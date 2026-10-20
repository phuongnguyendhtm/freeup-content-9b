#!/usr/bin/env node
'use strict';
// Validate metadata read from native Sheets tools; does not invent/create a board.
const fs = require('node:fs'), path = require('node:path');
const lib = require('./lib/project.cjs');
const contract = lib.read(path.join(__dirname, '..', 'references', 'google-sheet-template.json'));
function validate(snapshot) {
  const id = snapshot.spreadsheetId;
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]+$/.test(id)) throw Error('Thiếu ID bảng học viên từ công cụ đọc thực tế.');
  if (id === contract.source_spreadsheet_id) throw Error('Đây là Sheet gốc giảng viên. Phải dùng bản sao riêng; không ghi vào nguồn.');
  if (!Array.isArray(snapshot.sheets)) throw Error('Thiếu metadata/header đã đọc từ Google Sheets.');
  for (const expected of contract.sheets) {
    const matches = snapshot.sheets.filter(x => x.title === expected.title);
    if (matches.length !== 1) throw Error('Thiếu hoặc trùng tab: ' + expected.title);
    const actual = matches[0];
    if (JSON.stringify(actual.headers) !== JSON.stringify(expected.headers)) throw Error('Header không đúng Sheet mẫu: ' + expected.title);
    if (expected.formula_a2 && actual.formula_a2 !== expected.formula_a2) throw Error('Công thức A2 không đúng mẫu: ' + expected.title);
  }
  return { template_version: contract.template_version, source_spreadsheet_id: contract.source_spreadsheet_id, student_spreadsheet_id: id, spreadsheet_url: 'https://docs.google.com/spreadsheets/d/' + id + '/edit', schema_verified_at: new Date().toISOString(), automation_state: 'not_verified' };
}
function main(argv = process.argv.slice(2)) {
  const { positional, options } = lib.parse(argv);
  if (!['check', 'bind'].includes(positional[0]) || !options.file) throw Error('Dùng check|bind --file <snapshot-tu-tool.json> [--project <kho>].');
  const result = validate(lib.read(path.resolve(options.file)));
  if (positional[0] === 'bind') {
    const project = lib.root(options.project), binding = path.join(project, 'database', 'sheets-binding.json');
    if (fs.existsSync(binding)) {
      const previous = lib.read(binding);
      if (previous.student_spreadsheet_id !== result.student_spreadsheet_id) throw Error('Đã có Sheet riêng khác. Dùng lại bản cũ hoặc xác định rõ yêu cầu đổi bảng trước.');
      // Schema verification never resets live automation or account settings.
      lib.write(binding, { ...previous, ...result, automation_state: previous.automation_state || 'not_verified' });
    } else lib.write(binding, result);
    result.binding_file = binding;
  }
  console.log(JSON.stringify(result, null, 2)); return result;
}
if (require.main === module) { try { main(); } catch (e) { console.error(e.message); process.exitCode = 1; } }
module.exports = { validate, main };
