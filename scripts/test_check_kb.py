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

    def test_notice_is_specific_to_missing_attachments(self):
        self.assertTrue(check_kb.has_missing_attachment_notice('来源插图缺失，仅文本可用。'))
        self.assertFalse(check_kb.has_missing_attachment_notice('高速PCB设计资料中的边界说明。'))
        self.assertFalse(check_kb.has_missing_attachment_notice('附件测试过程未执行。'))


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
