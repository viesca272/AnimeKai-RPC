const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const extension = path.join(root, 'src/v7/extension');
const read = name => fs.readFileSync(path.join(extension, name), 'utf8');
const manifest = JSON.parse(read('manifest.json'));

assert.equal(manifest.name, 'Anime-RPC');
assert.equal(manifest.version, '7.0.0.1');
assert.equal(manifest.version_name, require('../package.json').version);
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.optional_host_permissions, ['<all_urls>']);
assert(!manifest.host_permissions.some(host => host.includes('<all_urls>') || host.includes('*://')));
assert.equal(manifest.key, JSON.parse(fs.readFileSync(path.join(root, 'src/v6/extension/manifest.json'))).key);
const files = [manifest.background.service_worker, manifest.action.default_popup,
  ...Object.values(manifest.icons), ...manifest.content_scripts.flatMap(script => script.js)];
for (const file of files) assert(fs.existsSync(path.join(extension, file)), `Missing ${file}`);
for (const entry of fs.readdirSync(extension, {recursive:true})) {
  const file = path.join(extension, entry);
  if (entry.endsWith('.js')) execFileSync(process.execPath, ['--check', file]);
  if (entry.endsWith('.html')) {
    const html = fs.readFileSync(file, 'utf8');
    for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
      assert(!/^https?:/.test(match[1]), 'Extension scripts must be bundled');
      assert(fs.existsSync(path.resolve(path.dirname(file), match[1])));
    }
    assert(!/\son\w+=/i.test(html), `Inline event handler in ${entry}`);
  }
}
for (const site of ['animekai', 'animepahe', 'nineanime']) {
  assert(fs.statSync(path.join(extension, 'assets/rpc', `${site}-512.png`)).size > 0);
}
console.log('V7 manifest, migration key, local scripts, artwork, and JavaScript syntax checked.');
