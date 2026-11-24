import importlib.util
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


if __name__ == '__main__':
    unittest.main()
