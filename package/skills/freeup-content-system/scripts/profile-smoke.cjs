#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const { inspectProfile, mergeProfile } = require('./lib/profile.cjs');
function smoke() {
  const defaults = {
    configured: false, brand_name: '', target_audience: '', products: [], usp: '', content_goal: '',
    tone_of_voice: { summary: '', traits: [] },
    brand_identity: { colors: { primary: '#202124', accent: '#2563EB', background: '#FAFAF8' }, fonts: { primary: 'Arial', accent: 'Georgia' }, watermark: { enabled: false, text: '' } }
  };
  const first = inspectProfile(defaults, {}, {});
  assert.equal(first.complete, false);
  assert.equal(first.missing.length, 6);
  assert.equal(first.question_groups.length, 3);
  assert.equal(first.optional['brand_identity.fonts.primary'].supplied, false);
  const partial = mergeProfile(defaults, { brand_name: 'Doanh nghiệp mẫu', target_audience: 'Chủ doanh nghiệp vừa và nhỏ', tone_of_voice: { traits: ['gần gũi', 'rõ ràng'] }, brand_identity: { colors: { primary: '#AABBCC' } } });
  assert.equal(inspectProfile(partial).missing.length, 3);
  assert.equal(partial.brand_identity.fonts.primary, 'Arial');
  assert.equal(partial.brand_identity.colors.accent, '#2563EB');
  const full = mergeProfile(partial, { products: [{ name: 'Khóa học quản lý', description: 'Hướng dẫn tổ chức đội ngũ và giao việc thực tế' }], usp: 'Có bài thực hành theo tình huống doanh nghiệp', content_goal: 'Tăng uy tín và tạo cuộc hẹn tư vấn', tone_of_voice: { summary: 'Rõ ràng, gần gũi và có ví dụ thực tế' } });
  assert.equal(inspectProfile(full).complete, true);
  assert.deepEqual(inspectProfile(full).missing, []);
  const rerun = mergeProfile(full, { brand_name: '', products: [], tone_of_voice: { summary: '' }, brand_identity: { fonts: { primary: '' } } });
  assert.deepEqual(rerun, full);
  const inferred = mergeProfile(full, { usp: 'Suy đoán mới', brand_identity: { colors: { primary: '#FFFFFF' } }, profile_provenance: { usp: { status: 'inferred' }, 'brand_identity.colors.primary': { status: 'inferred' } } });
  assert.equal(inferred.usp, full.usp);
  assert.equal(inferred.brand_identity.colors.primary, '#AABBCC');
  assert.equal(inspectProfile(inferred).complete, true);
  assert.throws(() => mergeProfile(full, { brand_name: 'Doanh nghiệp khác' }), e => e.code === 'PROFILE_BUSINESS_CONFLICT');
  assert.throws(() => mergeProfile(full, { brand_name: 'Doanh nghiệp khác', products: [{ name: 'Sản phẩm khác', description: 'Thuộc doanh nghiệp khác' }], profile_provenance: { brand_name: { status: 'inferred' } } }), e => e.code === 'PROFILE_BUSINESS_CONFLICT');
  assert.equal(inspectProfile({ ...full, products: [{ name: 'Khóa học' }] }).complete, false);
  assert.equal(inspectProfile({ ...full, tone_of_voice: { summary: '', traits: [''] } }).complete, false);
  assert.equal(inspectProfile({ ...full, content_goal: 'Tăng nhận diện', profile_provenance: { content_goal: { status: 'inferred', source: { type: 'uploaded_document', id: 'fixture' } } } }).complete, false);
  const none = mergeProfile(full, { profile_provenance: { products: { status: 'explicit_none', confirmed: true, source: { type: 'user_input', note: 'Chỉ chia sẻ kiến thức; chưa có sản phẩm/dịch vụ' } } } });
  assert.equal(inspectProfile({ ...none, products: [] }).complete, true);
  assert.equal(inspectProfile({ ...full, content_goal: '' }, { content_goal: 'Giáo dục thị trường' }).complete, true);
  assert.equal(inspectProfile(full, { publishing: { default_target: null } }).complete, true);
  assert.equal(inspectProfile({ ...full, brand_identity: defaults.brand_identity, profile_provenance: {} }).optional['brand_identity.colors.primary'].supplied, false);
  const confirmedTone = mergeProfile({ ...full, tone_of_voice: { summary: 'Giọng gợi ý', traits: [] }, profile_provenance: { tone_of_voice: { status: 'inferred' } } }, { tone_of_voice: { summary: 'Rõ ràng và gần gũi' } });
  assert.equal(inspectProfile(confirmedTone).complete, true);
  const inferredTone = inspectProfile({ ...full, tone_of_voice: { summary: 'Giọng AI gợi ý', traits: [] }, profile_provenance: { tone_of_voice: { status: 'inferred' } } });
  assert.equal(inferredTone.complete, false);
  assert.equal(inferredTone.fields.tone_of_voice.status, 'inferred');
  assert.match(inferredTone.fields.tone_of_voice.reason, /chưa được xác nhận/);
  const legacy = { ...full, profile_provenance: {} };
  assert.equal(inspectProfile(mergeProfile(legacy, { profile_provenance: { usp: { status: 'not_provided' } } })).complete, true);
  const oldSource = { ...full, profile_provenance: { usp: { status: 'supplied', source: { type: 'company_document', id: 'old-fixture' } } } };
  const changedUsp = mergeProfile(oldSource, { usp: 'Lợi thế mới được người dùng xác nhận' });
  assert.equal(changedUsp.profile_provenance.usp.source.type, 'user_input');
  assert.equal(changedUsp.profile_provenance.usp.previous_source.id, 'old-fixture');
  assert.deepEqual(none.products, []);
  const clearProduct = mergeProfile(full, { products: [], profile_provenance: { products: { status: 'explicit_none', confirmed: true, source: { type: 'user_input' } } } });
  assert.equal(inspectProfile(clearProduct).complete, true);
  assert.deepEqual(clearProduct.products, []);
  return { passed: true, checks: 33, scenarios: ['fresh_defaults', 'partial_to_full', 'missing_only', 'idempotent_rerun', 'nested_preservation', 'inferred_cannot_replace_confirmed', 'different_business', 'explicit_no_product', 'optional_media_channel', 'confirmed_leaf', 'inferred_tone', 'legacy_provenance', 'new_source_after_edit'] };
}
if (require.main === module) process.stdout.write(JSON.stringify(smoke(), null, 2) + '\n');
module.exports = { smoke };
