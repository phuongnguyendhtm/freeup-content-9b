#!/usr/bin/env node
'use strict';
// Runs only against new isolated fixtures. It never selects the user's app state.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bootstrap = require('./bootstrap.cjs');
const packageRoot = __dirname;
const args = process.argv.slice(2);
const opt = name => { const index = args.indexOf(name); return index < 0 ? null : args[index + 1]; };
const outputBase = path.resolve(opt('--output') || os.tmpdir());
fs.mkdirSync(outputBase, { recursive: true });
const fixtureRoot = fs.mkdtempSync(path.join(outputBase, 'freeup-bootstrap-smoke-'));
const results = [];
function write(file, data) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2)); }
function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function test(name, fn) { const start = Date.now(); fn(); results.push({ name, passed: true, elapsed_ms: Date.now() - start }); console.log(`PASS ${name}`); }
function copy(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name), to = path.join(target, entry.name);
    if (entry.isDirectory()) copy(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
    else throw Error('Test source contains unsupported link/file.');
  }
}
function fixture(label) {
  const root = path.join(fixtureRoot, label);
  const gift = path.join(root, 'downloaded-gift');
  const state = path.join(root, 'state');
  const workspace = path.join(state, 'workspace-student');
  fs.mkdirSync(workspace, { recursive: true });
  fs.mkdirSync(gift, { recursive: true });
  fs.copyFileSync(path.join(packageRoot, 'bootstrap.cjs'), path.join(gift, 'bootstrap.cjs'));
  const names = ['freeup-content-system', 'caidat', 'vietbai'];
  for (const name of names) {
    const dir = path.join(gift, 'skills', name);
    write(path.join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: Test fixture\n---\nFixture only.\n`);
  }
  write(path.join(gift, 'skills/freeup-content-system/scripts/content.cjs'), "const fs=require('node:fs'),path=require('node:path');const args=process.argv.slice(2);const project=args[args.indexOf('--project')+1];fs.mkdirSync(path.join(project,'database'),{recursive:true});const profile=path.join(project,'database','brand_config.json');if(!fs.existsSync(profile))fs.writeFileSync(profile,JSON.stringify({configured:false}));console.log(JSON.stringify({initialized:true}));");
  write(path.join(gift, 'distribution-manifest.json'), { package_id: 'freeup-content-student-gift', version: '1.0.0', skills: names.map(name => ({ name, source: `skills/${name}` })) });
  write(path.join(state, 'openclaw.json'), { agents: { defaults: { skills: ['existing-skill'] }, entries: { student: { workspace }, other: { workspace: path.join(state, 'workspace-other'), skills: ['other-skill'] } } }, gateway: { mode: 'local', port: 19899 } });
  const cli = path.join(root, 'mock-openclaw.mjs');
  write(cli, `import fs from 'node:fs';import path from 'node:path';
const args=process.argv.slice(2),state=process.env.OPENCLAW_STATE_DIR,configPath=process.env.OPENCLAW_CONFIG_PATH;let config=JSON.parse(fs.readFileSync(configPath,'utf8'));
const id=args.includes('--agent')?args[args.indexOf('--agent')+1]:'student';const agent=config.agents.entries[id];const workspace=agent.workspace;const root=path.join(workspace,'skills');
const log=path.join(state,'mock-calls.json');const calls=fs.existsSync(log)?JSON.parse(fs.readFileSync(log,'utf8')):[];calls.push(args);fs.writeFileSync(log,JSON.stringify(calls));
function emit(x){console.log(JSON.stringify(x));}function failure(x){console.error(x);process.exit(1);}function copyFiles(source,target){fs.mkdirSync(target,{recursive:true});for(const entry of fs.readdirSync(source,{withFileTypes:true})){const from=path.join(source,entry.name),to=path.join(target,entry.name);if(entry.isDirectory())copyFiles(from,to);else fs.copyFileSync(from,to);}}
if(args[0]==='skills'&&args[1]==='list'){const skills=[];if(fs.existsSync(root))for(const name of fs.readdirSync(root)){const folder=path.join(root,name);if(!fs.existsSync(path.join(folder,'SKILL.md')))continue;skills.push({name,eligible:true,disabled:false,blockedByAllowlist:false,blockedByAgentFilter:!(agent.skills||config.agents.defaults.skills||[]).includes(name),source:'openclaw-workspace'});}if(config.mockVisibleConflict)skills.push({name:config.mockVisibleConflict,eligible:true,source:'agents-skills-personal'});emit({workspaceDir:workspace,skills});}
else if(args[0]==='skills'&&args[1]==='install'){if(config.mockPolicyBlock)failure('security.installPolicy: block fixture');const source=args[2],name=args[args.indexOf('--as')+1],target=path.join(root,name);if(fs.existsSync(target)){if(!args.includes('--force'))failure('target exists');fs.rmSync(target,{recursive:true,force:true});}fs.mkdirSync(root,{recursive:true});copyFiles(source,target);fs.mkdirSync(path.join(target,'.openclaw'),{recursive:true});fs.writeFileSync(path.join(target,'.openclaw','source-origin.json'),'{}');emit({ok:true});}
else if(args[0]==='config'&&args[1]==='set'){const batch=JSON.parse(fs.readFileSync(args[args.indexOf('--batch-file')+1],'utf8'));if(!args.includes('--dry-run')){for(const change of batch){const keys=change.path.replace(/\\[(\\d+)\\]/g,'.$1').split('.');let obj=config;for(const key of keys.slice(0,-1))obj=obj[key]??=(Number.isInteger(Number(keys[key]))?[]:{});obj[keys.at(-1)]=change.value;}fs.writeFileSync(configPath,JSON.stringify(config,null,2));}emit({ok:true,dryRun:args.includes('--dry-run')});}
else if(args[0]==='config'&&args[1]==='get'){emit(config.agents);}
else failure('unexpected mock native action');`);
  return { root, gift, state, workspace, cli, names };
}
function run(f, flags, expectOk = true) {
  const env = { ...process.env, OPENCLAW_STATE_DIR: f.state, OPENCLAW_CONFIG_PATH: path.join(f.state, 'openclaw.json') };
  const result = cp.spawnSync(process.execPath, [path.join(f.gift, 'bootstrap.cjs'), '--cli', f.cli, '--state-dir', f.state, '--agent', 'student', ...flags], { env, encoding: 'utf8', windowsHide: true, timeout: 120000, maxBuffer: 4 * 1024 * 1024 });
  if (result.error) throw result.error;
  if (expectOk) assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  else assert.notEqual(result.status, 0, `${result.stdout}\n${result.stderr}`);
  return `${result.stdout}\n${result.stderr}`;
}
function recoveryFixture(label, upgrade = false) {
  const f = fixture('timeout-' + label);
  const manifest = read(path.join(f.gift, 'distribution-manifest.json'));
  const source = path.join(f.gift, 'skills/vietbai');
  const files = bootstrap.treeFiles(source);
  const skill = { name: 'vietbai', sourceHash: crypto.createHash('sha256').update(JSON.stringify(files)).digest('hex') };
  const stage = path.join(f.root, 'stage');
  copy(source, stage);
  write(path.join(stage, 'freeup-gift-origin.json'), { schema_version: 1, package_id: manifest.package_id, version: manifest.version, skill_name: skill.name, source_hash: skill.sourceHash, installed_files: files, installed_at_utc: 'fixture' });
  const target = path.join(f.workspace, 'skills/vietbai');
  if (upgrade) {
    write(path.join(target, 'SKILL.md'), 'Old managed version fixture.');
    const oldFiles = bootstrap.treeFiles(target);
    write(path.join(target, 'freeup-gift-origin.json'), { schema_version: 1, package_id: manifest.package_id, version: '0.9.0', skill_name: skill.name, source_hash: crypto.createHash('sha256').update(JSON.stringify(oldFiles)).digest('hex'), installed_files: oldFiles, installed_at_utc: 'older-fixture' });
  }
  return { ...f, manifest, skill, stage, target, options: { upgrade }, item: { skill, target, action: upgrade ? 'upgrade' : 'install' } };
}
function timeoutError(nativeOutput = '') { const error = new Error('Transient native timeout fixture'); error.code = 'ETIMEDOUT'; error.nativeOutput = nativeOutput; return error; }
function nativeCopy(f) { fs.cpSync(f.stage, f.target, { recursive: true }); }
function recover(f, callback) { return bootstrap.installNativeWithRecovery({}, ['skills', 'install', f.stage, '--agent', 'student', '--as', 'vietbai', ...(f.options.upgrade ? ['--force'] : [])], f.item, f.stage, f.manifest, f.options, callback); }
try {
  test('argument/roster/allowlist rules', () => {
    assert.equal(bootstrap.parseArgs([]).apply, false);
    assert.throws(() => bootstrap.parseArgs(['--apply', '--plan']));
    assert.throws(() => bootstrap.parseArgs(['--install-deps']));
    const agents = { defaults: { skills: ['old'] }, entries: { student: {}, other: { skills: ['other'] } } };
    assert.throws(() => bootstrap.selectAgent(agents));
    assert.deepEqual(bootstrap.allowlistBatch(agents, bootstrap.selectAgent(agents, 'student'), ['new']), [{ path: 'agents.entries.student.skills', value: ['old', 'new'] }]);
    assert.deepEqual(agents.defaults.skills, ['old']);
    const legacy = { defaults: { skills: ['old'] }, list: [{ id: 'student', skills: ['own'] }] };
    assert.equal(bootstrap.allowlistBatch(legacy, bootstrap.selectAgent(legacy), ['new'])[0].path, 'agents.list[0].skills');
    assert.deepEqual(bootstrap.allowlistBatch({ entries: { student: {} } }, { id: 'student', entry: {}, configPath: 'agents.entries.student.skills' }, ['new']), []);
    const implicit = { defaults: { skills: ['old'] } };
    assert.deepEqual(bootstrap.allowlistBatch(implicit, bootstrap.selectAgent(implicit), ['new']), [{ path: 'agents.entries.main.skills', value: ['old', 'new'] }]);
  });
  const normal = fixture('normal');
  test('default plan does not install or change config', () => {
    const before = fs.readFileSync(path.join(normal.state, 'openclaw.json'), 'utf8');
    run(normal, []);
    assert.equal(fs.readFileSync(path.join(normal.state, 'openclaw.json'), 'utf8'), before);
    assert.equal(fs.existsSync(path.join(normal.workspace, 'skills')), false);
  });
  test('apply fresh student machine; no legacy or owner assets', () => {
    const output = run(normal, ['--apply']);
    assert.match(output, /dùng \/caidat để kiểm hồ sơ doanh nghiệp/);
    assert.doesNotMatch(output, /dùng \/setup/);
    const config = read(path.join(normal.state, 'openclaw.json'));
    assert.deepEqual(config.agents.defaults.skills, ['existing-skill']);
    assert.deepEqual(config.agents.entries.other.skills, ['other-skill']);
    assert.deepEqual(config.agents.entries.student.skills, ['existing-skill', ...normal.names]);
    const runtime = read(path.join(normal.workspace, 'skills/freeup-content-system/runtime.json'));
    assert.equal(runtime.project_relative, '../../freeup-content-data');
    assert.deepEqual(read(path.join(normal.workspace, 'freeup-content-data/database/brand_config.json')), { configured: false });
  });
  test('same gift rerun is idempotent and preserves student profile', () => {
    const calls = read(path.join(normal.state, 'mock-calls.json'));
    const beforeInstalls = calls.filter(call => call[0] === 'skills' && call[1] === 'install').length;
    const profile = path.join(normal.workspace, 'freeup-content-data/database/brand_config.json');
    write(profile, { configured: true, brand_name: 'Student brand' });
    const browserCache = path.join(normal.workspace, 'skills/freeup-content-system/.runtime/puppeteer/chrome/test/chrome.exe');
    write(browserCache, 'Generated browser cache fixture');
    run(normal, ['--apply']);
    const afterInstalls = read(path.join(normal.state, 'mock-calls.json')).filter(call => call[0] === 'skills' && call[1] === 'install').length;
    assert.equal(afterInstalls, beforeInstalls);
    assert.equal(read(profile).brand_name, 'Student brand');
    assert.equal(fs.readFileSync(browserCache, 'utf8'), 'Generated browser cache fixture');
  });
  test('unrelated target and visible-source conflict rejected before installs', () => {
    const occupied = fixture('occupied');
    write(path.join(occupied.workspace, 'skills/caidat/SKILL.md'), 'Unrelated skill');
    const out = run(occupied, ['--apply'], false);
    assert.match(out, /không thuộc quà tặng/);
    assert.equal(read(path.join(occupied.state, 'mock-calls.json')).some(call => call[1] === 'install'), false);
    const visible = fixture('visible-conflict');
    const config = read(path.join(visible.state, 'openclaw.json')); config.mockVisibleConflict = 'caidat'; write(path.join(visible.state, 'openclaw.json'), config);
    assert.match(run(visible, ['--apply'], false), /nguồn khác/);
  });
  test('student-edited skill is preserved', () => {
    const file = path.join(normal.workspace, 'skills/vietbai/SKILL.md');
    fs.appendFileSync(file, '\nStudent customization.\n');
    assert.match(run(normal, ['--apply'], false), /đã được sửa/);
    assert.match(fs.readFileSync(file, 'utf8'), /Student customization/);
  });
  test('different version needs explicit upgrade; managed backup retained', () => {
    const upgraded = fixture('upgrade'); run(upgraded, ['--apply']);
    const manifestFile = path.join(upgraded.gift, 'distribution-manifest.json');
    const manifest = read(manifestFile); manifest.version = '1.1.0'; write(manifestFile, manifest);
    fs.appendFileSync(path.join(upgraded.gift, 'skills/vietbai/SKILL.md'), '\nVersion 1.1.0.\n');
    assert.match(run(upgraded, ['--apply'], false), /--upgrade/);
    run(upgraded, ['--apply', '--upgrade']);
    assert.equal(read(path.join(upgraded.workspace, 'skills/vietbai/freeup-gift-origin.json')).version, '1.1.0');
    assert.ok(fs.readdirSync(path.join(upgraded.workspace, 'freeup-content-install-reports')).some(name => name.startsWith('backup-')));
  });
  test('native policy denial stops without direct-copy bypass', () => {
    const denied = fixture('policy-denied');
    const configFile = path.join(denied.state, 'openclaw.json');
    const config = read(configFile); config.mockPolicyBlock = true; write(configFile, config);
    assert.match(run(denied, ['--apply'], false), /security\.installPolicy: block/);
    assert.equal(fs.existsSync(path.join(denied.workspace, 'skills/freeup-content-system')), false);
    assert.equal(read(configFile).agents.entries.student.skills, undefined);
    const calls = read(path.join(denied.state, 'mock-calls.json'));
    assert.equal(calls.filter(call => call[1] === 'install').length, 1);
    assert.equal(calls.some(call => call.includes('--acknowledge-install-policy-warning')), false);
  });
  test('package corruption rejected by checksum', () => {
    const damaged = fixture('checksums');
    const files = bootstrap.treeFiles(damaged.gift);
    write(path.join(damaged.gift, 'package-checksums.json'), { package_id: 'freeup-content-student-gift', version: '1.0.0', files });
    fs.appendFileSync(path.join(damaged.gift, 'skills/caidat/SKILL.md'), '\nCorrupted.');
    assert.match(run(damaged, ['--apply'], false), /Payload không khớp/);
    assert.equal(fs.existsSync(path.join(damaged.state, 'mock-calls.json')), false);
  });
  test('process timeout retains actual code; policy refusals never recover', () => {
    let actualTimeout;
    try { bootstrap.runProcess(process.execPath, ['-e', 'setTimeout(()=>{},2000)'], { timeout: 50 }); } catch (error) { actualTimeout = error; }
    assert.equal(actualTimeout?.code, 'ETIMEDOUT');
    assert.equal(bootstrap.retryableNativeTimeout(actualTimeout), true);
    assert.equal(bootstrap.retryableNativeTimeout(new Error('ETIMEDOUT text only')), false);
    assert.equal(bootstrap.retryableNativeTimeout(timeoutError('security.installPolicy: block fixture')), false);
    assert.equal(bootstrap.retryableNativeTimeout(timeoutError('permission denied\n' + 'other output\n'.repeat(1000))), false);
    assert.equal(bootstrap.retryableNativeTimeout({ code: 'ENOENT' }), false);
  });
  test('timeout before copy retries exactly once through native with identical arguments', () => {
    const f = recoveryFixture('retry'); let calls = 0; const argumentsSeen = [];
    const result = recover(f, (_runtime, nativeArgs) => { calls++; argumentsSeen.push([...nativeArgs]); if (calls === 1) throw timeoutError(); nativeCopy(f); });
    assert.equal(calls, 2);
    assert.deepEqual(argumentsSeen[0], argumentsSeen[1]);
    assert.equal(argumentsSeen[1].includes('--force'), false);
    assert.deepEqual(result, { attempts: 2, recovered: 'native-retry' });
    assert.equal(bootstrap.verifyManagedSkill(f.skill, f.target, f.manifest, f.options).action, 'keep');
  });
  test('timeout after complete native copy resumes from verified receipt without another install', () => {
    const f = recoveryFixture('receipt'); let calls = 0;
    const result = recover(f, () => { calls++; nativeCopy(f); throw timeoutError(); });
    assert.equal(calls, 1);
    assert.deepEqual(result, { attempts: 1, recovered: 'verified-receipt-after-timeout' });
  });
  test('second timeout is bounded; a completed second attempt may be verified', () => {
    const absent = recoveryFixture('double-timeout'); let absentCalls = 0;
    assert.throws(() => recover(absent, () => { absentCalls++; throw timeoutError(); }), /Transient native timeout/);
    assert.equal(absentCalls, 2);
    assert.equal(fs.existsSync(absent.target), false);
    const completed = recoveryFixture('second-receipt'); let completedCalls = 0;
    const result = recover(completed, () => { completedCalls++; if (completedCalls === 2) nativeCopy(completed); throw timeoutError(); });
    assert.equal(completedCalls, 2);
    assert.deepEqual(result, { attempts: 2, recovered: 'verified-receipt-after-timeout' });
  });
  test('native refusal and refusal followed by timeout are never retried', () => {
    for (const [label, error] of [['policy-exit', new Error('security.installPolicy: block')], ['policy-timeout', timeoutError('security.installPolicy: block')]]) {
      const f = recoveryFixture(label); let calls = 0;
      assert.throws(() => recover(f, () => { calls++; throw error; }));
      assert.equal(calls, 1);
      assert.equal(fs.existsSync(f.target), false);
    }
  });
  test('foreign, incomplete and privately edited timeout targets are preserved without retry', () => {
    const foreign = recoveryFixture('foreign'); let foreignCalls = 0;
    assert.throws(() => recover(foreign, () => { foreignCalls++; write(path.join(foreign.target, 'SKILL.md'), 'Foreign source'); throw timeoutError(); }), /không thuộc quà tặng/);
    assert.equal(foreignCalls, 1);
    assert.equal(fs.readFileSync(path.join(foreign.target, 'SKILL.md'), 'utf8'), 'Foreign source');
    const partial = recoveryFixture('partial'); let partialCalls = 0;
    assert.throws(() => recover(partial, () => { partialCalls++; write(path.join(partial.target, 'freeup-gift-origin.json'), read(path.join(partial.stage, 'freeup-gift-origin.json'))); throw timeoutError(); }), /đã được sửa/);
    assert.equal(partialCalls, 1);
    const edited = recoveryFixture('edited'); let editedCalls = 0;
    assert.throws(() => recover(edited, () => { editedCalls++; nativeCopy(edited); write(path.join(edited.target, 'student-notes.txt'), 'Keep my note'); throw timeoutError(); }), /file riêng chưa được quản lý/);
    assert.equal(editedCalls, 1);
    assert.equal(fs.readFileSync(path.join(edited.target, 'student-notes.txt'), 'utf8'), 'Keep my note');
  });
  test('managed upgrade timeout retries only unchanged original owned target', () => {
    const unchanged = recoveryFixture('upgrade-unchanged', true); let calls = 0; const argumentsSeen = [];
    const result = recover(unchanged, (_runtime, nativeArgs) => { calls++; argumentsSeen.push([...nativeArgs]); if (calls === 1) throw timeoutError(); nativeCopy(unchanged); });
    assert.equal(calls, 2);
    assert.deepEqual(argumentsSeen[0], argumentsSeen[1]);
    assert.equal(argumentsSeen[1].includes('--force'), true);
    assert.equal(result.recovered, 'native-retry');
    const changed = recoveryFixture('upgrade-changed', true); let changedCalls = 0;
    assert.throws(() => recover(changed, () => {
      changedCalls++; fs.appendFileSync(path.join(changed.target, 'SKILL.md'), '\nUpdated while CLI was running.');
      const receipt = read(path.join(changed.target, 'freeup-gift-origin.json')); const files = bootstrap.treeFiles(changed.target); delete files['freeup-gift-origin.json']; receipt.installed_files = files;
      write(path.join(changed.target, 'freeup-gift-origin.json'), receipt); throw timeoutError();
    }), /thay đổi trong lúc native CLI hết thời gian/);
    assert.equal(changedCalls, 1);
    assert.match(fs.readFileSync(path.join(changed.target, 'SKILL.md'), 'utf8'), /Updated while CLI/);
  });
  test('timeout receipt must match prepared install map, not merely claimed ownership', () => {
    const f = recoveryFixture('staged-map'); let calls = 0;
    assert.throws(() => recover(f, () => {
      calls++; nativeCopy(f); write(path.join(f.target, '.openclaw/source-origin.json'), '{}');
      const receipt = read(path.join(f.target, 'freeup-gift-origin.json')); const files = bootstrap.treeFiles(f.target); delete files['freeup-gift-origin.json']; receipt.installed_files = files;
      write(path.join(f.target, 'freeup-gift-origin.json'), receipt); throw timeoutError();
    }), /chưa khớp đầy đủ source đã chuẩn bị/);
    assert.equal(calls, 1);
  });
  const nativeCli = opt('--native-cli');
  if (nativeCli) {
    test('full gift install through real native CLI in isolated clean state', () => {
      const root = path.join(fixtureRoot, 'native-full');
      const gift = path.join(root, 'downloaded-gift');
      const state = path.join(root, 'state');
      const workspace = path.join(state, 'workspace-student');
      fs.mkdirSync(workspace, { recursive: true }); copy(packageRoot, gift);
      const nativeConfig = { agents: { ownership: 'explicit', defaults: { skills: ['existing-skill'] }, entries: { student: { workspace }, observer: { workspace: path.join(state, 'workspace-observer'), skills: ['observer-skill'] } } }, gateway: { mode: 'local', port: 19899, auth: { mode: 'token', token: 'isolated-fixture-only-not-a-user-secret' } } };
      write(path.join(state, 'openclaw.json'), nativeConfig);
      const node = opt('--native-node') || process.execPath;
      const env = { ...process.env, OPENCLAW_STATE_DIR: state, OPENCLAW_CONFIG_PATH: path.join(state, 'openclaw.json'), OPENCLAW_GATEWAY_URL: '', OPENCLAW_GATEWAY_TOKEN: '', OPENCLAW_WORKSPACE_DIR: workspace, OPENCLAW_DISABLE_PLUGIN_AUTO_ENABLE: '1' };
      const runNative = flags => {
        const result = cp.spawnSync(node, [path.join(gift, 'bootstrap.cjs'), '--cli', path.resolve(nativeCli), '--state-dir', state, '--agent', 'student', ...flags], { env, windowsHide: true, encoding: 'utf8', timeout: 900000, maxBuffer: 8 * 1024 * 1024 });
        write(path.join(root, flags.includes('--apply') ? 'native-apply.log' : 'native-plan.log'), `${result.stdout || ''}\n${result.stderr || ''}`);
        if (result.error) throw result.error;
        assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
      };
      runNative(['--plan']); runNative(['--apply']);
      const manifest = read(path.join(gift, 'distribution-manifest.json'));
      const config = read(path.join(state, 'openclaw.json'));
      assert.deepEqual(config.agents.defaults.skills, ['existing-skill']);
      assert.deepEqual(config.agents.entries.observer.skills, ['observer-skill']);
      for (const skill of manifest.skills) assert.ok(config.agents.entries.student.skills.includes(skill.name));
      const runtime = read(path.join(workspace, 'skills/freeup-content-system/runtime.json'));
      assert.equal(runtime.project_relative, '../../freeup-content-data');
      assert.equal(read(path.join(workspace, 'freeup-content-data/database/brand_config.json')).configured, false);
      const firstReceipt = fs.readFileSync(path.join(workspace, 'skills/vietbai/freeup-gift-origin.json'), 'utf8');
      runNative(['--apply']);
      assert.equal(fs.readFileSync(path.join(workspace, 'skills/vietbai/freeup-gift-origin.json'), 'utf8'), firstReceipt);
    });
  }
  write(path.join(fixtureRoot, 'bootstrap-smoke-result.json'), { passed: results.length, failed: 0, fixtures: fixtureRoot, results });
  console.log(JSON.stringify({ passed: results.length, failed: 0, fixtures: fixtureRoot }, null, 2));
} catch (error) {
  write(path.join(fixtureRoot, 'bootstrap-smoke-result.json'), { passed: results.length, failed: 1, fixtures: fixtureRoot, results, error: error.message });
  console.error(error.stack); console.error(`Fixtures retained: ${fixtureRoot}`); process.exitCode = 1;
}
