"""Validate the current public knowledge base without reading private directories.

Run: python scripts/check_kb.py [--staged] [--json report.json] [--audit-dir audit]
Only Python's standard library is required. --staged verifies index blobs,
including hashes, so working-tree contents cannot hide a bad staged commit.
"""
from pathlib import Path, PurePosixPath
from collections import Counter, defaultdict
from urllib.parse import unquote
import argparse
import csv
import datetime
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
EXTERNAL_TYPES = {'external-resource', 'concept', 'synthesis', 'source-map'}
STATUSES = {'seed', 'reviewed', 'needs-review'}
REQUIRED = {'title', 'type', 'status', 'updated', 'sources', 'tags'}
GENERIC_TAGS = {'Wiki子主题', 'Wiki条目', '新增资料', '待核验'}
DOMAIN_TAGS = {'嵌入式硬件'}
FORBIDDEN_TAGS = GENERIC_TAGS - {'嵌入式硬件'}
WIKI_LINE_LIMIT = 200
CURATED_LINE_LIMIT = 400
MAX_TAGS = 6
LARGE_FILE_WARN_BYTES = 10 * 1024 * 1024
ATTACH_BASELINE = 'journal/attachments-baseline.json'
ATTACHMENT_WARNING = re.compile(r'图缺失|缺图|图片缺失|附件缺失|仅文本可用')
ATTACHMENT_LINK = re.compile(r'!\[\[([^\]\n]+)\]\]|!\[[^\]\n]*\]\(([^)\n]+)\)')
PRIORITY_TOPICS = re.compile(r'锂电|电池保护|充电|高压|市电|电源路径|反接|浪涌|隔离|ESD|上电|启动|复位', re.I)
EPHEMERAL_CNKI_URL = re.compile(r'https?://kns\.cnki\.net/[^\s)]*\?[^\s)]*\bv=')


def configure_stdio():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, 'reconfigure'):
            try:
                stream.reconfigure(encoding='utf-8', errors='replace')
            except OSError:
                pass


def validate_external_page(path, body):
    page_errors = []
    fm = fields(body)
    if not REQUIRED.issubset(fm):
        page_errors.append(['external-frontmatter', path, sorted(REQUIRED - fm.keys())])
        return page_errors
    typ, status = fm['type'], fm['status']
    if typ not in EXTERNAL_TYPES or status not in STATUSES:
        page_errors.append(['external-enum', path, typ, status])
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', fm['updated']):
        page_errors.append(['external-updated-date', path])
    try:
        page_tags = values(fm['tags'])
    except ValueError as exc:
        page_errors.append(['external-list-format', path, str(exc)])
        page_tags = []
    if len(page_tags) > MAX_TAGS:
        page_errors.append(['external-too-many-tags', path, len(page_tags)])
    forbidden = sorted(set(page_tags) & FORBIDDEN_TAGS)
    if forbidden:
        page_errors.append(['external-generic-tags', path, forbidden])
    if EPHEMERAL_CNKI_URL.search(visible_markdown(body)):
        page_errors.append(['external-ephemeral-url', path])
    return page_errors


def private(path):
    path = path.replace('\\', '/')
    while path.startswith('./'):
        path = path[2:]
    return path == 'log.md' or path.startswith(PRIVATE)


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def other_knowledge_roots():
    import os
    scopes = [Path.home() / 'Documents', Path.home() / 'Desktop']
    if os.name == 'nt' and len(ROOT.parents) > 1:
        scopes.append(ROOT.parents[1])
    seen = set(); matches = set()
    for scope in scopes:
        try:
            scope = scope.resolve()
        except OSError:
            continue
        if scope in seen or not scope.is_dir():
            continue
        seen.add(scope)
        def walk_error(_):
            return None
        for base, dirs, files in os.walk(scope, onerror=walk_error, followlinks=False):
            current = Path(base)
            depth = len(current.relative_to(scope).parts)
            dirs[:] = [name for name in dirs if not (current / name).is_symlink()]
            if current.resolve() != ROOT.resolve() and 'index.md' in files and (current / 'wiki').is_dir():
                matches.add(str(current))
                dirs[:] = []
            elif depth >= 2:
                dirs[:] = []
    return sorted(matches)


def validate_local_root_config(root=ROOT):
    config_path = root / '.kb.local.json'
    if not config_path.is_file():
        return [['local-root-config-missing', '.kb.local.json']]
    try:
        config = json.loads(config_path.read_text(encoding='utf-8'))
    except (OSError, json.JSONDecodeError):
        return [['local-root-config-invalid', '.kb.local.json']]
    configured_root = config.get('root') if isinstance(config, dict) else None
    if not isinstance(configured_root, str) or not configured_root.strip():
        return [['local-root-config-invalid', '.kb.local.json', 'root']]
    configured_path = Path(configured_root).expanduser()
    if not configured_path.is_absolute():
        return [['local-root-config-not-absolute', '.kb.local.json', 'root']]
    if configured_path.resolve() != root.resolve():
        return [['local-root-mismatch', str(configured_path.resolve()), str(root.resolve())]]
    return []


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


def write_csv(path, columns, rows):
    with path.open('w', encoding='utf-8-sig', newline='') as stream:
        writer = csv.writer(stream, lineterminator='\n')
        writer.writerow(columns)
        writer.writerows(rows)


def visible_markdown(text):
    text = re.sub(r'^```.*?^```[^\n]*',
                  lambda match: '\n' * match.group().count('\n'),
                  text, flags=re.M | re.S)
    return re.sub(r'`[^`\n]+`', '', text)


def has_missing_attachment_notice(body):
    return bool(ATTACHMENT_WARNING.search(body))


def find_missing_attachments(path, body, baseline, resolve_target):
    visible = visible_markdown(body)
    findings = []
    for image in ATTACHMENT_LINK.finditer(visible):
        wiki_image, markdown_image = image.groups()
        target = (wiki_image or markdown_image).strip('<>')
        if re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target):
            continue
        if resolve_target(target) is not None:
            continue
        line = visible.count('\n', 0, image.start()) + 1
        reason = baseline.get(path, {}).get('reason', '未登记，需确认')
        findings.append([path, line, target, reason])
    return findings


def main():
    configure_stdio()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--staged', action='store_true')
    parser.add_argument('--json', type=Path)
    parser.add_argument('--audit-dir', type=Path, help='write attachment and review queue CSVs')
    args = parser.parse_args()
    indexed = set(git('ls-files', '-z').decode('utf-8').strip('\0').split('\0'))
    errors, warnings = [], []
    errors.extend(validate_local_root_config())
    for duplicate_root in other_knowledge_roots():
        errors.append(['duplicate-knowledge-root', duplicate_root])
    for path in sorted(indexed):
        if private(path):
            errors.append(['private-tracked', path])
        if path.startswith('硬件/_整理工作区/'):
            warnings.append(['workspace-scratch-tracked', path])
        if re.fullmatch(r'\.obsidian/plugins/[^/]+/(?:data\.json|obsidian_askpass\.sh)', path):
            warnings.append(['obsidian-plugin-state-tracked', path])
    if args.staged:
        paths = indexed
    else:
        paths = set()
        # Explicitly prune private directories before enumeration or reads.
        import os
        for base, dirs, files in os.walk(ROOT):
            parent = Path(base).relative_to(ROOT).as_posix()
            dirs[:] = [d for d in dirs if d not in {'.git', '.obsidian', '.claude',
                '.claudian', '.dsh-vision-router', '.easyeda', '.tools'}
                and not private(('' if parent == '.' else parent + '/') + d + '/')]
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

    source_manifest = json.loads(text('硬件/整理清单.json'))
    attachment_baseline = (json.loads(text(ATTACH_BASELINE)).get('originals', {})
                           if ATTACH_BASELINE in paths else {})
    structural_source_dates = {}
    for item in source_manifest.get('items', []):
        path = item.get('path', '')
        expected = item.get('structural_only_sha256', '')
        semantic_date = item.get('content_updated', '')
        if (path in paths and expected and re.fullmatch(r'\d{4}-\d{2}-\d{2}', semantic_date)
                and hashlib.sha256(data(path)).hexdigest() == expected):
            structural_source_dates[path] = semantic_date

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
    externals = sorted(p for p in paths if p.startswith('external/') and p.endswith('.md')
                       and PurePosixPath(p).name != 'README.md')
    titles = defaultdict(list)
    stale_reviewed = []
    source_change_dates = {}
    inbound = Counter(); content_inbound = Counter(); outlinks = {}; near_size = []; over_size = []
    tags = Counter(); statuses = Counter(); source_dependencies = defaultdict(list)
    review_queue = []
    for path in externals:
        errors.extend(validate_external_page(path, text(path)))
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
            if ' ' in PurePosixPath(path).name:
                errors.append(['wiki-filename-space', path])
            titles[fm['title']].append(path)
            if len(page_tags) > MAX_TAGS:
                errors.append(['too-many-tags', path, len(page_tags)])
            if not (set(page_tags) - GENERIC_TAGS - DOMAIN_TAGS):
                errors.append(['no-topic-tag', path])
            forbidden = sorted(set(page_tags) & FORBIDDEN_TAGS)
            if forbidden:
                errors.append(['generic-tags', path, forbidden])
        if path in pages:
            statuses[status] += 1
            if not sources:
                errors.append(['empty-wiki-sources', path])
            if args.audit_dir and status == 'needs-review':
                priority_topic = PRIORITY_TOPICS.search(' '.join([path, fm['title'], *page_tags]))
                priority = 'P1' if priority_topic else 'P2'
                reason = priority_topic.group() if priority_topic else '常规来源核验'
                review_queue.append([priority, path, status, fm['updated'], ' | '.join(sources), reason])
        for source in sources:
            target = resolve(source, str(PurePosixPath(path).parent))
            if path in curated and target in attachment_baseline and not has_missing_attachment_notice(body):
                errors.append(['missing-attachment-notice', path, target])
            if target is None:
                # Unavailable historical evidence remains explicit, not a valid source.
                warnings.append(['unavailable-source', path, source]) if path in curated else errors.append(['source-missing', path, source])
            elif path in pages and not target.startswith(('硬件/原理/', '硬件/PCB/', 'external/')):
                errors.append(['wiki-source-layer', path, source])
            elif target:
                source_dependencies[target].append(path)
                if path in pages and status == 'reviewed' and re.fullmatch(r'\d{4}-\d{2}-\d{2}', fm['updated']):
                    if target not in source_change_dates:
                        if target in structural_source_dates:
                            source_date = structural_source_dates[target]
                        else:
                            diff_command = ['git', '-C', str(ROOT), 'diff', '--quiet']
                            if args.staged:
                                diff_command.append('--cached')
                            diff_command.extend(['HEAD', '--', target])
                            changed_in_worktree = subprocess.run(
                                diff_command,
                                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode != 0
                            if changed_in_worktree:
                                source_date = datetime.date.today().isoformat()
                            else:
                                committed = subprocess.run(
                                    ['git', '-C', str(ROOT), 'log', '-1', '--format=%cs', '--', target],
                                    capture_output=True, text=True, encoding='utf-8').stdout.strip()
                                if committed:
                                    source_date = committed
                                else:
                                    try:
                                        source_date = datetime.date.fromtimestamp((ROOT / target).stat().st_mtime).isoformat()
                                    except (FileNotFoundError, OSError):
                                        source_date = ''
                        source_change_dates[target] = source_date
                    source_date = source_change_dates[target]
                    if source_date > fm['updated']:
                        stale_reviewed.append([path, fm['updated'], target, source_date])
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
        if path.startswith('wiki/导航/'):
            for link, annotated_status in re.findall(
                    r'\[\[([^\]\n]+)\]\]\s*·\s*`(seed|reviewed|needs-review)`', cleaned):
                target = resolve(link, str(PurePosixPath(path).parent))
                if target in pages and fields(text(target)).get('status') != annotated_status:
                    errors.append(['navigation-status-mismatch', path, link, annotated_status])
        outlinks[path] = targets
        if len(targets) < 2:
            errors.append(['too-few-links', path, len(targets)])
        line_count = len(body.splitlines())
        if path in pages and line_count > WIKI_LINE_LIMIT:
            errors.append(['wiki-too-long', path, line_count])
            over_size.append([path, line_count])
        elif path in curated and line_count > CURATED_LINE_LIMIT:
            errors.append(['curated-too-long', path, line_count])
        if path in pages and WIKI_LINE_LIMIT - 20 < line_count <= WIKI_LINE_LIMIT:
            near_size.append([path, line_count])

    for finding in stale_reviewed:
        errors.append(['stale-reviewed', *finding])

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

    for title, owners in sorted(titles.items()):
        if len(owners) > 1:
            errors.append(['duplicate-title', title, sorted(owners)])
    for path in pages + curated:
        stem = PurePosixPath(path).stem
        if re.search(r'-\d+-续$', stem):
            base = path[: -len('-续.md')] + '.md'
            if base in paths:
                errors.append(['continuation-title', path, base])

    manifest = source_manifest; roles = Counter(); hashes = defaultdict(list)
    if manifest.get('tool_version') != 2:
        errors.append(['manifest-version', manifest.get('tool_version')])
    for item in manifest['items']:
        path = item['path']; roles[item['role']] += 1
        if PurePosixPath(path).is_absolute() or '..' in PurePosixPath(path).parts:
            errors.append(['manifest-path-not-relative', path]); continue
        if private(path) or path not in paths:
            errors.append(['manifest-path', path]); continue
        blob = data(path); digest = hashlib.sha256(blob).hexdigest()
        if len(blob) > LARGE_FILE_WARN_BYTES:
            warnings.append(['large-tracked-file', path, len(blob)])
        if len(blob) != item['bytes'] or digest != item['sha256']:
            errors.append(['manifest-integrity', path])
        if item['role'] != 'curated-source':
            hashes[digest].append(path)
            if item.get('duplicate_of'):
                alias = item['duplicate_of']
                if alias not in paths:
                    errors.append(['duplicate-of-missing', path, alias])
                elif alias in paths and hashlib.sha256(data(alias)).hexdigest() != digest:
                    errors.append(['duplicate-of-hash-mismatch', path, alias])
    duplicates = [v for v in hashes.values() if len(v) > 1]
    for group in duplicates:
        errors.append(['duplicate-raw-present', sorted(group)])
    manifested = {x['path'] for x in manifest['items']}
    for path in curated + [p for p in paths if p.startswith('硬件/芯片数据手册/')]:
        if path not in manifested: errors.append(['unregistered-source', path])
    # Public pages cannot link to private records, even if they still exist locally.
    leaks = re.compile(r'(?:\[\[|\]\()(?:(?:\./)*)(?:log(?:\.md)?(?:[|#\])])|journal/(?:daily|planning)/|硬件/私人备份/|工作日志/|规划库/)')
    missing_attachments = []; attachment_locations = []; markdown_links = []
    for path in sorted(paths):
        if path.endswith('.md') and not path.startswith(('硬件/原始备份/', 'Imported/')):
            if leaks.search(text(path)): errors.append(['private-navigation', path])
        if not path.endswith('.md') or path.startswith(('Imported/', 'Excalidraw/')):
            continue
        original_body = text(path)
        body = visible_markdown(original_body)
        page_findings = find_missing_attachments(
            path, original_body, attachment_baseline,
            lambda target: resolve(target, str(PurePosixPath(path).parent)))
        for source, line, target, reason in page_findings:
            missing_attachments.append([source, target])
            if args.audit_dir:
                attachment_locations.append([source, line, target, reason])
        if not path.startswith('硬件/原始备份/'):
            for target in re.findall(r'(?<!!)\[[^\]\n]*\]\(([^)\n]+)\)', body):
                if not target or target.startswith('#') or re.match(r'^[a-zA-Z][a-zA-Z0-9+.-]*:', target):
                    continue
                folder = posixpath.normpath(str(PurePosixPath(path).parent) + '/' + target.strip('<>'))
                directory_exists = any(p.startswith(folder.rstrip('/') + '/') for p in paths)
                if not directory_exists and resolve(target.strip('<>'), str(PurePosixPath(path).parent)) is None:
                    markdown_links.append([path, target])
    if ATTACH_BASELINE not in paths:
        warnings.append(['attachment-baseline-missing', ATTACH_BASELINE])
    attachment_counts = Counter(x[0] for x in missing_attachments)
    for path, count in sorted(attachment_counts.items()):
        allowed = attachment_baseline.get(path, {}).get('count', 0)
        if count > allowed:
            errors.append(['missing-attachments-new', path, count, allowed])
        else:
            warnings.append(['missing-attachments', path, count])
    for finding in markdown_links:
        errors.append(['markdown-link-missing', *finding])
    for item in manifest.get('retired_items', []):
        warnings.append(['retired-source', item['former_path']])
    for item in manifest['items']:
        structural_hash = item.get('structural_only_sha256')
        structure_is_unchanged = (structural_hash and item['path'] in paths
                                  and hashlib.sha256(data(item['path'])).hexdigest() == structural_hash)
        if item.get('previous_sha256') and not structure_is_unchanged:
            warnings.append(['historical-hash-drift', item['path']])
    result = dict(mode='staged' if args.staged else 'working-tree', wiki_pages=len(pages),
        curated_pages=len(curated), model_pages=len(models), wiki_statuses=dict(statuses),
        valid_links=sum(map(len, outlinks.values())), reachable_wiki_pages=sum(p in reached for p in pages),
        private_tracked=sum(private(p) for p in indexed), manifest_items=len(manifest['items']),
        manifest_roles=dict(roles), identical_raw_groups=duplicates,
        over_200_lines=over_size, near_200_lines=near_size,
        navigation_only_inbound=[p for p in pages if not content_inbound[p]],
        other_knowledge_roots=other_knowledge_roots(),
        missing_attachments=missing_attachments,
        stale_reviewed=stale_reviewed,
        tags=dict(tags), errors=errors, warnings=warnings)
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(result, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    if args.audit_dir and not errors:
        args.audit_dir.mkdir(parents=True, exist_ok=True)
        write_csv(args.audit_dir / 'missing_attachments.csv', ('source', 'line', 'target', 'reason'),
                  attachment_locations)
        write_csv(args.audit_dir / 'review_queue.csv', ('priority', 'path', 'status', 'updated', 'sources', 'reason'),
                  sorted(review_queue))
    compact = {k:v for k,v in result.items() if k not in {'errors','warnings','tags','navigation_only_inbound','identical_raw_groups','near_wiki_limit','missing_attachments','stale_reviewed'}}
    compact.update(errors=len(errors), warnings=len(warnings), near_wiki_limit=len(near_size),
                   navigation_only_inbound=len(result['navigation_only_inbound']), duplicate_raw_groups=len(duplicates),
                   missing_attachment_references=len(missing_attachments), stale_reviewed_pages=len(stale_reviewed))
    print(json.dumps(compact, ensure_ascii=False, indent=2))
    for error in errors[:30]: print('ERROR:', json.dumps(error, ensure_ascii=False))
    if batch:
        batch.stdin.close(); batch.wait()
    return bool(errors)


if __name__ == '__main__':
    sys.exit(main())
