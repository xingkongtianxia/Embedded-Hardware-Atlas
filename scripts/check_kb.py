"""Validate the current public knowledge base without reading private directories.

Run: python scripts/check_kb.py [--staged] [--json report.json]
Only Python's standard library is required. --staged verifies index blobs,
including hashes, so working-tree contents cannot hide a bad staged commit.
"""
from pathlib import Path, PurePosixPath
from collections import Counter, defaultdict
from urllib.parse import unquote
import argparse
import csv
import hashlib
import json
import posixpath
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ('硬件/私人备份/', 'journal/daily/', 'journal/planning/',
           '工作日志/', '规划库/', '.planning/')
WIKI_TYPES = {'principle', 'datasheet', 'pcb-module', 'pcb-method', 'concept',
              'comparison', 'synthesis', 'source-map'}
SOURCE_TYPES = {'principle-source', 'datasheet-source', 'pcb-source', 'pcb-method'}
STATUSES = {'seed', 'reviewed', 'needs-review'}
REQUIRED = {'title', 'type', 'status', 'updated', 'sources', 'tags'}


def private(path):
    path = path.replace('\\', '/')
    while path.startswith('./'):
        path = path[2:]
    return path == 'log.md' or path.startswith(PRIVATE)


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def fields(text):
    match = re.match(r'\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)', text, re.S)
    if not match:
        return {}
    return {key: value.strip() for key, value in
            re.findall(r'^([\w-]+):[ \t]*(.*)$', match[1], re.M)}


def values(value):
    if not value.startswith('[') or not value.endswith(']'):
        raise ValueError('requires an inline YAML list')
    return [x.strip().strip('"\'') for x in next(csv.reader([value[1:-1]],
            skipinitialspace=True)) if x.strip()]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--staged', action='store_true')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    indexed = set(git('ls-files', '-z').decode('utf-8').strip('\0').split('\0'))
    errors, warnings = [], []
    for path in sorted(indexed):
        if private(path):
            errors.append(['private-tracked', path])
    if args.staged:
        paths = indexed
    else:
        paths = set()
        # Explicitly prune private directories before enumeration or reads.
        import os
        for base, dirs, files in os.walk(ROOT):
            parent = Path(base).relative_to(ROOT).as_posix()
            dirs[:] = [d for d in dirs if d not in {'.git', '.obsidian', '.claude',
                '.claudian'} and not private(('' if parent == '.' else parent + '/') + d + '/')]
            for name in files:
                path = (Path(base) / name).relative_to(ROOT).as_posix()
                if not private(path):
                    paths.add(path)

    batch = subprocess.Popen(['git', '-C', str(ROOT), 'cat-file', '--batch'],
                             stdin=subprocess.PIPE, stdout=subprocess.PIPE) if args.staged else None
    cached_text = {}

    def data(path):
        if not args.staged:
            return (ROOT / path).read_bytes()
        if path in cached_text:
            return cached_text[path]
        batch.stdin.write((':' + path + '\n').encode('utf-8')); batch.stdin.flush()
        header = batch.stdout.readline().split()
        if len(header) != 3 or header[1] != b'blob':
            raise ValueError('Cannot read staged blob: ' + path)
        blob = batch.stdout.read(int(header[2]))
        if batch.stdout.read(1) != b'\n':
            raise ValueError('Malformed Git batch response')
        if path.endswith('.md'):
            cached_text[path] = blob
        return blob

    def text(path):
        return data(path).decode('utf-8-sig')

    basenames = defaultdict(list)
    for p in paths:
        basenames[PurePosixPath(p).stem].append(p)

    def resolve(target, parent):
        target = unquote(target.split('|', 1)[0].split('#', 1)[0]).replace('\\', '/')
        if not target:
            return ''
        for prefix in ['', parent + '/', 'wiki/', '硬件/']:
            candidate = posixpath.normpath(prefix + target)
            for p in [candidate, candidate + '.md']:
                if p in paths:
                    return p
        if '/' not in target and len(basenames[target]) == 1:
            return basenames[target][0]
        return None

    pages = sorted(p for p in paths if p.startswith('wiki/') and p.endswith('.md'))
    curated = sorted(p for p in paths if p.startswith(('硬件/原理/', '硬件/PCB/'))
                     and p.endswith('.md'))
    models = sorted(p for p in paths if p.startswith('思维模型库/') and p.endswith('.md'))
    inbound = Counter(); content_inbound = Counter(); outlinks = {}; size = []
    tags = Counter(); statuses = Counter(); source_dependencies = defaultdict(list)
    for path in pages + curated + models:
        body = text(path); fm = fields(body)
        if not REQUIRED.issubset(fm):
            errors.append(['frontmatter', path, sorted(REQUIRED - fm.keys())])
            continue
        typ, status = fm['type'], fm['status']
        if path in pages and (typ not in WIKI_TYPES or status not in STATUSES):
            errors.append(['wiki-enum', path, typ, status])
        if path in curated and (typ not in SOURCE_TYPES or status not in STATUSES | {'curated'}):
            errors.append(['source-enum', path, typ, status])
        model_type = 'synthesis' if path == '思维模型库/README.md' else 'meta-method'
        if path in models and (typ != model_type or status not in STATUSES):
            errors.append(['model-enum', path, typ, status])
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', fm['updated']):
            errors.append(['updated-date', path])
        try:
            sources = values(fm['sources']); page_tags = values(fm['tags'])
        except ValueError as exc:
            errors.append(['list-format', path, str(exc)]); continue
        tags.update(page_tags)
        if path in pages:
            statuses[status] += 1
            if not sources:
                errors.append(['empty-wiki-sources', path])
        for source in sources:
            target = resolve(source, str(PurePosixPath(path).parent))
            if target is None:
                # Unavailable historical evidence remains explicit, not a valid source.
                warnings.append(['unavailable-source', path, source]) if path in curated else errors.append(['source-missing', path, source])
            elif path in pages and not target.startswith(('硬件/原理/', '硬件/PCB/', 'external/')):
                errors.append(['wiki-source-layer', path, source])
            elif target:
                source_dependencies[target].append(path)
        cleaned = re.sub(r'^```.*?^```[^\n]*', '', body, flags=re.M | re.S)
        targets = set()
        for link in re.findall(r'\[\[([^\]\n]+)\]\]', cleaned):
            target = resolve(link, str(PurePosixPath(path).parent))
            if target is None:
                errors.append(['wikilink-missing', path, link])
            elif target and target != path:
                targets.add(target)
                if path in pages:
                    inbound[target] += 1
                    if not path.startswith('wiki/导航/') and path not in {'wiki/知识网络.md', 'wiki/概览.md', 'wiki/来源映射.md'}:
                        content_inbound[target] += 1
        outlinks[path] = targets
        if len(targets) < 2:
            errors.append(['too-few-links', path, len(targets)])
        if len(body.splitlines()) > 200:
            size.append([path, len(body.splitlines())])

    for root_page in ['index.md', 'README.md']:
        if root_page not in paths:
            errors.append(['root-page-missing', root_page]); continue
        root_text = re.sub(r'`[^`\n]+`', '', text(root_page))
        for link in re.findall(r'\[\[([^\]\n]+)\]\]', root_text):
            target = resolve(link, '')
            if target is None:
                errors.append(['navigation-missing', root_page, link])
            elif target:
                inbound[target] += 1
    index = text('index.md')
    reached = set(); pending = [t for t in re.findall(r'\[\[([^\]\n]+)\]\]', index)]
    for link in pending:
        target = resolve(link, '')
        if target: reached.add(target)
    todo = list(reached)
    while todo:
        for target in outlinks.get(todo.pop(), set()) - reached:
            reached.add(target); todo.append(target)
    for path in pages:
        if not inbound[path]: errors.append(['orphan', path])
        if path not in reached: errors.append(['not-reachable-from-index', path])

    manifest = json.loads(text('硬件/整理清单.json')); roles = Counter(); hashes = defaultdict(list)
    if manifest.get('tool_version') != 2:
        errors.append(['manifest-version', manifest.get('tool_version')])
    for item in manifest['items']:
        path = item['path']; roles[item['role']] += 1
        if private(path) or path not in paths:
            errors.append(['manifest-path', path]); continue
        blob = data(path); digest = hashlib.sha256(blob).hexdigest()
        if len(blob) != item['bytes'] or digest != item['sha256']:
            errors.append(['manifest-integrity', path])
        if item['role'] != 'curated-source': hashes[digest].append(path)
    duplicates = [v for v in hashes.values() if len(v) > 1]
    manifested = {x['path'] for x in manifest['items']}
    for path in curated + [p for p in paths if p.startswith('硬件/芯片数据手册/')]:
        if path not in manifested: errors.append(['unregistered-source', path])
    # Public pages cannot link to private records, even if they still exist locally.
    leaks = re.compile(r'(?:\[\[|\]\()(?:(?:\./)*)(?:log(?:\.md)?(?:[|#\])])|journal/(?:daily|planning)/|硬件/私人备份/|工作日志/|规划库/)')
    missing_attachments = []; markdown_links = []
    for path in sorted(paths):
        if path.endswith('.md') and not path.startswith(('硬件/原始备份/', 'Imported/')):
            if leaks.search(text(path)): errors.append(['private-navigation', path])
        if not path.endswith('.md') or path.startswith(('Imported/', 'Excalidraw/')):
            continue
        body = re.sub(r'^```.*?^```[^\n]*', '', text(path), flags=re.M | re.S)
        body = re.sub(r'`[^`\n]+`', '', body)
        for wiki_image, md_image in re.findall(r'!\[\[([^\]\n]+)\]\]|!\[[^\]\n]*\]\(([^)\n]+)\)', body):
            target = (wiki_image or md_image).strip('<>')
            if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target):
                continue
            if resolve(target, str(PurePosixPath(path).parent)) is None:
                missing_attachments.append([path, target])
        if not path.startswith('硬件/原始备份/'):
            for target in re.findall(r'(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)', body):
                if not target or target.startswith('#') or re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target):
                    continue
                folder = posixpath.normpath(str(PurePosixPath(path).parent) + '/' + target.strip('<>'))
                directory_exists = any(p.startswith(folder.rstrip('/') + '/') for p in paths)
                if not directory_exists and resolve(target.strip('<>'), str(PurePosixPath(path).parent)) is None:
                    markdown_links.append([path, target])
    for path, count in Counter(x[0] for x in missing_attachments).items():
        warnings.append(['missing-attachments', path, count])
    for finding in markdown_links:
        errors.append(['markdown-link-missing', *finding])
    for item in manifest.get('retired_items', []):
        warnings.append(['retired-source', item['former_path']])
    for item in manifest['items']:
        if item.get('previous_sha256'): warnings.append(['historical-hash-drift', item['path']])
    result = dict(mode='staged' if args.staged else 'working-tree', wiki_pages=len(pages),
        curated_pages=len(curated), model_pages=len(models), wiki_statuses=dict(statuses),
        valid_links=sum(map(len, outlinks.values())), reachable_wiki_pages=sum(p in reached for p in pages),
        private_tracked=sum(private(p) for p in indexed), manifest_items=len(manifest['items']),
        manifest_roles=dict(roles), identical_raw_groups=duplicates, over_200_lines=size,
        navigation_only_inbound=[p for p in pages if not content_inbound[p]],
        missing_attachments=missing_attachments,
        tags=dict(tags), errors=errors, warnings=warnings)
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    compact = {k:v for k,v in result.items() if k not in {'errors','warnings','tags','navigation_only_inbound','identical_raw_groups','over_200_lines','missing_attachments'}}
    compact.update(errors=len(errors), warnings=len(warnings), over_200_lines=len(size),
                   navigation_only_inbound=len(result['navigation_only_inbound']), duplicate_raw_groups=len(duplicates),
                   missing_attachment_references=len(missing_attachments))
    print(json.dumps(compact, ensure_ascii=False, indent=2))
    for error in errors[:30]: print('ERROR:', json.dumps(error, ensure_ascii=False))
    if batch:
        batch.stdin.close(); batch.wait()
    return bool(errors)


if __name__ == '__main__':
    sys.exit(main())
