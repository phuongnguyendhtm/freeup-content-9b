const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const installer = require('../install.cjs');
const sheet = require('../package/skills/freeup-content-system/scripts/sheet-template.cjs');
const downloader = require('../scripts/download.cjs');
const contract = require('../package/skills/freeup-content-system/references/google-sheet-template.json');
const fixtureBase = process.env.FREEUP_TEST_DIR || os.tmpdir(); fs.mkdirSync(fixtureBase, { recursive: true });
const fixture = fs.mkdtempSync(path.join(fixtureBase, 'freeup-universal-test-'));
function snapshot(id = 'student-copy-fixture') { return { spreadsheetId: id, sheets: contract.sheets.map(x => ({ title: x.title, headers: [...x.headers], ...(x.formula_a2 ? { formula_a2: x.formula_a2 } : {}) })) }; }
function quiet(fn) { const log = console.log; try { console.log = () => {}; return fn(); } finally { console.log = log; } }
test('running host signals and explicit target choose exactly one host', () => {
  assert.equal(installer.target({ target: 'claude' }, { CODEX_HOME: 'other-app' }), 'claude');
  assert.equal(installer.target({ target: 'auto' }, { CODEX_THREAD_ID: 'current' }), 'codex');
  assert.equal(installer.target({ target: 'auto' }, { CLAUDECODE: '1' }), 'claude');
  assert.equal(installer.target({ target: 'auto' }, { NINEBIZ_INSTALL_ROOT: 'installed' }), '9bizclaw');
  assert.equal(installer.target({ target: 'auto' }, { OPENCLAW_STATE_DIR: path.join(fixture, '.openclaw') }), 'openclaw');
  assert.throws(() => installer.target({ target: 'auto' }, {}), /tín hiệu/);
});
for (const host of ['codex', 'claude']) test(host + ': fresh install, Unicode/space paths, runtime and idempotency preserve company data', () => {
  const home = path.join(fixture, host + ' Học viên mới');
  const context = { home, env: {} };
  const planned = quiet(() => installer.main(['--target', host, '--plan'], context));
  assert.equal(fs.existsSync(home), false); assert.equal(planned.skills.length, 8);
  const result = quiet(() => installer.main(['--target', host, '--apply', '--upgrade'], context));
  assert.equal(result.state, 'files-verified');
  assert.equal(result.skills.length, 8);
  const base = path.join(result.skills_dir, 'freeup-content-system');
  const runtime = JSON.parse(fs.readFileSync(path.join(base, 'runtime.json')));
  assert.equal(path.resolve(base, runtime.project_relative), result.data_dir);
  assert(fs.existsSync(path.join(base, 'references', 'google-sheet-template.json')));
  const profile = path.join(result.data_dir, 'database', 'brand_config.json');
  fs.writeFileSync(profile, JSON.stringify({ brand_name: 'Doanh nghiệp của học viên', usp: 'Giữ riêng' }));
  const again = quiet(() => installer.main(['--target', host, '--apply', '--upgrade'], context));
  assert(again.skills.every(x => x.action === 'keep'));
  assert.equal(JSON.parse(fs.readFileSync(profile)).usp, 'Giữ riêng');
  assert.equal(fs.existsSync(path.join(base, 'student-project')), false);
});
test('upgrade keeps a backup; edited skill and conflicting name stop before changing other targets', () => {
  const context = { home: path.join(fixture, 'upgrade'), env: {} };
  const r = quiet(() => installer.main(['--target', 'codex', '--apply'], context));
  const base = path.join(r.skills_dir, 'freeup-content-system');
  const receipt = path.join(base, 'freeup-gift-origin.json');
  const origin = JSON.parse(fs.readFileSync(receipt)); origin.version = '1.5.9'; fs.writeFileSync(receipt, JSON.stringify(origin));
  assert.throws(() => quiet(() => installer.main(['--target', 'codex', '--apply'], context)), /--upgrade/);
  quiet(() => installer.main(['--target', 'codex', '--apply', '--upgrade'], context));
  assert(fs.readdirSync(path.join(path.dirname(r.skills_dir), 'freeup-content-install-reports')).some(n => n.startsWith('backup-')));
  fs.appendFileSync(path.join(base, 'SKILL.md'), '\nStudent customization\n');
  assert.throws(() => quiet(() => installer.main(['--target', 'codex', '--apply', '--upgrade'], context)), /đã được sửa/);
  const conflict = { home: path.join(fixture, 'conflict'), env: {} };
  const existing = path.join(conflict.home, '.claude', 'skills', 'vietbai'); fs.mkdirSync(existing, { recursive: true }); fs.writeFileSync(path.join(existing, 'SKILL.md'), 'Mine');
  assert.throws(() => quiet(() => installer.main(['--target', 'claude', '--apply', '--upgrade'], conflict)), /không thuộc/);
  assert.equal(fs.existsSync(path.join(conflict.home, '.claude', 'skills', 'freeup-content-system')), false);
});
test('native targets cannot be redirected through the file-copy adapter', () => {
  assert.throws(() => installer.main(['--target', '9bizclaw', '--skills-dir', fixture]), /Native host/);
  assert.throws(() => installer.main(['--target', 'openclaw', '--data-dir', fixture]), /Native host/);
});
test('sheet validator accepts the exact template and rejects source, missing tab, arbitrary headers or formula', () => {
  assert.equal(sheet.validate(snapshot()).student_spreadsheet_id, 'student-copy-fixture');
  assert.throws(() => sheet.validate(snapshot(contract.source_spreadsheet_id)), /Sheet gốc/);
  const missing = snapshot(); missing.sheets.pop(); assert.throws(() => sheet.validate(missing), /Thiếu/);
  const headers = snapshot(); headers.sheets[3].headers[0] = 'Random ID'; assert.throws(() => sheet.validate(headers), /Header/);
  const formula = snapshot(); formula.sheets[2].formula_a2 = '=1'; assert.throws(() => sheet.validate(formula), /Công thức/);
});
test('sheet bind reuses the existing board and preserves automation state; does not switch IDs', () => {
  const project = path.join(fixture, 'binding'), input = path.join(fixture, 'snapshot.json'); fs.writeFileSync(input, JSON.stringify(snapshot()));
  const a = quiet(() => sheet.main(['bind', '--file', input, '--project', project]));
  const data = JSON.parse(fs.readFileSync(a.binding_file)); data.automation_state = 'verified-fixture'; data.account = 'own-account'; fs.writeFileSync(a.binding_file, JSON.stringify(data));
  quiet(() => sheet.main(['bind', '--file', input, '--project', project]));
  assert.equal(JSON.parse(fs.readFileSync(a.binding_file)).automation_state, 'verified-fixture');
  assert.equal(JSON.parse(fs.readFileSync(a.binding_file)).account, 'own-account');
  fs.writeFileSync(input, JSON.stringify(snapshot('different-copy')));
  assert.throws(() => quiet(() => sheet.main(['bind', '--file', input, '--project', project])), /Sheet riêng khác/);
});
test('no-Git download pins a commit, checks every digest and refuses corruption/existing destination', async () => {
  const originalFetch = global.fetch, commit = 'a'.repeat(40), bytes = Buffer.from('reviewed fixture');
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  let corrupt = false; const urls = [];
  global.fetch = async url => {
    urls.push(url);
    if (url.includes('api.github.com')) return new Response(JSON.stringify({ sha: commit }));
    assert(url.includes('/' + commit + '/'));
    if (url.endsWith('/release.json')) return new Response(JSON.stringify({ version: 'fixture', files: { 'install.cjs': digest, 'package/package-checksums.json': digest } }));
    return new Response(corrupt ? 'bad' : bytes);
  };
  try {
    const dest = path.join(fixture, 'download'); const r = await downloader.download(dest);
    assert.equal(r.files, 2); assert.equal(r.commit, commit);
    await assert.rejects(() => downloader.download(dest), /đã có/);
    corrupt = true; await assert.rejects(() => downloader.download(path.join(fixture, 'corrupt')), /SHA-256/);
    assert(urls.some(x => x.includes('api.github.com')));
  } finally { global.fetch = originalFetch; }
});
test('download path validation blocks traversal and Windows reserved paths', () => {
  for (const name of ['../x', 'a/../b', '/root', 'C:/x', 'a\\b', 'CON.txt', 'a./b']) assert.throws(() => downloader.safeName(name));
  assert.equal(downloader.safeName('package/skills/vietbai/SKILL.md'), 'package/skills/vietbai/SKILL.md');
});
