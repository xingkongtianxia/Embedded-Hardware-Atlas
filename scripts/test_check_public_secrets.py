import importlib.util
import unittest
from pathlib import Path


MODULE_SPEC = importlib.util.spec_from_file_location(
    'check_public_secrets', Path(__file__).with_name('check_public_secrets.py'))
secret_check = importlib.util.module_from_spec(MODULE_SPEC)
MODULE_SPEC.loader.exec_module(secret_check)


class PublicSecretTests(unittest.TestCase):
    def test_detects_private_key_without_returning_key_material(self):
        header = '-' * 5 + 'BEGIN OPENSSH ' + 'PRIVATE KEY' + '-' * 5
        findings = secret_check.scan_text('example.pem',
                                          header + '\n...')

        self.assertEqual(findings, [('private-key-block', 1)])

    def test_detects_provider_token(self):
        findings = secret_check.scan_text('example.md', 'GITHUB_TOKEN=github_pat_' + 'A' * 60)

        self.assertEqual(findings, [('github-token', 1)])

    def test_detects_credential_assignment(self):
        findings = secret_check.scan_text('config.env', 'access_token = "' + 'x' * 40 + '"')

        self.assertEqual(findings, [('credential-assignment', 1)])

    def test_ignores_documentation_placeholders(self):
        contents = 'API_KEY="your-api-key-here"\npassword = "changeme"\nsecret=<redacted>\n'

        self.assertEqual(secret_check.scan_text('README.md', contents), [])

    def test_flags_private_material_filenames(self):
        self.assertTrue(secret_check.is_sensitive_filename('service.pem'))
        self.assertTrue(secret_check.is_sensitive_filename('.env.production'))
        self.assertFalse(secret_check.is_sensitive_filename('datasheet.pdf'))


if __name__ == '__main__':
    unittest.main()
