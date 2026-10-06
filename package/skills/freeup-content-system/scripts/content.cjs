#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const lib=require('./lib/project.cjs');
const output=require('./lib/output.cjs');
const profile=require('./lib/profile.cjs');
const {options:o,positional}=lib.parse(process.argv.slice(2));const command=positional.shift()||'help';
const project=lib.root(o.project);
const read=lib.read,write=lib.write;
const db=name=>path.join(project,'database',name+'.json');
const stamp=()=>new Date().toISOString();
const print=x=>process.stdout.write((typeof x==='string'?x:JSON.stringify(x,null,2))+'\n');
const fail=x=>{throw Error(x);};
const formats=['story','founder-quote','visual-insight','image','carousel','infographic','comment-chain','reels','broll'];
function requireProject(){if(!fs.existsSync(path.join(project,'project_config.json')))fail('Chưa có project. Chạy init hoặc /caidat.');}
function localDate(){const tz=read(path.join(project,'project_config.json')).timezone;return new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
function jobs(){const dir=path.join(project,'media_output');if(!fs.existsSync(dir))return [];return fs.readdirSync(dir,{withFileTypes:true}).filter(d=>d.isDirectory()&&/^\d{4}-\d{2}-\d{2}$/.test(d.name)).flatMap(d=>fs.readdirSync(path.join(dir,d.name),{withFileTypes:true}).filter(j=>j.isDirectory()).map(j=>path.join(dir,d.name,j.name,'record.json')).filter(f=>fs.existsSync(f)));}
function locate(id){if(!/^post_[a-z0-9_]+$/.test(id||''))fail('ID bài không hợp lệ.');const found=jobs().filter(f=>read(f).id===id);if(found.length!==1)fail('Không tìm thấy duy nhất một bài '+id);return found[0];}
function active(r){return(r.artifacts||[]).filter(a=>a.active!==false);}
const editable=['big_idea','sources','quote','quote_candidates','quote_type','layout','preset','source_photo','headline','headline_candidates','visual_format','concepts','selected_concept','mia','text_placement','cta','design_record','comments','blocker','parent_id'];
function contentHash(r,folder){const fields=['format','topic','goal',...editable.filter(k=>k!=='blocker')];const data=Object.fromEntries(fields.map(k=>[k,r[k]??null]));for(const name of ['caption.txt','master_content.md']){const f=path.join(folder,name);data[name]=fs.existsSync(f)?fs.readFileSync(f,'utf8'):null;}return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');}
const fileHash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
function sync(r){const items=read(db('post_inventory'));const item={id:r.id,topic:r.topic,format:r.format,parent_id:r.parent_id||null,status:r.status,folder:path.relative(project,path.dirname(locate(r.id))),updated_at:r.updated_at};const at=items.findIndex(x=>x.id===r.id);at<0?items.push(item):items.splice(at,1,item);write(db('post_inventory'),items);}
function refreshIdea(id){if(!id)return;const all=jobs().map(f=>read(f)).filter(r=>r.idea_id===id);const produced=['READY_FOR_REVIEW','APPROVED','SCHEDULED','PUBLISHED'];const status=all.length&&all.every(r=>produced.includes(r.status))?'PRODUCED':all.length?'IN_PROGRESS':'NEW';const ideas=read(db('idea_bank')),idea=ideas.find(x=>x.id===id);if(!idea)fail('Idea ID không có.');idea.status=status;idea.job_ids=all.map(r=>r.id);idea.updated_at=stamp();write(db('idea_bank'),ideas);const pipeline=read(db('ideation_pipeline')),at=pipeline.findIndex(x=>x.idea_id===id),item={idea_id:id,status,jobs:all.map(r=>({id:r.id,format:r.format,status:r.status})),updated_at:stamp()};at<0?pipeline.push(item):pipeline.splice(at,1,item);write(db('ideation_pipeline'),pipeline);}
function save(f,r,event,details){r.updated_at=stamp();r.history.push({at:stamp(),event,details});write(f,r);sync(r);refreshIdea(r.idea_id);output.jobOutput(project,path.dirname(f),r);}
function check(r,folder,qaRequired=true){
const errors=[];if(!r.big_idea?.trim())errors.push('Thiếu Big Idea.');
const caption=path.join(folder,'caption.txt');if(!fs.existsSync(caption)||!fs.readFileSync(caption,'utf8').trim())errors.push('Caption trống.');
if(!Array.isArray(r.sources)||!r.sources.length)errors.push('Thiếu nguồn.');
if(r.format==='comment-chain'&&(!Array.isArray(r.comments)||!r.comments.length||r.comments.some(c=>typeof c!=='string'||!c.trim())))errors.push('Bình luận cần mảng chuỗi không rỗng, đúng thứ tự.');
if(r.format==='founder-quote'){if(!r.quote?.trim())errors.push('Thiếu quote.');if(!/^P0[1-6]$/.test(r.layout||''))errors.push('Layout P01–P06.');if(!['DAYLIGHT','INDOOR','DARK'].includes(r.preset))errors.push('Preset không hợp lệ.');if(!r.source_photo||r.source_photo.inspected!==true||(!r.source_photo.path&&!r.source_photo.native_asset_id))errors.push('Thiếu ảnh thật đã mở.');}
if(r.format==='visual-insight'){if(!r.headline?.trim())errors.push('Thiếu headline.');if(!['A','B','C','D','E','F'].includes(r.visual_format))errors.push('Format A–F.');if(!Array.isArray(r.concepts)||r.concepts.length!==3)errors.push('Cần 3 concept.');}
if(!qaRequired)return errors;
const assets=active(r),needsMedia=!['story','comment-chain'].includes(r.format);
if(needsMedia&&!assets.length)errors.push('Chưa có media thật.');
for(const a of assets){const f=path.resolve(folder,a.file);if(!lib.contained(folder,f)||!fs.existsSync(f)||fs.statSync(f).size===0)errors.push('Artifact thiếu/ngoài folder.');else if(fileHash(f)!==a.sha256)errors.push('Artifact đã đổi sau ghi nhận.');}
const qa=r.qa;if(!qa?.reviewer||!qa.reviewed_at||qa.viewed_actual_artifact!==true)errors.push('Cần QA file/asset thật.');
if(qa?.content_hash!==contentHash(r,folder)||qa?.artifact_hashes?.join('|')!==assets.map(a=>a.sha256).join('|'))errors.push('QA không khớp phiên bản.');
if(qa?.content_pass!==true||((needsMedia||assets.length>0)&&qa?.media_pass!==true))errors.push('Nội dung/media chưa đạt.');
if(r.format==='founder-quote'&&qa){let total=0;for(const[k,max]of Object.entries({big_idea:20,quote:15,photo:15,composition:15,typography:10,color:10,personal_brand:10,mobile:5})){const v=qa.scores?.[k];if(!Number.isFinite(v)||v<0||v>max)errors.push('Điểm không hợp lệ '+k);else total+=v;}if(total<90||qa.hard_rejection!==false)errors.push('Founder Quote cần >=90 và không hard rejection.');}
if(r.format==='visual-insight'&&qa){if(!Array.isArray(qa.checks)||qa.checks.length!==10||qa.checks.some(v=>typeof v!=='boolean'))errors.push('Cần 10 checks boolean.');else if(qa.checks.filter(v=>!v).length>=2)errors.push('Visual Insight >=2 checks không đạt.');}
return errors;}
function approvalMatches(r,folder){return r.approval?.content_hash===contentHash(r,folder)&&r.approval?.artifact_hashes?.join('|')===active(r).map(a=>a.sha256).join('|');}
function main(){
if(command==='help')return print('init | doctor | profile | setup --file BRAND_JSON (partial updates allowed) | strategy --file STRATEGY_JSON | ideas [--file IDEAS_JSON] | assets [--file JSON] | channels [--file JSON] | plan [--file JSON] | new --topic TEXT --format FORMAT [--mode produce|review|plan --parent POST_ID --idea IDEA_ID] | list | show --id ID | outputs [--id ID] | open [--id ID | --all true] --confirm USER_INSTRUCTION | update --id ID --file JSON | artifact --id ID --path FILE [--role ROLE] | artifact --id ID --native UUID --receipt JSON | qa --id ID --file QA_JSON | validate --id ID | approve --id ID --by USER --note TEXT [--scope content|media|publish --channel TARGET --at now|ISO_OFFSET] | schedule --id ID --schedule-id REAL_ID --channel TARGET --at ISO_OFFSET --evidence TEXT | published --id ID --channel TARGET --url URL --evidence TEXT | feedback --id ID --text TEXT [--scope current|permanent --by USER] | metrics --id ID --file JSON | templates [--file JSON]. Every command accepts --project PATH. Publish approval requires --channel.');
if(command==='init'){lib.init(project);return print({project,initialized:true,brand_configured:read(db('brand_config')).configured});}
if(command==='doctor'){
 if(!process.env.PUPPETEER_CACHE_DIR&&fs.existsSync(path.join(lib.skillRoot,'.runtime','puppeteer')))process.env.PUPPETEER_CACHE_DIR=path.join(lib.skillRoot,'.runtime','puppeteer');
 const report={skill_root:lib.skillRoot,project,node:process.version,project_initialized:fs.existsSync(path.join(project,'project_config.json')),brand_configured:false,render_dependencies:{},commands:read(path.join(lib.skillRoot,'command-map.json')).commands.length};
 if(report.project_initialized){report.profile=profile.inspectProfile(read(db('brand_config')),read(path.join(project,'project_config.json')),read(db('strategy')));report.brand_configured=report.profile.complete;}
 for(const name of ['puppeteer','ffmpeg-static']){try{const mod=require(path.join(lib.skillRoot,'node_modules',name));report.render_dependencies[name]={installed:true,executable_exists:fs.existsSync(name==='puppeteer'?mod.executablePath():mod)};}catch{report.render_dependencies[name]={installed:false};}}
 return print(report);
}
requireProject();
if(command==='profile')return print({project,...profile.inspectProfile(read(db('brand_config')),read(path.join(project,'project_config.json')),read(db('strategy')))});
if(command==='setup'){
 const input=read(path.resolve(o.file||fail('Cần BRAND_JSON.')));const allowed=['brand_name','founder','target_audience','products','usp','tone_of_voice','pronouns','forbidden_words','brand_identity','content_goal','profile_provenance'];for(const k of Object.keys(input))if(!allowed.includes(k))fail('Brand field không hợp lệ '+k);
 const cfg=read(path.join(project,'project_config.json')),brand=profile.mergeProfile(read(db('brand_config')),input),report=profile.inspectProfile(brand,cfg,read(db('strategy')));brand.configured=report.complete;brand.updated_at=stamp();write(db('brand_config'),brand);cfg.setup_complete=report.complete;write(path.join(project,'project_config.json'),cfg);return print({project,brand_configured:report.complete,...report});
}
if(command==='strategy'){const v=read(path.resolve(o.file||fail('Cần STRATEGY_JSON.')));if(!Array.isArray(v.content_pillars)||!v.content_pillars.length)fail('Cần content_pillars.');write(db('strategy'),{...v,configured:true,updated_at:stamp()});return print({pillars:v.content_pillars.length});}
if(command==='ideas'){
 const items=read(db('idea_bank'));if(!o.file)return print(items);const input=read(path.resolve(o.file)),incoming=Array.isArray(input)?input:[input];for(const idea of incoming)if(!idea.topic?.trim()||!Array.isArray(idea.sources)||!idea.sources.length)fail('Ý tưởng cần topic và sources.');const added=[];for(const idea of incoming){const same=items.find(x=>x.topic===idea.topic&&JSON.stringify(x.sources)===JSON.stringify(idea.sources));if(same){added.push({id:same.id,existing:true});continue;}const id='idea_'+crypto.randomBytes(5).toString('hex');items.push({...idea,id,created_at:stamp(),status:'NEW',job_ids:[]});added.push({id,existing:false});}write(db('idea_bank'),items);return print({count:items.length,items:added});
}
if(['assets','channels','plan'].includes(command)){
 const name={assets:'media_assets',channels:'channels',plan:'content_plan'}[command],items=read(db(name));if(!o.file)return print(items);const input=read(path.resolve(o.file)),incoming=Array.isArray(input)?input:[input];
 for(const v of incoming){if(command==='assets'){if(!v.source||!v.kind||(!v.path&&!v.native_asset_id))fail('Asset cần source/kind/path hoặc native_asset_id.');if(v.path){const p=path.isAbsolute(v.path)?v.path:path.resolve(project,v.path);if(!fs.existsSync(p)||!fs.statSync(p).isFile())fail('Asset path không có thật.');v.path=lib.contained(project,p)?path.relative(project,p):p;}}
 if(command==='channels'&&(!v.id||!v.platform||!v.verification_evidence))fail('Kênh cần id/platform/verification_evidence thật.');
 if(command==='plan'&&(!v.topic||!formats.includes(v.format)||!v.planned_at))fail('Plan cần topic/format/planned_at.');}
 for(const v of incoming){const id=v.id||command+'_'+crypto.randomBytes(5).toString('hex'),at=items.findIndex(x=>x.id===id),item={...v,id,updated_at:stamp()};if(command==='plan')item.status='EDITORIAL_PLAN';at<0?items.push(item):items.splice(at,1,item);}write(db(name),items);return print({saved:incoming.length,total:items.length});
}
if(command==='templates'){
 const builtin=read(path.join(lib.skillRoot,'assets','templates','catalog.json'));const f=path.join(project,'templates','custom.json'),custom=fs.existsSync(f)?read(f):[];
 if(!o.file)return print({builtin,custom});const v=read(path.resolve(o.file));if(!v.id||!v.name||!v.format||!v.definition)fail('Mẫu cần id/name/format/definition.');const at=custom.findIndex(x=>x.id===v.id);if(at>=0)fail('Template ID đã có; dùng ID phiên bản mới.');custom.push(v);write(f,custom);return print({saved:v.id});
}
if(command==='new'){
 if(!o.topic?.trim()||!formats.includes(o.format))fail('Cần topic và format: '+formats.join(', '));
 if(o.mode&&!['produce','review','plan'].includes(o.mode))fail('Mode không hợp lệ.');
 const day=localDate(),id='post_'+day.replaceAll('-','')+'_'+crypto.randomBytes(4).toString('hex'),folder=path.join(project,'media_output',day,id);
 if(o.parent)locate(o.parent);const idea=o.idea?read(db('idea_bank')).find(x=>x.id===o.idea):null;if(o.idea&&!idea)fail('Idea ID không có.');
 fs.mkdirSync(folder,{recursive:true});const r={schema_version:1,id,topic:o.topic,format:o.format,goal:o.goal||'authority',mode:o.mode||'produce',parent_id:o.parent||null,date_local:day,status:'DRAFT',created_at:stamp(),updated_at:stamp(),sources:[{type:'user_brief',text:o.topic}],big_idea:null,artifacts:[],qa:null,approval:null,feedback:[],history:[{at:stamp(),event:'created'}]};
 if(idea){r.idea_id=idea.id;r.sources=idea.sources;}const f=path.join(folder,'record.json');write(f,r);fs.writeFileSync(path.join(folder,'caption.txt'),'');sync(r);refreshIdea(r.idea_id);return print({id,folder,status:r.status});
}
if(command==='list')return print(read(db('post_inventory')));
if(command==='outputs'||command==='open'){
 const records=jobs().map(f=>({folder:path.dirname(f),r:read(f)})).sort((a,b)=>b.r.updated_at.localeCompare(a.r.updated_at));
 const all=output.overview(project,records),selected=o.id?records.find(x=>x.r.id===o.id):records[0];if(o.id&&!selected)fail('Không tìm thấy bài '+o.id);
 const result={project,...all,selected:selected?output.jobOutput(project,selected.folder,selected.r):null};
 if(command==='open'){if(!o.confirm?.trim())fail('Mở thư mục cần --confirm chỉ dẫn mở của học viên.');const folder=o.all==="true"?all.folder:result.selected?.folder||all.folder;if(process.platform!=='win32')fail('Mở thư mục tự động hiện hỗ trợ Windows; trả đường dẫn từ outputs để mở thủ công.');const child=require('node:child_process').spawn('explorer.exe',[folder],{detached:true,stdio:'ignore',windowsHide:false});child.on('error',e=>{process.stderr.write('Không mở được thư mục: '+e.message+'\n');process.exitCode=1;});child.unref();result.open_requested=true;result.opened_folder=folder;}
 return print(result);
}
const f=locate(o.id),folder=path.dirname(f),r=read(f);
if(command==='show')return print({folder,...r});
if(command==='validate'){const errors=check(r,folder);print({valid:!errors.length,status:r.status,errors});if(errors.length)process.exitCode=2;return;}
if(command==='update'){
 const v=read(path.resolve(o.file||fail('Cần JSON nội dung.')));for(const k of Object.keys(v))if(!editable.includes(k))fail('Field không được sửa trực tiếp '+k);if(v.parent_id){if(v.parent_id===r.id)fail('Bài không thể là parent của chính nó.');locate(v.parent_id);}for(const[k,val]of Object.entries(v))r[k]=val;
 r.qa=null;r.approval=null;r.status=v.blocker?'BLOCKED_TOOL':check(r,folder,false).length?'DRAFT':'CONTENT_READY';save(f,r,'content_updated',{fields:Object.keys(v)});
}else if(command==='artifact'){
 const role=o.role||'media';if(!/^[a-zA-Z0-9_-]+$/.test(role))fail('Role không hợp lệ.');
 let src,ext,native=null;
 if(o.native){
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(o.native)||!o.receipt)fail('Cần UUID thật và receipt JSON.');
  const receipt=read(path.resolve(o.receipt));if(receipt.asset_id!==o.native||receipt.success!==true)fail('Receipt không khớp asset ID thành công.');
  src=path.resolve(o.receipt);ext='.json';native=o.native;
 }else{src=path.resolve(o.path||fail('Cần file artifact.'));ext=path.extname(src).toLowerCase();if(!['.png','.jpg','.jpeg','.webp','.gif','.mp4','.mp3','.wav','.pdf'].includes(ext))fail('Định dạng artifact không hỗ trợ.');}
 if(!fs.existsSync(src)||!fs.statSync(src).isFile()||!fs.statSync(src).size)fail('File nguồn thiếu/rỗng.');
 let v=1,dest;do{dest=path.join(folder,role+'_v'+String(v++).padStart(2,'0')+ext);}while(fs.existsSync(dest));
 fs.copyFileSync(src,dest,fs.constants.COPYFILE_EXCL);
 for(const old of r.artifacts)if((old.role||'media')===role)old.active=false;
 r.artifacts.push({role,file:path.basename(dest),active:true,sha256:fileHash(dest),bytes:fs.statSync(dest).size,native_asset_id:native,source_path:src,recorded_at:stamp()});
 r.qa=null;r.approval=null;r.status='MEDIA_READY';save(f,r,'artifact_recorded',{role,file:path.basename(dest)});
}else if(command==='qa'){
 const input=read(path.resolve(o.file||fail('Cần QA_JSON.')));r.qa={...input,content_hash:contentHash(r,folder),artifact_hashes:active(r).map(a=>a.sha256),reviewed_at:stamp()};r.approval=null;const errors=check(r,folder);r.status=errors.length?'REVISE':'READY_FOR_REVIEW';save(f,r,'qa_recorded',{errors});
}else if(command==='approve'){
 if(!o.by||!o.note)fail('Cần người duyệt và chỉ dẫn thật.');const scope=o.scope||'publish';
 if(!['content','media','publish'].includes(scope))fail('Scope duyệt không hợp lệ.');
 if(scope==='publish'&&!o.channel?.trim())fail('Duyệt đăng cần --channel đích cụ thể.');
 if(scope==='publish'&&o.at&&o.at!=='now'&&(!/(Z|[+-]\d{2}:\d{2})$/.test(o.at)||!Number.isFinite(Date.parse(o.at))))fail('Thời gian duyệt cần now hoặc ISO có timezone.');
 const errors=check(r,folder,scope!=='content');if(errors.length)fail(errors.join(' '));
 if(scope==='content'){r.content_approval={by:o.by,instruction:o.note,hash:contentHash(r,folder),at:stamp()};r.status=['story','comment-chain'].includes(r.format)?'CONTENT_APPROVED':'PENDING_MEDIA';}
 else{r.approval={by:o.by,instruction:o.note,scope,target:scope==='publish'?{channel:o.channel,at:o.at||'now'}:null,content_hash:contentHash(r,folder),artifact_hashes:active(r).map(a=>a.sha256),at:stamp()};r.status='APPROVED';}
 save(f,r,'approved',{scope,by:o.by});
}else if(command==='schedule'||command==='published'){
 if(!['APPROVED','SCHEDULED'].includes(r.status)||!approvalMatches(r,folder)||r.approval?.scope!=='publish')fail('Bản đang dùng chưa có duyệt đăng hợp lệ.');if(!o.channel||o.channel!==r.approval.target?.channel)fail('Đích đăng không khớp phạm vi đã duyệt.');const errors=check(r,folder);if(errors.length)fail(errors.join(' '));
 if(!o.evidence)fail('Cần evidence công cụ thật.');
 if(command==='schedule'){if(!o['schedule-id']||!o.at||!/(Z|[+-]\d{2}:\d{2})$/.test(o.at)||!Number.isFinite(Date.parse(o.at)))fail('Cần schedule ID/kênh/ISO có timezone.');if(r.approval.target.at==='now'||Date.parse(o.at)!==Date.parse(r.approval.target.at))fail('Lịch không khớp thời gian đã duyệt.');r.schedule={id:o['schedule-id'],channel:o.channel,at:o.at,evidence:o.evidence};r.status='SCHEDULED';}
 else{const url=new URL(o.url||fail('Cần permalink thật.'));if(!['https:','http:'].includes(url.protocol))fail('URL không hợp lệ.');r.publication={url:url.href,channel:o.channel,evidence:o.evidence,at:stamp()};r.status='PUBLISHED';}
 save(f,r,command+'_recorded',command==='schedule'?r.schedule:r.publication);
}else if(command==='feedback'){
 if(!o.text?.trim())fail('Cần feedback.');const scope=o.scope||'current';if(!['current','permanent'].includes(scope)||scope==='permanent'&&!o.by)fail('Permanent cần chỉ dẫn người dùng.');const item={text:o.text,scope,by:o.by||null,at:stamp()};r.feedback.push(item);if(scope==='permanent'){const prefs=read(db('preferences'));prefs.push(item);write(db('preferences'),prefs);}save(f,r,'feedback_recorded',item);
}else if(command==='metrics'){
 const input=read(path.resolve(o.file||fail('Cần metrics JSON.')));if(!input.source||!input.observed_at)fail('Cần source/observed_at.');r.metrics=r.metrics||[];r.metrics.push(input);const all=read(db('metrics'));all.push({post_id:r.id,...input});write(db('metrics'),all);save(f,r,'metrics_recorded',{source:input.source});
}else fail('Lệnh chưa hỗ trợ '+command);
print({id:r.id,status:r.status,folder});
}
try{main();}catch(e){process.stderr.write(e.message+'\n');process.exitCode=1;}

