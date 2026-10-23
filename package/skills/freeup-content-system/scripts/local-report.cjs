#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),lib=require('./lib/project.cjs');
function report(project,now=new Date()){
 const read=(n,fallback)=>{const p=path.join(project,n);return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):fallback;};
 const list=n=>{const r=read('database/'+n+'.json',[]);return Array.isArray(r)?r:[];};
 const day=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh'}).format(now);
 const ideas=list('idea_bank'),posts=list('post_inventory'),sources=list('expert_sources');
 const scan=read('database/research_runs/'+day+'.json',null);
 const lines=['FREEUP CONTENT — '+day,'Kho trên máy: '+project,'Ý tưởng: '+ideas.length+' · Bài đã tạo: '+posts.length,'Nguồn đang bật: '+sources.filter(x=>x.enabled!==false).length];
 if(scan){lines.push('Nghiên cứu hôm nay: '+(scan.status||'xem biên bản'));for(const x of (scan.selected||scan.ideas||[]).slice(0,3))lines.push('- '+(x.topic||x.title||x.id||x.url));if(scan.reason)lines.push('Ghi chú: '+scan.reason);}
 else lines.push('Chưa có biên bản nghiên cứu hôm nay; chưa xác nhận đã quét đủ nguồn.');
 const ready=posts.filter(x=>x.status==='APPROVED'),blocked=posts.filter(x=>/BLOCK|FAIL|ERROR/.test(x.status||''));
 lines.push('Đã duyệt để tự đăng: '+ready.length+' · Bài cần xử lý lỗi: '+blocked.length);
 for(const x of blocked.slice(0,5))lines.push('- '+x.id+': '+(x.error||x.blocked_reason||x.status));
 lines.push('Nhắn “Xem ý tưởng” hoặc “Mở bài [ID]” để tiếp tục. Người dùng tự đăng caption và media.');
 return lines.join('\n');
}
if(require.main===module){try{const {options}=lib.parse(process.argv.slice(2));process.stdout.write(report(lib.root(options.project))+'\n');}catch(e){console.error('Không đọc được kho local: '+e.message);process.exitCode=1;}}
module.exports={report};
