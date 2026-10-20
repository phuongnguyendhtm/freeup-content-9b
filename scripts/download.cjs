#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const REPO = 'phuongnguyendhtm/freeup-content-9b';
function safeName(name) {
  if (typeof name !== 'string' || !name || /[\\\u0000-\u001f:]/.test(name) || name.startsWith('/') || name.split('/').some(x => !x || x === '.' || x === '..' || /[. ]$/.test(x) || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(x))) throw Error('Đường dẫn tải không hợp lệ.');
  return name;
}
async function read(url, maximum) {
  const r = await fetch(url, { signal: AbortSignal.timeout(60000), headers: { 'User-Agent': 'freeup-content-installer' }, redirect: 'error' });
  if (!r.ok) throw Error('Tải không thành công HTTP ' + r.status + ': ' + url);
  let size = 0; const parts = [];
  for await (const chunk of r.body) { size += chunk.length; if (size > maximum) throw Error('Tệp tải vượt giới hạn.'); parts.push(chunk); }
  return Buffer.concat(parts);
}
async function download(destination, ref = 'main') {
  const dest = path.resolve(destination);
  // Fresh directory only; never merge a download over a user's files.
  if (fs.existsSync(dest)) throw Error('Thư mục đích đã có; chọn cache mới.');
  const commit = JSON.parse((await read('https://api.github.com/repos/' + REPO + '/commits/' + encodeURIComponent(ref), 3 * 1024 * 1024)).toString('utf8')).sha;
  if (!/^[a-f0-9]{40}$/.test(commit || '')) throw Error('GitHub chưa trả commit hợp lệ.');
  const raw = 'https://raw.githubusercontent.com/' + REPO + '/' + commit + '/';
  const release = JSON.parse((await read(raw + 'release.json', 1024 * 1024)).toString('utf8'));
  const entries = Object.entries(release.files || {}), seen = new Set();
  if (!entries.length || entries.length > 600 || !release.files['install.cjs'] || !release.files['package/package-checksums.json']) throw Error('Release manifest thiếu hoặc vượt giới hạn.');
  for (const [name, digest] of entries) { safeName(name); const folded = name.toLowerCase(); if (seen.has(folded) || !/^[a-f0-9]{64}$/.test(digest)) throw Error('Manifest trùng tên/hash không hợp lệ.'); seen.add(folded); }
  fs.mkdirSync(dest, { recursive: true });
  let cursor = 0, total = 0;
  async function worker() {
    while (cursor < entries.length) {
      const [name, digest] = entries[cursor++];
      const bytes = await read(raw + name.split('/').map(encodeURIComponent).join('/'), 32 * 1024 * 1024);
      total += bytes.length; if (total > 100 * 1024 * 1024) throw Error('Tổng bản tải vượt giới hạn.');
      if (crypto.createHash('sha256').update(bytes).digest('hex') !== digest) throw Error('SHA-256 không khớp: ' + name);
      const output = path.join(dest, ...name.split('/')); fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, bytes, { flag: 'wx' });
    }
  }
  const results = await Promise.allSettled(Array.from({ length: 4 }, worker));
  const failure = results.find(x => x.status === 'rejected');
  if (failure) throw failure.reason; // Leave partial cache for diagnosis; no installer runs.
  const result = { repository: REPO, commit, version: release.version, files: entries.length, directory: dest, state: 'download-verified' };
  fs.writeFileSync(path.join(dest, 'download-receipt.json'), JSON.stringify(result, null, 2)); return result;
}
if (require.main === module) {
  const args = process.argv.slice(2); let destination, ref = 'main';
  for (let i = 0; i < args.length; i++) { if (args[i] === '--destination') destination = args[++i]; else if (args[i] === '--ref') ref = args[++i]; else throw Error('Dùng --destination <cache mới> [--ref main|commit].'); }
  if (!destination) throw Error('Cần --destination <cache mới>.');
  download(destination, ref).then(r => console.log(JSON.stringify(r, null, 2))).catch(e => { console.error(e.message); process.exitCode = 1; });
}
module.exports = { download, safeName };
