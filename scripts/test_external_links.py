import importlib.util
import unittest
from pathlib import Path
from urllib.error import HTTPError


MODULE_SPEC = importlib.util.spec_from_file_location(
    'external_links', Path(__file__).with_name('check_external_links.py'))
external_links = importlib.util.module_from_spec(MODULE_SPEC)
MODULE_SPEC.loader.exec_module(external_links)


class FakeResponse:
    status = 200
    url = 'https://docs.example.org/final'

    def __enter__(self):
        return self

    def __exit__(self, *arguments):
        return False


class FakeOpener:
    def __init__(self, responses):
        self.responses = list(responses)
        self.calls = []

    def open(self, request, timeout):
        self.calls.append((request.get_method(), timeout))
        result = self.responses.pop(0)
        if isinstance(result, Exception):
            raise result
        return result


class ExternalLinkTests(unittest.TestCase):
    def test_extracts_unique_markdown_urls_with_source_lines(self):
        sources = {
            'external/a.md': ('Header\n\n```text\nhttps://example.org/ignored\n```\n'
                              '[manual](https://docs.example.org/a).\n'
                              'See https://docs.example.org/a again.\n')
        }

        links, skipped = external_links.collect_links(sources)

        self.assertEqual(len(links), 1)
        self.assertEqual(links[0]['url'], 'https://docs.example.org/a')
        self.assertEqual(links[0]['locations'], [('external/a.md', 6), ('external/a.md', 7)])
        self.assertEqual(skipped, [])

    def test_auth_and_query_urls_are_not_requested_or_written_to_audit(self):
        sources = {'external/source.md': ('https://' + 'user' + ':' + 'secret' + '@example.org/a\n'
                   'https://example.org/doc?token=private\n'
                   'https://kns.cnki.net/paper?id=private\n')}

        links, skipped = external_links.collect_links(sources)

        self.assertEqual(links, [])
        self.assertEqual(len(skipped), 3)
        self.assertNotIn('secret', str(skipped))
        self.assertNotIn('token=', str(skipped))
        self.assertNotIn('private', str(skipped))

    def test_strips_balanced_markdown_link_closer_and_local_punctuation(self):
        url = 'https://docs.example.org/path'
        links, _ = external_links.collect_links({'external/a.md': f'[source]({url})、[next](/local)\n'})

        self.assertEqual([link['url'] for link in links], [url])

    def test_404_is_confirmed_broken(self):
        opener = FakeOpener([HTTPError('https://example.org/missing', 404, 'Not Found', {}, None)])

        result = external_links.inspect_url('https://example.org/missing', opener)

        self.assertEqual(result['result'], 'not_found')
        self.assertEqual(opener.calls, [('HEAD', external_links.TIMEOUT_SECONDS)])

    def test_forbidden_is_access_restricted_not_a_broken_link(self):
        opener = FakeOpener([HTTPError('https://example.org/page', 403, 'Forbidden', {}, None)])

        result = external_links.inspect_url('https://example.org/page', opener)

        self.assertEqual(result['result'], 'access_restricted')

    def test_unsupported_head_retries_get_without_disclosing_query(self):
        opener = FakeOpener([
            HTTPError('https://example.org/page', 405, 'Method Not Allowed', {}, None), FakeResponse()])

        result = external_links.inspect_url('https://example.org/page', opener)

        self.assertEqual(result['result'], 'ok')
        self.assertEqual(opener.calls, [
            ('HEAD', external_links.TIMEOUT_SECONDS), ('GET', external_links.TIMEOUT_SECONDS)])
        self.assertNotIn('token=', str(result))


if __name__ == '__main__':
    unittest.main()
