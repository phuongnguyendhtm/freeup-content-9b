'use strict';

// Pure profile helpers: they neither read files nor contact 9B.
const CORE_FIELDS = [
  { field: 'brand_name', label: 'Tên doanh nghiệp/thương hiệu' },
  { field: 'target_audience', label: 'Khách hàng/người đọc mục tiêu' },
  { field: 'products', label: 'Sản phẩm/dịch vụ và mô tả hoặc lợi ích' },
  { field: 'usp', label: 'Lợi thế/điểm khác biệt đã được xác nhận' },
  { field: 'tone_of_voice', label: 'Giọng văn mong muốn' },
  { field: 'content_goal', label: 'Mục tiêu làm nội dung' }
];
const VALID_STATUSES = new Set(['supplied', 'not_provided', 'explicit_none', 'inferred', 'default']);
const NEUTRAL_DEFAULTS = {
  'brand_identity.colors.primary': '#202124',
  'brand_identity.colors.accent': '#2563EB',
  'brand_identity.colors.background': '#FAFAF8',
  'brand_identity.fonts.primary': 'Arial',
  'brand_identity.fonts.accent': 'Georgia'
};
const object = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const clone = v => v === undefined ? undefined : JSON.parse(JSON.stringify(v));
const normalized = v => typeof v === 'string' ? v.trim().toLocaleLowerCase('vi').replace(/\s+/g, ' ') : '';
const placeholders = new Set(['', 'n/a', 'na', 'none', 'null', 'undefined', 'tbd', 'todo', 'default', 'chưa có', 'chưa rõ', 'chưa xác định', 'chưa cung cấp', 'chưa chọn', 'không rõ', 'đang cập nhật', 'mặc định']);
function text(v) { return typeof v === 'string' && !placeholders.has(normalized(v)); }
function get(v, field) { return field.split('.').reduce((node, key) => object(node) ? node[key] : undefined, v); }
function provenance(profile, field) {
  const all = profile?.profile_provenance || {};
  let key = field;
  while (key) {
    if (object(all[key])) return all[key];
    key = key.includes('.') ? key.slice(0, key.lastIndexOf('.')) : '';
  }
  return null;
}
function unconfirmed(meta) { return !!meta && (['inferred', 'default', 'not_provided'].includes(meta.status) || meta.confirmed === false); }
function hasProducts(v) {
  if (!Array.isArray(v) || !v.length) return false;
  return v.some(item => {
    // A natural language entry must describe an offer, not just a one-word name.
    if (typeof item === 'string') return text(item) && item.trim().split(/\s+/).length >= 4;
    if (!object(item)) return false;
    const name = item.name || item.product_name || item.title;
    return text(name) && ['description', 'summary', 'benefit', 'benefits', 'offer', 'problem_solved', 'details'].some(key => {
      const detail = item[key];
      return text(detail) || (Array.isArray(detail) && detail.some(text));
    });
  });
}
function hasTone(v, brand) {
  if (typeof v === 'string') return text(v);
  if (!object(v)) return false;
  const summary = text(v.summary);
  const traits = Array.isArray(v.traits) && v.traits.filter(text).length >= 2;
  return !!(summary || traits);
}
function toneEvidence(v, brand) {
  const entries = [
    { meaningful: text(v.summary), meta: provenance(brand, 'tone_of_voice.summary') },
    { meaningful: Array.isArray(v.traits) && v.traits.filter(text).length >= 2, meta: provenance(brand, 'tone_of_voice.traits') }
  ];
  const proven = entries.find(entry => entry.meaningful && !unconfirmed(entry.meta));
  return { confirmed: !!proven, meta: proven?.meta || entries.find(entry => entry.meaningful)?.meta || provenance(brand, 'tone_of_voice') };
}
function hasGoal(v) { return text(v) || (Array.isArray(v) && v.some(text)); }
function inspectProfile(brand = {}, projectConfig = {}, strategy = {}) {
  if (!object(brand) || !object(projectConfig) || !object(strategy)) throw new TypeError('Hồ sơ/cấu hình phải là object.');
  const missing = [], fields = {};
  for (const { field, label } of CORE_FIELDS) {
    let value = brand[field], holder = brand;
    // Older projects may have stored the goal at project/strategy level.
    if (field === 'content_goal' && !hasGoal(value)) {
      if (hasGoal(projectConfig.content_goal)) { value = projectConfig.content_goal; holder = projectConfig; }
      else if (hasGoal(strategy.content_goal)) { value = strategy.content_goal; holder = strategy; }
    }
    let meta = provenance(holder, field);
    const explicitNone = field === 'products' && meta?.status === 'explicit_none' && meta.confirmed !== false;
    const meaningful = field === 'products' ? hasProducts(value) : field === 'tone_of_voice' ? hasTone(value, holder) : field === 'content_goal' ? hasGoal(value) : text(value);
    // Structured tone can have a confirmed leaf even when an older parent was inferred.
    const tone = field === 'tone_of_voice' && object(value) ? toneEvidence(value, holder) : null;
    if (tone) meta = tone.meta;
    const complete = explicitNone || (meaningful && (tone ? tone.confirmed : !unconfirmed(meta)));
    let reason = '';
    if (!complete) reason = unconfirmed(meta) && meaningful ? 'Có dữ liệu gợi ý nhưng chưa được xác nhận.' : field === 'products' && Array.isArray(value) && value.length ? 'Cần thêm mô tả/lợi ích của ít nhất một sản phẩm; hoặc xác nhận không có sản phẩm/dịch vụ.' : 'Chưa có thông tin đủ dùng.';
    fields[field] = { label, complete, status: explicitNone ? 'explicit_none' : complete ? 'supplied' : unconfirmed(meta) && meaningful ? meta.status : 'not_provided', source: meta?.source || null, reason };
    if (!complete) missing.push({ field, label, reason });
  }
  const optional = {};
  for (const [field, neutral] of Object.entries(NEUTRAL_DEFAULTS)) {
    const value = get(brand, field), meta = provenance(brand, field);
    const supplied = text(value) && !unconfirmed(meta) && (meta?.status === 'supplied' || normalized(value) !== normalized(neutral));
    optional[field] = { supplied, status: supplied ? 'supplied' : meta?.status === 'explicit_none' ? 'explicit_none' : 'default', value: value ?? null };
  }
  optional.channels = { supplied: !!projectConfig.publishing?.default_target, blocking_for_writing: false };
  optional.assets = { blocking_for_writing: false, check_at: 'Khi chọn format cần ảnh/video/âm thanh thật.' };
  const groups = [
    ['brand_name', 'target_audience'],
    ['products', 'usp'],
    ['tone_of_voice', 'content_goal']
  ].map(group => group.filter(field => !fields[field].complete)).filter(group => group.length).map(group => ({ fields: group, labels: group.map(field => fields[field].label) }));
  return {
    schema_version: 1,
    complete: missing.length === 0,
    missing,
    fields,
    question_groups: groups,
    next_actions: missing.length ? ['Đọc nguồn hồ sơ đang có và lưu phần có căn cứ.', 'Chỉ hỏi những trường còn thiếu hoặc cần xác nhận.'] : ['Dùng lại hồ sơ đã đủ; không yêu cầu nhập lại.', 'Kiểm tra media/kênh khi format hoặc việc đăng bài cần đến.'],
    optional,
    strategy_configured: strategy.configured === true
  };
}
function mergeProfile(oldProfile = {}, input = {}) {
  if (!object(oldProfile) || !object(input)) throw new TypeError('Hồ sơ cũ và phần bổ sung phải là object.');
  const existingName = oldProfile.brand_name, incomingName = input.brand_name;
  if (text(existingName) && text(incomingName) && normalized(existingName) !== normalized(incomingName) && !unconfirmed(provenance(oldProfile, 'brand_name'))) {
    const error = new Error('Tên doanh nghiệp khác hồ sơ hiện có. Cần xác nhận doanh nghiệp đang làm trước khi thay hồ sơ; không ghép dữ liệu hai doanh nghiệp.');
    error.code = 'PROFILE_BUSINESS_CONFLICT';
    error.field = 'brand_name';
    throw error;
  }
  const result = clone(oldProfile), accepted = new Set(), ignored = new Set();
  function merge(a, b, prefix) {
    const out = object(a) ? clone(a) : {};
    for (const [key, value] of Object.entries(b)) {
      if (key === 'profile_provenance') continue;
      if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('Tên trường hồ sơ không hợp lệ.');
      const field = prefix ? prefix + '.' + key : key;
      const before = out[key], oldMeta = provenance(oldProfile, field), newMeta = provenance(input, field);
      const oldMeaningful = text(before) || (Array.isArray(before) && before.length) || (object(before) && Object.keys(before).length);
      if (oldMeaningful && !unconfirmed(oldMeta) && unconfirmed(newMeta)) { ignored.add(field); continue; }
      if (field === 'products' && newMeta?.status === 'explicit_none' && newMeta.confirmed !== false) {
        out[key] = []; accepted.add(field); continue;
      }
      if (value === null || value === undefined || (typeof value === 'string' && !value.trim()) || (Array.isArray(value) && !value.length)) {
        // Empty extraction/partial forms never erase already saved information.
        ignored.add(field); continue;
      }
      if (object(value)) { out[key] = merge(before, value, field); continue; }
      if (field === 'tone_of_voice.traits' && Array.isArray(before) && Array.isArray(value)) {
        out[key] = [...new Map([...before, ...value].filter(text).map(v => [normalized(v), v])).values()];
      } else out[key] = clone(value);
      accepted.add(field);
    }
    return out;
  }
  Object.assign(result, merge(result, input, ''));
  const metadata = clone(oldProfile.profile_provenance || {});
  for (const [field, meta] of Object.entries(input.profile_provenance || {})) {
    if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/.test(field) || field.split('.').some(k => ['__proto__', 'prototype', 'constructor'].includes(k))) throw new Error('Đường dẫn profile_provenance không hợp lệ.');
    if (!object(meta) || !VALID_STATUSES.has(meta.status)) throw new Error('profile_provenance cần status hợp lệ cho ' + field);
    const wasIgnored = [...ignored].some(parent => field === parent || field.startsWith(parent + '.'));
    const before = provenance(oldProfile, field);
    const oldValue = get(oldProfile, field);
    const oldMeaningful = text(oldValue) || (Array.isArray(oldValue) && oldValue.length) || (object(oldValue) && Object.keys(oldValue).length);
    if (wasIgnored || (oldMeaningful && !unconfirmed(before) && unconfirmed(meta))) continue;
    metadata[field] = clone(meta);
  }
  // Track explicit incremental input, while preserving original source evidence.
  for (const field of accepted) {
    if (!provenance(input, field)) {
      const before = provenance(oldProfile, field), changed = JSON.stringify(get(oldProfile, field)) !== JSON.stringify(get(result, field));
      if (!before || unconfirmed(before) || changed) {
        metadata[field] = { status: 'supplied', source: { type: 'user_input' } };
        if (before?.source && changed) metadata[field].previous_source = clone(before.source);
      }
    }
  }
  if (metadata.products?.status === 'explicit_none' && metadata.products.confirmed !== false) result.products = [];
  if (Object.keys(metadata).length) result.profile_provenance = metadata;
  return result;
}
module.exports = { CORE_FIELDS, VALID_STATUSES, inspectProfile, mergeProfile, provenance };
