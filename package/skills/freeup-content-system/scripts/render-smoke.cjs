#!/usr/bin/env node
'use strict';
// Reproducible media test uses only newly generated synthetic assets, never student media.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {render,runCommand,ffmpegPath,inspectPng,SKILL_ROOT}=require('./render-media.cjs');
async function smoke(projectOverride) {
  const projectRoot=projectOverride?path.resolve(projectOverride):require('./lib/project.cjs').root();
  fs.mkdirSync(projectRoot,{recursive:true});
  const base=path.join(projectRoot,'verification',`render-smoke-${new Date().toISOString().replace(/[:.]/g,'-')}-${crypto.randomBytes(3).toString('hex')}`);
  fs.mkdirSync(base,{recursive:true});
  const brand=path.join(base,'sample-brand.json');
  fs.writeFileSync(brand,JSON.stringify({brand_name:'Thương hiệu mẫu',author:'Người sáng lập',handle:'@thuonghieumau',brand_identity:{colors:{background:'#F2F0E8',primary:'#142E38',accent:'#007F80'},fonts:{primary:'Arial'}}},null,2));
  const outputs=[];
  async function test(name,job) {
    const input=path.join(base,`${name}.json`),output=path.join(base,name);
    fs.writeFileSync(input,JSON.stringify(job,null,2));
    const result=await render({project:projectRoot,input,brand,output});
    outputs.push({test:name,format:job.format,output:path.relative(projectRoot,output),files:result.manifest.deliverables});
    return result;
  }
  const quote=await test('quote',{format:'founder-quote',kicker:'Góc nhìn người sáng lập',headline:'Doanh nghiệp cần hệ thống, không chỉ cần thêm người.',body:'Rõ việc · Rõ tiêu chí · Rõ trách nhiệm'});
  const synthetic=path.join(quote.outputDir,'visual.png');
  assert.deepEqual({...inspectPng(synthetic),bytes:0},{width:1080,height:1350,bytes:0});
  await test('photo-quote',{format:'founder-quote',image:synthetic,headline:'Việc nào đang chờ bạn duyệt?',author:'Học viên mẫu',body:'Chọn một việc để trao quyền trong tuần này.'});
  await test('visual-insight',{format:'visual-insight',kicker:'Một vấn đề · Một góc nhìn',headline:'Nút thắt nằm ở cách quyết định',body:'Đừng chỉ đếm số người. Hãy nhìn đường đi của quyết định.',panels:[{title:'Hiện tại',body:'Mọi việc đều phải xin duyệt.'},{title:'Nguyên nhân',body:'Thiếu tiêu chí và quyền hạn.'},{title:'Thay đổi',body:'Giao việc kèm phạm vi quyết định.'},{title:'Hành động',body:'Chọn một việc để thử hôm nay.'}],cta:'Bạn đang duyệt việc nào mỗi ngày?'});
  await test('infographic',{format:'infographic',layout:'flow',kicker:'Quy trình mẫu',headline:'Từ ý tưởng tới nội dung',panels:[{title:'Chọn một vấn đề',body:'Một bài chỉ tập trung một điều.'},{title:'Viết một thông điệp',body:'Có ví dụ và hành động cụ thể.'},{title:'Kiểm tra trước khi dùng',body:'Rà câu chữ, hình ảnh và nguồn.'}]});
  await test('carousel',{format:'carousel',slides:[{kicker:'Bắt đầu từ một việc',headline:'3 câu hỏi trước khi phân quyền',body:'Một bộ tiêu chí rõ ràng giúp đội ngũ tự quyết.'},{kicker:'01 · Phạm vi',headline:'Việc nào được tự quyết?',body:'Nêu rõ kết quả, ngân sách và hạn chót.'},{kicker:'02 · Phản hồi',headline:'Khi nào cần báo lại?',body:'Chọn thời điểm báo cáo và tình huống cần trao đổi ngay.',cta:'Thử ngay với một việc trong tuần này.'}]});
  const binary=ffmpegPath(),clip=path.join(base,'synthetic-clip.mp4'),audio=path.join(base,'synthetic-audio.wav');
  await runCommand(binary,['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','color=c=0x385660:s=360x640:r=30','-t','1','-an','-c:v','libx264','-pix_fmt','yuv420p',clip],'Tạo clip kiểm thử');
  await runCommand(binary,['-hide_banner','-loglevel','error','-y','-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','1','-c:a','pcm_s16le',audio],'Tạo âm thanh kiểm thử');
  await test('broll',{format:'broll',scenes:[{media:synthetic,duration:1,headline:'Rõ việc, rõ trách nhiệm',body:'Bắt đầu từ một quyết định.'},{media:clip,duration:1,headline:'Cho đội ngũ tiêu chí rõ ràng'}]});
  await test('reels-audio',{format:'reels',audio,audio_volume:.2,scenes:[{media:clip,duration:1.5,headline:'Một thay đổi nhỏ hôm nay',body:'Một việc · Một người phụ trách · Một tiêu chí rõ.'}]});
  const custom=path.join(base,'custom.html');
  fs.writeFileSync(custom,'<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>body{margin:0;background:#152b35;color:white;font-family:Arial}main{padding:100px}h1{font-size:90px}p{font-size:40px}</style></head><body><main><h1>Kiểm thử HTML cục bộ</h1><p>Tiếng Việt: ă â ê ô ơ ư đ · Thương hiệu mẫu</p></main></body></html>');
  const htmlResult=await render({project:projectRoot,html:custom,format:'visual-insight',output:path.join(base,'custom-html')});
  outputs.push({test:'custom-html',files:htmlResult.manifest.deliverables});
  const customCarousel=path.join(base,'custom-carousel.html');
  fs.writeFileSync(customCarousel,'<!doctype html><html lang="vi"><head><meta charset="utf-8"><style>.slide{padding:90px;background:#152b35;color:white;font-family:Arial}.slide h1{font-size:74px}.slide p{font-size:36px}.slide img{width:360px;height:450px;object-fit:cover}</style></head><body><section class="slide"><h1>Carousel HTML tự thiết kế</h1><p>Slide đầu có ảnh cục bộ tương đối.</p><img src="quote/visual.png"></section><section class="slide"><h1>Không ép header hoặc avatar</h1><p>Chữ Việt: ă â ê ô ơ ư đ · trách nhiệm</p></section></body></html>');
  const customCarouselResult=await render({project:projectRoot,html:customCarousel,format:'carousel',output:path.join(base,'custom-carousel')});
  outputs.push({test:'custom-carousel',files:customCarouselResult.manifest.deliverables});
  assert.equal(customCarouselResult.manifest.deliverables.length,2);
  const remote=path.join(base,'remote.html');
  fs.writeFileSync(remote,'<html><body><img src="https://example.invalid/test.png"></body></html>');
  await assert.rejects(()=>render({project:projectRoot,html:remote,format:'founder-quote',output:path.join(base,'reject-remote')}),/bị chặn/);
  await assert.rejects(()=>render({project:projectRoot,input:path.join(base,'quote.json'),output:quote.outputDir}),/đã có file/);
  await assert.rejects(()=>render({project:projectRoot,input:path.join(base,'quote.json'),output:path.resolve(projectRoot,'..','outside-render-smoke')}),/phải nằm trong project/);
  const result={ok:true,generated_at:new Date().toISOString(),project:projectRoot,skillRoot:SKILL_ROOT,outputs,checks:['Vietnamese text present','PNG dimensions exact','H264 1080x1920 video fully decoded','local image and local clip inputs','audio file merged','custom HTML carousel with relative local image','remote URL rejected','nonempty output rejected','outside-project output rejected'],notes:['All media assets were synthetic and newly generated. No user image was edited.','Requires dependencies installed inside skill; initial npm install needs internet. Rendering uses local files only.']};
  fs.writeFileSync(path.join(base,'smoke-result.json'),JSON.stringify(result,null,2)+'\n');
  console.log(JSON.stringify({ok:true,report:path.join(base,'smoke-result.json'),tests:outputs.length},null,2));
  return result;
}
if(require.main===module){const args=process.argv.slice(2),index=args.indexOf('--project');smoke(index<0?undefined:args[index+1]).catch(error=>{console.error(`[Smoke] ${error.stack}`);process.exitCode=1;});}
module.exports={smoke};
