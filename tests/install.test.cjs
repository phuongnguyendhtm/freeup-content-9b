const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os'), crypto = require('node:crypto');
const installer = require('../install.cjs');
const downloader = require('../scripts/download.cjs');
const fixtureBase = process.env.FREEUP_TEST_DIR || os.tmpdir(); fs.mkdirSync(fixtureBase, { recursive: true });
const fixture = fs.mkdtempSync(path.join(fixtureBase, 'freeup-universal-test-'));
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
  assert(fs.existsSync(path.join(base, 'references', 'local-workflow.md')));
  assert(!fs.existsSync(path.join(base, 'references', 'google-sheet-template.json')));
  assert(fs.existsSync(path.join(result.skills_dir, 'duyetbai', 'SKILL.md')));
  assert(!fs.existsSync(path.join(result.skills_dir, 'duyetvadang')));
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
test('upgrade retires only an unchanged owned publishing group and preserves user data', () => {
  const context={home:path.join(fixture,'retire-owned'),env:{}};
  const result=quiet(()=>installer.main(['--target','codex','--apply'],context));
  const folder=path.join(result.skills_dir,'duyetvadang');fs.mkdirSync(folder);
  const content='Old owned skill';fs.writeFileSync(path.join(folder,'SKILL.md'),content);
  const manifest=require('../package/distribution-manifest.json');
  fs.writeFileSync(path.join(folder,'freeup-gift-origin.json'),JSON.stringify({package_id:manifest.package_id,skill_name:'duyetvadang',installed_files:{'SKILL.md':crypto.createHash('sha256').update(content).digest('hex')}}));
  quiet(()=>installer.main(['--target','codex','--apply','--upgrade'],context));
  assert(!fs.existsSync(folder));
  const reports=path.join(path.dirname(result.skills_dir),'freeup-content-install-reports');
  assert(fs.readdirSync(reports).some(n=>n.startsWith('retired-')&&fs.readFileSync(path.join(reports,n,'SKILL.md'),'utf8')===content));
});
test('unowned retired name blocks before changing any active skill', () => {
  const context={home:path.join(fixture,'retire-conflict'),env:{}};
  const folder=path.join(context.home,'.codex','skills','duyetvadang');fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'SKILL.md'),'Student owned');
  assert.throws(()=>quiet(()=>installer.main(['--target','codex','--apply','--upgrade'],context)),/ownership/);
  assert(!fs.existsSync(path.join(path.dirname(folder),'freeup-content-system')));
});

test('locked Windows directory can retire the skill entry after a verified backup, and reruns are safe', () => {
  const retire=require('../package/retire-skills.cjs'),manifest=require('../package/distribution-manifest.json');
  const skillRoot=path.join(fixture,'locked-retirement','skills'),folder=path.join(skillRoot,'duyetvadang');fs.mkdirSync(folder,{recursive:true});
  const content='Owned publishing group';fs.writeFileSync(path.join(folder,'SKILL.md'),content);
  fs.writeFileSync(path.join(folder,'freeup-gift-origin.json'),JSON.stringify({package_id:manifest.package_id,skill_name:'duyetvadang',installed_files:{'SKILL.md':crypto.createHash('sha256').update(content).digest('hex')}}));
  const plan=retire.plan(skillRoot,manifest),original=fs.renameSync;
  let done;try{fs.renameSync=()=>{throw Object.assign(Error('Fixture locked directory'),{code:'EBUSY'});};done=retire.apply(plan,path.join(fixture,'locked-retirement','backup'));}finally{fs.renameSync=original;}
  assert(!fs.existsSync(path.join(folder,'SKILL.md')));assert.equal(fs.readFileSync(path.join(done[0].backup,'SKILL.md'),'utf8'),content);assert.deepEqual(retire.plan(skillRoot,manifest),[]);
});

test('local morning report is read only and never reports a missing scan as completed', () => {
  const {report}=require('../package/skills/freeup-content-system/scripts/local-report.cjs');const project=path.join(fixture,'report-no-data');
  const text=report(project,new Date('2026-10-22T18:00:00Z'));
  assert.match(text,/2026-10-23/);assert.match(text,/Chưa có biên bản nghiên cứu/);assert(!fs.existsSync(project));
  fs.mkdirSync(path.join(project,'database/research_runs'),{recursive:true});const file=path.join(project,'database/research_runs/2026-10-23.json');
  fs.writeFileSync(file,JSON.stringify({status:'PARTIAL',selected:[{topic:'Ý đã đọc thật'}],reason:'Nguồn bị chặn'}));const before=fs.readFileSync(file,'utf8');
  const result=report(project,new Date('2026-10-22T18:00:00Z'));assert.match(result,/PARTIAL/);assert.match(result,/Nguồn bị chặn/);assert.equal(fs.readFileSync(file,'utf8'),before);
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
