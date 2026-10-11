'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),lib=require('./project.cjs');
const isDate=s=>/^\d{4}-\d{2}-\d{2}$/.test(s);
const kindByFormat={story:'post',image:'post','founder-quote':'quote','visual-insight':'insight',carousel:'carousel',infographic:'infographic','comment-chain':'post',reels:'reel',broll:'reel'};
function kind(r){return kindByFormat[r.format]||'post';}
function title(r){return [r.output_title,r.title,r.headline,r.topic].find(v=>typeof v==='string'&&v.trim())?.normalize('NFC').replace(/\s+/gu,' ').trim()||'Bài viết';}
function basename(value,max=80){
 let clean=String(value).normalize('NFC').replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g,' ').replace(/\s+/gu,' ').trim().replace(/[ .]+$/g,'');
 if(!clean||/^\.+$/.test(clean))clean='Bài viết';
 if(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(clean))clean='Bài viết - '+clean;
 clean=Array.from(clean).slice(0,Math.max(1,max)).join('').replace(/[ .]+$/g,'');
 return clean||'Bài viết';
}
function realInside(project,file){const parent=fs.realpathSync(project),real=fs.realpathSync(file);if(!lib.contained(parent,real))throw Error('Thư mục nằm ngoài kho content.');return real;}
function records(project){const root=path.join(project,'media_output');if(!fs.existsSync(root))return [];return fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isDirectory()&&isDate(e.name)).flatMap(day=>fs.readdirSync(path.join(root,day.name),{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>path.join(root,day.name,e.name,'record.json')).filter(file=>fs.existsSync(file))).map(file=>({file,folder:path.dirname(file),r:lib.read(file)}));}
function budget(day){return Math.min(100,Math.max(40,240-day.length-80-2));}
function metadata(r,day,folder){return {schema_version:2,type:kind(r),date:day,title:title(r),folder_name:path.basename(folder)};}
function candidate(day,r,reserved=new Set(),current){
 const date=path.basename(day),prefix=kind(r)+' - '+date+' - ',used=new Set(fs.existsSync(day)?fs.readdirSync(day).filter(n=>path.join(day,n)!==current).map(n=>n.normalize('NFC').toLocaleLowerCase('vi')):[]);
 for(const v of reserved)used.add(v.normalize('NFC').toLocaleLowerCase('vi'));
 if(current&&r.output_naming?.schema_version===2&&r.output_naming.type===kind(r)&&r.output_naming.date===date&&r.output_naming.title===title(r)&&r.output_naming.folder_name===path.basename(current))return current;
 for(let n=1;n<=10000;n++){const suffix=n===1?'':` (${n})`,name=prefix+basename(title(r),budget(day)-prefix.length-suffix.length)+suffix;if(!used.has(name.toLocaleLowerCase('vi')))return path.join(day,name);}
 throw Error('Không tìm được tên thư mục khác biệt.');
}
function create(project,day,r){
 if(!isDate(day))throw Error('Ngày thư mục không hợp lệ.');const parent=path.join(project,'media_output',day);fs.mkdirSync(parent,{recursive:true});realInside(project,parent);
 for(let attempt=0;attempt<20;attempt++){const folder=candidate(parent,r);try{fs.mkdirSync(folder);r.output_naming=metadata(r,day,folder);return folder;}catch(e){if(e.code!=='EEXIST')throw e;}}
 throw Error('Tên thư mục đang bị thay đổi đồng thời; thử lại ở lượt sau.');
}
function plan(project,items=records(project)){const reserved=new Map();return items.map(({folder,r})=>{realInside(project,folder);const day=path.dirname(folder);if(!isDate(path.basename(day))||path.dirname(day)!==path.join(project,'media_output'))throw Error('Bài không nằm trong thư mục ngày.');const taken=reserved.get(day)||new Set(),to=candidate(day,r,taken,folder);taken.add(path.basename(to));reserved.set(day,taken);return {id:r.id,type:kind(r),date:path.basename(day),title:title(r),from:folder,to,changed:folder!==to};});}
function remap(value,moves,project){
 if(typeof value==='string'){for(const move of moves){const pairs=[[move.from,move.to],[move.from.replaceAll('\\','/'),move.to.replaceAll('\\','/')],[path.relative(project,move.from),path.relative(project,move.to)],[path.relative(project,move.from).replaceAll('\\','/'),path.relative(project,move.to).replaceAll('\\','/')]];for(const [from,to]of pairs)if(value===from||value.startsWith(from+'\\')||value.startsWith(from+'/'))return to+value.slice(from.length);}return value;}
 if(Array.isArray(value))return value.map(v=>remap(v,moves,project));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,remap(v,moves,project)]));return value;
}
function jsonFiles(project,items){
 const files=[];function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('Giữ nguyên bài có đường dẫn liên kết: '+file);if(e.isDirectory())visit(file);else if(e.isFile()&&e.name.endsWith('.json'))files.push(file);}}
 for(const item of items)visit(item.folder);
 const db=path.join(project,'database');if(fs.existsSync(db))for(const e of fs.readdirSync(db,{withFileTypes:true}))if(e.isFile()&&e.name.endsWith('.json'))files.push(path.join(db,e.name));
 for(const e of fs.readdirSync(project,{withFileTypes:true}))if(e.isFile()&&e.name.endsWith('.json'))files.push(path.join(project,e.name));
 return [...new Set(files)];
}
function apply(project,moves,options={}){
 const changes=moves.filter(m=>m.changed);if(!changes.length)return {renamed:0,moves};
 for(const move of changes){realInside(project,move.from);realInside(project,path.dirname(move.to));if(fs.existsSync(move.to))throw Error('Tên đích đã tồn tại; xem lại danh sách trước khi đổi.');}
 const lock=path.join(project,'.output-naming.lock');let fd;try{fd=fs.openSync(lock,'wx');}catch(e){if(e.code==='EEXIST')throw Error('Kho đang đổi tên; chờ tác vụ hiện tại kết thúc.');throw e;}
 const done=[],written=[];let snapshots;
 try{
  fs.writeFileSync(fd,JSON.stringify({pid:process.pid,at:new Date().toISOString()}));
  const items=records(project);
  snapshots=jsonFiles(project,items).map(file=>{const bytes=fs.readFileSync(file);const stat=fs.lstatSync(file);if(!stat.isFile()||stat.nlink!==1)throw Error('Tệp metadata liên kết được giữ nguyên.');return {file,bytes,json:JSON.parse(bytes.toString('utf8').replace(/^\uFEFF/,''))};});
  const binding=new Map(items.map(item=>{const r=options.incoming?.id===item.r.id?options.incoming:item.r;return [r.id,{r,hash:options.contentHash?.(r,item.folder)}];}));
  const backup=path.join(project,'.output-name-backups',crypto.randomUUID());fs.mkdirSync(backup,{recursive:true});
  const updates=snapshots.map(s=>{let value=options.incoming&&options.incoming.id===s.json.id?options.incoming:s.json;value=remap(value,changes,project);
   const move=changes.find(m=>m.id===value.id&&path.basename(s.file)==='record.json');if(move)value.output_naming=metadata(value,move.date,path.basename(move.to));
   return {...s,value,target:remap(s.file,changes,project)};
  }).filter(s=>JSON.stringify(s.value)!==JSON.stringify(s.json));
  for(let i=0;i<updates.length;i++)fs.writeFileSync(path.join(backup,String(i)+'.json'),updates[i].bytes);
  lib.write(path.join(backup,'manifest.json'),{moves:changes,files:updates.map((s,i)=>({file:s.file,backup:String(i)+'.json'}))});
  for(const move of changes){if(fs.existsSync(move.to))throw Error('Tên đích vừa xuất hiện; dừng để tránh ghi đè.');fs.renameSync(move.from,move.to);done.push(move);}
  for(const update of updates){if(path.basename(update.file)==='record.json'&&binding.has(update.value.id)&&options.contentHash){const original=binding.get(update.value.id);const newHash=options.contentHash(update.value,path.dirname(update.target));for(const field of ['qa','approval'])if(update.value[field]?.content_hash===original.hash)update.value[field].content_hash=newHash;if(update.value.content_approval?.hash===original.hash)update.value.content_approval.hash=newHash;}
   lib.write(update.target,update.value);written.push(update);if(options.incoming&&options.incoming.id===update.value.id)Object.assign(options.incoming,update.value);
  }
  const inventory=path.join(project,'database/post_inventory.json');if(fs.existsSync(inventory)){const data=lib.read(inventory);for(const move of changes){const item=data.find(v=>v.id===move.id);if(item){item.folder=path.relative(project,move.to);item.title=move.title;}}lib.write(inventory,data);}
  const result={renamed:done.length,moves,backup};lib.write(path.join(backup,'result.json'),result);return result;
 }catch(error){for(const move of done.reverse())if(fs.existsSync(move.to)&&!fs.existsSync(move.from))fs.renameSync(move.to,move.from);for(const s of written)fs.writeFileSync(s.file,s.bytes);throw error;}
 finally{if(fd!==undefined){fs.closeSync(fd);fs.unlinkSync(lock);}}
}
function ensure(project,folder,r,contentHash){const move=plan(project,[{folder,r}])[0];if(!move.changed){r.output_naming=metadata(r,move.date,folder);return folder;}apply(project,[move],{incoming:r,contentHash});return move.to;}
module.exports={title,kind,basename,records,create,plan,remap,apply,ensure};
