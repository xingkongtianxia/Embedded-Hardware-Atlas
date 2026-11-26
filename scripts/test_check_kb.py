import importlib.util
import json
import tempfile
import unittest
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


if __name__ == '__main__':
    unittest.main()
