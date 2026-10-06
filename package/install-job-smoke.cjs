#!/usr/bin/env node
'use strict';
// Only isolated mock runtimes are used. Never targets the installed app.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const jobs = require('./install-job.cjs');
const argv = process.argv.slice(2); const outputIndex = argv.indexOf('--output');
const output = path.resolve(outputIndex >= 0 ? argv[outputIndex + 1] : os.tmpdir()); fs.mkdirSync(output, { recursive: true });
const root = fs.mkdtempSync(path.join(output, 'freeup-install-job-smoke-'));
const results = [];
function write(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, typeof value === 'string' ? value : JSON.stringify(value)); }
function read(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function test(name, fn) { const started = Date.now(); await fn(); results.push({ name, passed: true, elapsed_ms: Date.now() - started }); console.log('PASS ' + name); }
function preflight(active = 0) { return { safe: active === 0, summary: active ? 'work active' : 'safe to restart now', blockers: active ? [{ message: 'chat turn active' }] : [], counts: { queueSize: 0, pendingReplies: 0, embeddedRuns: active, cronRuns: 0, backgroundExecSessions: 0, rootRequests: 0, activeTasks: 0, totalActive: active } }; }
function unitJob(label) {
  const state = path.join(root, label, 'state'); const folder = path.join(state, 'freeup-content-install-jobs', 'fixture'); fs.mkdirSync(folder, { recursive: true });
  const file = path.join(folder, 'status.json'), log = path.join(folder, 'install.log'); write(log, '');
  const job = { job_file: file, log_file: log, job_id: label, state: 'queued', package_id: 'freeup-content-student-gift', version: '1.3.0', agent_id: 'student', options: { agent: 'student', graceMs: 35000, pollMs: 3000, waitMs: 60000 }, history: [] };
  write(file, job); return { job, runtime: { stateDir: state } };
}
function fixture(label, control) {
  const folder = path.join(root, label + ' path with spaces'); const gift = path.join(folder, 'gift package'); const state = path.join(folder, 'student state'); const workspace = path.join(state, 'workspace student');
  fs.mkdirSync(gift, { recursive: true }); fs.mkdirSync(workspace, { recursive: true });
  for (const name of ['bootstrap.cjs', 'install-job.cjs']) fs.copyFileSync(path.join(__dirname, name), path.join(gift, name));
  const names = ['freeup-content-system', 'vietbai'];
  for (const name of names) write(path.join(gift, 'skills', name, 'SKILL.md'), `---\nname: ${name}\ndescription: Mock install job fixture\n---\nFixture only.\n`);
  write(path.join(gift, 'skills/freeup-content-system/scripts/content.cjs'), "const fs=require('node:fs'),path=require('node:path'),a=process.argv.slice(2);const p=a[a.indexOf('--project')+1];fs.mkdirSync(path.join(p,'database'),{recursive:true});const f=path.join(p,'database','brand_config.json');if(!fs.existsSync(f))fs.writeFileSync(f,JSON.stringify({configured:false}));console.log('{}');");
  write(path.join(gift, 'distribution-manifest.json'), { package_id: 'freeup-content-student-gift', version: '1.3.0', skills: names.map(name => ({ name, source: 'skills/' + name })) });
  write(path.join(state, 'openclaw.json'), { agents: { defaults: { skills: ['old-skill'] }, entries: { student: { workspace }, other: { workspace: path.join(state, 'other'), skills: ['other-skill'] } } }, gateway: { mode: 'local', port: 19997 } });
  const cli = path.join(folder, 'mock cli.mjs'); const controlFile = path.join(state, 'control.json'); write(controlFile, control);
  write(cli, `import fs from 'node:fs';import path from 'node:path';
const a=process.argv.slice(2),s=process.env.OPENCLAW_STATE_DIR,p=process.env.OPENCLAW_CONFIG_PATH,c=JSON.parse(fs.readFileSync(p,'utf8')),control=JSON.parse(fs.readFileSync(path.join(s,'control.json'),'utf8'));
const log=path.join(s,'calls.json'),calls=fs.existsSync(log)?JSON.parse(fs.readFileSync(log,'utf8')):[];calls.push(a);fs.writeFileSync(log,JSON.stringify(calls));
function emit(x){console.log(JSON.stringify(x))}function error(x){console.error(x);process.exit(1)}function copy(from,to){fs.mkdirSync(to,{recursive:true});for(const e of fs.readdirSync(from,{withFileTypes:true})){const f=path.join(from,e.name),t=path.join(to,e.name);if(e.isDirectory())copy(f,t);else fs.copyFileSync(f,t)}}
if(a[0]==='gateway'&&a[1]==='call'&&a[2]==='gateway.restart.preflight'){if(a[a.indexOf('--port')+1]!=='19997')error('wrong fixture port');if(control.unavailable)error('fixture gateway unavailable');if(control.malformed)emit({safe:true});else{const n=control.busy?1:0;emit({safe:!n,summary:n?'chat active':'safe',blockers:n?[{}]:[],counts:{queueSize:0,pendingReplies:0,embeddedRuns:n,cronRuns:0,backgroundExecSessions:0,rootRequests:0,activeTasks:0,totalActive:n}})}}
else if(a[0]==='skills'&&a[1]==='list'){const id=a[a.indexOf('--agent')+1],agent=c.agents.entries[id],r=path.join(agent.workspace,'skills');emit({workspaceDir:agent.workspace,skills:fs.existsSync(r)?fs.readdirSync(r).filter(n=>fs.existsSync(path.join(r,n,'SKILL.md'))).map(n=>({name:n,eligible:true,blockedByAllowlist:false,blockedByAgentFilter:!(agent.skills||c.agents.defaults.skills).includes(n),source:'openclaw-workspace'})):[]})}
else if(a[0]==='skills'&&a[1]==='install'){if(control.policy)error('security.installPolicy: block fixture');const id=a[a.indexOf('--agent')+1],n=a[a.indexOf('--as')+1],target=path.join(c.agents.entries[id].workspace,'skills',n);if(fs.existsSync(target))error('occupied target');copy(a[2],target);fs.mkdirSync(path.join(target,'.openclaw'),{recursive:true});fs.writeFileSync(path.join(target,'.openclaw/source-origin.json'),'{}');emit({ok:true})}
else if(a[0]==='config'&&a[1]==='set'){if(!a.includes('--dry-run'))for(const b of JSON.parse(fs.readFileSync(a[a.indexOf('--batch-file')+1],'utf8'))){const k=b.path.split('.');let v=c;for(const q of k.slice(0,-1))v=v[q]??={};v[k.at(-1)]=b.value}if(!a.includes('--dry-run'))fs.writeFileSync(p,JSON.stringify(c));emit({ok:true})}
else if(a[0]==='config'&&a[1]==='get'){emit(a[2]==='agents'?c.agents:c.gateway.port)}else error('unexpected mock action');`);
  return { folder, gift, state, workspace, cli, controlFile, names };
}
function launchFixture(f) {
  const env = { ...process.env, OPENCLAW_STATE_DIR: f.state, OPENCLAW_CONFIG_PATH: path.join(f.state, 'openclaw.json') }; delete env.OPENCLAW_GATEWAY_PORT;
  const started = Date.now();
  const result = cp.spawnSync(process.execPath, [path.join(f.gift, 'install-job.cjs'), 'launch', '--cli', f.cli, '--state-dir', f.state, '--agent', 'student', '--handoff-seconds', '15', '--poll-seconds', '1', '--wait-seconds', '60'], { cwd: f.gift, env, encoding: 'utf8', shell: false, windowsHide: true, timeout: 10000 });
  assert.equal(result.status, 0, result.stdout + '\n' + result.stderr); const output = JSON.parse(result.stdout); assert.equal(output.agent_id, 'student'); assert.ok(Date.now() - started < 10000); return output;
}
async function waitState(file, states, deadlineMs = 30000) { const deadline = Date.now() + deadlineMs; while (Date.now() < deadline) { const value = read(file); if (states.includes(value.state)) return value; await delay(100); } throw Error('Fixture worker timeout: ' + fs.readFileSync(file, 'utf8')); }
async function main() {
  await test('arguments enforce handoff grace and reject invalid/unknown input', () => {
    assert.equal(jobs.parseArgs(['launch']).graceMs, 35000);
    assert.throws(() => jobs.parseArgs(['launch', '--handoff-seconds', '1']));
    assert.throws(() => jobs.parseArgs(['launch', '--agent', '../main']));
    assert.throws(() => jobs.parseArgs(['status']));
    assert.throws(() => jobs.parseArgs(['launch', '--file', 'x']));
    assert.throws(() => jobs.parseArgs(['launch', '--select-agent']));
  });
  await test('native preflight unknown and contradictory facts fail closed', () => {
    assert.equal(jobs.validatePreflight(preflight()).idle, true); assert.equal(jobs.validatePreflight(preflight(2)).idle, false);
    assert.throws(() => jobs.validatePreflight({ safe: true })); const contradictory = preflight(1); contradictory.safe = true; assert.throws(() => jobs.validatePreflight(contradictory));
    const total = preflight(); total.counts.totalActive = 1; assert.throws(() => jobs.validatePreflight(total));
  });
  await test('busy wait requires two consecutive idle samples before apply', async () => {
    const { job, runtime } = unitJob('transitions'); let time = 0, polls = 0, applied = 0; const sequence = [1, 0, 1, 0, 0];
    await jobs.runJob(job, runtime, { now: () => time, sleep: async ms => { time += ms; assert.equal(applied, 0); }, preflight: async () => preflight(sequence[polls++]), manifest: () => ({ package_id: job.package_id, version: job.version, skills: ['one', 'two'] }), apply: async () => { applied++; assert.equal(polls, 5); return { verified_skill_count: 2 }; } });
    assert.equal(applied, 1); assert.equal(read(job.job_file).state, 'completed'); assert.deepEqual(job.history.map(item => item.state), ['starting', 'waiting_for_turn_end', 'waiting_for_idle', 'installing', 'completed']); assert.ok(time >= 35000 + 12000);
  });
  await test('unknown preflight stops without any apply', async () => {
    const { job, runtime } = unitJob('unknown'); let applied = 0;
    await assert.rejects(jobs.runJob(job, runtime, { sleep: async () => {}, preflight: async () => ({ safe: true }), apply: async () => { applied++; } }), /preflight/);
    assert.equal(applied, 0); assert.equal(read(job.job_file).state, 'failed');
  });
  await test('temporary native status failure retries and only installs after two idle checks', async () => {
    const { job, runtime } = unitJob('temporary-unavailable'); let time = 0, checks = 0, applied = 0;
    await jobs.runJob(job, runtime, { now: () => time, sleep: async ms => { time += ms; }, preflight: async () => {
      checks++; if (checks === 1) { const error = new Error('Gateway chưa phản hồi'); error.code = 'NATIVE_STATUS_UNAVAILABLE'; throw error; }
      return preflight();
    }, manifest: () => ({ package_id: job.package_id, version: job.version, skills: ['one'] }), apply: async () => { applied++; assert.equal(checks, 3); return { verified_skill_count: 1 }; } });
    assert.equal(applied, 1); assert.equal(read(job.job_file).preflight_failures, 1);
  });
  await test('persistent unreadable native status times out without installing', async () => {
    const { job, runtime } = unitJob('persistent-unavailable'); let time = 0, applied = 0;
    await assert.rejects(jobs.runJob(job, runtime, { now: () => time, sleep: async ms => { time += ms; }, preflight: async () => {
      const error = new Error('Gateway chưa phản hồi'); error.code = 'NATIVE_STATUS_UNAVAILABLE'; throw error;
    }, apply: async () => { applied++; } }), /Không đọc được trạng thái native 9B trong thời gian chờ/);
    assert.equal(applied, 0); assert.equal(read(job.job_file).state, 'failed');
  });
  await test('native access denied stops with actionable Mac guidance', async () => {
    const { job, runtime } = unitJob('access-denied'); let applied = 0;
    await assert.rejects(jobs.runJob(job, runtime, { sleep: async () => {}, preflight: async () => {
      const error = new Error('Dùng CAI-DAT-MAC.command ngoài chat'); error.code = 'NATIVE_STATUS_ACCESS_DENIED'; throw error;
    }, apply: async () => { applied++; } }), /CAI-DAT-MAC\.command/);
    assert.equal(applied, 0);
  });
  await test('busy gateway has bounded wait and no apply', async () => {
    const { job, runtime } = unitJob('bounded'); let time = 0, applied = 0;
    await assert.rejects(jobs.runJob(job, runtime, { now: () => time, sleep: async ms => { time += ms; }, preflight: async () => preflight(1), apply: async () => { applied++; } }), /chưa rảnh/);
    assert.equal(applied, 0); assert.equal(read(job.job_file).state, 'failed');
  });
  await test('native policy failure is terminal, never retries apply', async () => {
    const { job, runtime } = unitJob('policy'); let calls = 0;
    await assert.rejects(jobs.runJob(job, runtime, { sleep: async () => {}, preflight: () => preflight(), manifest: () => ({ package_id: job.package_id, version: job.version, skills: ['one'] }), apply: async () => { calls++; throw Error('security.installPolicy: block fixture'); } }), /security.installPolicy/);
    assert.equal(calls, 1); assert.equal(read(job.job_file).state, 'failed'); assert.equal(fs.existsSync(path.join(runtime.stateDir, 'freeup-content-install-jobs', 'agent-student.lock')), false);
  });
  await test('same-agent overlapping worker cannot apply or reclaim live lock', async () => {
    const { job, runtime } = unitJob('occupied'); const lock = path.join(runtime.stateDir, 'freeup-content-install-jobs', 'agent-student.lock'); write(lock, { job_id: 'another', worker_pid: process.pid }); let calls = 0;
    await assert.rejects(jobs.runJob(job, runtime, { apply: async () => { calls++; } }), /giữ khóa/); assert.equal(calls, 0); assert.equal(read(lock).job_id, 'another');
  });
  await test('Windows launcher discovers local runtime without security override', () => {
    const cmd = fs.readFileSync(path.join(__dirname, 'CAI-DAT-9B.cmd'), 'utf8'); assert.match(cmd, /install-root\.json/); assert.match(cmd, /NINEBIZ_INSTALL_ROOT/); assert.match(cmd, /--select-agent/); assert.match(cmd, /--upgrade/); assert.match(cmd, /\& \$n @a/); assert.doesNotMatch(cmd, /ExecutionPolicy|Bypass|D:\\9Biz|Stop-Process|taskkill/i);
  });
  const normal = fixture('native-detached', { busy: true }); const denied = fixture('native-policy', { busy: false, policy: true });
  const successJob = launchFixture(normal), deniedJob = launchFixture(denied);
  await test('real detached launch returns while busy and leaves payload untouched', async () => {
    await delay(300);
    assert.equal(fs.existsSync(path.join(normal.workspace, 'skills')), false);
    assert.equal(read(successJob.job_file).state, 'waiting_for_turn_end');
    assert.ok(!successJob.job_file.startsWith(normal.gift)); assert.ok(!successJob.log_file.startsWith(normal.gift));
    assert.equal(fs.existsSync(path.join(normal.state, 'calls.json')), false);
    assert.equal(fs.readdirSync(normal.gift).some(name => /log|status|job-/.test(name) && name !== 'install-job.cjs'), false);
  });
  await test('real busy fixture blocks installation until idle then installs non-main agent', async () => {
    await waitState(successJob.job_file, ['waiting_for_idle']); await delay(1200); assert.equal(fs.existsSync(path.join(normal.workspace, 'skills')), false);
    write(normal.controlFile, { busy: false }); const result = await waitState(successJob.job_file, ['completed', 'failed']); assert.equal(result.state, 'completed', JSON.stringify(result)); assert.equal(result.verified_skill_count, 2);
    const config = read(path.join(normal.state, 'openclaw.json')); assert.deepEqual(config.agents.entries.student.skills, ['old-skill', ...normal.names]); assert.deepEqual(config.agents.entries.other.skills, ['other-skill']); assert.equal(fs.existsSync(path.join(normal.state, 'other', 'skills')), false);
    const calls = read(path.join(normal.state, 'calls.json')); assert.equal(calls.filter(call => call[1] === 'install').length, 2); assert.ok(calls.filter(call => call[1] === 'install').every(call => call.includes('student')));
    const status = cp.spawnSync(process.execPath, [path.join(normal.gift, 'install-job.cjs'), 'status', '--file', successJob.job_file], { encoding: 'utf8', windowsHide: true }); assert.equal(status.status, 0); assert.equal(JSON.parse(status.stdout).state, 'completed');
    assert.equal(JSON.stringify(result.options).includes('TOKEN'), false);
  });
  await test('real native policy refusal has one attempt and no direct-copy fallback', async () => {
    const result = await waitState(deniedJob.job_file, ['failed']); assert.equal(fs.existsSync(path.join(denied.workspace, 'skills/freeup-content-system')), false); assert.equal(read(path.join(denied.state, 'calls.json')).filter(call => call[1] === 'install').length, 1); assert.match(fs.readFileSync(result.log_file, 'utf8'), /security.installPolicy: block fixture/);
  });
  write(path.join(root, 'test-results.json'), { results, fixture_root: root }); console.log(JSON.stringify({ passed: results.length, fixture_root: root }));
}
main().catch(error => { console.error(error.stack); console.error('Fixtures: ' + root); process.exitCode = 1; });
