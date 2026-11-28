import importlib.util
import copy
import hashlib
import json
import tempfile
import unittest
from unittest import mock
from pathlib import Path


MODULE_SPEC = importlib.util.spec_from_file_location(
    'check_kb', Path(__file__).with_name('check_kb.py'))
check_kb = importlib.util.module_from_spec(MODULE_SPEC)
MODULE_SPEC.loader.exec_module(check_kb)


class AttachmentAuditTests(unittest.TestCase):
    def test_skips_code_examples_and_preserves_source_line(self):
        body = ('# Example\n\n```markdown\n![[example.png]]\n```\n'
                '\n![actual](images/actual.png)\n')

        findings = check_kb.find_missing_attachments(
            'source.md', body, {'source.md': {'reason': 'asset folder absent'}},
            lambda target: None)

        self.assertEqual(findings, [[
            'source.md', 7, 'images/actual.png', 'asset folder absent']])

    def test_resolves_existing_images(self):
        findings = check_kb.find_missing_attachments(
            'source.md', '![actual](images/actual.png)\n', {},
            lambda target: 'images/actual.png' if target.endswith('actual.png') else None)

        self.assertEqual(findings, [])

    def test_missing_image_without_baseline_requires_registration(self):
        findings = check_kb.find_missing_attachments(
            'new.md', '![[unknown.png]]\n', {}, lambda target: None)

        self.assertEqual(findings, [['new.md', 1, 'unknown.png', '未登记，需确认']])

    def test_finds_html_images_inside_tables(self):
        body = '# Table\n<table><tr><td><img src="images/a.jpg"></td>' \
               "<td><img width='80' src='images/b.png'></td></tr></table>\n"
        findings = check_kb.find_missing_attachments('raw.md', body, {}, lambda _: None)
        self.assertEqual([row[2] for row in findings], ['images/a.jpg', 'images/b.png'])
        self.assertEqual([row[1] for row in findings], [2, 2])

    def test_ignores_hidden_attachment_comments(self):
        body = '<!--\n![](old.png)\n-->\n%% ![[hidden.png]] %%\n![[visible.png]]\n'
        findings = check_kb.find_missing_attachments('raw.md', body, {}, lambda _: None)
        self.assertEqual(findings, [['raw.md', 5, 'visible.png', '未登记，需确认']])

    def test_notice_is_specific_to_missing_attachments(self):
        self.assertTrue(check_kb.has_missing_attachment_notice('来源插图缺失，仅文本可用。'))
        self.assertFalse(check_kb.has_missing_attachment_notice('高速PCB设计资料中的边界说明。'))
        self.assertFalse(check_kb.has_missing_attachment_notice('附件测试过程未执行。'))

    def test_pending_originals_remain_visible_and_registered(self):
        body = '**原图待补：** `first.png`\n<span class="missing-original">second.png</span>\n'
        errors, warnings = check_kb.validate_pending_originals('raw.md', body, 2)
        self.assertEqual(errors, [])
        self.assertEqual(warnings, [['pending-original-images', 'raw.md', 2]])

    def test_pending_originals_cannot_be_silently_removed_or_added(self):
        for body, registered in [('', 1), ('**原图待补：** `unknown.png`', 0)]:
            errors, warnings = check_kb.validate_pending_originals('raw.md', body, registered)
            self.assertEqual(errors[0][0], 'pending-original-count')
            self.assertEqual(warnings, [])

    def test_pending_original_examples_and_hidden_comments_are_ignored(self):
        body = '<!-- **原图待补：** `hidden.png` -->\n```md\n**原图待补：** `example.png`\n```\n'
        self.assertEqual(check_kb.pending_original_count(body), 0)


class ExternalValidationTests(unittest.TestCase):
    def test_repository_template_passes_external_validator(self):
        template = (Path(__file__).parents[1] / 'external' / '资源条目模板.md').read_text(encoding='utf-8')
        self.assertEqual(check_kb.validate_external_page('external/资源条目模板.md', template), [])

    def test_valid_external_page_passes(self):
        body = (
            '---\n'
            'title: 示例外来资料\n'
            'type: external-resource\n'
            'status: needs-review\n'
            'updated: 2026-11-24\n'
            'sources: []\n'
            'tags: [外来资料, 电源, 选型]\n'
            '---\n\n'
            '# 示例外来资料\n'
        )
        self.assertEqual(check_kb.validate_external_page('external/demo.md', body), [])

    def test_rejects_forbidden_tags_too_many_tags_and_ephemeral_cnki_url(self):
        body = (
            '---\n'
            'title: 违规外来资料\n'
            'type: external-resource\n'
            'status: needs-review\n'
            'updated: 2026-11-24\n'
            'sources: []\n'
            'tags: [外来资料, A, B, C, D, E, 待核验]\n'
            '---\n\n'
            '- https://kns.cnki.net/kcms2/article/abstract?v=abcdef&uniplatform=NZKPT\n'
        )
        errors = check_kb.validate_external_page('external/bad.md', body)
        kinds = [e[0] for e in errors]
        self.assertIn('external-too-many-tags', kinds)
        self.assertIn('external-generic-tags', kinds)
        self.assertIn('external-ephemeral-url', kinds)


class LocalRootConfigTests(unittest.TestCase):
    def test_matches_current_repository_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '.kb.local.json').write_text(
                json.dumps({'root': str(root.resolve())}), encoding='utf-8')
            self.assertEqual(check_kb.validate_local_root_config(root), [])

    def test_rejects_a_different_repository_root(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / '.kb.local.json').write_text(
                json.dumps({'root': str(root / 'other')}), encoding='utf-8')
            errors = check_kb.validate_local_root_config(root)
            self.assertEqual(errors[0][0], 'local-root-mismatch')


class HistoricalHashReviewTests(unittest.TestCase):
    def setUp(self):
        self.path = '硬件/原始备份/example.md'
        self.proof = 'audit/repair.csv'
        self.files = {self.path: b'current source bytes', self.proof: b'repair evidence'}
        self.current = hashlib.sha256(self.files[self.path]).hexdigest()
        self.item = {'path': self.path, 'previous_sha256': 'a' * 64,
                     'sha256': self.current, 'status': 'needs-review'}
        self.manifest = {'items': [self.item]}
        self.hashes = {self.path: self.current}
        self.record = {'version': 1, 'reviews': [{
            'path': self.path, 'previous_sha256': 'a' * 64, 'sha256': self.current,
            'reviewed_on': '2026-11-28', 'scope': 'byte-change-only',
            'reason': 'Exact old bytes and repair changes reviewed.',
            'evidence': [{'path': self.proof,
                          'sha256': hashlib.sha256(self.files[self.proof]).hexdigest()}],
        }]}

    def validate(self, record=None, paths=None):
        return check_kb.validate_historical_hash_reviews(
            self.record if record is None else record, self.manifest, self.hashes,
            set(self.files) if paths is None else paths, self.files.__getitem__,
            evidence_is_safe=lambda target: True)

    def test_review_requires_exact_bytes_and_evidence_without_promoting_status(self):
        before = copy.deepcopy(self.manifest)
        self.assertEqual(self.validate()[0], [])
        self.assertEqual(list(self.validate()[1]), [self.path])
        self.assertEqual(self.validate()[2], [])
        self.assertEqual(self.manifest, before)

    def test_actual_file_change_invalidates_review(self):
        self.hashes[self.path] = 'b' * 64
        self.assertEqual(self.validate(), ([], {}, [self.path]))

    def test_updating_manifest_to_new_bytes_cannot_reuse_old_review(self):
        self.item['sha256'] = self.hashes[self.path] = 'b' * 64
        self.assertEqual(self.validate(), ([], {}, [self.path]))

    def test_changed_previous_hash_cannot_reuse_review(self):
        self.item['previous_sha256'] = 'b' * 64
        self.assertEqual(self.validate(), ([], {}, [self.path]))

    def test_changed_or_missing_evidence_invalidates_review(self):
        self.files[self.proof] = b'changed evidence'
        self.assertEqual(self.validate(), ([], {}, [self.path]))
        del self.files[self.proof]
        self.assertEqual(self.validate(), ([], {}, [self.path]))

    def test_staged_check_cannot_read_unstaged_evidence_from_worktree(self):
        self.assertEqual(self.validate(paths={self.path}), ([], {}, [self.path]))

    def test_private_absolute_traversal_and_self_evidence_are_rejected(self):
        for target in ['journal/daily/private.md', '/audit/proof.csv',
                       'C:/audit/proof.csv', 'audit/../private.csv',
                       'audit\\proof.csv', check_kb.HASH_REVIEWS]:
            record = copy.deepcopy(self.record)
            record['reviews'][0]['evidence'][0]['path'] = target
            errors, approved, _ = self.validate(record=record)
            self.assertTrue(errors, target)
            self.assertEqual(approved, {}, target)

    def test_missing_previous_hash_and_duplicate_review_fail_closed(self):
        del self.item['previous_sha256']
        self.assertTrue(self.validate()[0])
        self.item['previous_sha256'] = 'a' * 64
        self.record['reviews'].append(copy.deepcopy(self.record['reviews'][0]))
        errors, approved, _ = self.validate()
        self.assertTrue(errors)
        self.assertEqual(approved, {})

    def test_duplicate_manifest_paths_cannot_hide_another_old_hash(self):
        other = copy.deepcopy(self.item)
        other['previous_sha256'] = 'b' * 64
        self.manifest['items'].append(other)
        errors, approved, _ = self.validate()
        self.assertTrue(errors)
        self.assertEqual(approved, {})

    def test_staged_evidence_requires_regular_blob_mode(self):
        for mode, allowed in [('100644', True), ('100755', True),
                              ('120000', False), ('160000', False), ('unmerged', False)]:
            self.assertEqual(check_kb.public_review_evidence(
                self.proof, index_modes={self.proof: mode}), allowed)

    def test_worktree_evidence_rejects_junction_ancestor(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            alias = root / 'audit' / 'alias'
            alias.mkdir(parents=True)
            target = alias / 'proof.csv'
            target.write_text('proof', encoding='utf-8')
            self.assertTrue(check_kb.public_review_evidence('audit/alias/proof.csv', root=root))
            with mock.patch.object(Path, 'is_junction', autospec=True,
                                   side_effect=lambda path: path == alias, create=False):
                self.assertFalse(check_kb.public_review_evidence('audit/alias/proof.csv', root=root))

    def test_alias_guard_prevents_reading_evidence_bytes(self):
        def refuse_read(path):
            self.fail('Unsafe evidence must not be read: ' + path)
        errors, approved, _ = check_kb.validate_historical_hash_reviews(
            self.record, self.manifest, self.hashes, set(self.files), refuse_read,
            evidence_is_safe=lambda target: False)
        self.assertTrue(errors)
        self.assertEqual(approved, {})

    def test_malformed_date_scope_or_empty_evidence_are_rejected(self):
        for key, value in [('reviewed_on', '2026-02-30'), ('scope', 'technical-review'),
                           ('evidence', []), ('reason', '')]:
            record = copy.deepcopy(self.record)
            record['reviews'][0][key] = value
            errors, approved, _ = self.validate(record=record)
            self.assertTrue(errors)
            self.assertEqual(approved, {})

    def test_no_review_does_not_waive_historical_drift(self):
        self.assertEqual(check_kb.validate_historical_hash_reviews(
            None, self.manifest, self.hashes, set(self.files), self.files.__getitem__),
            ([], {}, []))


if __name__ == '__main__':
    unittest.main()
