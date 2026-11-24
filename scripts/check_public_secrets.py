"""Scan public tracked text files and report credential locations only.

Run: python scripts/check_public_secrets.py
Private backup, daily log, plan, and tool directories are pruned before reading.
"""
from pathlib import Path
import argparse
import os
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
PRIVATE = {'硬件/私人备份', 'journal/daily', 'journal/planning', '.git',
           '.obsidian', '.claude', '.claudian', '.dsh-vision-router', '.easyeda',
           '.tools', '.planning', '__pycache__'}
PRIVATE_FILES = {'log.md'}
TEXT_EXTENSIONS = {'.c', '.cc', '.cfg', '.conf', '.cpp', '.cs', '.go', '.h', '.hpp',
                   '.html', '.ini', '.java', '.js', '.json', '.jsonl', '.md', '.php',
                   '.ps1', '.py', '.rb', '.rs', '.sh', '.sql', '.toml', '.txt', '.xml',
                   '.yaml', '.yml'}
PLACEHOLDERS = re.compile(
    r'^(?:placeholder|(?:your|example|dummy|fake|test)[-_ ].*|redacted|changeme|'
    r'change[-_ ]me|replace[-_ ]me|<[^>]+>)$', re.I)
SENSITIVE_ASSIGNMENT = re.compile(
    r'''(?ix)\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|'''
    r'''password|passwd|refresh[_-]?token|secret)\b["']?\s*[:=]\s*["']'''
    r'''([A-Za-z0-9/+_.=-]{20,})["']''')
PROVIDER_PATTERNS = (
    ('aws-access-key', re.compile(r'\bAKIA[0-9A-Z]{16}\b')),
    ('github-token', re.compile(r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})\b')),
    ('openai-token', re.compile(r'\bsk-(?:proj-)?[A-Za-z0-9_-]{32,}\b')),
    ('private-key-block', re.compile(r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----')),
    ('credential-url', re.compile(r'\bhttps?://[^/\s:@]+:[^/@\s]+@', re.I)),
)
SENSITIVE_SUFFIXES = {'.env', '.key', '.pem', '.p12', '.pfx', '.p8', '.ppk'}


def is_sensitive_filename(filename):
    name = Path(filename).name.lower()
    return name == '.env' or name.startswith('.env.') or Path(name).suffix in SENSITIVE_SUFFIXES


def scan_text(path, text):
    findings = []
    for line_number, line in enumerate(text.splitlines(), 1):
        for rule, pattern in PROVIDER_PATTERNS:
            if pattern.search(line):
                findings.append((rule, line_number))
        for match in SENSITIVE_ASSIGNMENT.finditer(line):
            if not PLACEHOLDERS.fullmatch(match.group(1)):
                findings.append(('credential-assignment', line_number))
    return sorted(set(findings), key=lambda finding: (finding[1], finding[0]))


def public_files(root=ROOT):
    for current, directories, filenames in os.walk(root):
        directory = Path(current)
        relative = directory.relative_to(root).as_posix()
        directories[:] = [name for name in directories
                          if not any(part in PRIVATE for part in
                                     (name if relative == '.' else relative + '/' + name).split('/'))]
        for filename in filenames:
            path = directory / filename
            rel = path.relative_to(root).as_posix()
            if rel in PRIVATE_FILES:
                continue
            if path.suffix.lower() in TEXT_EXTENSIONS or is_sensitive_filename(filename):
                yield rel, path


def scan_tree(root=ROOT):
    findings = []
    for relative, path in public_files(root):
        if is_sensitive_filename(path.name):
            findings.append((relative, 1, 'sensitive-file'))
            continue
        try:
            content = path.read_text(encoding='utf-8-sig')
        except UnicodeError:
            continue
        for rule, line_number in scan_text(relative, content):
            findings.append((relative, line_number, rule))
    return findings


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    args = parser.parse_args()
    findings = scan_tree(args.root.resolve())
    print(f'credential findings: {len(findings)}')
    for path, line_number, rule in findings:
        print(f'{path}:{line_number}: {rule}')
    return bool(findings)


if __name__ == '__main__':
    sys.exit(main())
