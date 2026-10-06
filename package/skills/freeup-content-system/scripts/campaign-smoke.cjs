#!/usr/bin/env node
'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const {spawnSync, spawn} = require('node:child_process');
const lib = require('./lib/project.cjs');
const {options} = lib.parse(process.argv.slice(2));
const base = path.resolve(options.project || path.join(lib.skillRoot, '.verification'));
const folder = path.join(base, 'campaign-' + crypto.randomBytes(5).toString('hex'));
const project = path.join(folder, 'student'); fs.mkdirSync(folder, {recursive:true});
const cli = path.join(__dirname, 'campaign.cjs'), contentCli = path.join(__dirname, 'content.cjs');
const tests = [];
function run(args, expected = 0, target = cli) {
  const r = spawnSync(process.execPath, [target, ...args, '--project', project], {encoding:'utf8', windowsHide:true});
  assert.equal(r.status, expected, r.stderr + ' ' + r.stdout);
  return r.stdout ? JSON.parse(r.stdout) : null;
}
const content = (args, expected = 0) => run(args, expected, contentCli);
function json(name, data) { const file = path.join(folder, name + '.json'); lib.write(file, data); return file; }
function test(name, fn) { fn(); tests.push({name, pass:true}); }
function db(name) { return path.join(project, 'database', name + '.json'); }
function expire(id) { const tasks = lib.read(db('production_queue')); tasks.find(t => t.id === id).lease_until = '2000-01-01T00:00:00Z'; lib.write(db('production_queue'), tasks); }
function approve(plan) { return run(['approve', '--id', plan.id, '--revision', String(plan.revision), '--by', 'Fixture student', '--note', 'Fixture approval for production only']); }
function claim(task, owner) { return run(['claim', '--task', task.id, '--owner', owner]); }
function ready(post) {
  fs.writeFileSync(path.join(post.folder, 'caption.txt'), 'Nhận định giả lập, không đăng công khai.');
  content(['update', '--id', post.id, '--file', json('content-' + post.id, {big_idea:'Thông điệp riêng từ nguồn giả lập'})]);
  content(['qa', '--id', post.id, '--file', json('qa-' + post.id, {reviewer:'Fixture reviewer', viewed_actual_artifact:true, content_pass:true, media_pass:true})]);
}
async function parallelClaim(id, owner) {
  return new Promise(resolve => {
    const child = spawn(process.execPath, [cli, 'claim', '--task', id, '--owner', owner, '--project', project], {windowsHide:true});
    let stdout = '', stderr = ''; child.stdout.on('data', x => stdout += x); child.stderr.on('data', x => stderr += x);
    child.on('close', status => resolve({status, stdout, stderr}));
  });
}
async function main() {
  let item, idea, plan, task, post;
  test('Fresh project retains existing data and sources are opt-in', () => {
    content(['init']); const r = run(['status']); assert.equal(r.sources.length, 0); assert.equal(r.publication_authorized, false);
    run(['sources', '--preset', 'marketing']); run(['sources', '--preset', 'marketing']); assert.equal(run(['sources']).length, 3);
    assert.equal(lib.read(db('brand_config')).configured, false);
  });
  test('READ needs real access evidence; failed batch is atomic', () => {
    const bad = {source_id:'alex_hormozi', url:'https://example.com/fixture', title:'Fixture source', status:'READ', accessed_at:'2026-10-07T00:00:00Z'};
    run(['collect', '--file', json('bad-source', [bad])], 1); assert.equal(run(['collect']).length, 0);
    run(['collect', '--file', json('batch-bad', [{...bad, summary:'Own summary from fixture', evidence:{tool:'fixture', reference:'fixture-only'}}, {...bad,source_id:'missing'}])], 1);
    assert.equal(run(['collect']).length, 0);
  });
  test('URL deduplication preserves READ on later access failure', () => {
    const input = {source_id:'alex_hormozi', url:'https://example.com/fixture?utm_source=test#fragment', title:'Fixture source', status:'READ', accessed_at:'2026-10-07T00:00:00Z', summary:'Original fixture summary only', evidence:{tool:'fixture', reference:'fixture-only; not a real external read'}};
    run(['collect', '--file', json('read-source', input)]);
    run(['collect', '--file', json('blocked-source', {...input,url:'https://example.com/fixture',status:'BLOCKED',reason:'Fixture login wall'})]);
    const rows = run(['collect']); assert.equal(rows.length, 1); item = rows[0]; assert.equal(item.status, 'READ'); assert.equal(item.last_attempt.status, 'BLOCKED');
    run(['collect', '--file', json('bad-metric', {...input, observed_metrics:{views:-1,observed_at:input.accessed_at,evidence:'fixture'}})], 1);
  });
  test('Personal stories require student provenance and confirmation', () => {
    run(['stories', '--file', json('fake-story', {title:'Borrowed story',story:'Expert experience',confirmed:false})], 1);
    run(['stories', '--file', json('own-story', {title:'Fixture own story',story:'Invented fixture for testing only',source_type:'user_message',confirmed:true,confirmed_by:'Fixture student',evidence:'fixture-only'})]);
    assert.equal(run(['stories']).length, 1);
  });
  test('Unread expert candidates cannot enter a production plan', () => {
    const incoming = {topic:'Original fixture topic',sources:[{type:'expert',candidate_id:item.id,url:item.url}]};
    content(['ideas', '--file', json('idea', incoming)]); idea = content(['ideas'])[0];
    const other = content(['ideas','--file',json('unread-idea',{topic:'Unread fixture',sources:[{type:'expert',candidate_id:'item_missing'}]})]).items[0].id;
    run(['plan', '--file', json('unread-plan',{title:'Fixture invalid',rows:[{idea_id:other,topic:'Unread fixture',big_idea:'Own insight',format:'story',channel:'fixture-channel',planned_at:'2030-01-01T09:00:00+07:00'}]})],1);
    assert.equal(run(['plan']).length,0);
  });
  const payload = {title:'Fixture week',request_key:'week-2030-01-01',timezone:'Asia/Ho_Chi_Minh',rows:[{id:'row_1',idea_id:idea.id,topic:'<script>fixture</script>',big_idea:'Own insight for fixture audience',format:'story',channel:'fixture-channel',planned_at:'2030-01-01T09:00:00+07:00'}]};
  test('Draft alone has no queue and incomplete profile blocks approval', () => {
    plan = run(['plan','--file',json('plan',payload)]); assert.equal(plan.status,'DRAFT'); assert.equal(run(['queue']).length,0);
    run(['approve','--id',plan.id,'--revision','1','--by','Fixture','--note','fixture'],1);
    content(['setup','--file',json('brand',{brand_name:'Fixture Brand',target_audience:'Fixture audience',products:[{name:'Fixture product',description:'Fixture learning service'}],usp:'Fixture advantage',tone_of_voice:'Plain and practical',content_goal:'Authority'})]);
  });
  test('Approval is revision-bound, production-only and idempotent', () => {
    run(['approve','--id',plan.id,'--revision','99','--by','Fixture','--note','fixture'],1);
    const result = approve(plan); approve(plan); assert.equal(result.scope,'PRODUCE_ONLY'); assert.equal(run(['queue']).length,1); task = run(['queue'])[0];
    assert.equal(task.eligible,true); assert.equal(run(['plan','--id',plan.id]).approval.scope,'PRODUCE_ONLY');
    const reused = run(['plan','--file',json('background-proposal',{...payload,title:'Changed background draft'})]);
    assert.equal(reused.id,plan.id); assert.equal(reused.reused_approved_plan,true); assert.equal(reused.revision,1);
  });
  test('Only one owner can work a task; no post can finish before QA', () => {
    const claimed = claim(task,'run-one'); post=claimed.post;
    assert.equal(claimed.publication_authorized,false);
    run(['claim','--task',task.id,'--owner','run-two'],1);
    run(['block','--task',task.id,'--owner','run-two','--reason','wrong owner'],1);
    run(['finish','--task',task.id,'--owner','run-one'],1);
  });
  test('Lease recovery reuses the same post and keeps existing files', () => {
    fs.writeFileSync(path.join(post.folder,'master_content.md'),'Partial work fixture'); expire(task.id);
    const resumed=claim(task,'run-resume'); assert.equal(resumed.post.id,post.id); assert.equal(resumed.post.reused,true);
    assert.equal(content(['list']).length,1); assert.equal(fs.readFileSync(path.join(post.folder,'master_content.md'),'utf8'),'Partial work fixture');
    ready(post); const finished=run(['finish','--task',task.id,'--owner','run-resume']); assert.equal(finished.status,'READY_FOR_REVIEW'); assert.equal(finished.publication_authorized,false);
    assert.equal(content(['show','--id',post.id]).approval,null);
    content(['published','--id',post.id,'--channel','fixture-channel','--url','https://example.com/post','--evidence','fixture-only'],1);
  });
  test('Editing approved plan supersedes old work without deleting output', () => {
    plan=run(['plan','--id',plan.id,'--file',json('revised-plan',{...payload,title:'Fixture revised week'})]);
    assert.equal(plan.revision,2); assert.equal(plan.approval,null); assert.equal(run(['queue'])[0].status,'SUPERSEDED');
    assert(fs.existsSync(path.join(post.folder,'caption.txt')));
    run(['finish','--task',task.id,'--owner','run-resume'],1);
    const result=approve(plan); assert.equal(result.tasks.length,1); task=result.tasks[0];
  });
  const attempts = await Promise.all([parallelClaim(task.id,'parallel-one'),parallelClaim(task.id,'parallel-two')]);
  assert.equal(attempts.filter(v=>v.status===0).length,1,JSON.stringify(attempts));
  const owner=attempts[0].status===0?'parallel-one':'parallel-two';
  const claimed=JSON.parse(attempts.find(v=>v.status===0).stdout);
  assert.equal(content(['list']).length,2);
  tests.push({name:'Concurrent runs cannot duplicate the same task/post',pass:true});
  test('Missing assets block only the task; retry needs a user instruction',()=>{
    run(['block','--task',task.id,'--owner',owner,'--reason','Fixture missing image']); assert.equal(run(['queue']).find(v=>v.id===task.id).eligible,false);
    run(['retry','--task',task.id],1); run(['retry','--task',task.id,'--by','Fixture','--note','Fixture supplied resource; retry']);
    assert.equal(claim(task,'retry-after-resource').post.id,claimed.post.id);
  });
  test('Attempts are bounded and explicit retry preserves post ID',()=>{
    expire(task.id); claim(task,'attempt-two'); expire(task.id); claim(task,'attempt-three'); expire(task.id);
    run(['claim','--task',task.id,'--owner','attempt-four'],1);
    assert.equal(run(['queue']).find(v=>v.id===task.id).eligible,false);
    run(['retry','--task',task.id,'--by','Fixture','--note','Fixture issue fixed']); assert.equal(claim(task,'manual-retry').post.id,claimed.post.id);
  });
  test('Native scheduler spec is not a receipt; custom timing is persisted',()=>{
    const spec=run(['spec','--kind','scan']); assert.equal(spec.publication_authorized,false); assert.equal(run(['status']).scheduler_receipts.length,0);
    run(['register','--file',json('fake-receipt',{kind:'scan',job_id:'fixture-job'})],1);
    const custom=run(['spec','--file',json('timing',{kind:'scan',schedule:{kind:'cron',expr:'0 8 * * *',tz:'Asia/Ho_Chi_Minh'}})]);
    assert.equal(custom.schedule.expr,'0 8 * * *'); assert.equal(run(['spec','--kind','scan']).definition_hash,custom.definition_hash);
    const receipt={kind:'scan',job_id:'fixture-job',tool:'fixture-only native scheduler',evidence:'Mock get result, no real schedule created',verified_enabled:true,definition_hash:custom.definition_hash,access_token:'must never persist'};
    run(['register','--file',json('receipt',receipt)]);
    assert.equal(lib.read(db('content_automations'))[0].access_token,undefined);
    run(['register','--file',json('duplicate-receipt',{...receipt,job_id:'different-job'})],1);
    run(['register','--file',json('disabled-receipt',{...receipt,verified_enabled:false})]);
    assert.equal(run(['status']).scheduler_receipts[0].verified_enabled,false);
    assert.equal(run(['status']).scheduler_live_status_verified,false);
  });
  test('Offline calendar is escaped and does not claim published status',()=>{
    const status=run(['status']), html=fs.readFileSync(status.preview,'utf8'); assert.match(html,/&lt;script&gt;fixture/); assert.doesNotMatch(html,/<script>/);
    assert.match(html,/chờ bạn duyệt trước khi đăng/); assert.equal(status.publication_authorized,false);
  });
  const report={ok:true,tests,project,external_actions:false}; lib.write(path.join(folder,'result.json'),report); process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
main().catch(e=>{lib.write(path.join(folder,'result.json'),{ok:false,tests,error:e.message,project,external_actions:false});process.stderr.write(e.stack+'\n');process.exitCode=1;});
