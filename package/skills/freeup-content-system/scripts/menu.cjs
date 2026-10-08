'use strict';
// Local documentation only. Does not initialize business data or produce content.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const lib=require('./lib/project.cjs'),assetRoot=path.join(lib.skillRoot,'assets','content-menu');
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function catalog(){const c=lib.read(path.join(assetRoot,'catalog.json'));if(c.schema_version!==1||!/^\d+\.\d+\.\d+$/.test(c.version))throw Error('Invalid menu catalog');return c;}
function select(c,value){const item=[c.automatic,...c.choices].find(row=>String(row.choice)===String(value)||row.id===value);if(!item)throw Error('Chọn số 0–9 hoặc ID có trong bảng chọn.');return item;}
function safeDirectory(dir){const stat=fs.lstatSync(dir);if(stat.isSymbolicLink()||!stat.isDirectory())throw Error('Menu folder must be a real directory: '+dir);}
function targetFolder(project,version){
 const absolute=path.resolve(project);
 if(fs.existsSync(absolute))safeDirectory(absolute);else fs.mkdirSync(absolute,{recursive:true});
 const real=fs.realpathSync(absolute);
 let dir=real;
 for(const part of ['help','content-menu',version]){dir=path.join(dir,part);if(fs.existsSync(dir))safeDirectory(dir);else fs.mkdirSync(dir);const resolved=fs.realpathSync(dir);if(!lib.contained(real,resolved))throw Error('Menu path escaped project');}
 return dir;
}
function decode(asset){
 const jpeg=/^[a-z0-9-]+\.jpg$/.test(asset.file)&&asset.mime==='image/jpeg';
 const png=/^[a-z0-9-]+\.png$/.test(asset.file)&&asset.mime==='image/png';
 if(!jpeg&&!png)throw Error('Invalid menu filename/MIME');
 if(typeof asset.data!=='string'||!Number.isInteger(asset.bytes)||asset.bytes<4||asset.bytes>2000000||asset.data.length>2800000)throw Error('Invalid menu image size');
 const bytes=Buffer.from(asset.data,'base64');
 const magic=jpeg?bytes[0]===255&&bytes[1]===216&&bytes.at(-2)===255&&bytes.at(-1)===217:bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(bytes.toString('base64')!==asset.data||bytes.length!==asset.bytes||digest(bytes)!==asset.sha256||!magic)throw Error('Invalid menu image/checksum');
 return {file:asset.file,bytes,sha256:asset.sha256,mime:asset.mime};
}
function exportMenu(c,options){
 if(options.all!==undefined&&options.choice!==undefined)throw Error('Use --all true or --choice, not both');
 if(options.all!==undefined&&options.all!=='true')throw Error('--all needs true');
 const choice=options.choice===undefined?null:select(c,options.choice);
 const names=options.all==='true'?[...c.intro_assets,...c.choices.map(row=>row.asset)]:choice?[choice.asset||'00-quy-trinh.jpg']:c.intro_assets;
 const imagePack=lib.read(path.join(assetRoot,'images.json'));
 if(imagePack.schema_version!==1||imagePack.version!==c.version||!Array.isArray(imagePack.assets))throw Error('Invalid image package');
 const unique=new Set(imagePack.assets.map(a=>a.file));if(unique.size!==imagePack.assets.length)throw Error('Duplicate assets');
 // Validate every requested byte before writing any output files.
 const outputs=[...new Set(names)].map(name=>{const a=imagePack.assets.find(item=>item.file===name);if(!a)throw Error('Missing image: '+name);return decode(a);});
 if(options.all==='true'){const bytes=fs.readFileSync(path.join(assetRoot,'index.html'));outputs.push({file:'index.html',bytes,sha256:digest(bytes),mime:'text/html'});}
 const folder=targetFolder(lib.root(options.project),c.version);
 // Preflight the entire selection: never overwrite edited guides or follow file links.
 for(const out of outputs){const file=path.join(folder,out.file);if(fs.existsSync(file)){const stat=fs.lstatSync(file);if(stat.isSymbolicLink()||!stat.isFile()||stat.nlink!==1||digest(fs.readFileSync(file))!==out.sha256)throw Error('Existing file is different or linked; preserved: '+file);}}
 const files=outputs.map(out=>{const file=path.join(folder,out.file);let status='kept';if(!fs.existsSync(file)){fs.writeFileSync(file,out.bytes,{flag:'wx'});status='created';}return {path:file,mime:out.mime,bytes:out.bytes.length,sha256:out.sha256,status};});
 return {version:c.version,purpose:'help-only',folder,choice,files,choices:c.choices.map(({choice,id,name,group,intent,command})=>({choice,id,name,group,intent,command})),automatic:c.automatic};
}
function main(args){const {options,positional}=lib.parse(args);if(positional.length!==1)throw Error('Use list | choice --id VALUE | export [--choice VALUE | --all true] [--project PATH]');const action=positional[0],c=catalog();const allowed=action==='export'?['choice','all','project']:action==='choice'?['id']:[];for(const key of Object.keys(options))if(!allowed.includes(key))throw Error('Unsupported option: '+key);
 if(action==='list')return c;
 if(action==='choice')return select(c,options.id);
 if(action==='export')return exportMenu(c,options);
 throw Error('Unknown menu action');}
module.exports={catalog,select,decode,exportMenu,main};
if(require.main===module){try{console.log(JSON.stringify(main(process.argv.slice(2)),null,2));}catch(error){console.error(error.message);process.exitCode=1;}}
