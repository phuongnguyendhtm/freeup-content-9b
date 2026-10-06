'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const skillRoot=path.resolve(__dirname,'..','..');
function parse(args){const options={};const positional=[];for(let i=0;i<args.length;i++){const a=args[i];if(a.startsWith('--')){const k=a.slice(2);if(i+1>=args.length||args[i+1].startsWith('--'))throw Error('Tham số '+a+' cần giá trị.');options[k]=args[++i];}else positional.push(a);}return {options,positional};}
function read(file){return JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));}
function root(override){if(override)return path.resolve(override);const runtime=path.join(skillRoot,'runtime.json');if(fs.existsSync(runtime)){const data=read(runtime);return path.resolve(skillRoot,data.project_relative);}return path.join(skillRoot,'student-project');}
function write(file,data){fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.'+crypto.randomBytes(4).toString('hex')+'.tmp';try{fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n');fs.renameSync(temp,file);}finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}}
function contained(parent,file){const rel=path.relative(path.resolve(parent),path.resolve(file));return rel!==''&&rel!=='..'&&!rel.startsWith('..'+path.sep)&&!path.isAbsolute(rel);}
function init(project){fs.mkdirSync(project,{recursive:true});const defaults=path.join(skillRoot,'assets','defaults');for(const [source,target]of [['project_config.json','project_config.json'],['brand_config.json','database/brand_config.json'],['strategy.json','database/strategy.json']]){const file=path.join(project,target);if(!fs.existsSync(file))write(file,read(path.join(defaults,source)));}
for(const name of ['idea_bank','ideation_pipeline','post_inventory','media_assets','preferences','metrics','channels','content_plan']){const file=path.join(project,'database',name+'.json');if(!fs.existsSync(file))write(file,[]);}
for(const dir of ['personal_image','image_stock','celebrity_image','background-video','music','logo','mascot'])fs.mkdirSync(path.join(project,'media-input',dir),{recursive:true});
fs.mkdirSync(path.join(project,'media_output'),{recursive:true});fs.mkdirSync(path.join(project,'templates'),{recursive:true});
return project;}
module.exports={skillRoot,parse,read,root,write,contained,init};

