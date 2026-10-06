# Xuất ảnh và video trên máy học viên

Gói có renderer cục bộ và template tự chứa. Không cần thư mục `02-freeup-content-agent`, không đọc `.env`, không gọi dịch vụ ảnh, font, giọng đọc hoặc stock bên ngoài. Lần cài dependencies đầu cần Internet để tải Chrome của Puppeteer và FFmpeg; sau đó renderer dùng file cục bộ. Windows/macOS/Linux có Node 20+; Linux có thể cần thư viện hệ thống Chromium.

## Lệnh

Có thể chạy trong thư mục skill đã được 9bizclaw cài hoặc gọi đường dẫn tuyệt đối tới script từ thư mục khác. Renderer tìm Chrome đã cài trong `.runtime/puppeteer` theo vị trí skill. Runtime `runtime.json` có `project_relative` do bootstrap thiết lập; `--project` có thể chỉ rõ project học viên. Input, brand và đường dẫn media tương đối đều được tính từ project, không tính từ thư mục skill hay thư mục job.

```text
node scripts/render-media.cjs --project <project-hoc-vien> --input <job.json>
node scripts/render-media.cjs --project <project-hoc-vien> --input <job.json> --output media_output/2026-10-06/post_001/founder-quote/v1
node scripts/render-media.cjs --project <project-hoc-vien> --html <file.html> --format infographic
node scripts/render-smoke.cjs --project <project-kiem-thu>
```

Renderer trả JSON `{ok, output, manifest, files}`. PNG/MP4, HTML nguồn và `render-manifest.json` nằm trong output để xem và duyệt. Thư mục output phải mới hoặc trống, nằm trong project; renderer không ghi đè sản phẩm trước và không đổi ảnh/clip gốc. Đường dẫn tuyệt đối tới media cục bộ được hỗ trợ khi học viên đã cung cấp file đó. Với ảnh, đưa byte ảnh vào HTML để không cần đường dẫn máy người tạo gói. Với video, FFmpeg đọc nguồn và xuất file mới.

Sau khi render, đăng ký từng file với sổ bài viết:

```text
node scripts/content.cjs artifact --id <ID> --path <file-output> --role visual
node scripts/content.cjs artifact --id <ID> --path <slide-01.png> --role slide-01
node scripts/content.cjs artifact --id <ID> --path <video.mp4> --role video
```

Render thành công vẫn cần người dùng xem hình/video và duyệt nội dung. Không tự đăng bài.

## Map ảnh nguồn và thực thi style đã chọn

`source_photo.path` trong hồ sơ bài là metadata; renderer không tự đọc hồ sơ đó. Với ảnh local đã mở và được học viên cấp quyền dùng, chép đúng đường dẫn này sang `image` trong job render. Nếu dùng native tool, đưa `source_photo.native_asset_id` thật vào reference ID theo schema của tool, không gửi local path như UUID.

Nhãn Founder `layout:P01–P06`, `preset:DAYLIGHT/INDOOR/DARK` và Visual Insight `visual_format:A–F` **không tự áp dụng** vào template JSON cơ sở. Chúng cần được thực thi bằng thiết kế HTML/SVG riêng (`--html`) hoặc native media tool với reference đúng và prompt/bố cục đầy đủ. Renderer JSON chỉ có ảnh/chữ/panels cơ sở và `layout:"flow"`; không thực hiện grading. Không coi ảnh bốn ô chữ là đã đạt Visual Metaphor, hoặc quote mặc định là đã đạt Founder Pxx/preset. Mở output thật, kiểm theo tài liệu từng style và ghi mức thực hiện thực tế; ảnh đã chỉnh nếu có phải là output mới, giữ nguồn gốc.

## Brand

Tìm mặc định theo thứ tự `database/brand_config.json`, `config/brand_config.json`, `brand_config.json`. Có thể chỉ rõ bằng `--brand` hoặc `brand_config` trong job.

```json
{
  "brand_name": "Thương hiệu của học viên",
  "founder": "Tên người sáng lập",
  "handle": "@ten-thuong-hieu",
  "brand_identity": {
    "colors": {"background": "#F4F1E9", "primary": "#152B35", "accent": "#007E80"},
    "fonts": {"primary": "Arial", "local_file": "media-input/logo/font-cua-ban.ttf"}
  }
}
```

`local_file` là tùy chọn. Khi chưa có font riêng, renderer dùng font có sẵn trên hệ điều hành: Arial, Noto Sans, DejaVu Sans hoặc sans-serif. Chọn font có dấu tiếng Việt, có quyền sử dụng; font tải lên được nhúng local. Không có tên founder, logo, màu hoặc avatar FreeUp bị ép lên nội dung học viên. `author`, `handle` trong từng slide có thể đổi chữ ký; `show_signature:false` bỏ chữ ký.

## Ảnh đơn: Founder Quote, Visual Insight, infographic

Các format `founder-quote`, `visual-insight`, `infographic` xuất PNG **1080 × 1350**, deviceScaleFactor 1. Alias `quote`, `image`, `insight` được hỗ trợ. Schema có `headline` (bắt buộc; alias `quote`/`title`), `kicker`, `body`, `cta`, `author`, `handle`, `show_signature`, `image`, `focal` và `panels`. `image` tùy chọn và phải do học viên cung cấp; ảnh được đặt trong bố cục mới, không đổi nguồn. `focal` dạng `"50% 40%"`. `layout:"flow"` chuyển panels thành các bước dọc. Không dùng avatar/hình cá nhân khi học viên chưa đưa ảnh hoặc chưa chọn ảnh.

```json
{
  "format": "visual-insight",
  "kicker": "Một vấn đề · một góc nhìn",
  "headline": "Nút thắt nằm ở cách quyết định",
  "body": "Nhìn lại việc nào đang đi qua người sáng lập mỗi ngày.",
  "panels": [
    {"title": "Hiện tại", "body": "Mọi việc đều phải xin duyệt."},
    {"title": "Thay đổi", "body": "Giao việc kèm tiêu chí và quyền hạn."}
  ],
  "cta": "Chọn một việc để thử trong tuần này."
}
```

Giới hạn: headline 260 ký tự; body 850; kicker 70; cta 160; tối đa 6 panels (title 100, body 240). Đây là mức trần schema; bài đẹp thường cần ít chữ hơn. Renderer giảm font trong giới hạn đọc được rồi từ chối nếu vẫn tràn. Nếu tràn, rút gọn hoặc tách slide, không tuyên bố thành công và giao file thiếu chữ.

Template Founder Quote là ảnh trích dẫn có chữ ký tùy chọn. Template Visual Insight cung cấp tiêu đề cùng các khối/flow; agent phải thiết kế nội dung theo skill Visual Insight (một luận điểm trực quan, có nguồn cho số liệu), không gọi bốn ô chữ bất kỳ là insight. Với sơ đồ/metaphor riêng có thể dùng HTML tùy chỉnh cục bộ, rồi duyệt bằng mắt.

## Carousel

Format `carousel` có `slides` là mảng 1–20 object theo schema ảnh đơn. Xuất `slide-01.png`, `slide-02.png`… **1080 × 1080**, kèm HTML từng slide và số trang. Không tự tạo avatar/header ép buộc. Ví dụ đầy đủ nằm ở `templates/carousel.job.json`.

## B-roll và Reels

Format `broll` hoặc `reels` (alias `reel`) xuất **MP4 H.264, 1080 × 1920, 30 fps**. `scenes` là 1–24 cảnh, mỗi cảnh có `media` (alias `image`/`clip`) đường dẫn ảnh hoặc clip local, `duration` 0.5–60 giây và văn bản theo schema ảnh đơn. Tổng tối đa 180 giây; headline tối đa 180, body tối đa 380 ký tự mỗi cảnh. Ảnh PNG/JPG/WebP hoặc clip MP4/MOV/WebM/MKV/M4V; SVG/GIF dùng được cho ảnh đơn nhưng cần PNG/JPG hoặc MP4 khi đưa vào video.

```json
{
  "format": "reels",
  "audio": "media-input/music/giong-doc-hoc-vien.wav",
  "audio_volume": 1,
  "scenes": [
    {"media": "media-input/image_stock/anh-01.jpg", "duration": 4, "headline": "Mọi việc đều phải chờ bạn?"},
    {"media": "media-input/background-video/clip-01.mp4", "duration": 5, "headline": "Trao quyền kèm tiêu chí rõ ràng.", "body": "Bắt đầu từ một việc có rủi ro thấp."}
  ]
}
```

`audio` tùy chọn, là file học viên tải lên (MP3/WAV/M4A/AAC/OGG/FLAC), `audio_volume` 0–2. Audio ngắn được thêm im lặng tới hết video; dài được cắt theo tổng thời gian. Không có audio thì xuất video im lặng và thông báo đúng điều đó. Âm thanh gốc clip được tắt. Không tự tạo giọng đọc, lip-sync, avatar AI hoặc tự mua provider. Nếu cần voiceover, agent tạo kịch bản đọc, hỏi học viên cung cấp file giọng đọc hoặc xác nhận công cụ đã kết nối. Không mô tả video im lặng là đã có voiceover.

Cảnh ảnh giữ nguyên ảnh đứng; cảnh clip được scale/crop phủ khung dọc và loop nếu ngắn. Chuyển cảnh là cắt. Đây là renderer cơ sở tự chứa, không có hiệu ứng Remotion, tự đồng bộ lời nói hay karaoke theo âm thanh. Text tiếng Việt được Chrome vẽ thành lớp PNG trong vùng an toàn; FFmpeg không cần font hệ thống cho phần chữ. Đầu ra được kiểm tra decode trước khi báo thành công.

## HTML tùy chỉnh

`--html` với ảnh đơn render khung 1080 × 1350. Với carousel, HTML cần `section.slide` 1080 × 1080 và CSS trong `<style>`. Dùng ảnh/font local, data URL hoặc SVG inline; HTTP/CDN bị chặn. HTML carousel tách slide lấy HTML + CSS, không chạy animation/JS giữa các slide. Renderer không đóng thêm header, avatar, CTA hay watermark. Với HTML ngoài template chuẩn, cần xem lại chữ, khoảng cách và toàn bộ bố cục vì renderer không hiểu ý nghĩa thiết kế.

## Kiểm chứng

`render-smoke.cjs` tạo asset tổng hợp mới và kiểm tra quote, photo quote, Visual Insight, flow infographic, carousel, B-roll từ ảnh và clip local, Reels có audio local, HTML local và carousel HTML có ảnh tương đối. Kiểm tra kích thước PNG, video H.264 1080 × 1920 và decode, chặn URL từ xa, chặn output ra ngoài project, chặn ghi đè output. Kết quả nằm trong `project/verification/render-smoke-*/smoke-result.json`; không sử dụng ảnh của giảng viên/học viên. Người kiểm tra cần mở PNG/MP4 để xem dấu tiếng Việt và bố cục trước phát hành.
