#!/usr/bin/env node
'use strict';
// One entry point. Native hosts keep their native policy; file-based hosts use
// their documented skill roots. No accounts, profiles or security settings ship.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');
const bootstrap = require('./package/bootstrap.cjs');
const packageRoot = path.join(__dirname, 'package');
const receiptName = 'freeup-gift-origin.json';

function parse(argv) {
  const out = { target: 'auto', apply: false, upgrade: false };
  const values = { '--target': 'target', '--agent': 'agent', '--skills-dir': 'skillsDir', '--data-dir': 'dataDir', '--install-root': 'installRoot', '--cli': 'cli', '--state-dir': 'stateDir', '--workspace': 'workspace' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--apply') out.apply = true;
    else if (arg === '--plan') out.plan = true;
    else if (arg === '--upgrade') out.upgrade = true;
    else if (arg === '--install-deps') out.installDeps = true;
    else if (arg === '--help') out.help = true;
    else if (values[arg]) { const v = argv[++i]; if (!v || v.startsWith('--')) throw Error('Thiếu giá trị: ' + arg); out[values[arg]] = v; }
    else throw Error('Tham số không hỗ trợ: ' + arg);
  }
  if (out.apply && out.plan) throw Error('Chọn --plan hoặc --apply.');
  if (!['auto', 'codex', 'claude', 'openclaw', '9bizclaw'].includes(out.target)) throw Error('Target: codex, claude, openclaw, 9bizclaw.');
  return out;
}
function target(options, env) {
  if (options.target !== 'auto') return options.target;
  // Running-host signals take precedence over the mere presence of other apps.
  if (env.CODEX_THREAD_ID || env.CODEX_CI || env.CODEX_HOME) return 'codex';
  if (env.CLAUDECODE || env.CLAUDE_PROJECT_DIR || env.CLAUDE_CONFIG_DIR) return 'claude';
  if (env.NINEBIZ_INSTALL_ROOT || env.NINEBIZ_CLI_ROOT) return '9bizclaw';
  if (env.OPENCLAW_STATE_DIR) return fs.existsSync(path.join(path.dirname(path.resolve(env.OPENCLAW_STATE_DIR)), 'vendor', 'node_modules', 'openclaw', 'openclaw.mjs')) ? '9bizclaw' : 'openclaw';
  throw Error('Chưa có tín hiệu nền tảng. Agent truyền --target theo chính phiên đang chạy; không đoán từ các ứng dụng đã cài.');
}
function noLinks(file) {
  let current = path.parse(path.resolve(file)).root;
  for (const part of path.resolve(file).slice(current.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Không ghi qua symlink/junction: ' + current);
  }
}
function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const item of fs.readdirSync(from, { withFileTypes: true })) {
    if (item.isSymbolicLink()) throw Error('Source chứa link.');
    const src = path.join(from, item.name), dest = path.join(to, item.name);
    if (item.isDirectory()) copy(src, dest);
    else if (item.isFile()) fs.copyFileSync(src, dest, fs.constants.COPYFILE_EXCL);
    else throw Error('Source chứa loại file không hỗ trợ.');
  }
}
function nativeArgs(o) {
  const args = [];
  for (const [key, flag] of [['agent', '--agent'], ['installRoot', '--install-root'], ['cli', '--cli'], ['stateDir', '--state-dir'], ['workspace', '--workspace']]) if (o[key]) args.push(flag, o[key]);
  if (o.upgrade) args.push('--upgrade');
  if (o.installDeps) args.push('--install-deps');
  return args;
}
function openclawCli(o, env) {
  if (o.cli || env.OPENCLAW_CLI) return path.resolve(o.cli || env.OPENCLAW_CLI);
  for (const folder of (env.PATH || env.Path || '').split(path.delimiter).filter(Boolean)) {
    for (const candidate of [path.join(folder, 'openclaw'), path.join(folder, 'node_modules', 'openclaw', 'openclaw.mjs'), path.join(folder, '..', 'lib', 'node_modules', 'openclaw', 'openclaw.mjs')]) {
      if (fs.existsSync(candidate)) { const real = fs.realpathSync(candidate); if (/\.m?js$/i.test(real)) return real; }
    }
  }
  throw Error('Chưa tìm được entrypoint OpenClaw. Đọc cấu hình/PATH của runtime hiện tại, truyền --cli <openclaw.mjs>.');
}
function main(argv = process.argv.slice(2), context = {}) {
  const o = parse(argv), env = context.env || process.env, home = context.home || os.homedir();
  if (o.help) { console.log('node install.cjs --target auto|9bizclaw|openclaw|claude|codex [--plan|--apply] [--upgrade]. Xem INSTALL.md.'); return; }
  if (Number(process.versions.node.split('.')[0]) < 20) throw Error('Cần Node 20 trở lên; 9B dùng Node đi kèm ứng dụng.');
  const host = target(o, env);
  const manifest = bootstrap.loadManifest(); // Full source integrity before mutation.
  if (host === '9bizclaw' || host === 'openclaw') {
    if (o.skillsDir || o.dataDir) throw Error('Native host tự quyết workspace/kho; không nhận --skills-dir hoặc --data-dir.');
    if (host === 'openclaw') { o.cli = openclawCli(o, env); o.stateDir ||= env.OPENCLAW_STATE_DIR || path.join(home, '.openclaw'); }
    const args = nativeArgs(o);
    // 9B defers installation until the current model turn has finished.
    if (host === '9bizclaw' && o.apply) {
      const r = cp.spawnSync(process.execPath, [path.join(packageRoot, 'install-job.cjs'), 'launch', ...args], { env, shell: false, windowsHide: true, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
      if (r.status !== 0 || r.error) throw Error(r.stderr || r.error?.message || 'Không khởi chạy được bộ cài native.');
      console.log(r.stdout);
      console.log('Đã khởi chạy. Kết thúc lượt này; lượt mới kiểm status theo job_file. Chưa báo cài xong.');
      return { state: 'launched', target: host };
    }
    return bootstrap.main([o.apply ? '--apply' : '--plan', ...args]);
  }
  if (o.installDeps) throw Error('Claude/Codex: cài công cụ media trong thư mục skill sau khi cài skill, theo INSTALL.md.');
  const config = host === 'codex' ? env.CODEX_HOME || path.join(home, '.codex') : env.CLAUDE_CONFIG_DIR || path.join(home, '.claude');
  const skillRoot = path.resolve(o.skillsDir || path.join(config, 'skills'));
  const dataRoot = path.resolve(o.dataDir || path.join(config, 'freeup-content-data'));
  noLinks(skillRoot); noLinks(dataRoot);
  if (skillRoot === dataRoot || bootstrap.contained(dataRoot, skillRoot) || bootstrap.contained(skillRoot, dataRoot)) throw Error('Kho dữ liệu phải tách khỏi thư mục skill.');
  const items = manifest.skills.map(skill => { const dest = path.join(skillRoot, skill.name); noLinks(dest); return { skill, dest, ...bootstrap.verifyManagedSkill(skill, dest, manifest, o) }; });
  const plan = { version: manifest.version, target: host, state: 'plan', skills_dir: skillRoot, data_dir: dataRoot, skills: items.map(x => ({ name: x.skill.name, action: x.action })) };
  if (!o.apply) { console.log(JSON.stringify(plan, null, 2)); return plan; }
  // Validate every target first; preserve existing company profile and assets.
  fs.mkdirSync(skillRoot, { recursive: true });
  const reports = path.join(path.dirname(skillRoot), 'freeup-content-install-reports'); noLinks(reports); fs.mkdirSync(reports, { recursive: true });
  for (const item of items) {
    if (item.action === 'keep') continue;
    if (bootstrap.verifyManagedSkill(item.skill, item.dest, manifest, o).action !== item.action) throw Error('Target đã đổi sau preflight.');
    const stage = fs.mkdtempSync(path.join(skillRoot, '.freeup-install-'));
    copy(item.skill.sourcePath, stage);
    if (item.skill.name === 'freeup-content-system') fs.writeFileSync(path.join(stage, 'runtime.json'), JSON.stringify({ schema_version: 1, package_id: manifest.package_id, version: manifest.version, host, project_relative: path.relative(item.dest, dataRoot) }, null, 2));
    const receipt = { schema_version: 1, package_id: manifest.package_id, version: manifest.version, skill_name: item.skill.name, source_hash: item.skill.sourceHash, installed_files: bootstrap.treeFiles(stage), installed_at_utc: new Date().toISOString() };
    fs.writeFileSync(path.join(stage, receiptName), JSON.stringify(receipt, null, 2));
    if (item.action === 'upgrade') fs.renameSync(item.dest, path.join(reports, `backup-${Date.now()}-${item.skill.name}`));
    fs.renameSync(stage, item.dest);
  }
  const installedRoot = path.join(skillRoot, 'freeup-content-system');
  const project = require(path.join(installedRoot, 'scripts', 'lib', 'project.cjs'));
  project.init(dataRoot);
  for (const item of items) if (bootstrap.verifyManagedSkill(item.skill, item.dest, manifest, o).action !== 'keep') throw Error('Đọc lại skill chưa khớp gói.');
  const report = { ...plan, state: 'files-verified', next: 'Mở lượt mới, xác nhận đủ 8 skill trong danh sách của host rồi dùng /thietlapcontent. Google/Facebook và lịch tự động kiểm riêng.' };
  fs.writeFileSync(path.join(reports, 'latest.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  return report;
}
if (require.main === module) { try { main(); } catch (e) { console.error(e.message); process.exitCode = 1; } }
module.exports = { main, parse, target, openclawCli };
