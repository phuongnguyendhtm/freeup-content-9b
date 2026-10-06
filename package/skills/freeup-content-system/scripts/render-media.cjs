#!/usr/bin/env node
'use strict';

/** Local, portable renderer. Does not load .env, fetch media or alter originals. */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL, fileURLToPath } = require('node:url');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');

const SKILL_ROOT = path.resolve(__dirname, '..');
const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.mkv', '.m4v']);
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac']);
const FORMATS = new Set(['founder-quote', 'visual-insight', 'infographic', 'carousel', 'broll', 'reels']);
const ALIASES = { quote: 'founder-quote', image: 'founder-quote', insight: 'visual-insight', reel: 'reels' };

function die(message) { throw new Error(message); }
function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
  catch (error) { die(`Không đọc được JSON ${file}: ${error.message}`); }
}
function inside(base, candidate) {
  const relative = path.relative(base, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}
function canonical(file) { return fs.realpathSync(file); }
function nearestExisting(candidate) {
  let ancestor = candidate;
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) die(`Không tìm thấy thư mục gốc cho ${candidate}`);
    ancestor = parent;
  }
  return { real: canonical(ancestor), suffix: path.relative(ancestor, candidate) };
}
function outputWithin(projectRoot, candidate) {
  const { real, suffix } = nearestExisting(candidate);
  const resolved = path.resolve(real, suffix);
  if (!inside(canonical(projectRoot), resolved)) die('Thư mục output phải nằm trong project, không đi qua symlink ra ngoài.');
  return resolved;
}
function localAsset(value, projectRoot, extensions, label) {
  if (!value || typeof value !== 'string') die(`${label}: cần đường dẫn file cục bộ.`);
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) die(`${label}: chỉ nhận đường dẫn cục bộ, không nhận URL.`);
  const resolved = path.resolve(projectRoot, value);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) die(`${label}: không tìm thấy ${resolved}`);
  if (!extensions.has(path.extname(resolved).toLowerCase())) die(`${label}: định dạng chưa hỗ trợ ${path.extname(resolved)}`);
  return canonical(resolved);
}
function text(value, max, label, required = false) {
  if (value === undefined || value === null) value = '';
  if (typeof value !== 'string') die(`${label} phải là văn bản.`);
  value = value.trim();
  if (required && !value) die(`${label} không được để trống.`);
  if (value.length > max) die(`${label} dài ${value.length} ký tự; tối đa ${max}, hãy rút gọn nội dung trên ảnh.`);
  return value;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function color(value, fallback) { return typeof value === 'string' && /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ? value : fallback; }
function dataUrl(file) {
  const ext = path.extname(file).toLowerCase();
  const mime = { '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.gif':'image/gif', '.webp':'image/webp', '.svg':'image/svg+xml', '.ttf':'font/ttf', '.otf':'font/otf', '.woff':'font/woff', '.woff2':'font/woff2' }[ext];
  if (!mime) die(`Không hỗ trợ nhúng file ${file}`);
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}
function brandValues(brand, projectRoot) {
  const identity = brand.brand_identity || {};
  const colors = identity.colors || brand.colors || {};
  const fonts = identity.fonts || brand.fonts || {};
  const family = text(fonts.primary || 'Arial', 100, 'font primary').replace(/["'\\;<>]/g, '');
  const fontFile = fonts.local_file || brand.font_file;
  return {
    paper: color(colors.background || brand.background, '#F4F1E9'),
    ink: color(colors.text || colors.primary, '#152B35'),
    accent: color(colors.accent, '#007E80'),
    font: fontFile ? 'StudentLocalFont' : `'${family}'`,
    fontFace: fontFile ? `@font-face{font-family:StudentLocalFont;src:url('${dataUrl(localAsset(fontFile, projectRoot, new Set(['.ttf','.otf','.woff','.woff2']), 'font_file'))}');font-display:block;}` : '',
    name: text(brand.founder || brand.author || brand.brand_name || '', 110, 'tên ký'),
    handle: text(brand.handle || identity.handle || brand.brand_name || '', 110, 'handle')
  };
}
function normalizeCard(card, label) {
  if (!card || typeof card !== 'object' || Array.isArray(card)) die(`${label} phải là object.`);
  const panels = card.panels || [];
  if (!Array.isArray(panels) || panels.length > 6) die(`${label}.panels cần từ 0 đến 6 mục.`);
  return {
    ...card,
    headline: text(card.headline || card.quote || card.title, 260, `${label}.headline`, true),
    body: text(card.body || card.description, 850, `${label}.body`),
    kicker: text(card.kicker, 70, `${label}.kicker`),
    cta: text(card.cta, 160, `${label}.cta`),
    author: card.author === undefined ? undefined : text(card.author, 110, `${label}.author`),
    handle: card.handle === undefined ? undefined : text(card.handle, 110, `${label}.handle`),
    panels: panels.map((panel, i) => ({
      title: text(panel.title, 100, `${label}.panels[${i}].title`, true),
      body: text(panel.body, 240, `${label}.panels[${i}].body`)
    }))
  };
}
function makeHtml(card, format, brand, projectRoot, pageNumber = '', video = false) {
  const theme = brandValues(brand, projectRoot);
  const width = 1080, height = video ? 1920 : format === 'carousel' ? 1080 : 1350;
  const photo = card.image && !video ? localAsset(card.image, projectRoot, IMAGE_EXTS, 'image') : null;
  const focal = /^\d{1,3}% \d{1,3}%$/.test(card.focal || '') ? card.focal : '50% 50%';
  const author = card.author === undefined ? theme.name : card.author;
  const handle = card.handle === undefined ? theme.handle : card.handle;
  const showSignature = card.show_signature !== false && (author || handle);
  const panels = card.panels.length ? `<div class="panel-grid ${card.layout === 'flow' ? 'flow-grid' : ''}">${card.panels.map((panel, i) => `<article class="panel"><div class="panel-number">${String(i+1).padStart(2,'0')}</div><h2 data-fit-text>${escapeHtml(panel.title)}</h2>${panel.body ? `<p data-fit-text>${escapeHtml(panel.body)}</p>` : ''}</article>`).join('')}</div>` : '';
  const layout = [video ? 'video-layout' : format === 'carousel' ? 'carousel-layout' : format === 'founder-quote' ? 'quote-layout' : 'insight-layout', photo ? 'photo-layout' : '', photo && format === 'founder-quote' ? 'quote-photo' : ''].filter(Boolean).join(' ');
  const values = {
    DOCUMENT_TITLE: escapeHtml(card.headline), FONT_FACE: theme.fontFace,
    PAPER: theme.paper, INK: theme.ink, ACCENT: theme.accent, FONT: theme.font,
    WIDTH: width, HEIGHT: height, FOCAL: focal, LAYOUT: layout, BODY_CLASS: video ? 'video-body' : '',
    PHOTO: photo ? `<img class="photo" alt="" src="${dataUrl(photo)}">` : '',
    SHADE: photo || video ? '<div class="shade"></div>' : '',
    KICKER: card.kicker ? `<div class="kicker" data-fit-text>${escapeHtml(card.kicker)}</div>` : '',
    QUOTE_SYMBOL: format === 'founder-quote' && !video ? '<div class="quote-symbol">“</div>' : '',
    HEADLINE: escapeHtml(card.headline),
    BODY: card.body ? `<p class="body" data-fit-text>${escapeHtml(card.body)}</p>` : '',
    PANELS: panels, CTA: card.cta ? `<div class="cta" data-fit-text>${escapeHtml(card.cta)}</div>` : '',
    SIGNATURE: showSignature ? `<div class="signature" data-fit-text>${escapeHtml(author)}${handle && handle !== author ? `<small>${escapeHtml(handle)}</small>` : ''}</div>` : '<div></div>',
    PAGE: pageNumber ? `<div class="page">${escapeHtml(pageNumber)}</div>` : ''
  };
  return fs.readFileSync(path.join(SKILL_ROOT, 'templates', 'media.html'), 'utf8').replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => values[key] ?? '');
}
async function launchBrowser(options) {
  // Puppeteer searches config from cwd. The 9bizclaw caller can be anywhere,
  // so reuse bootstrap's portable cache relative to this installed skill.
  const portableCache = path.join(SKILL_ROOT, '.runtime', 'puppeteer');
  if (!process.env.PUPPETEER_CACHE_DIR && fs.existsSync(portableCache)) process.env.PUPPETEER_CACHE_DIR = portableCache;
  let puppeteer;
  try { puppeteer = require(path.join(SKILL_ROOT, 'node_modules', 'puppeteer')); } catch { die('Thiếu Puppeteer trong skill. Chạy setup/bootstrap của gói trước khi xuất ảnh/video.'); }
  const executablePath = options.chrome ? localAsset(options.chrome, options.projectRoot, new Set(['.exe','']), 'chrome') : undefined;
  try { return await puppeteer.launch({ headless: true, executablePath, args: ['--disable-background-networking', '--disable-dev-shm-usage'] }); }
  catch (error) { die(`Không mở được Chrome của Puppeteer: ${error.message}. Chạy bootstrap; nếu dùng Linux, cần các thư viện hệ thống Chromium.`); }
}
async function renderPage(browser, htmlFile, pngFile, dimensions, allowedRoots, transparent = false, customHtml = false) {
  const page = await browser.newPage();
  const blocked = [];
  try {
    await page.setViewport({ width: dimensions.width, height: dimensions.height, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on('request', request => {
      const url = request.url();
      let allow = /^(data:|about:|blob:)/.test(url);
      if (url.startsWith('file:')) {
        try {
          const file = canonical(fileURLToPath(url.split('#')[0].split('?')[0]));
          allow = allowedRoots.some(root => inside(root, file));
        } catch { allow = false; }
      }
      if (!allow) { blocked.push(url); request.abort(); } else request.continue();
    });
    await page.goto(pathToFileURL(htmlFile).href, { waitUntil:'load', timeout:30000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.images).map(img => img.complete ? Promise.resolve() : new Promise(resolve => { img.onload = resolve; img.onerror = resolve; })));
    });
    if (blocked.length) die(`HTML tham chiếu tài nguyên bị chặn: ${blocked.slice(0,3).join(', ')}. Dùng ảnh/font local, không dùng CDN.`);
    const qa = await page.evaluate(({ width, height, customHtml }) => {
      const missingImages = Array.from(document.images).filter(img => !img.complete || img.naturalWidth === 0).length;
      if (!customHtml) {
        const content = document.querySelector('[data-fit-content]');
        let attempts = 0;
        while (content && content.scrollHeight > content.clientHeight + 2 && attempts++ < 24) {
          document.querySelectorAll('[data-fit-text]').forEach(node => {
            const size = parseFloat(getComputedStyle(node).fontSize);
            const minimum = node.tagName === 'H1' ? 44 : node.tagName === 'H2' ? 24 : 20;
            node.style.fontSize = `${Math.max(minimum, size * .95)}px`;
          });
          document.querySelectorAll('.panel,.panel-grid,.body,.headline,.cta,.quote-symbol,.footer').forEach(node => {
            const style = getComputedStyle(node);
            for (const property of ['marginTop','paddingTop','paddingBottom','rowGap']) {
              const size = parseFloat(style[property]);
              if (size > 12) node.style[property] = `${Math.max(12, size * .94)}px`;
            }
          });
        }
      }
      const outside = Array.from(document.querySelectorAll('[data-fit-text],.panel')).filter(node => {
        const rect = node.getBoundingClientRect();
        return rect.left < -1 || rect.top < -1 || rect.right > width + 1 || rect.bottom > height + 1 || node.scrollWidth > node.clientWidth + 3;
      }).map(node => node.textContent.slice(0,80));
      const content = document.querySelector('[data-fit-content]');
      const overflow = !!content && content.scrollHeight > content.clientHeight + 3;
      return { missingImages, overflow, outside, fonts: document.fonts.status, width, height };
    }, { ...dimensions, customHtml });
    if (qa.missingImages) die(`Có ${qa.missingImages} ảnh không đọc được trong HTML.`);
    if (qa.overflow || qa.outside.length) die(`Nội dung tràn khung: ${qa.outside.join(' / ') || 'quá nhiều chữ'}. Rút gọn hoặc tách slide trước khi render.`);
    await page.screenshot({ path: pngFile, type:'png', omitBackground: transparent });
    return qa;
  } finally { await page.close(); }
}
function runCommand(binary, args, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { windowsHide:true, stdio:['ignore','pipe','pipe'] });
    let errors = '', output = '';
    child.stdout.on('data', chunk => { output = (output + chunk).slice(-12000); });
    child.stderr.on('data', chunk => { errors = (errors + chunk).slice(-12000); });
    child.on('error', error => reject(new Error(`${label}: ${error.message}`)));
    child.on('close', code => code === 0 ? resolve({output, errors}) : reject(new Error(`${label} không thành công (${code}): ${errors.slice(-4500)}`)));
  });
}
function ffmpegPath() {
  let binary;
  try { binary = require(path.join(SKILL_ROOT, 'node_modules', 'ffmpeg-static')); } catch { die('Thiếu FFmpeg trong skill. Chạy setup/bootstrap của gói trước khi xuất video.'); }
  if (!binary || !fs.existsSync(binary)) die('Không tìm thấy FFmpeg phù hợp hệ điều hành. Cài lại dependencies trên máy này.');
  return binary;
}
function inspectPng(file) {
  const bytes = fs.readFileSync(file);
  if (bytes.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') die(`Không phải PNG: ${file}`);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), bytes: bytes.length };
}
async function renderVideo(job, browser, brand, options, outputDir, manifest) {
  const scenes = job.scenes;
  if (!Array.isArray(scenes) || scenes.length < 1 || scenes.length > 24) die('Video cần 1–24 scenes.');
  const normalized = scenes.map((scene, i) => {
    const card = normalizeCard(scene, `scenes[${i}]`);
    if (card.headline.length > 180 || card.body.length > 380) die(`scenes[${i}]: tiêu đề tối đa 180, body tối đa 380 ký tự.`);
    const duration = Number(scene.duration ?? 4);
    if (!Number.isFinite(duration) || duration < 0.5 || duration > 60) die(`scenes[${i}].duration cần từ 0.5 đến 60 giây.`);
    const media = localAsset(scene.media || scene.image || scene.clip, options.projectRoot, new Set([...IMAGE_EXTS,...VIDEO_EXTS]), `scenes[${i}].media`);
    if (['.svg','.gif'].includes(path.extname(media).toLowerCase())) die('Video: dùng PNG/JPG/WebP hoặc clip MP4 thay SVG/GIF cho scene.media.');
    return { card, duration, media, still: IMAGE_EXTS.has(path.extname(media).toLowerCase()) };
  });
  const duration = normalized.reduce((total, scene) => total + scene.duration, 0);
  if (duration > 180) die('Video tối đa 180 giây. Tách nội dung thành nhiều video.');
  const audio = job.audio ? localAsset(job.audio, options.projectRoot, AUDIO_EXTS, 'audio') : null;
  const binary = ffmpegPath(), work = path.join(outputDir, 'video-parts');
  fs.mkdirSync(work, {recursive:true});
  const parts = [];
  for (let i = 0; i < normalized.length; i++) {
    const scene = normalized[i], stem = `scene-${String(i+1).padStart(2,'0')}`;
    const html = path.join(work, `${stem}.html`), overlay = path.join(work, `${stem}-overlay.png`), segment = path.join(work, `${stem}.mp4`);
    fs.writeFileSync(html, makeHtml(scene.card, options.format, brand, options.projectRoot, '', true));
    const qa = await renderPage(browser, html, overlay, {width:1080,height:1920}, [options.projectRoot,SKILL_ROOT], true);
    const args = ['-hide_banner','-loglevel','error','-y'];
    if (scene.still) args.push('-loop','1','-framerate','30','-i',scene.media);
    else args.push('-stream_loop','-1','-i',scene.media);
    args.push('-loop','1','-framerate','30','-i',overlay);
    // Scale and crop keep the original file untouched; the overlay supplies all Vietnamese text.
    const filter = '[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1,fps=30[bg];[bg][1:v]overlay=0:0:shortest=1,format=yuv420p[v]';
    args.push('-filter_complex',filter,'-map','[v]','-an','-t',String(scene.duration),'-r','30','-c:v','libx264','-preset','veryfast','-crf','23','-movflags','+faststart',segment);
    await runCommand(binary,args,`Render ${stem}`);
    parts.push(segment);
    manifest.scenes.push({ scene:i+1, duration:scene.duration, source:path.relative(options.projectRoot,scene.media), kind:scene.still?'image':'clip', qa });
  }
  const list = path.join(work,'concat.txt');
  // Files here have deterministic safe relative names, so no user path enters FFmpeg concat syntax.
  fs.writeFileSync(list,parts.map(file => `file '${path.basename(file)}'`).join('\n')+'\n');
  const silent = path.join(work,'joined.mp4'), final = path.join(outputDir,'video.mp4');
  await runCommand(binary,['-hide_banner','-loglevel','error','-y','-f','concat','-safe','1','-i',list,'-c','copy','-movflags','+faststart',silent],'Ghép các cảnh');
  if (audio) {
    const volume = Number(job.audio_volume ?? 1);
    if (!Number.isFinite(volume) || volume < 0 || volume > 2) die('audio_volume cần từ 0 đến 2.');
    await runCommand(binary,['-hide_banner','-loglevel','error','-y','-i',silent,'-i',audio,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-af',`volume=${volume},apad`,'-t',String(duration),'-movflags','+faststart',final],'Ghép âm thanh học viên');
  } else fs.copyFileSync(silent,final);
  const inspection = await runCommand(binary,['-hide_banner','-i',final], 'Inspect video').catch(error => ({errors:error.message}));
  if (!/1080x1920/.test(inspection.errors) || !/Video: h264/.test(inspection.errors)) die('Video đầu ra không đạt kiểm tra H.264/1080x1920.');
  const validation = await runCommand(binary,['-hide_banner','-loglevel','error','-i',final,'-f','null','-'],'Đọc kiểm tra video');
  manifest.deliverables.push({file:'video.mp4', width:1080,height:1920,duration,bytes:fs.statSync(final).size,audio:audio ? 'uploaded-local' : 'silent',decodeVerified:!validation.errors});
  manifest.notes.push('Cảnh ảnh là still image với chuyển cảnh cắt; clip cục bộ được scale/crop, loop nếu ngắn. Âm thanh gốc clip không đưa vào; dùng audio upload nếu cần.');
}
function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i];
    if (name === '--help' || name === '-h') parsed.help = true;
    else if (['--project','--input','--output','--brand','--html','--format','--chrome'].includes(name)) {
      if (!argv[i+1] || argv[i+1].startsWith('--')) die(`${name} thiếu giá trị.`);
      parsed[name.slice(2)] = argv[++i];
    } else die(`Tham số không hỗ trợ: ${name}`);
  }
  return parsed;
}
async function render(options) {
  const projectRoot = require('./lib/project.cjs').root(options.project);
  if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) die('Project chưa tồn tại. Chạy khởi tạo trước.');
  options.projectRoot = canonical(projectRoot);
  if (!!options.input === !!options.html) die('Cần đúng một trong --input job.json hoặc --html file.html.');
  const input = options.input ? localAsset(options.input,options.projectRoot,new Set(['.json']),'input') : localAsset(options.html,options.projectRoot,new Set(['.html','.htm']),'html');
  const job = options.input ? readJson(input) : {};
  options.format = ALIASES[options.format || job.format] || options.format || job.format;
  if (!FORMATS.has(options.format)) die(`format cần một trong: ${[...FORMATS].join(', ')}`);
  if (options.html && ['broll','reels'].includes(options.format)) die('Video dùng --input với scenes; HTML tùy chỉnh chỉ dành cho ảnh/carousel.');
  const brandCandidate = options.brand || job.brand_config || ['database/brand_config.json','config/brand_config.json','brand_config.json'].find(file => fs.existsSync(path.join(options.projectRoot,file)));
  const brand = brandCandidate ? readJson(localAsset(brandCandidate,options.projectRoot,new Set(['.json']),'brand')) : {};
  const stamp = new Date().toISOString().replace(/[:.]/g,'-');
  const requestedOutput = path.resolve(options.projectRoot,options.output || job.output || path.join('media_output',`${stamp}-${options.format}-${crypto.randomBytes(3).toString('hex')}`));
  const outputDir = outputWithin(options.projectRoot,requestedOutput);
  if (fs.existsSync(outputDir) && fs.readdirSync(outputDir).length) die('Thư mục output đã có file. Chọn thư mục mới để giữ nguyên bản trước.');
  if (inside(outputDir,input)) die('Không được đặt output bao quanh input gốc.');
  fs.mkdirSync(outputDir,{recursive:true});
  const manifest = { version:1, format:options.format, generated_at:new Date().toISOString(), input:path.relative(options.projectRoot,input), output:path.relative(options.projectRoot,outputDir), deliverables:[], scenes:[], notes:[], status:'rendered-local-review-required' };
  let browser;
  try {
    browser = await launchBrowser(options);
    if (options.html) {
      // Keep a copy for review; the original HTML and assets stay unchanged.
      const copied = path.join(outputDir,'source.html');
      const source = fs.readFileSync(input,'utf8');
      const base = `<base href="${escapeHtml(pathToFileURL(path.dirname(input)+path.sep).href)}">`;
      fs.writeFileSync(copied,/<head[^>]*>/i.test(source) ? source.replace(/<head[^>]*>/i,`$&${base}`) : `${base}${source}`);
      if (options.format === 'carousel') {
        const page = await browser.newPage();
        try {
          await page.setRequestInterception(true);
          page.on('request',request => /^(file:|data:|about:|blob:)/.test(request.url()) ? request.continue() : request.abort());
          await page.goto(pathToFileURL(copied).href,{waitUntil:'load'});
          const count = await page.$$eval('section.slide',nodes => nodes.length);
          if (count < 1 || count > 20) die('HTML carousel cần 1–20 section.slide.');
          const css = await page.$$eval('style',nodes => nodes.map(node => node.outerHTML).join('\n'));
          const slides = await page.$$eval('section.slide',nodes => nodes.map(node => node.outerHTML));
          for (let i=0;i<count;i++) {
            const filename = `slide-${String(i+1).padStart(2,'0')}`;
            const html = path.join(outputDir,`${filename}.html`), png = path.join(outputDir,`${filename}.png`);
            fs.writeFileSync(html,`<!doctype html><html lang="vi"><head><meta charset="utf-8">${base}${css}<style>html,body{margin:0;width:1080px;height:1080px;overflow:hidden}section.slide{width:1080px;height:1080px;box-sizing:border-box}</style></head><body>${slides[i]}</body></html>`);
            const qa = await renderPage(browser,html,png,{width:1080,height:1080},[options.projectRoot,path.dirname(input),SKILL_ROOT],false,true);
            manifest.deliverables.push({file:path.basename(png),...inspectPng(png),qa});
          }
        } finally { await page.close(); }
      } else {
        const png = path.join(outputDir,'visual.png');
        const qa = await renderPage(browser,copied,png,{width:1080,height:1350},[options.projectRoot,path.dirname(input),SKILL_ROOT],false,true);
        manifest.deliverables.push({file:'visual.png',...inspectPng(png),qa});
      }
      manifest.notes.push('HTML tùy chỉnh cần tự kiểm tra thiết kế; renderer kiểm tra kích thước ảnh và tài nguyên, không hiểu bố cục ngoài template chuẩn.');
    } else if (['broll','reels'].includes(options.format)) await renderVideo(job,browser,brand,options,outputDir,manifest);
    else {
      const cards = options.format === 'carousel' ? job.slides : [job];
      if (!Array.isArray(cards) || cards.length < 1 || cards.length > 20) die('Carousel cần 1–20 slides.');
      for (let i=0;i<cards.length;i++) {
        const card = normalizeCard(cards[i],options.format === 'carousel' ? `slides[${i}]` : 'job');
        const stem = options.format === 'carousel' ? `slide-${String(i+1).padStart(2,'0')}` : 'visual';
        const html = path.join(outputDir,`${stem}.html`), png = path.join(outputDir,`${stem}.png`);
        fs.writeFileSync(html,makeHtml(card,options.format,brand,options.projectRoot,options.format === 'carousel' ? `${i+1} / ${cards.length}` : ''));
        const size = {width:1080,height:options.format === 'carousel'?1080:1350};
        const qa = await renderPage(browser,html,png,size,[options.projectRoot,SKILL_ROOT]);
        manifest.deliverables.push({file:path.basename(png),...inspectPng(png),qa});
      }
    }
    fs.writeFileSync(path.join(outputDir,'render-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify({ok:true,output:outputDir,manifest:path.join(outputDir,'render-manifest.json'),files:manifest.deliverables.map(file=>file.file)},null,2));
    return {outputDir,manifest};
  } catch (error) {
    fs.writeFileSync(path.join(outputDir,'render-error.txt'),`${error.message}\n`);
    throw error;
  } finally { if (browser) await browser.close(); }
}

if (require.main === module) {
  Promise.resolve().then(() => {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log('Render local: node scripts/render-media.cjs --project <project> --input <job.json> [--output <new-dir>] [--brand <brand.json>]\nHTML local: thêm --html <file.html> thay --input và --format founder-quote|visual-insight|infographic|carousel\nKhông tải ảnh/font, không tự tạo giọng đọc, không đăng bài.');
      return;
    }
    return render(options);
  }).catch(error => { console.error(`[Render] ${error.message}`); process.exitCode=1; });
}
module.exports = { render, makeHtml, normalizeCard, inspectPng, runCommand, ffmpegPath, SKILL_ROOT };
