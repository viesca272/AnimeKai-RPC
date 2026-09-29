import importlib.util
import io
import json
import os
from pathlib import Path
import struct
import tempfile
import unittest
from unittest.mock import patch

TEMP = tempfile.TemporaryDirectory()
os.environ['LOCALAPPDATA'] = TEMP.name
path = Path(__file__).resolve().parents[2] / 'src/v7/native_host/native_host.py'
spec = importlib.util.spec_from_file_location('host', path)
host = importlib.util.module_from_spec(spec)
spec.loader.exec_module(host)


class FakeRPC:
    def __init__(self):
        self.updates = []
        self.cleared = False
    def update(self, **data):
        self.updates.append(data)
    def clear(self):
        self.cleared = True


class HostTests(unittest.TestCase):
    def setUp(self):
        host.rpc = FakeRPC()
        host.discord_connected = True
        host.clear()
        self.status = patch.object(host, 'status').start()
        self.clock = patch.object(host.time, 'time', return_value=1700000000).start()
        self.data = dict(url='https://animepahe.com/play/a/b', title='Frieren', episode=3, image='https://img.test/a.png', state='playing', position=60, duration=1200)
    def tearDown(self):
        patch.stopall()
    def test_site_names_and_badges(self):
        host.activity(self.data)
        d = host.rpc.updates[-1]
        self.assertEqual(d['buttons'][0]['label'], 'Watch on AnimePahe')
        self.assertTrue(d['small_image'].endswith('/play-256.png'))
    def test_pause_removes_running_timestamps(self):
        host.activity(self.data)
        host.activity({**self.data, 'state':'paused'})
        d = host.rpc.updates[-1]
        self.assertNotIn('start', d)
        self.assertNotIn('end', d)
        self.assertTrue(d['small_image'].endswith('/pause-256.png'))
    def test_seek_reanchors_timer(self):
        host.activity(self.data)
        start = host.rpc.updates[-1]['start']
        host.activity({**self.data, 'position':300})
        self.assertEqual(host.rpc.updates[-1]['start'], start-240000)
    def test_browsing_art_matches_site(self):
        host.activity({**self.data, 'kind':'browsing', 'image':''})
        d=host.rpc.updates[-1]
        self.assertEqual(d['details'],'Browsing AnimePahe')
        self.assertTrue(d['large_image'].endswith('/animepahe-512.png'))
    def test_unknown_numbers_and_waiting(self):
        host.activity({**self.data, 'state':'waiting','position':float('nan'),'duration':float('inf'),'episode':None,'total':None})
        d=host.rpc.updates[-1]
        self.assertIn('Waiting for player',d['state'])
        self.assertNotIn('start',d)
    def test_foreign_url_is_not_published(self):
        host.activity({**self.data, 'url':'https://animepahe.com.evil.test'})
        self.assertFalse(host.rpc.updates)
    def test_image_failure_reaches_text_fallback(self):
        calls=[]
        def update(**data):
            if 'large_image' in data: raise ValueError('Image failed')
            calls.append(data)
        host.rpc.update=update
        host.activity(self.data)
        self.assertEqual(len(calls),1)
        self.assertEqual(host.last_variant,'minimal')
    def test_bom_preferences_are_preserved(self):
        host.CONFIG_FILE.write_text(json.dumps({'showTimestamp':False}),encoding='utf-8-sig')
        self.assertFalse(host.cfg()['showTimestamp'])
        host.CONFIG_FILE.unlink()
    def test_repair_preserves_valid_browser_origins(self):
        extra = "chrome-extension://" + "a"*32 + "/"
        host.MANIFEST_FILE.write_text(json.dumps({"allowed_origins":[extra,"chrome-extension://bad/"]}),encoding="utf-8-sig")
        origins = host.expected_manifest()["allowed_origins"]
        self.assertIn(extra,origins)
        self.assertNotIn("chrome-extension://bad/",origins)
        host.MANIFEST_FILE.unlink()
    def test_episode_zero_is_not_unknown(self):
        self.assertEqual(host.templ("Episode {episode}", {"episode":0}, "Playing"), "Episode 0")
    def test_partial_native_stream_is_read(self):
        class Stream(io.BytesIO):
            def read(self,size=-1):return super().read(min(size,2))
        data=b'{"type":"ping"}'
        stream=Stream(struct.pack('<I',len(data))+data)
        with patch.object(host.sys,'stdin',type('In',(),{'buffer':stream})()):
            self.assertEqual(host.readmsg(),{'type':'ping'})
    def test_oversized_native_message_rejected(self):
        with patch.object(host.sys,'stdin',type('In',(),{'buffer':io.BytesIO(struct.pack('<I',2**22))})()):
            with self.assertRaises(ValueError):host.readmsg()

if __name__=='__main__':
    unittest.main()
