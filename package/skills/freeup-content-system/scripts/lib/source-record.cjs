'use strict';
const crypto = require('node:crypto');
const digest = text => crypto.createHash('sha256').update(text, 'utf8').digest('hex');
function https(value, label) {
  let u; try { u = new URL(value); } catch { throw Error(label + ' cần URL nguồn thật.'); }
  if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password) throw Error(label + ' cần URL HTTP(S), không chứa thông tin đăng nhập.');
  u.hash = ''; return u.href;
}
function sourceRecord(idea) {
  const capture = idea.sourceCapture;
  if (!capture || typeof capture !== 'object') throw Error('Thiếu sourceCapture: không dùng angle/tóm tắt AI làm bài viết gốc.');
  const sourceUrl = https(idea.sourceUrl || capture.url, 'Bài gốc');
  if (https(capture.url, 'Bản đọc nguồn') !== sourceUrl) throw Error('Bản đọc nguồn không cùng bài gốc.');
  if (capture.textStatus !== 'complete' || typeof capture.text !== 'string' || !capture.text.trim()) throw Error('Chưa đọc đầy đủ bài gốc; giữ local và báo thiếu nguyên văn, không tự viết bù.');
  if (capture.text.length > 49000) throw Error('Nguyên văn vượt giới hạn một ô: giữ bản đầy đủ trong tệp được phép, liên kết và báo giới hạn; không cắt bớt âm thầm.');
  if (!capture.evidence || typeof capture.evidence !== 'string' || !capture.evidence.trim() || !Number.isFinite(Date.parse(capture.readAt))) throw Error('Bản gốc cần bằng chứng công cụ/tệp và thời điểm đọc thực.');
  if (!Array.isArray(capture.images)) throw Error('Cần danh sách ảnh gốc theo thứ tự, kể cả [] khi nguồn không có ảnh.');
  if (!['complete', 'none', 'unavailable'].includes(capture.imageStatus)) throw Error('Cần trạng thái kiểm ảnh gốc.');
  const images = capture.images.map((image, i) => {
    if (image.origin !== 'source_post' || image.verified !== true || !image.evidence || https(image.postUrl, 'Nguồn ảnh') !== sourceUrl) throw Error('Ảnh ' + (i + 1) + ' chưa xác minh thuộc đúng bài nguồn; không dùng ảnh AI/stock/logo thay thế.');
    return { url: https(image.url, 'Ảnh gốc'), position: i + 1, evidence: image.evidence };
  });
  if (new Set(images.map(x => x.url)).size !== images.length) throw Error('Danh sách ảnh gốc bị lặp URL.');
  if ((capture.imageStatus === 'none' || capture.imageStatus === 'unavailable') && images.length) throw Error('Trạng thái ảnh không khớp danh sách.');
  if (capture.imageStatus === 'complete' && !images.length) throw Error('Không được báo đủ ảnh khi danh sách rỗng.');
  const first = images[0]?.url;
  return { sourceUrl, text: capture.text, textHash: digest(capture.text), readAt: capture.readAt, evidence: capture.evidence, imageStatus: capture.imageStatus, images,
    preview: first ? '=IFERROR(IMAGE("' + first.replaceAll('"', '""') + '";1);"Xem Link ảnh gốc")' : '',
    imageLinks: images.map(x => x.url).join('\n'),
    imageLimit: capture.imageStatus === 'none' ? 'Nguồn không có ảnh.' : capture.imageStatus === 'unavailable' ? 'Chưa lấy được ảnh gốc; không có ảnh thay thế.' : images.length > 1 ? 'Preview ảnh đầu; Link ảnh gốc có đủ ' + images.length + ' ảnh theo thứ tự nguồn.' : '' };
}
function sourceCells(idea) { const record = sourceRecord(idea); return { record, D: record.preview, E: record.text, F: idea.angle || '', N: record.imageLinks, U: [idea.limits || '', record.imageLimit].filter(Boolean).join('\n') }; }
// USER_ENTERED is needed for D's IMAGE formula. Quote every other nonempty
// string so the original body is literal and dates/numbers/formulas stay text.
function literalRow(row) { return row.map((value, column) => column === 3 && value ? value : typeof value === 'string' && value !== '' ? "'" + value : value); }
module.exports = { sourceRecord, sourceCells, literalRow, digest };
