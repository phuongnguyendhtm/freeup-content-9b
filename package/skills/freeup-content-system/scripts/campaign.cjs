#!/usr/bin/env node
'use strict';
// Durable coordination; the 9B agent performs research, writing and rendering.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const lib = require('./lib/project.cjs');
const profile = require('./lib/profile.cjs');
const formats = ['story', 'founder-quote', 'visual-insight', 'image', 'carousel', 'infographic', 'comment-chain', 'reels', 'broll'];
const files = ['expert_sources', 'source_library', 'story_bank', 'campaigns', 'production_queue', 'content_automations', 'content_automation_settings', 'research_preferences', 'source_scan_state'];
const stamp = () => new Date().toISOString();
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])]));
  return value;
}
const hash = value => crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
function need(condition, message) { if (!condition) throw Error(message); }
function text(value) { return typeof value === 'string' && value.trim().length > 0; }
function url(value) {
  const parsed = new URL(value);
  need(parsed.protocol === 'https:' && !parsed.username && !parsed.password, 'Nguồn phải là URL HTTPS công khai, không chứa thông tin đăng nhập.');
  parsed.hash = '';
  for (const key of [...parsed.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$)/i.test(key)) parsed.searchParams.delete(key);
  parsed.searchParams.sort();
  return parsed.href;
}
function iso(value) { return typeof value === 'string' && /T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value)); }
function arrayInput(value) { return Array.isArray(value) ? value : [value]; }
const keyPattern = /^[a-zA-Z0-9_-]{1,100}$/;
function initialize(project) {
  need(fs.existsSync(path.join(project, 'project_config.json')), 'Chạy /thietlapcontent trước.');
  for (const name of files) {
    const file = path.join(project, 'database', name + '.json');
    if (!fs.existsSync(file)) lib.write(file, []);
  }
}
function withLock(project, fn) {
  const file = path.join(project, 'database', '.campaign.lock');
  let fd;
  try { fd = fs.openSync(file, 'wx'); } catch (e) {
    if (e.code !== 'EEXIST') throw e;
    let stale = false;
    try { const lock = lib.read(file); try { process.kill(lock.pid, 0); } catch (err) { stale = err.code === 'ESRCH'; } } catch {}
    need(stale, 'Một lượt đang cập nhật lịch. Chờ lượt đó kết thúc rồi thử lại.');
    fs.unlinkSync(file); fd = fs.openSync(file, 'wx');
  }
  try { fs.writeFileSync(fd, JSON.stringify({pid: process.pid, created_at: stamp()})); return fn(); }
  finally { fs.closeSync(fd); fs.unlinkSync(file); }
}
function context(project) {
  const file = name => path.join(project, 'database', name + '.json');
  return {get: name => lib.read(file(name)), put: (name, value) => lib.write(file(name), value)};
}
function sourceRows(input) {
  return arrayInput(input).map(v => {
    need(v && text(v.name) && text(v.url), 'Nguồn cần name và url.');
    const address = url(v.url);
    const id = v.id || 'source_' + hash(address).slice(0, 12);
    need(keyPattern.test(id), 'ID nguồn không hợp lệ.');
    const kind = v.kind || 'website';
    need(['website', 'rss', 'youtube', 'facebook', 'linkedin', 'newsletter'].includes(kind), 'Loại nguồn không hợp lệ.');
    need(!v.topics || Array.isArray(v.topics) && v.topics.every(text), 'topics cần mảng chuỗi.');
    return {id, name: v.name.trim(), url: address, kind, topics: v.topics || [], enabled: v.enabled !== false, identity_evidence: v.identity_evidence || null, updated_at: stamp()};
  });
}
function upsert(items, incoming) { for (const item of incoming) { const at = items.findIndex(v => v.id === item.id); at < 0 ? items.push(item) : items.splice(at, 1, item); } return items; }
function normalizePlan(input, previous, config) {
  need(text(input.title) && Array.isArray(input.rows) && input.rows.length, 'Lịch cần title và ít nhất một dòng rows.');
  const timezone = input.timezone || config.timezone;
  new Intl.DateTimeFormat('en', {timeZone: timezone}).format(new Date());
  const ids = new Set();
  const rows = input.rows.map((r, i) => {
    const id = r.id || 'row_' + (i + 1);
    need(keyPattern.test(id) && !ids.has(id), 'ID dòng lịch trùng/không hợp lệ.'); ids.add(id);
    need(text(r.idea_id) && text(r.topic) && text(r.big_idea) && text(r.channel), 'Dòng lịch cần idea_id, topic, big_idea và channel.');
    need(formats.includes(r.format) && iso(r.planned_at), 'Dòng lịch cần format và planned_at có múi giờ.');
    need(!r.asset_ids || Array.isArray(r.asset_ids) && r.asset_ids.every(text), 'asset_ids cần mảng ID.');
    return {id, idea_id: r.idea_id, topic: r.topic.trim(), big_idea: r.big_idea.trim(), format: r.format, channel: r.channel, planned_at: r.planned_at, goal: r.goal || 'authority', hook: r.hook || '', cta: r.cta || '', pillar: r.pillar || '', story_id: r.story_id || null, asset_ids: r.asset_ids || [], design: r.design || {}};
  });
  need(!input.request_key || keyPattern.test(input.request_key), 'request_key cần khóa ổn định theo kỳ, không chứa đường dẫn.');
  const definition = {title: input.title.trim(), timezone, request_key: input.request_key || null, rows};
  const digest = hash(definition);
  if (previous && previous.definition_hash === digest) return previous;
  return {...definition, id: previous?.id || 'plan_' + crypto.randomBytes(6).toString('hex'), revision: (previous?.revision || 0) + 1, definition_hash: digest, status: 'DRAFT', approval: null, created_at: previous?.created_at || stamp(), updated_at: stamp()};
}
function definition(plan) { return {title: plan.title, timezone: plan.timezone, request_key: plan.request_key, rows: plan.rows}; }
function planMatches(plan) { return plan?.approval?.scope === 'PRODUCE_ONLY' && plan.approval.definition_hash === hash(definition(plan)) && plan.approval.revision === plan.revision; }
function rowContext(c, row) {
  const idea = c.get('idea_bank').find(v => v.id === row.idea_id);
  need(idea && Array.isArray(idea.sources) && idea.sources.length, 'Thiếu ý tưởng có nguồn: ' + row.idea_id);
  const library = c.get('source_library');
  for (const source of idea.sources) {
    if (source.type === 'expert' || source.candidate_id) {
      const candidate = library.find(v => v.id === source.candidate_id);
      need(candidate?.status === 'READ' && text(candidate.summary) && candidate.evidence, 'Nguồn chuyên gia chưa đọc được: ' + (source.candidate_id || row.idea_id));
    }
  }
  const story = row.story_id ? c.get('story_bank').find(v => v.id === row.story_id) : null;
  need(!row.story_id || story?.confirmed === true, 'Câu chuyện cá nhân chưa được xác nhận.');
  const assets = row.asset_ids.map(id => { const asset = c.get('media_assets').find(v => v.id === id); need(asset, 'Thiếu asset ' + id); return asset; });
  return {idea, story, assets};
}
function content(project, args) {
  const r = spawnSync(process.execPath, [path.join(__dirname, 'content.cjs'), ...args, '--project', project], {encoding: 'utf8', windowsHide: true});
  need(r.status === 0, (r.stderr || r.stdout || 'Không chạy được helper bài viết.').trim());
  return JSON.parse(r.stdout);
}
function findPlan(c, id) { const result = c.get('campaigns').find(v => v.id === id); need(result, 'Không tìm thấy lịch ' + id); return result; }
function taskPlan(c, task) { const plan = findPlan(c, task.plan_id); need(planMatches(plan) && plan.revision === task.revision && plan.definition_hash === task.definition_hash, 'Lịch đã đổi hoặc chưa được duyệt. Duyệt phiên bản mới trước khi tiếp tục.'); return plan; }
function taskOwner(task, owner) { need(task.status === 'RUNNING' && text(owner) && task.owner === owner && Date.parse(task.lease_until) > Date.now(), 'Lượt này không còn giữ quyền xử lý tác vụ.'); }
function escape(v) { return String(v ?? '').replace(/[&<>"']/g, x => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[x])); }
function dashboard(project, c) {
  const labels = {DRAFT: 'Chờ duyệt lịch', APPROVED_FOR_PRODUCTION: 'Đã duyệt sản xuất', QUEUED: 'Chờ làm', RUNNING: 'Đang làm', BLOCKED: 'Cần bổ sung', READY_FOR_REVIEW: 'Chờ duyệt thành phẩm', SUPERSEDED: 'Lịch đã thay đổi'};
  const queue = c.get('production_queue');
  const cards = c.get('campaigns').map(plan => `<section><h2>${escape(plan.title)}</h2><p>${escape(plan.id)} · Bản ${plan.revision} · ${escape(labels[plan.status] || plan.status)}</p><table><thead><tr><th>Dự kiến đăng</th><th>Chủ đề</th><th>Dạng</th><th>Kênh</th><th>Tiến độ</th></tr></thead><tbody>${plan.rows.map(row => {const task = queue.find(t => t.plan_id === plan.id && t.revision === plan.revision && t.row_id === row.id); return `<tr><td>${escape(row.planned_at)}</td><td>${escape(row.topic)}<small>${escape(row.big_idea)}</small></td><td>${escape(row.format)}</td><td>${escape(row.channel)}</td><td>${escape(labels[task?.status || plan.status] || task?.status || plan.status)}${task?.blocker ? '<small>' + escape(task.blocker) + '</small>' : ''}</td></tr>`;}).join('')}</tbody></table></section>`).join('');
  const folder = path.join(project, 'content-calendar'); fs.mkdirSync(folder, {recursive: true});
  const preview = path.join(folder, 'index.html');
  fs.writeFileSync(preview, `<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lịch content</title><style>body{font:16px/1.5 Arial,sans-serif;max-width:1200px;margin:32px auto;padding:0 20px;background:#f5f5f2;color:#202124}section{background:white;padding:24px;margin:24px 0;border-radius:12px;overflow:auto}table{width:100%;border-collapse:collapse}th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}small{display:block;color:#666}a{color:#1457ba}</style><body><h1>Lịch content</h1><p>Duyệt lịch cho phép tạo bài và ảnh. Thành phẩm chờ bạn duyệt trước khi đăng.</p><p><a href="../media_output/index.html">Mở kho thành phẩm</a></p>${cards || '<p>Chưa có lịch. Dùng /lapkehoach Lập lịch: trong 9B.</p>'}</body></html>`);
  return {folder, preview};
}
function schedulerSpec(project, kind) {
  const config = lib.read(path.join(project, 'project_config.json'));
  need(['scan', 'plan', 'produce'].includes(kind), 'kind là scan, plan hoặc produce.');
  const lead = `Dùng skill freeup-content-system tại ${lib.skillRoot}. Đọc references/automation.md. Project ${project}. `;
  const messages = {
    scan: 'Đọc research-profile và nguồn riêng của doanh nghiệp này. Gọi campaign.cjs scan-next --limit 5 để lấy nhóm nguồn đang bật tiếp theo; quét tối đa 10 mục mới mỗi nguồn bằng công cụ nguồn thật. Các lượt sau luân phiên nhóm kế tiếp, không giới hạn danh sách ở ba chuyên gia marketing. Ghi cả nguồn không đọc được, chống trùng URL. Chọn insight phù hợp ngành, khách hàng và Brand DNA, lưu ý tưởng có candidate_id và nguồn. Không tự thêm preset của ngành khác, duyệt lịch hoặc đăng bài. Báo khi có ý tưởng mới hữu ích hoặc cần xử lý nguồn.',
    plan: 'Đọc kho ý tưởng, lịch và nguồn lực thật. Tạo hoặc tái sử dụng bản nháp cho 7 ngày tới; không tạo thêm bản nháp trùng kỳ. Tối đa 7 dòng khi chưa có tần suất riêng. Gửi lịch có ID/bản để người dùng duyệt. Không tự duyệt, không đăng.',
    produce: 'Đọc campaign.cjs queue. Chỉ xử lý tối đa 2 tác vụ của lịch đã duyệt sản xuất còn hiệu lực. Claim bằng owner duy nhất của lượt này; tiếp tục đúng post_id đã tạo. Chạy skill viết/media đúng format, QA tệp thật, finish hoặc block với lý do. Không tạo approval chữ/ảnh/publish. Gửi thành phẩm để người dùng xem. Không có tác vụ thì kết thúc im lặng.'
  };
  const settingsFile = path.join(project, 'database', 'content_automation_settings.json');
  const setting = fs.existsSync(settingsFile) ? lib.read(settingsFile).find(v => v.id === kind) : null;
  const schedule = setting?.schedule || (kind === 'scan' ? {kind: 'cron', expr: '0 7 * * *', tz: config.timezone} : kind === 'plan' ? {kind: 'cron', expr: '0 16 * * 5', tz: config.timezone} : {kind: 'every', everyMs: 1800000});
  const spec = {kind, name: 'FREEUP content ' + kind, timezone: schedule.tz || config.timezone, schedule, message: lead + messages[kind], publication_authorized: false};
  return {...spec, definition_hash: hash(spec)};
}
function execute(project, command, o) {
  initialize(project);
  const c = context(project);
  const input = () => lib.read(path.resolve(o.file || (() => {throw Error('Cần --file JSON.');})()));
  if (command === 'research-profile') {
    const current = c.get('research_preferences')[0] || {};
    if (!o.file) return current;
    const v = input();
    need(v && typeof v === 'object' && !Array.isArray(v), 'Cấu hình nghiên cứu cần object.');
    const allowed = ['industry', 'market', 'content_language', 'topics', 'source_types', 'source_selection_mode', 'basis'];
    for (const field of Object.keys(v)) need(allowed.includes(field), 'Trường nghiên cứu không được hỗ trợ: ' + field);
    for (const field of ['industry', 'market', 'content_language', 'basis']) if (field in v) need(text(v[field]), field + ' cần nội dung rõ.');
    if ('topics' in v) need(Array.isArray(v.topics) && v.topics.every(text), 'topics cần mảng chuỗi.');
    if ('source_types' in v) need(Array.isArray(v.source_types) && v.source_types.every(x => ['website','rss','youtube','facebook','linkedin','newsletter'].includes(x)), 'source_types không hợp lệ.');
    if ('source_selection_mode' in v) need(['provided','suggest','automatic'].includes(v.source_selection_mode), 'Cách chọn nguồn là provided, suggest hoặc automatic theo yêu cầu học viên.');
    const saved = {...current, ...v, id:'profile', updated_at:stamp()};
    c.put('research_preferences', [saved]); return saved;
  }
  if (command === 'scan-next') {
    const limit = o.limit === undefined ? 5 : Number(o.limit);
    need(Number.isInteger(limit) && limit >= 1 && limit <= 20, 'Mỗi lượt lấy 1–20 nguồn; danh sách tổng không bị giới hạn ở số này.');
    const sources = c.get('expert_sources').filter(v => v.enabled);
    if (!sources.length) return {sources:[], total_active:0, research_profile:c.get('research_preferences')[0] || {}, note:'Chưa có nguồn được chọn cho doanh nghiệp này. Dùng /lapkehoach Chọn nguồn: theo hồ sơ riêng; không tự nhập nguồn marketing.'};
    const state = c.get('source_scan_state')[0] || {offset:0};
    const start = Number.isSafeInteger(state.offset) && state.offset >= 0 ? state.offset % sources.length : 0;
    const count = Math.min(limit, sources.length);
    const selected = Array.from({length:count}, (_, i) => sources[(start + i) % sources.length]);
    c.put('source_scan_state', [{id:'round_robin', offset:(start + count) % sources.length, updated_at:stamp()}]);
    return {sources:selected, total_active:sources.length, selected_count:count, research_profile:c.get('research_preferences')[0] || {}};
  }
  if (command === 'sources') {
    if (!o.file && !o.preset) return c.get('expert_sources');
    need(!o.preset || o.preset === 'marketing', 'Preset hiện có: marketing.');
    const incoming = sourceRows(o.preset ? lib.read(path.join(lib.skillRoot, 'assets', 'defaults', 'marketing-sources.json')) : input());
    c.put('expert_sources', upsert(c.get('expert_sources'), incoming)); return {saved: incoming.map(v => v.id), sources: c.get('expert_sources')};
  }
  if (command === 'collect') {
    if (!o.file) return c.get('source_library');
    const sources = c.get('expert_sources');
    const incoming = arrayInput(input()).map(v => {
      need(sources.some(s => s.id === v.source_id && s.enabled), 'Nguồn chưa được bật/không có.');
      need(text(v.title) && ['READ', 'UNREAD', 'BLOCKED'].includes(v.status) && iso(v.accessed_at), 'Mục nguồn cần title/status/accessed_at có múi giờ.');
      const address = url(v.url);
      if (v.status === 'READ') need(text(v.summary) && text(v.evidence?.tool) && text(v.evidence?.reference), 'Chỉ ghi READ khi có tóm tắt từ nội dung đã đọc và bằng chứng công cụ.');
      if (v.status === 'BLOCKED') need(text(v.reason), 'Nguồn bị chặn cần reason.');
      const metrics = v.observed_metrics || null;
      if (metrics) { need(iso(metrics.observed_at) && text(metrics.evidence), 'Số tương tác cần thời điểm đo/bằng chứng.'); for (const [k, value] of Object.entries(metrics)) if (!['observed_at', 'evidence'].includes(k)) need(['views', 'likes', 'comments', 'shares'].includes(k) && Number.isFinite(value) && value >= 0, 'Số tương tác không hợp lệ.'); }
      return {id: 'item_' + hash(address).slice(0, 20), source_id: v.source_id, url: address, title: v.title, status: v.status, accessed_at: v.accessed_at, published_at: iso(v.published_at) ? v.published_at : null, summary: v.status === 'READ' ? v.summary : null, evidence: v.evidence || null, reason: v.reason || null, observed_metrics: metrics};
    });
    const existing = c.get('source_library');
    for (const item of incoming) { const previous = existing.find(v => v.id === item.id); if (previous?.status === 'READ' && item.status !== 'READ') { previous.last_attempt = {at: item.accessed_at, status: item.status, reason: item.reason}; } else upsert(existing, [item]); }
    c.put('source_library', existing); return {saved: incoming.map(v => v.id), total: existing.length};
  }
  if (command === 'stories') {
    if (!o.file) return c.get('story_bank');
    const incoming = arrayInput(input()).map(v => {
      need(text(v.title) && text(v.story) && v.confirmed === true && text(v.confirmed_by) && text(v.evidence) && ['user_message', 'business_document'].includes(v.source_type), 'Câu chuyện cần nguồn của học viên và xác nhận thực, không lấy trải nghiệm chuyên gia.');
      const id = v.id || 'story_' + hash(v.title + v.story).slice(0, 12); need(keyPattern.test(id), 'ID câu chuyện không hợp lệ.');
      return {id, title: v.title, story: v.story, confirmed: true, confirmed_by: v.confirmed_by, source_type: v.source_type, evidence: v.evidence, updated_at: stamp()};
    }); c.put('story_bank', upsert(c.get('story_bank'), incoming)); return {saved: incoming.map(v => v.id)};
  }
  if (command === 'plan') {
    if (!o.file) return o.id ? findPlan(c, o.id) : c.get('campaigns');
    const payload = input(), plans = c.get('campaigns');
    const previous = o.id ? findPlan(c, o.id) : payload.request_key ? plans.find(v => v.request_key === payload.request_key) : null;
    if (!o.id && previous && planMatches(previous)) return {...previous, reused_approved_plan: true, ...dashboard(project, c)};
    const plan = normalizePlan(payload, previous, lib.read(path.join(project, 'project_config.json')));
    for (const row of plan.rows) rowContext(c, row);
    c.put('campaigns', upsert(plans, [plan]));
    const queue = c.get('production_queue');
    for (const task of queue) if (task.plan_id === plan.id && task.revision !== plan.revision) { task.previous_status = task.status; task.status = 'SUPERSEDED'; task.updated_at = stamp(); }
    c.put('production_queue', queue);
    return {...plan, ...dashboard(project, c)};
  }
  if (command === 'approve') {
    const plans = c.get('campaigns'), plan = findPlan(c, o.id);
    need(text(o.by) && text(o.note) && Number(o.revision) === plan.revision, 'Cần người duyệt, chỉ dẫn thực và đúng --revision lịch đã xem.');
    const report = profile.inspectProfile(c.get('brand_config'), lib.read(path.join(project, 'project_config.json')), c.get('strategy'));
    need(report.complete, 'Hồ sơ còn thiếu: ' + report.missing.map(v => v.field).join(', '));
    for (const row of plan.rows) rowContext(c, row);
    need(plan.definition_hash === hash(definition(plan)), 'Lịch đã đổi ngoài helper; lưu bản mới trước khi duyệt.');
    if (!planMatches(plan)) plan.approval = {scope: 'PRODUCE_ONLY', by: o.by, note: o.note, at: stamp(), revision: plan.revision, definition_hash: plan.definition_hash};
    plan.status = 'APPROVED_FOR_PRODUCTION'; c.put('campaigns', upsert(plans, [plan]));
    const queue = c.get('production_queue');
    for (const row of plan.rows) {
      const id = 'task_' + hash([plan.id, plan.revision, row.id]).slice(0, 24);
      if (!queue.some(v => v.id === id)) queue.push({id, plan_id: plan.id, revision: plan.revision, definition_hash: plan.definition_hash, row_id: row.id, status: 'QUEUED', attempts: 0, post_id: null, created_at: stamp(), updated_at: stamp()});
    }
    c.put('production_queue', queue); return {plan_id: plan.id, revision: plan.revision, scope: 'PRODUCE_ONLY', tasks: queue.filter(v => v.plan_id === plan.id && v.revision === plan.revision), ...dashboard(project, c)};
  }
  if (command === 'queue') return c.get('production_queue').filter(v => !o.id || v.plan_id === o.id).map(task => {
    let eligible = false; try { taskPlan(c, task); eligible = (task.status === 'QUEUED' || task.status === 'RUNNING' && Date.parse(task.lease_until) <= Date.now()) && task.attempts < 3; } catch {}
    return {...task, eligible};
  });
  if (['claim', 'finish', 'block', 'retry'].includes(command)) {
    const queue = c.get('production_queue'), task = queue.find(v => v.id === o.task); need(task, 'Không có task ' + o.task);
    const plan = taskPlan(c, task), row = plan.rows.find(v => v.id === task.row_id);
    const selected = rowContext(c, row);
    if (command === 'claim') {
      need(text(o.owner), 'Cần --owner duy nhất của lượt chạy.');
      need(task.status === 'QUEUED' || task.status === 'RUNNING' && Date.parse(task.lease_until) <= Date.now(), 'Tác vụ đã hoàn tất, bị chặn hoặc đang có lượt khác xử lý.');
      need(task.attempts < 3, 'Đã thử 3 lần. Sửa nguyên nhân rồi yêu cầu /vietbai Làm trọn content: thử lại.');
      const post = content(project, ['new', '--topic', row.topic, '--format', row.format, '--idea', row.idea_id, '--goal', row.goal, '--task', task.id]);
      task.post_id = post.id; task.status = 'RUNNING'; task.owner = o.owner; task.lease_until = new Date(Date.now() + 2 * 3600000).toISOString(); task.attempts++; task.updated_at = stamp(); c.put('production_queue', queue);
      return {task, row, post, context: {...selected, brand: c.get('brand_config'), preferences: c.get('preferences')}, instruction: 'Tạo bản gốc mới, dùng câu chuyện/ảnh thật được chọn; thiếu thì dùng nhận định hoặc ví dụ giả định. Chạy QA rồi finish. Chờ học viên duyệt thành phẩm trước khi đăng.', publication_authorized: false};
    }
    if (command === 'retry') {
      need(task.status === 'BLOCKED' || task.status === 'RUNNING' && Date.parse(task.lease_until) <= Date.now(), 'Chỉ thử lại tác vụ bị chặn/hết lượt.');
      need(text(o.by) && text(o.note), 'Cần yêu cầu thử lại thực từ người dùng.');
      task.status = 'QUEUED'; task.attempts = 0; task.retry_authorization = {by: o.by, note: o.note, at: stamp()}; task.blocker = null;
    } else {
      taskOwner(task, o.owner);
      if (command === 'finish') { const result = content(project, ['validate', '--id', task.post_id]); need(result.valid, 'Thành phẩm chưa qua QA.'); task.status = 'READY_FOR_REVIEW'; task.completed_at = stamp(); }
      if (command === 'block') { need(text(o.reason), 'Cần lý do cụ thể.'); task.status = 'BLOCKED'; task.blocker = o.reason; }
    }
    task.owner = null; task.lease_until = null; task.updated_at = stamp(); c.put('production_queue', queue);
    return {...task, publication_authorized: false, ...dashboard(project, c)};
  }
  if (command === 'spec') {
    if (o.file) {
      const v = input(), s = v.schedule;
      need(['scan', 'plan', 'produce'].includes(v.kind) && s && ['cron', 'every'].includes(s.kind), 'Cấu hình cần kind scan|plan|produce và schedule cron|every.');
      if (s.kind === 'cron') { need(text(s.expr) && [5, 6].includes(s.expr.trim().split(/\s+/).length) && text(s.tz), 'Cron cần biểu thức và múi giờ.'); new Intl.DateTimeFormat('en', {timeZone: s.tz}).format(new Date()); }
      if (s.kind === 'every') need(Number.isSafeInteger(s.everyMs) && s.everyMs >= 60000, 'Khoảng lặp tối thiểu 1 phút.');
      const schedule = s.kind === 'cron' ? {kind: 'cron', expr: s.expr.trim(), tz: s.tz} : {kind: 'every', everyMs: s.everyMs};
      c.put('content_automation_settings', upsert(c.get('content_automation_settings'), [{id: v.kind, schedule}]));
      return schedulerSpec(project, v.kind);
    }
    return schedulerSpec(project, o.kind);
  }
  if (command === 'register') {
    const v = input(), spec = schedulerSpec(project, v.kind);
    need(text(v.job_id) && text(v.tool) && text(v.evidence) && typeof v.verified_enabled === 'boolean' && v.definition_hash === spec.definition_hash, 'Lịch nền cần ID/receipt và đọc lại trạng thái job khớp nội dung; spec chưa phải lịch đã tạo.');
    const rows = c.get('content_automations');
    const previous = rows.find(r => r.kind === v.kind);
    need(!previous || previous.job_id === v.job_id, 'Đã có job cùng chức năng. Đọc/sửa đúng job cũ; không tạo job trùng.');
    c.put('content_automations', upsert(rows, [{id: v.kind, kind: v.kind, job_id: v.job_id, tool: v.tool, evidence: v.evidence, verified_enabled: v.verified_enabled, definition_hash: v.definition_hash, checked_at: stamp()}])); return {registered: v.job_id};
  }
  if (command === 'status') return {research_profile:c.get('research_preferences')[0] || {}, sources: c.get('expert_sources'), source_counts: Object.fromEntries(['READ', 'UNREAD', 'BLOCKED'].map(status => [status, c.get('source_library').filter(v => v.status === status).length])), plans: c.get('campaigns'), queue: c.get('production_queue'), scheduler_receipts: c.get('content_automations'), scheduler_live_status_verified: false, publication_authorized: false, ...dashboard(project, c)};
  throw Error('Lệnh không có. Dùng help.');
}
function main(args = process.argv.slice(2)) {
  const {options, positional} = lib.parse(args), command = positional.shift() || 'help';
  if (command === 'help') return {commands: 'research-profile [--file JSON] | sources [--preset marketing | --file JSON] | scan-next [--limit N] | collect [--file JSON] | stories [--file JSON] | plan [--file JSON --id PLAN] | approve --id PLAN --revision N --by USER --note INSTRUCTION | queue [--id PLAN] | claim --task TASK --owner RUN | finish --task TASK --owner RUN | block --task TASK --owner RUN --reason TEXT | retry --task TASK --by USER --note INSTRUCTION | spec [--kind scan|plan|produce | --file SETTINGS] | register --file RECEIPT | status', project_option: '--project PATH', scope: 'Plan approval permits production only, never publication.'};
  const project = lib.root(options.project);
  need(fs.existsSync(path.join(project, 'database')), 'Chạy /thietlapcontent trước.');
  return withLock(project, () => execute(project, command, options));
}
if (require.main === module) { try { process.stdout.write(JSON.stringify(main(), null, 2) + '\n'); } catch (e) { process.stderr.write(e.message + '\n'); process.exitCode = 1; } }
module.exports = {main, hash, normalizePlan, planMatches, schedulerSpec};
