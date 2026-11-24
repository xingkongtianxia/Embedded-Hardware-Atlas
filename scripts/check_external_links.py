"""Check safe public HTTP URLs in Markdown without rewriting source URLs.

Run: python scripts/check_external_links.py [--audit-csv audit/external_links.csv]
URLs containing credentials, query strings, or CNKI access tokens are skipped.
"""
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import ProxyHandler, Request, build_opener
import argparse
import csv
import re
import socket
import ssl
import sys


ROOT = Path(__file__).resolve().parents[1]
TIMEOUT_SECONDS = 8
MAX_WORKERS = 8
URL_PATTERN = re.compile(r'https?://[^\s<>"`()\[\]{}，。；、）】]+', re.I)
TRAILING_PUNCTUATION = '.,;:!?，。；！？、】}>'
UNBALANCED_CLOSERS = {')': '(', ']': '[', '}': '{'}
SKIP_HOSTS = {'cnki.net', 'www.cnki.net', 'kns.cnki.net'}


def read_sources(root=ROOT):
    paths = [root / 'README.md', root / 'index.md', root / 'rules.md', root / 'schema.md']
    for folder in ('external', 'wiki', '硬件/原理', '硬件/PCB'):
        base = root / folder
        if base.is_dir():
            paths.extend(base.rglob('*.md'))
    sources = {}
    for path in sorted(set(paths)):
        try:
            relative = path.relative_to(root).as_posix()
            sources[relative] = path.read_text(encoding='utf-8-sig')
        except (OSError, UnicodeError):
            continue
    return sources


def collect_links(sources):
    links = {}
    skipped = []
    for path, content in sources.items():
        fence = None
        for line_number, line in enumerate(content.splitlines(), 1):
            fence_match = re.match(r'^\s*(`{3,}|~{3,})', line)
            if fence_match:
                marker = fence_match.group(1)[0]
                if fence is None:
                    fence = marker
                elif marker == fence:
                    fence = None
                continue
            if fence is not None:
                continue
            for match in URL_PATTERN.finditer(line):
                url = match.group(0)
                while True:
                    previous = url
                    url = url.rstrip(TRAILING_PUNCTUATION)
                    if (url[-1:] in UNBALANCED_CLOSERS
                            and url.count(url[-1]) > url.count(UNBALANCED_CLOSERS[url[-1]])):
                        url = url[:-1]
                    if url == previous:
                        break
                try:
                    parts = urlsplit(url)
                    host = (parts.hostname or '').lower()
                except ValueError:
                    skipped.append([path, line_number, '', 'malformed URL omitted'])
                    continue
                if parts.username or parts.password:
                    skipped.append([path, line_number, host, 'credential URL omitted'])
                    continue
                if parts.query or host in SKIP_HOSTS:
                    skipped.append([path, line_number, host, 'query-bearing or access-controlled URL omitted'])
                    continue
                if parts.scheme.lower() not in {'http', 'https'} or not host:
                    skipped.append([path, line_number, host, 'unsupported URL omitted'])
                    continue
                links.setdefault(url, set()).add((path, line_number))
    result = [{'url': url, 'locations': sorted(locations)} for url, locations in sorted(links.items())]
    return result, skipped


def classify_error(error):
    if isinstance(error, HTTPError):
        if error.code in {401, 403, 407}:
            return 'access_restricted', error.code
        if error.code == 404:
            return 'not_found', error.code
        if error.code == 410:
            return 'gone', error.code
        if error.code in {405, 501}:
            return 'retry_get', error.code
        return 'inconclusive', error.code
    if isinstance(error, (TimeoutError, socket.timeout, URLError, ssl.SSLError, OSError)):
        return 'inconclusive', type(error).__name__
    return 'inconclusive', type(error).__name__


def inspect_url(url, opener=None):
    opener = opener or build_opener(ProxyHandler({}))
    request = Request(url, method='HEAD', headers={'User-Agent': 'embedded-kb-link-audit/1.0'})
    try:
        with opener.open(request, timeout=TIMEOUT_SECONDS) as response:
            status = response.status
    except Exception as error:
        result, status = classify_error(error)
        if result != 'retry_get':
            return {'url': url, 'status': status, 'result': result}
        request = Request(url, headers={'User-Agent': 'embedded-kb-link-audit/1.0', 'Range': 'bytes=0-0'})
        try:
            with opener.open(request, timeout=TIMEOUT_SECONDS) as response:
                status = response.status
        except Exception as retry_error:
            result, status = classify_error(retry_error)
            return {'url': url, 'status': status, 'result': result}
    if 200 <= status < 400:
        result = 'ok'
    elif status == 404:
        result = 'not_found'
    elif status == 410:
        result = 'gone'
    elif status in {401, 403, 407}:
        result = 'access_restricted'
    else:
        result = 'inconclusive'
    return {'url': url, 'status': status, 'result': result}


def write_csv(path, links, results, skipped):
    path.parent.mkdir(parents=True, exist_ok=True)
    result_map = {item['url']: item for item in results}
    with path.open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.writer(stream, lineterminator='\n')
        writer.writerow(('source', 'line', 'url', 'status', 'result'))
        for item in links:
            result = result_map[item['url']]
            for source, line in item['locations']:
                writer.writerow((source, line, item['url'], result['status'], result['result']))
        writer.writerow(('', '', '', '', f'skipped references: {len(skipped)}'))
        for source, line, host, reason in skipped:
            writer.writerow((source, line, host, '', reason))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--audit-csv', type=Path, help='write per-source URL results')
    args = parser.parse_args()
    links, skipped = collect_links(read_sources())
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as pool:
        results = list(pool.map(lambda item: inspect_url(item['url']), links))
    broken = [item for item in results if item['result'] in {'not_found', 'gone'}]
    counts = defaultdict(int)
    for result in results:
        counts[result['result']] += 1
    print(f"checked={len(results)} ok={counts['ok']} restricted={counts['access_restricted']} "
          f"inconclusive={counts['inconclusive']} missing={len(broken)} skipped={len(skipped)}")
    for result in broken:
        print(f"BROKEN {result['status']} {result['url']}")
    for result in results:
        if result['result'] == 'inconclusive':
            print(f"UNCONFIRMED {result['status']} {result['url']}")
    if args.audit_csv:
        write_csv(args.audit_csv, links, results, skipped)
    return bool(broken)


if __name__ == '__main__':
    sys.exit(main())
