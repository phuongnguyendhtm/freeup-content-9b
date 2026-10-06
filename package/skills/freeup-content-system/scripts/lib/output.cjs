'use strict';
const fs=require('node:fs'),path=require('node:path');
const lib=require('./project.cjs');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const href=p=>p.split(path.sep).map(encodeURIComponent).join('/');
const text=f=>fs.existsSync(f)?fs.readFileSync(f,'utf8'):'';
const status=s=>({DRAFT:"Bản nháp",CONTENT_READY:"Đã viết nội dung",CONTENT_APPROVED:"Đã duyệt nội dung",PENDING_MEDIA:"Đang chờ ảnh/video",MEDIA_READY:"Đã tạo ảnh/video",REVISE:"Cần chỉnh sửa",READY_FOR_REVIEW:"Sẵn sàng xem",APPROVED:"Đã duyệt",SCHEDULED:"Đã lên lịch đăng",PUBLISHED:"Đã đăng",BLOCKED_TOOL:"Cần bổ sung tài nguyên hoặc công cụ"}[s]||"Đang làm");
const shell=(title,body)=>`<!doctype html><html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)}</title><style>body{font:18px/1.6 Arial,sans-serif;background:#f7f7f4;color:#202124;max-width:1040px;margin:24px auto;padding:0 20px}h1{font-size:30px;line-height:1.25}h2{font-size:22px}article,section{background:white;border:1px solid #deded8;border-radius:12px;padding:24px;margin:20px 0}pre{white-space:pre-wrap;word-break:break-word;font:inherit}img,video{max-width:100%;height:auto;max-height:900px;display:block;margin:12px auto}a{color:#1457ba}small{color:#555}nav{display:flex;gap:20px;flex-wrap:wrap}.assets{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}.assets figure{margin:0;padding:12px;border:1px solid #ddd;border-radius:8px}</style><body>${body}</body></html>`;
function jobOutput(project,folder,r){
 const caption=text(path.join(folder,'caption.txt')),master=text(path.join(folder,'master_content.md'));
 const artifacts=(r.artifacts||[]).filter(a=>a.active!==false).map(a=>{const file=path.resolve(folder,a.file);const exists=lib.contained(folder,file)&&fs.existsSync(file)&&fs.statSync(file).isFile();return {...a,path:exists?file:null,exists,local_media:exists&&!a.native_asset_id};}).sort((a,b)=>(a.role||'').localeCompare(b.role||'',undefined,{numeric:true}));
 const preview=path.join(folder,'index.html');
 const media=artifacts.map(a=>{const url=href(a.file),ext=path.extname(a.file).toLowerCase();let content;
  if(!a.exists)content='<p>Tệp chưa có trên máy.</p>';
  else if(a.native_asset_id)content=`<p>Ảnh đang ở thư viện 9B. Dùng /xem trong chat để xem ảnh.</p><a href="${url}">Thông tin ảnh</a>`;
  else if(['.png','.jpg','.jpeg','.webp','.gif'].includes(ext))content=`<img loading="lazy" src="${url}" alt="${escape(a.role||'Ảnh thành phẩm')}"><a href="${url}" download>Tải ảnh</a>`;
  else if(ext==='.mp4')content=`<video controls preload="metadata" src="${url}"></video><a href="${url}" download>Tải video</a>`;
  else if(['.mp3','.wav'].includes(ext))content=`<audio controls src="${url}"></audio><a href="${url}" download>Tải âm thanh</a>`;
  else content=`<a href="${url}" download>Tải tệp</a>`;
  return `<figure><figcaption>${escape(a.role||'Thành phẩm')}</figcaption>${content}</figure>`;
 }).join('');
 const back=href(path.relative(folder,path.join(project,'media_output','index.html')));
 const body=`<nav><a href="${back}">Kho thành phẩm</a><a href="caption.txt" download>Tải nội dung đăng</a>${master?'<a href="master_content.md" download>Tải bài gốc</a>':''}</nav><h1>${escape(r.topic)}</h1><small>${escape(r.id)} · ${escape(status(r.status))}</small><article><h2>Nội dung đăng</h2><pre>${escape(caption||'Nội dung đang được soạn.')}</pre></article>${media?`<section><h2>Ảnh và video</h2><div class="assets">${media}</div></section>`:''}${master?`<article><h2>Bài gốc</h2><pre>${escape(master)}</pre></article>`:''}`;
 fs.writeFileSync(preview,shell(r.topic,body));
 return {id:r.id,topic:r.topic,status:r.status,folder,preview,caption,master_content:master,artifacts,phone:{local_path_accessible:false,note:'Muốn xem trên điện thoại, gửi caption và tệp/asset qua kênh chat đã kết nối bằng công cụ 9B thực có. Chỉ báo đã gửi khi công cụ xác nhận.'}};
}
function overview(project,records){
 const root=path.join(project,'media_output');fs.mkdirSync(root,{recursive:true});
 const cards=records.map(({r,folder})=>{jobOutput(project,folder,r);const link=href(path.relative(root,path.join(folder,'index.html')));return `<article><h2><a href="${link}">${escape(r.topic)}</a></h2><small>${escape(r.id)} · ${escape(status(r.status))}</small></article>`;}).join('');
 const preview=path.join(root,'index.html');fs.writeFileSync(preview,shell('Kho thành phẩm',`<h1>Kho thành phẩm</h1><p>Mở một bài để đọc nội dung và xem ảnh/video đã lưu. Đây là trang xem trên máy tính của bạn.</p>${cards||'<p>Chưa có bài. Dùng /vietbai hoặc /anh để bắt đầu.</p>'}`));return {folder:root,preview,count:records.length};
}
module.exports={jobOutput,overview};
