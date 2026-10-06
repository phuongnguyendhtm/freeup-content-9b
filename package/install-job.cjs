#!/usr/bin/env node
'use strict';
// The chat launches this worker and ends its turn. Only the detached worker,
// after native active-work admission reports idle, calls the native installer.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const readline = require('node:readline/promises');
const bootstrap = require('./bootstrap.cjs');
const PACKAGE_ROOT = fs.realpathSync(__dirname);
const JOB_FOLDER = 'freeup-content-install-jobs';
const ACTIVE_COUNTS = ['queueSize', 'pendingReplies', 'embeddedRuns', 'cronRuns', 'backgroundExecSessions', 'rootRequests', 'activeTasks'];
function json(file) { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
function fail(message) { throw new Error(message); }
function noLinks(file) {
  let current = path.parse(path.resolve(file)).root;
  for (const part of path.resolve(file).slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) fail('Không ghi công việc qua symlink/junction.');
  }
}
function atomic(file, value) {
  noLinks(file);
  const temporary = file + '.' + crypto.randomUUID() + '.tmp';
  fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  fs.renameSync(temporary, file);
}
function parseArgs(argv) {
  const command = argv[0] || 'help';
  if (!['launch', 'run', 'status', 'help'].includes(command)) fail('Dùng launch, run hoặc status.');
  const result = { command, installDeps: false, upgrade: false, selectAgent: false, graceMs: 35000, pollMs: 3000, waitMs: 600000 };
  const values = new Map([['--agent', 'agent'], ['--install-root', 'installRoot'], ['--state-dir', 'stateDir'], ['--cli', 'cli'], ['--workspace', 'workspace'], ['--file', 'file']]);
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--install-deps') result.installDeps = true;
    else if (arg === '--upgrade') result.upgrade = true;
    else if (arg === '--select-agent') result.selectAgent = true;
    else if (values.has(arg)) { const value = argv[++i]; if (!value || value.startsWith('--')) fail('Thiếu giá trị cho ' + arg); result[values.get(arg)] = value; }
    else if (['--handoff-seconds', '--poll-seconds', '--wait-seconds'].includes(arg)) {
      const number = Number(argv[++i]);
      const limits = arg === '--handoff-seconds' ? [15, 300] : arg === '--poll-seconds' ? [1, 30] : [60, 1800];
      if (!Number.isInteger(number) || number < limits[0] || number > limits[1]) fail(arg + ' phải nằm trong ' + limits.join('–') + '.');
      result[arg === '--handoff-seconds' ? 'graceMs' : arg === '--poll-seconds' ? 'pollMs' : 'waitMs'] = number * 1000;
    } else fail('Tham số không được hỗ trợ: ' + arg);
  }
  if (result.agent && !/^[a-z][a-z0-9-]{0,63}$/.test(result.agent)) fail('Agent ID không hợp lệ.');
  if (command === 'launch' && result.file) fail('launch tạo công việc mới; không nhận --file.');
  if (command === 'status' && !result.file) fail('status cần --file <status.json>.');
  if (result.selectAgent && command !== 'run') fail('--select-agent chỉ dùng khi cài bên ngoài chat bằng run.');
  return result;
}
function cliJson(runtime, args, timeout = 20000) {
  const result = cp.spawnSync(runtime.node, [runtime.cli, ...args], { cwd: PACKAGE_ROOT, env: runtime.env, shell: false, windowsHide: true, encoding: 'utf8', timeout, maxBuffer: 4 * 1024 * 1024 });
  if (result.error || result.status !== 0) fail('Không đọc được trạng thái native 9B. Kiểm tra 9B đang mở và đúng runtime; bộ cài chưa được chạy.');
  try { return JSON.parse(result.stdout.trim()); } catch { fail('Native 9B trả trạng thái không rõ ràng; dừng trước khi cài.'); }
}
function readAgents(runtime) {
  return typeof bootstrap.readAgents === 'function' ? bootstrap.readAgents(runtime) : (function () {
    try { return json(runtime.configPath).agents || {}; } catch (error) { if (!(error instanceof SyntaxError)) throw error; return cliJson(runtime, ['config', 'get', 'agents', '--json']); }
  })();
}
async function selectedAgent(runtime, options) {
  const agents = readAgents(runtime);
  try { return bootstrap.selectAgent(agents, options.agent); }
  catch (error) {
    if (!options.selectAgent || options.agent || !process.stdin.isTTY) throw error;
    const roster = bootstrap.agentRoster(agents);
    console.log('Chọn agent muốn cài: ' + roster.map(record => record.id).join(', '));
    const input = readline.createInterface({ input: process.stdin, output: process.stdout });
    try { return bootstrap.selectAgent(agents, (await input.question('Nhập Agent ID: ')).trim()); } finally { input.close(); }
  }
}
function gatewayPort(runtime) {
  const fromEnv = runtime.env.OPENCLAW_GATEWAY_PORT;
  let fromConfig;
  try { fromConfig = json(runtime.configPath).gateway?.port; }
  catch (error) { if (!(error instanceof SyntaxError)) throw error; fromConfig = cliJson(runtime, ['config', 'get', 'gateway.port', '--json']); }
  const port = Number(typeof fromEnv === 'string' && fromEnv.trim() ? fromEnv : fromConfig ?? 18789);
  if (!Number.isInteger(port) || port < 1 || port > 65535) fail('Cổng gateway không hợp lệ; không đoán runtime đích.');
  return port;
}
function validatePreflight(value) {
  if (!value || typeof value.safe !== 'boolean' || !value.counts || !Array.isArray(value.blockers) || typeof value.summary !== 'string') fail('Gateway preflight không có đủ trạng thái an toàn; dừng trước khi cài.');
  for (const name of [...ACTIVE_COUNTS, 'totalActive']) if (!Number.isSafeInteger(value.counts[name]) || value.counts[name] < 0) fail('Gateway preflight thiếu số công việc đang chạy; dừng trước khi cài.');
  const sum = ACTIVE_COUNTS.reduce((n, name) => n + value.counts[name], 0);
  if (sum !== value.counts.totalActive || value.safe !== (sum === 0) || (value.safe && value.blockers.length !== 0)) fail('Gateway preflight mâu thuẫn; dừng trước khi cài.');
  return { idle: value.safe && sum === 0, active: sum, summary: value.summary.slice(0, 1000) };
}
function runtimeOptions(options) {
  return Object.fromEntries(['agent', 'installRoot', 'stateDir', 'cli', 'workspace'].filter(key => options[key]).map(key => [key, options[key]]));
}
async function createJob(options) {
  const manifest = bootstrap.loadManifest();
  const runtime = bootstrap.resolveRuntime(options);
  if (path.resolve(runtime.configPath) !== path.join(runtime.stateDir, 'openclaw.json')) fail('Runtime dùng tên file cấu hình riêng. Bộ cài nền chưa hỗ trợ trường hợp này; không đổi hoặc đoán cấu hình đích.');
  const agent = await selectedAgent(runtime, options);
  const root = path.join(runtime.stateDir, JOB_FOLDER);
  if (bootstrap.contained(root, PACKAGE_ROOT, true)) fail('Job/log phải nằm ngoài thư mục gói có checksum.');
  noLinks(root);
  fs.mkdirSync(root, { recursive: true });
  const id = crypto.randomUUID();
  const folder = path.join(root, id);
  fs.mkdirSync(folder, { mode: 0o700 });
  const file = path.join(folder, 'status.json');
  const log = path.join(folder, 'install.log');
  fs.writeFileSync(log, '', { flag: 'wx', mode: 0o600 });
  const now = new Date().toISOString();
  const job = { schema_version: 1, package_id: manifest.package_id, version: manifest.version, job_id: id, package_root: PACKAGE_ROOT, job_file: file, log_file: log, state: 'queued', created_at_utc: now, agent_id: agent.id, options: { ...runtimeOptions(options), ...runtime.root ? { installRoot: runtime.root } : {}, stateDir: runtime.stateDir, cli: runtime.cli, agent: agent.id, installDeps: Boolean(options.installDeps), upgrade: Boolean(options.upgrade), graceMs: options.graceMs, pollMs: options.pollMs, waitMs: options.waitMs }, history: [{ state: 'queued', at_utc: now }] };
  atomic(file, job);
  return { job, runtime };
}
function readJob(file) {
  const absolute = path.resolve(file);
  noLinks(absolute);
  const job = json(absolute);
  if (job.schema_version !== 1 || job.package_id !== 'freeup-content-student-gift' || !/^[a-f0-9-]{36}$/.test(job.job_id || '') || job.package_root !== PACKAGE_ROOT || path.resolve(job.job_file || '.') !== absolute || !job.options || job.agent_id !== job.options.agent || !/^[a-z][a-z0-9-]{0,63}$/.test(job.agent_id || '')) fail('File công việc không thuộc bộ cài này.');
  const runtime = bootstrap.resolveRuntime(job.options);
  const folder = path.join(runtime.stateDir, JOB_FOLDER, job.job_id);
  if (absolute !== path.join(folder, 'status.json') || job.log_file !== path.join(folder, 'install.log') || bootstrap.contained(folder, PACKAGE_ROOT, true)) fail('Đường dẫn công việc không khớp runtime.');
  if (![job.options.graceMs, job.options.pollMs, job.options.waitMs].every(Number.isSafeInteger) || job.options.graceMs < 15000 || job.options.graceMs > 300000 || job.options.pollMs < 1000 || job.options.pollMs > 30000 || job.options.waitMs < 60000 || job.options.waitMs > 1800000) fail('Thời gian công việc không hợp lệ.');
  noLinks(folder);
  return { job, runtime };
}
function update(job, state, fields = {}) {
  if (job.state !== state) job.history.push({ state, at_utc: new Date().toISOString() });
  Object.assign(job, fields, { state, updated_at_utc: new Date().toISOString() });
  atomic(job.job_file, job);
}
function log(job, message) { fs.appendFileSync(job.log_file, new Date().toISOString() + ' ' + message + '\n'); }
async function waitForIdle(job, runtime, dependencies = {}) {
  const now = dependencies.now || Date.now;
  const sleep = dependencies.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
  const preflight = dependencies.preflight || (() => cliJson(runtime, ['gateway', 'call', 'gateway.restart.preflight', '--port', String(gatewayPort(runtime)), '--timeout', '15000', '--json']));
  update(job, 'waiting_for_turn_end', { message: 'Hãy kết thúc lượt chat cài đặt. Bộ cài chờ 9B hoàn tất công việc đang chạy.' });
  await sleep(job.options.graceMs);
  update(job, 'waiting_for_idle');
  const deadline = now() + job.options.waitMs;
  let consecutive = 0;
  while (now() <= deadline) {
    const fact = validatePreflight(await preflight());
    consecutive = fact.idle ? consecutive + 1 : 0;
    update(job, 'waiting_for_idle', { active_work: fact.active, idle_samples: consecutive, message: fact.idle ? '9B đang rảnh; đang xác nhận lần tiếp theo.' : 'Đang chờ các công việc 9B kết thúc.' });
    if (consecutive >= 2) return;
    await sleep(job.options.pollMs);
  }
  fail('9B chưa rảnh sau thời gian chờ. Kết thúc lượt chat/công việc đang chạy, rồi chạy lại bộ cài. Chưa gọi bootstrap.');
}
function applyArgs(job) {
  const args = ['--apply', '--agent', job.agent_id];
  for (const [key, flag] of [['installRoot', '--install-root'], ['stateDir', '--state-dir'], ['cli', '--cli'], ['workspace', '--workspace']]) if (job.options[key]) args.push(flag, job.options[key]);
  if (job.options.installDeps) args.push('--install-deps');
  if (job.options.upgrade) args.push('--upgrade');
  return args;
}
function invokeBootstrap(job, runtime) {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(runtime.node, [path.join(PACKAGE_ROOT, 'bootstrap.cjs'), ...applyArgs(job)], { cwd: PACKAGE_ROOT, env: runtime.env, shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdoutTail = '';
    let pending = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', text => {
      fs.appendFileSync(job.log_file, text);
      stdoutTail = (stdoutTail + text).slice(-16000);
      pending += text;
      let end;
      while ((end = pending.indexOf('\n')) >= 0) {
        const line = pending.slice(0, end); pending = pending.slice(end + 1);
        const installed = line.match(/Đã cài native: ([a-z][a-z0-9-]*)/);
        if (installed) { job.completed_skills = [...new Set([...(job.completed_skills || []), installed[1]])]; update(job, 'installing'); }
      }
      if (pending.length > 16000) pending = pending.slice(-16000);
    });
    child.stderr.on('data', chunk => fs.appendFileSync(job.log_file, chunk));
    child.on('error', () => reject(new Error('Không khởi chạy được bootstrap bằng Node của 9B; xem install.log.')));
    child.on('close', code => {
      if (code !== 0) return reject(new Error('Bộ cài native chưa hoàn tất. Xem install.log và báo cáo native; giữ các skill đã cài. Không tự vượt policy hoặc thử lại lỗi từ chối.'));
      const report = stdoutTail.match(/Báo cáo: ([^\r\n]+)/);
      if (!report) return reject(new Error('Bootstrap kết thúc nhưng chưa xác minh được báo cáo hoàn tất; xem install.log.'));
      try {
        const result = json(report[1].trim());
        if (result.state !== 'installed-and-native-inventory-verified' || result.package_id !== job.package_id || result.version !== job.version || result.agent_id !== job.agent_id) fail('Báo cáo native không khớp công việc.');
        resolve({ native_report: report[1].trim(), verified_skill_count: new Set(result.completed.filter(item => ['installed', 'kept', 'upgraded'].includes(item.action)).map(item => item.name)).size });
      } catch (error) { reject(error); }
    });
  });
}
async function runJob(job, runtime, dependencies = {}) {
  if (job.state !== 'queued') fail('Công việc này đã chạy. Xem status; để thử lại hãy tạo công việc mới.');
  const lock = path.join(runtime.stateDir, JOB_FOLDER, 'agent-' + job.agent_id + '.lock');
  noLinks(lock);
  let locked = false;
  update(job, 'starting', { worker_pid: process.pid });
  try {
    try { fs.writeFileSync(lock, JSON.stringify({ job_id: job.job_id, worker_pid: process.pid, job_file: job.job_file }), { flag: 'wx', mode: 0o600 }); locked = true; }
    catch (error) {
      if (error.code !== 'EEXIST') throw error;
      let prior;
      try { prior = json(lock).job_file; } catch {}
      fail('Agent này đã có công việc cài đang giữ khóa. Xem công việc trước: ' + (typeof prior === 'string' ? prior : lock) + '. Không chạy hai bộ cài cùng lúc; nếu worker đã đóng, cần kiểm tra khóa này trước khi thử lại.');
    }
    await waitForIdle(job, runtime, dependencies);
    const manifest = dependencies.manifest ? await dependencies.manifest() : bootstrap.loadManifest();
    if (manifest.package_id !== job.package_id || manifest.version !== job.version) fail('Gói đã thay đổi sau khi tạo công việc; tải gói nguyên vẹn và chạy lại.');
    if (!dependencies.apply) bootstrap.selectAgent(readAgents(runtime), job.agent_id);
    update(job, 'installing', { message: 'Đang cài qua native CLI và xác minh skill/hồ sơ. Hãy chờ hoàn tất trước khi dùng agent này.' });
    log(job, 'Native install bắt đầu cho agent ' + job.agent_id);
    const result = await (dependencies.apply || invokeBootstrap)(job, runtime);
    if (result.verified_skill_count !== manifest.skills.length) fail('Số skill được native xác minh chưa khớp manifest.');
    update(job, 'completed', { ...result, finished_at_utc: new Date().toISOString(), message: 'Đã cài và xác minh. Mở lượt chat mới, chạy /caidat; hồ sơ đã có được giữ lại.' });
    log(job, 'Đã hoàn tất và xác minh ' + result.verified_skill_count + ' skill.');
    return job;
  } catch (error) {
    update(job, 'failed', { error: error.message, finished_at_utc: new Date().toISOString(), message: 'Chưa cài hoàn tất. Đọc lỗi/log; không tự đổi policy. Có thể chạy lại bộ cài sau khi xử lý nguyên nhân.' });
    log(job, 'FAILED: ' + error.message);
    throw error;
  } finally {
    if (locked) {
      noLinks(lock);
      const owner = json(lock);
      if (owner.job_id === job.job_id && owner.worker_pid === process.pid) fs.unlinkSync(lock);
    }
  }
}
async function launch(options) {
  const { job, runtime } = await createJob(options);
  const out = fs.openSync(path.join(path.dirname(job.job_file), 'worker.log'), 'a', 0o600);
  try {
    const child = cp.spawn(runtime.node, [__filename, 'run', '--file', job.job_file], { cwd: PACKAGE_ROOT, env: runtime.env, shell: false, detached: true, windowsHide: true, stdio: ['ignore', out, out] });
    await new Promise((resolve, reject) => { child.once('spawn', resolve); child.once('error', reject); });
    child.unref();
    return { state: 'queued', job_id: job.job_id, agent_id: job.agent_id, job_file: job.job_file, log_file: job.log_file, message: 'Đã giao bộ cài sang tác vụ riêng. Kết thúc lượt chat này ngay; chưa chạy /caidat, không chờ hoặc hỏi status trong lượt hiện tại. Ở lượt mới, đọc status.json để biết kết quả.' };
  } catch (error) { update(job, 'failed', { error: 'Không khởi chạy được worker.' }); throw error; }
  finally { fs.closeSync(out); }
}
async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.command === 'help') { console.log('node install-job.cjs launch --agent <id> [--install-deps] [--upgrade]\nnode install-job.cjs status --file <status.json>\nnode install-job.cjs run --select-agent [--install-deps] [--upgrade]\nJob/log nằm ngoài gói. launch trả về để chat kết thúc; worker chờ native gateway rảnh trước khi cài.'); return; }
  if (options.command === 'status') { const { job } = readJob(options.file); console.log(JSON.stringify(job, null, 2)); return job; }
  if (options.command === 'launch') { const result = await launch(options); console.log(JSON.stringify(result, null, 2)); return result; }
  const { job, runtime } = options.file ? readJob(options.file) : await createJob(options);
  console.log('Công việc: ' + job.job_file);
  console.log('Bộ cài chờ 9B rảnh. Kết thúc lượt chat cài đặt trước khi tiếp tục.');
  const result = await runJob(job, runtime);
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) main().catch(error => { console.error('CHƯA CÀI XONG: ' + error.message); process.exitCode = 1; });
module.exports = { main, parseArgs, validatePreflight, waitForIdle, runJob, applyArgs, createJob, readJob, gatewayPort, launch };
