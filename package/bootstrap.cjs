#!/usr/bin/env node
'use strict';

// Portable installer. Imports existing, reviewed package skills through the
// official local-directory CLI; it never writes around an install-policy denial.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const cp = require('node:child_process');

const PACKAGE_ROOT = fs.realpathSync(__dirname);
const PACKAGE_ID = 'freeup-content-student-gift';
const CONDUCTOR = 'freeup-content-system';
const DATA_FOLDER = 'freeup-content-data';
const RECEIPT_FILE = 'freeup-gift-origin.json';
const NATIVE_METADATA = new Set(['.openclaw-origin.json', '.clawhub/origin.json', '.clawhub/lock.json', '.openclaw/source.json', '.openclaw/skill-source.json', '.openclaw/source-origin.json']);

function fail(message) { throw new Error(message); }
function exists(file) { try { fs.lstatSync(file); return true; } catch (error) { if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return false; throw error; } }
function hash(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function json(file) { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }
function writable(file) { try { fs.accessSync(file, fs.constants.W_OK); return true; } catch { return false; } }
function contained(file, root, allowRoot = false) {
  const relative = path.relative(path.resolve(root), path.resolve(file));
  return (allowRoot && relative === '') || (relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}
function assertContained(file, root, allowRoot = false) {
  if (!contained(file, root, allowRoot)) fail(`Đường dẫn nằm ngoài thư mục được phép: ${file}`);
  return path.resolve(file);
}
function assertNoLinks(file, root = file) {
  const resolved = path.resolve(file);
  const boundary = path.resolve(root);
  if (!contained(resolved, boundary, true)) fail('Không thể kiểm tra đường dẫn ngoài boundary.');
  const relative = path.relative(boundary, resolved);
  const components = relative ? relative.split(path.sep) : [];
  let current = boundary;
  for (const part of ['', ...components]) {
    if (part) current = path.join(current, part);
    if (exists(current) && fs.lstatSync(current).isSymbolicLink()) fail(`Không đi qua symlink/junction: ${current}`);
  }
}
function treeFiles(root, { ignoreDependencies = false } = {}) {
  assertNoLinks(root);
  const files = {};
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const file = path.join(dir, entry.name);
      assertContained(file, root);
      if (entry.isSymbolicLink() || fs.lstatSync(file).isSymbolicLink()) fail(`Gói/skill chứa link không được hỗ trợ: ${file}`);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' && ignoreDependencies) continue;
        if (ignoreDependencies && path.relative(root, file).split(path.sep).join('/') === '.runtime/puppeteer') continue;
        if (entry.name === '.git') fail(`Không phân phối dữ liệu Git trong skill: ${file}`);
        walk(file);
      } else if (entry.isFile()) {
        const stat = fs.statSync(file);
        if (stat.nlink > 1) fail(`Không nhận hardlink trong gói/skill: ${file}`);
        files[path.relative(root, file).split(path.sep).join('/')] = hash(fs.readFileSync(file));
      } else fail(`Gói/skill có file type không được hỗ trợ: ${file}`);
    }
  }
  walk(root);
  return Object.fromEntries(Object.keys(files).sort().map(name => [name, files[name]]));
}
function copyTree(source, target) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = assertContained(path.join(target, entry.name), target);
    if (entry.isSymbolicLink()) fail(`Không copy link: ${from}`);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to, fs.constants.COPYFILE_EXCL);
    else fail(`Không copy file type: ${from}`);
  }
}
function writeJson(file, value, exclusive = false) {
  assertNoLinks(file, path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', { encoding: 'utf8', flag: exclusive ? 'wx' : 'w' });
}
function parseArgs(argv) {
  const options = { apply: false, plan: false, upgrade: false, installDeps: false };
  const valueFlags = new Map([['--agent', 'agent'], ['--install-root', 'installRoot'], ['--state-dir', 'stateDir'], ['--cli', 'cli'], ['--workspace', 'workspace']]);
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--apply') options.apply = true;
    else if (arg === '--plan') options.plan = true;
    else if (arg === '--upgrade') options.upgrade = true;
    else if (arg === '--install-deps') options.installDeps = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (valueFlags.has(arg)) {
      const value = argv[++index];
      if (!value || value.startsWith('--')) fail(`Thiếu giá trị cho ${arg}.`);
      options[valueFlags.get(arg)] = value;
    } else fail(`Tham số không được hỗ trợ: ${arg}`);
  }
  if (options.apply && options.plan) fail('Chỉ chọn --plan hoặc --apply.');
  if (options.installDeps && !options.apply) fail('--install-deps chỉ dùng cùng --apply, vì bước này tải dependencies.');
  if (options.agent && !/^[a-z][a-z0-9-]{0,63}$/.test(options.agent)) fail('Agent ID không hợp lệ.');
  return options;
}
function printHelp() {
  console.log('FREEUP Content System — bộ cài tự chứa cho 9BizClaw v3\n');
  console.log('node bootstrap.cjs --plan');
  console.log('node bootstrap.cjs --apply [--agent <id>] [--install-root <path>]');
  console.log('node bootstrap.cjs --apply --upgrade');
  console.log('node bootstrap.cjs --apply --install-deps');
  console.log('\n--state-dir <path> và --cli <native-openclaw.mjs> dùng khi cấu hình runtime riêng.');
  console.log('--workspace <path> chỉ xác nhận workspace native, không ghi đè chọn workspace.');
  console.log('Mặc định chỉ lập kế hoạch. Không tự restart, tạo ảnh/video hoặc đăng bài.');
}
function loadManifest() {
  const file = path.join(PACKAGE_ROOT, 'distribution-manifest.json');
  if (!exists(file)) fail('Gói thiếu distribution-manifest.json.');
  const manifest = json(file);
  if (manifest.package_id !== PACKAGE_ID || typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(manifest.version)) fail('Manifest package_id/version không hợp lệ.');
  if (!Array.isArray(manifest.skills) || manifest.skills.length < 1 || manifest.skills.length > 100) fail('Manifest thiếu danh sách skill hợp lệ.');
  const seen = new Set();
  for (const skill of manifest.skills) {
    if (!skill || typeof skill.name !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(skill.name) || seen.has(skill.name)) fail('Tên skill trùng hoặc không hợp lệ trong manifest.');
    if (skill.source !== `skills/${skill.name}`) fail(`Source phải là thư mục skill cùng cấp: ${skill.name}`);
    seen.add(skill.name);
    skill.sourcePath = assertContained(path.join(PACKAGE_ROOT, ...skill.source.split('/')), PACKAGE_ROOT);
    assertNoLinks(skill.sourcePath, PACKAGE_ROOT);
    const text = fs.readFileSync(path.join(skill.sourcePath, 'SKILL.md'), 'utf8');
    const frontmatter = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(text);
    const name = frontmatter && /^name:\s*["']?([a-z][a-z0-9-]*)["']?\s*$/m.exec(frontmatter[1]);
    if (!name || name[1] !== skill.name) fail(`SKILL.md frontmatter không khớp tên: ${skill.name}`);
    skill.files = treeFiles(skill.sourcePath);
    if (Object.hasOwn(skill.files, RECEIPT_FILE)) fail(`Source không được chứa receipt cài đặt: ${skill.name}`);
    skill.sourceHash = hash(JSON.stringify(skill.files));
  }
  if (!seen.has(CONDUCTOR)) fail(`Gói thiếu ${CONDUCTOR}.`);
  const checksumFile = path.join(PACKAGE_ROOT, 'package-checksums.json');
  if (exists(checksumFile)) {
    const checksums = json(checksumFile);
    if (checksums.package_id !== PACKAGE_ID || checksums.version !== manifest.version || !checksums.files || typeof checksums.files !== 'object') fail('Checksum manifest không khớp gói.');
    const actual = treeFiles(PACKAGE_ROOT);
    delete actual['package-checksums.json'];
    if (!same(Object.keys(actual).sort(), Object.keys(checksums.files).sort()) || Object.keys(actual).some(file => actual[file] !== checksums.files[file])) fail('Payload không khớp package-checksums.json. Tải lại gói nguyên vẹn.');
  }
  return manifest;
}
function resolveRuntime(options, env = process.env) {
  let root = options.installRoot || env.NINEBIZ_INSTALL_ROOT || env.NINEBIZ_CLI_ROOT;
  if (!root && env.OPENCLAW_STATE_DIR) {
    const candidate = path.dirname(path.resolve(env.OPENCLAW_STATE_DIR));
    if (exists(path.join(candidate, 'vendor', 'node_modules', 'openclaw', 'openclaw.mjs'))) root = candidate;
  }
  if (!root && !options.cli) {
    const appData = env.APPDATA || (process.platform === 'win32' ? path.join(os.homedir(), 'AppData', 'Roaming') : undefined);
    if (appData) {
      const metadata = path.join(appData, '9BizClaw-v3', 'install-root.json');
      if (exists(metadata)) {
        const record = json(metadata);
        if (typeof record.path === 'string' && record.path.trim()) root = record.path;
      }
    }
  }
  if (!root && !options.cli) fail('Chưa tìm thấy 9BizClaw v3. Mở/cài 9b trước, hoặc cung cấp --install-root của máy này.');
  if (root) root = fs.realpathSync(path.resolve(root));
  const cli = path.resolve(options.cli || path.join(root, 'vendor', 'node_modules', 'openclaw', 'openclaw.mjs'));
  if (!/\.m?js$/i.test(cli) || !exists(cli)) fail('--cli phải trỏ tới native OpenClaw JavaScript entrypoint, không dùng wrapper .cmd vì wrapper có thể đổi state target.');
  assertNoLinks(cli, root && contained(cli, root) ? root : path.dirname(cli));
  const bundledNode = root && path.join(root, 'vendor', 'node', process.platform === 'win32' ? 'node.exe' : 'node');
  const node = bundledNode && exists(bundledNode) ? bundledNode : process.execPath;
  const stateDir = path.resolve(options.stateDir || (options.installRoot && root && path.join(root, 'openclaw-state')) || env.OPENCLAW_STATE_DIR || (root && path.join(root, 'openclaw-state')) || fail('Cần --state-dir khi chỉ định --cli độc lập.'));
  const configPath = options.stateDir || options.installRoot ? path.join(stateDir, 'openclaw.json') : env.OPENCLAW_CONFIG_PATH || path.join(stateDir, 'openclaw.json');
  if (!exists(configPath)) fail('Runtime chưa có cấu hình. Hoàn tất khởi tạo 9b trước khi cài gói.');
  assertNoLinks(stateDir);
  assertNoLinks(configPath, stateDir);
  const runtimeEnv = { ...env, OPENCLAW_STATE_DIR: stateDir, OPENCLAW_CONFIG_PATH: configPath, OPENCLAW_NO_BANNER: '1', NO_COLOR: '1', FORCE_COLOR: '0', PATH: [path.dirname(node), env.PATH || env.Path || ''].join(path.delimiter) };
  return { root, cli, node, stateDir, configPath, env: runtimeEnv };
}
function runProcess(command, args, { cwd, env, timeout = 120000, label = 'Công cụ', inherit = false } = {}) {
  const result = cp.spawnSync(command, args, { cwd, env, encoding: 'utf8', windowsHide: true, shell: false, timeout, maxBuffer: 16 * 1024 * 1024, stdio: inherit ? 'inherit' : 'pipe' });
  if (result.error) {
    const error = new Error(`${label} không chạy được: ${result.error.message}`, { cause: result.error });
    error.code = result.error.code;
    error.nativeOutput = `${result.stderr || ''}\n${result.stdout || ''}`.trim();
    throw error;
  }
  if (result.status !== 0) {
    const detail = `${result.stderr || ''}\n${result.stdout || ''}`.trim().slice(-6000);
    fail(`${label} thất bại (exit ${result.status}). Không copy trực tiếp hoặc đổi policy để vượt từ chối.${detail ? '\n' + detail : ''}`);
  }
  return (result.stdout || '').trim();
}
function native(runtime, args, options = {}) {
  return runProcess(runtime.node, [runtime.cli, ...args], { env: runtime.env, cwd: options.cwd || PACKAGE_ROOT, label: `Native CLI ${args[0] || ''}`, timeout: options.timeout || 120000 });
}
function nativeJson(runtime, args) {
  const raw = native(runtime, args);
  try { return JSON.parse(raw); } catch { fail(`Native CLI không trả JSON hợp lệ cho ${args.slice(0, 2).join(' ')}; không đoán trạng thái.`); }
}
function readAgents(runtime) {
  try {
    const config = json(runtime.configPath);
    return config.agents || {};
  } catch (error) {
    // JSON5 is supported by the native reader, without importing app internals.
    if (!(error instanceof SyntaxError)) throw error;
    return nativeJson(runtime, ['config', 'get', 'agents', '--json']);
  }
}
function agentRoster(agents) {
  if (Object.hasOwn(agents, 'entries')) {
    if (!agents.entries || Array.isArray(agents.entries) || typeof agents.entries !== 'object') fail('agents.entries không hợp lệ.');
    return Object.entries(agents.entries).map(([id, entry]) => ({ id, entry, configPath: `agents.entries.${id}.skills` }));
  }
  if (Object.hasOwn(agents, 'list')) {
    if (!Array.isArray(agents.list)) fail('agents.list không hợp lệ.');
    return agents.list.map((entry, index) => ({ id: entry.id, entry, configPath: `agents.list[${index}].skills` }));
  }
  return [{ id: 'main', entry: {}, configPath: 'agents.entries.main.skills' }];
}
function selectAgent(agents, requested) {
  const roster = agentRoster(agents);
  if (!roster.length) fail('Runtime chưa có agent.');
  for (const record of roster) if (!/^[a-z][a-z0-9-]{0,63}$/.test(record.id || '') || !record.entry || typeof record.entry !== 'object') fail('Agent roster không hợp lệ.');
  if (requested) {
    const match = roster.find(record => record.id === requested);
    if (!match) fail(`Không có agent '${requested}' trên runtime này.`);
    return match;
  }
  if (roster.length === 1) return roster[0];
  if (agents.ownership !== 'explicit') {
    const defaults = roster.filter(record => record.entry.default === true);
    if (defaults.length === 1) return defaults[0];
  }
  fail(`Runtime có nhiều agent (${roster.map(record => record.id).join(', ')}). Chạy lại với --agent của chat đang dùng.`);
}
function allowlistBatch(agents, agent, names) {
  const own = Object.hasOwn(agent.entry, 'skills');
  const inherited = agents.defaults && Object.hasOwn(agents.defaults, 'skills');
  if (!own && !inherited) return [];
  const before = own ? agent.entry.skills : agents.defaults.skills;
  if (!Array.isArray(before) || before.some(name => typeof name !== 'string')) fail('Allowlist của agent không phải mảng tên skill.');
  const after = [...before];
  for (const name of names) if (!after.includes(name)) after.push(name);
  if (own && same(before, after)) return [];
  if (!agent.configPath) fail('Không có đường dẫn allowlist riêng cho agent đích.');
  return [{ path: agent.configPath, value: after }];
}
function verifyManagedSkill(skill, target, manifest, options) {
  if (!exists(target)) return { action: 'install' };
  assertNoLinks(target);
  const originFile = path.join(target, RECEIPT_FILE);
  if (!exists(originFile)) fail(`Skill '${skill.name}' đã có và không thuộc quà tặng này. Không ghi đè; chọn agent/workspace khác hoặc xử lý xung đột trong 9b.`);
  const origin = json(originFile);
  if (origin.package_id !== PACKAGE_ID || origin.skill_name !== skill.name || typeof origin.version !== 'string' || !origin.installed_files) fail(`Skill '${skill.name}' không có ownership hợp lệ của quà tặng.`);
  const actual = treeFiles(target, { ignoreDependencies: true });
  for (const [file, expected] of Object.entries(origin.installed_files)) {
    if (!/^[a-f0-9]{64}$/.test(expected) || actual[file] !== expected) fail(`Skill '${skill.name}' đã được sửa sau cài (${file}). Giữ bản học viên, không tự ghi đè.`);
  }
  const extras = Object.keys(actual).filter(file => file !== RECEIPT_FILE && !Object.hasOwn(origin.installed_files, file) && !NATIVE_METADATA.has(file));
  if (extras.length) fail(`Skill '${skill.name}' có file riêng chưa được quản lý (${extras.slice(0, 3).join(', ')}). Không tự ghi đè.`);
  if (origin.version === manifest.version) {
    if (origin.source_hash !== skill.sourceHash) fail(`Gói cùng version nhưng nội dung '${skill.name}' khác. Cần gói có version mới trước khi nâng cấp.`);
    return { action: 'keep' };
  }
  if (!options.upgrade) fail(`Skill '${skill.name}' thuộc version ${origin.version}. Chỉ nâng cấp bằng --apply --upgrade sau khi xem gói mới.`);
  return { action: 'upgrade', previousVersion: origin.version };
}
function installedReceipt(manifest, skill, stage) {
  return { schema_version: 1, package_id: PACKAGE_ID, version: manifest.version, skill_name: skill.name, source_hash: skill.sourceHash, installed_files: treeFiles(stage), installed_at_utc: new Date().toISOString() };
}
function retryableNativeTimeout(error) {
  // Only an actual process timeout is recoverable. Native refusals and policy
  // errors are never retried, even if that process subsequently times out.
  return error?.code === 'ETIMEDOUT' && !/\b(?:denied|blocked|refused)\b|security\.installPolicy|\b(?:policy|permission)\s+(?:denial|refusal)|không được phép|từ chối/i.test(error.nativeOutput || '');
}
function assertManagedInstall(skill, target, stage, manifest, options) {
  if (verifyManagedSkill(skill, target, manifest, options).action !== 'keep') fail(`Native install '${skill.name}' chưa có receipt hoàn chỉnh của bản đang cài.`);
  const receipt = json(path.join(target, RECEIPT_FILE));
  const expected = json(path.join(stage, RECEIPT_FILE));
  if (!same(receipt.installed_files, expected.installed_files)) fail(`Native install '${skill.name}' chưa khớp đầy đủ source đã chuẩn bị.`);
}
function installNativeWithRecovery(runtime, args, item, stage, manifest, options, invoke = native) {
  if (verifyManagedSkill(item.skill, item.target, manifest, options).action !== item.action) fail(`Target '${item.skill.name}' thay đổi trước native install; dừng để giữ cập nhật mới.`);
  const before = exists(item.target) ? treeFiles(item.target, { ignoreDependencies: true }) : null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      invoke(runtime, args);
      assertManagedInstall(item.skill, item.target, stage, manifest, options);
      return { attempts: attempt, recovered: attempt > 1 ? 'native-retry' : null };
    } catch (error) {
      if (!retryableNativeTimeout(error)) throw error;
      const ownership = verifyManagedSkill(item.skill, item.target, manifest, options);
      if (ownership.action === 'keep') {
        assertManagedInstall(item.skill, item.target, stage, manifest, options);
        console.log(`Đã kiểm receipt và tệp đầy đủ sau khi native CLI hết thời gian: ${item.skill.name}`);
        return { attempts: attempt, recovered: 'verified-receipt-after-timeout' };
      }
      // No direct copy, force escalation, or partial-tree repair. A retry may
      // reuse only the original, still-unchanged native installation decision.
      if (ownership.action !== item.action) fail(`Target '${item.skill.name}' thay đổi sau timeout; dừng để giữ dữ liệu hiện tại.`);
      if (before && !same(before, treeFiles(item.target, { ignoreDependencies: true }))) fail(`Skill '${item.skill.name}' thay đổi trong lúc native CLI hết thời gian; không tự ghi đè.`);
      if (attempt === 2) throw error;
      console.log(`Native CLI hết thời gian; trạng thái skill xác nhận có thể thử lại đúng một lần: ${item.skill.name}`);
    }
  }
  fail('Native retry vượt số lần cho phép.');
}
function assertReady(inventory, names) {
  for (const name of names) {
    const matches = inventory.skills.filter(skill => skill.name === name);
    if (matches.length !== 1) fail(`Inventory chưa có duy nhất skill '${name}'.`);
    const entry = matches[0];
    if (!entry.eligible || entry.disabled || entry.blockedByAgentFilter || entry.blockedByAllowlist) fail(`Skill '${name}' chưa eligible hoặc bị policy/allowlist chặn. Chưa thể báo cài xong.`);
  }
}
function dependencyInstall(runtime, installedRoot) {
  const dependencyEnv = { ...runtime.env, PUPPETEER_CACHE_DIR: path.join(installedRoot, '.runtime', 'puppeteer') };
  const npmCli = [path.join(path.dirname(runtime.node), 'node_modules', 'npm', 'bin', 'npm-cli.js'), runtime.root && path.join(runtime.root, 'vendor', 'node', 'node_modules', 'npm', 'bin', 'npm-cli.js')].find(file => file && exists(file));
  if (!npmCli) fail('Không tìm thấy npm đi kèm runtime. Skills đã cài; dependencies tùy chọn chưa cài.');
  const projects = [installedRoot, path.join(installedRoot, 'scripts', 'reels_engine')].filter(dir => exists(path.join(dir, 'package.json')));
  for (const dir of projects) {
    if (!exists(path.join(dir, 'package-lock.json'))) fail(`Dependency project thiếu package-lock.json: ${path.relative(installedRoot, dir) || '.'}`);
    console.log(`Đang cài dependencies đã khóa: ${path.relative(installedRoot, dir) || 'content engines'}`);
    runProcess(runtime.node, [npmCli, 'ci', '--no-audit', '--no-fund'], { cwd: dir, env: dependencyEnv, timeout: 600000, label: 'npm ci', inherit: true });
  }
  const playwrightCli = path.join(installedRoot, 'node_modules', 'playwright', 'cli.js');
  if (exists(playwrightCli)) runProcess(runtime.node, [playwrightCli, 'install', 'chromium'], { cwd: installedRoot, env: dependencyEnv, timeout: 600000, label: 'Browser install', inherit: true });
  const validation = "const fs=require('node:fs'); const cp=require('node:child_process'); const packageJson=require('./package.json'); let browser=null; if(packageJson.dependencies?.puppeteer){browser=require('./node_modules/puppeteer').executablePath();}else if(packageJson.dependencies?.playwright){browser=require('./node_modules/playwright').chromium.executablePath();}else throw Error('No browser dependency declared'); if(!browser||!fs.existsSync(browser))throw Error('Chromium missing'); const ffmpeg=require('./node_modules/ffmpeg-static'); if(!ffmpeg||!fs.existsSync(ffmpeg))throw Error('FFmpeg missing'); const r=cp.spawnSync(ffmpeg,['-version'],{encoding:'utf8',windowsHide:true}); if(r.status!==0)throw Error('FFmpeg verification failed'); console.log(JSON.stringify({chromium:true,ffmpeg:true}));";
  runProcess(runtime.node, ['-e', validation], { cwd: installedRoot, env: dependencyEnv, timeout: 60000, label: 'Xác minh browser/FFmpeg' });
}
function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help) { printHelp(); return; }
  const manifest = loadManifest();
  const runtime = resolveRuntime(options);
  const agents = readAgents(runtime);
  const agent = selectAgent(agents, options.agent);
  const inventory = nativeJson(runtime, ['skills', 'list', '--agent', agent.id, '--json']);
  if (!inventory || typeof inventory.workspaceDir !== 'string' || !Array.isArray(inventory.skills)) fail('Native inventory thiếu workspaceDir/skills.');
  const workspace = path.resolve(inventory.workspaceDir);
  if (!exists(workspace) || !fs.statSync(workspace).isDirectory()) fail('Workspace native chưa tồn tại. Mở chat 9b và khởi tạo workspace trước.');
  assertNoLinks(workspace);
  if (fs.realpathSync(workspace) !== workspace) fail('Workspace đi qua link/junction; bộ cài không tự ghi qua đường dẫn này.');
  if (options.workspace && path.resolve(options.workspace) !== workspace) fail('--workspace không khớp workspace authoritative từ native inventory.');
  const skillRoot = assertContained(path.join(workspace, 'skills'), workspace);
  assertNoLinks(skillRoot, workspace);
  const names = manifest.skills.map(skill => skill.name);
  const plan = manifest.skills.map(skill => {
    const target = assertContained(path.join(skillRoot, skill.name), workspace);
    assertNoLinks(target, workspace);
    const visible = inventory.skills.find(entry => entry.name === skill.name);
    if (visible && !exists(target)) fail(`Tên skill '${skill.name}' đã được dùng bởi nguồn khác (${visible.source || 'native inventory'}). Không shadow skill có sẵn.`);
    return { skill, target, ...verifyManagedSkill(skill, target, manifest, options) };
  });
  const batch = allowlistBatch(agents, agent, names);
  const dataRoot = assertContained(path.join(workspace, DATA_FOLDER), workspace);
  assertNoLinks(dataRoot, workspace);
  if (exists(dataRoot) && !fs.statSync(dataRoot).isDirectory()) fail('Đường dẫn project data đang là file.');
  const runtimeVersionFile = path.join(path.dirname(runtime.cli), 'package.json');
  const version = exists(runtimeVersionFile) ? json(runtimeVersionFile).version : 'unknown';
  const planReport = { package_id: PACKAGE_ID, version: manifest.version, mode: options.apply ? 'apply' : 'plan', runtime_version: version, agent: agent.id, workspace, project: dataRoot, writable_context: { workspace: writable(workspace), state: writable(runtime.stateDir), config: writable(runtime.configPath) }, skills: plan.map(item => ({ name: item.skill.name, command: item.skill.command_alias || '/' + item.skill.name.replace(/[^a-z0-9_]+/g, '_').slice(0, 32), action: item.action })), allowlist_paths: batch.map(change => change.path), install_dependencies: options.installDeps };
  console.log(JSON.stringify(planReport, null, 2));
  if (!options.apply) { console.log('PLAN: chỉ kiểm tra gói và native inventory; chưa cài skill/chỉnh cấu hình. Chạy --apply để cài.'); return planReport; }
  fs.accessSync(workspace, fs.constants.W_OK);
  const taskTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'freeup-gift-install-'));
  const transaction = { schema_version: 1, package_id: PACKAGE_ID, version: manifest.version, agent_id: agent.id, started_at_utc: new Date().toISOString(), state: 'installing', completed: [] };
  const reportFolder = assertContained(path.join(workspace, 'freeup-content-install-reports'), workspace);
  assertNoLinks(reportFolder, workspace);
  fs.mkdirSync(reportFolder, { recursive: true });
  const reportPath = path.join(reportFolder, `install-${Date.now()}-${crypto.randomUUID()}.json`);
  try {
    if (batch.length) {
      const preflightFile = path.join(taskTemp, 'allowlist-preflight.json');
      writeJson(preflightFile, batch, true);
      native(runtime, ['config', 'set', '--batch-file', preflightFile, '--dry-run', '--json']);
    }
    writeJson(reportPath, transaction, true);
    for (const item of plan) {
      if (item.action === 'keep') { transaction.completed.push({ name: item.skill.name, action: 'kept' }); continue; }
      const currentOwnership = verifyManagedSkill(item.skill, item.target, manifest, options);
      if (currentOwnership.action !== item.action) fail(`Target '${item.skill.name}' thay đổi sau preflight; dừng để giữ cập nhật mới.`);
      const stage = assertContained(path.join(taskTemp, item.skill.name), taskTemp);
      copyTree(item.skill.sourcePath, stage);
      if (item.skill.name === CONDUCTOR) writeJson(path.join(stage, 'runtime.json'), { schema_version: 1, package_id: PACKAGE_ID, version: manifest.version, project_relative: '../../' + DATA_FOLDER });
      writeJson(path.join(stage, RECEIPT_FILE), installedReceipt(manifest, item.skill, stage), true);
      if (item.action === 'upgrade') {
        const backup = assertContained(path.join(reportFolder, `backup-${Date.now()}-${item.skill.name}`), reportFolder);
        copyTree(item.target, backup);
        transaction.completed.push({ name: item.skill.name, action: 'backed-up', backup_relative: path.relative(workspace, backup).split(path.sep).join('/') });
        writeJson(reportPath, transaction);
      }
      const args = ['skills', 'install', stage, '--agent', agent.id, '--as', item.skill.name];
      if (item.action === 'upgrade') args.push('--force');
      const nativeResult = installNativeWithRecovery(runtime, args, item, stage, manifest, options);
      transaction.completed.push({ name: item.skill.name, action: item.action === 'upgrade' ? 'upgraded' : 'installed', ...(nativeResult.recovered ? { timeout_recovery: nativeResult.recovered, native_attempts: nativeResult.attempts } : {}) });
      writeJson(reportPath, transaction);
      console.log(`Đã cài native: ${item.skill.name}`);
    }
    const latestAgents = readAgents(runtime);
    const latestAgent = selectAgent(latestAgents, agent.id);
    const latestBatch = allowlistBatch(latestAgents, latestAgent, names);
    if (latestBatch.length) {
      const batchFile = path.join(taskTemp, 'allowlist-apply.json');
      writeJson(batchFile, latestBatch, true);
      native(runtime, ['config', 'set', '--batch-file', batchFile, '--dry-run', '--json']);
      native(runtime, ['config', 'set', '--batch-file', batchFile, '--json']);
      const afterAgents = readAgents(runtime);
      if (allowlistBatch(afterAgents, selectAgent(afterAgents, agent.id), names).length) fail('Đọc lại allowlist chưa thấy đủ skill của gói.');
    }
    const installedRoot = path.join(skillRoot, CONDUCTOR);
    const helper = assertContained(path.join(installedRoot, 'scripts', 'content.cjs'), installedRoot);
    if (!exists(helper)) fail('Conductor thiếu scripts/content.cjs để khởi tạo project.');
    runProcess(runtime.node, [helper, 'init', '--project', dataRoot], { cwd: installedRoot, env: runtime.env, label: 'Khởi tạo hồ sơ học viên' });
    if (options.installDeps) dependencyInstall(runtime, installedRoot);
    const finalInventory = nativeJson(runtime, ['skills', 'list', '--agent', agent.id, '--json']);
    assertReady(finalInventory, names);
    transaction.state = 'installed-and-native-inventory-verified';
    transaction.finished_at_utc = new Date().toISOString();
    transaction.dependencies_installed = options.installDeps;
    writeJson(reportPath, transaction);
    console.log(`ĐÃ CÀI VÀ XÁC MINH ${names.length}/${names.length} SKILL. Hồ sơ học viên ở ${dataRoot}.`);
    console.log('Mở lượt/chat mới trong 9b, dùng /caidat để kiểm hồ sơ doanh nghiệp rồi /vietbai <chủ đề>.');
    console.log('Nếu lệnh ngắn trùng tên, dùng /skill freeup-content-system /vietbai <chủ đề>.');
    console.log(`Báo cáo: ${reportPath}`);
    return { ...planReport, result: transaction.state, report: reportPath };
  } catch (error) {
    transaction.state = 'incomplete';
    transaction.error = error.message;
    transaction.finished_at_utc = new Date().toISOString();
    if (exists(reportPath)) writeJson(reportPath, transaction);
    throw error;
  } finally {
    // Exactly one verified private temporary tree; never delete app state.
    assertContained(taskTemp, os.tmpdir());
    assertNoLinks(taskTemp, os.tmpdir());
    fs.rmSync(taskTemp, { recursive: true, force: true });
  }
}

if (require.main === module) {
  try { main(); }
  catch (error) { console.error(`CHƯA CÀI XONG: ${error.message}`); process.exitCode = 1; }
}
module.exports = { main, parseArgs, resolveRuntime, agentRoster, selectAgent, allowlistBatch, treeFiles, contained, loadManifest, verifyManagedSkill, readAgents, nativeJson, runProcess, retryableNativeTimeout, installNativeWithRecovery };
