# Quy trình content hoàn chỉnh cho một máy mới

## Luồng nguồn chuyên gia và lịch được duyệt

Với yêu cầu xây hệ thống theo dõi chuyên gia, đọc **automation.md**: chọn nguồn công khai → đọc bài thật → chấm ý tưởng theo khách hàng/mục tiêu → xây góc nhìn riêng với câu chuyện/ảnh đã xác nhận → `/lich` trình lịch có ID/bản → `/duyetlich` tự sản xuất và QA → `/xem` chờ duyệt thành phẩm → `/duyetdang` và `/dang` → số liệu thật cho vòng tiếp theo. Dùng `campaign.cjs` để quản lý lịch/queue. Native `/theodoi` chỉ bật khi học viên yêu cầu theo dõi định kỳ và phải có job/receipt/run history thật.

Gói skill có đủ hướng dẫn biên tập, mẫu và công cụ lưu quy trình để khởi tạo trên máy học viên. Mỗi học viên tạo Brand DNA, nguồn tri thức, tài nguyên và tài khoản riêng. Các script của gói chạy từ `{baseDir}` và dùng thư mục làm việc lâu dài đã lưu trong cấu hình; không cần bản Antigravity hay thư mục máy người tặng.

## 1. Thiết lập một lần

Đọc `SKILL.md`, bootstrap kho làm việc và kiểm tra công cụ thật. Thu tối thiểu tên thương hiệu, đối tượng, sản phẩm/lợi thế, giọng văn, mục tiêu và kênh. Nếu người dùng đã cung cấp, dùng ngay. Mục còn thiếu có thể ghi chưa xác định; không biến một ví dụ thành thành tích thương hiệu.

Tạo:

- **Brand DNA:** đại từ, giọng, thông điệp, điều không nói, thông tin được xác nhận, chữ ký/logo/màu/font nếu có.
- **Chiến lược:** 3–5 trụ cột phù hợp và 3–5 góc nhìn như vấn đề, nguyên nhân, cách làm, phản biện, bài học. Ma trận 5×5 là một cách tạo ý tưởng, không phải hạn ngạch bắt buộc.
- **Nguồn:** tài liệu kinh doanh, case được xác nhận, URL, câu trả lời học viên và thời điểm đọc.
- **Kho media riêng:** ảnh chân dung, ảnh công việc, logo, video, âm thanh và điều kiện dùng. Chưa có ảnh cá nhân → chưa thể hoàn thiện Founder Quote có người thật.
- **Năng lực:** công cụ AI viết/ảnh/video/voice/đăng hiện có, runtime render cục bộ, điểm thiếu. Ghi kết quả kiểm tra thực, không chỉ dựa trên tên công cụ.

Ưu tiên công cụ tài liệu/media native của 9B nếu chúng thực sự xuất hiện. Khi không có, dùng tệp người dùng cung cấp và công cụ trong gói. Năng lực tạo chữ, thiết kế và lưu bài khác với khả năng sinh video có thoại hoặc đăng lên một kênh cụ thể.

## 2. Nhận brief và chọn format

Mỗi bài có ID riêng và brief gồm chủ đề, đối tượng, mục tiêu, một Big Idea, kênh, format, độ dài/thời lượng, nguồn, asset và CTA. Thu phần còn thiếu làm thay đổi nội dung; những lựa chọn hình thức nhỏ có thể dùng mặc định đã ghi.

| Dữ liệu và mục tiêu | Format nên cân nhắc |
|---|---|
| Một nguyên tắc có quan hệ/ẩn dụ nhìn thấy được | Visual Insight |
| Một câu quan điểm + ảnh cá nhân thật đúng mood | Founder Quote |
| Chia sẻ bài học, hướng dẫn, phản biện | Bài Facebook/Story có nguồn/analysis |
| Nhiều ý theo thứ tự, người đọc cần lưu lại | Carousel |
| Quy trình, so sánh, sơ đồ hệ thống | Infographic |
| Mỗi luận điểm có thể đọc riêng | Chuỗi bình luận |
| Một luận điểm có thể nói tự nhiên trong 15–60 giây | Reels có thoại |
| Một hook ngắn + cảnh/ảnh được phép dùng | B-roll không thoại |

Khi yêu cầu media từ một chủ đề mới, tự tạo phần nội dung cần thiết trước. Visual Insight và Founder Quote cần một Big Idea/caption thích hợp, không cần bị ép thành bài Story Ads bảy phần.

## 3. Nghiên cứu và ngân hàng ý tưởng

Đọc `research.md`. Tìm trong tài liệu doanh nghiệp trước khi cần web. Trích insight, phân biệt dữ kiện với ý kiến và ví dụ giả định. Mỗi ý tưởng có nguồn, hook, đối tượng, giá trị, format và trạng thái. Nguồn không truy cập được phải được ghi đúng; không báo đã đọc hoặc đã cào.

## 4. Viết nội dung gốc

Đọc `copywriting.md`. Tạo master content khi format cần bài nền, caption cho kênh và dữ liệu thiết kế. Lưu Big Idea, góc nhìn, nguồn và claim cần kiểm chứng ngoài phần chữ đăng. Bản chữ không có nhãn quản trị, placeholder chưa điền hoặc câu hứa một tài liệu chưa tồn tại.

## 5. Sản xuất media

Chọn asset cụ thể đã xem. Nếu công cụ media native cần asset ID, upload/import theo schema thật rồi dùng ID được trả về; đường dẫn trong prompt không thay được việc import. Nếu render cục bộ, dùng tệp thật mà runtime truy cập được và xuất vào bundle của bài.

| Loại | Quy cách mặc định | Đầu ra cần lưu |
|---|---|---|
| Ảnh đơn | 1080×1350, 4:5; một thông điệp chính | Thiết kế/prompt, caption, PNG/JPEG đã render |
| Visual Insight | 1080×1350; 3–7 thành phần, headline ngắn | Record theo `visual-insight.md`, thiết kế và ảnh thực |
| Founder Quote | 1080×1350; ảnh thật, quote ngắn | Record theo `founder-quote.md`, ảnh nguồn và ảnh thực |
| Carousel | 1080×1080; thường 5–10 trang tùy lượng ý | Nội dung từng trang, thiết kế, PNG đúng thứ tự và caption |
| Infographic | 1080×1350; 4–5 khối chính hoặc sơ đồ đơn giản | Thiết kế, nguồn dữ liệu và ảnh thực |
| Comment chain | Post 1–2 câu; thường 3–10 bình luận | Post body, JSON danh sách bình luận và bản đọc toàn chuỗi |
| Reels | 1080×1920; thường 15–60 giây | Thoại, storyboard/timeline, phụ đề, asset/audio và MP4 nếu đã render |
| B-roll | 1080×1920; ngắn theo brief | Hook, timeline, asset/nhạc được phép dùng, caption và MP4 nếu đã render |

Không ép số trang/thời lượng bằng cách thêm nội dung rỗng. Carousel: mỗi trang một ý, thường 20–45 từ/trang, trang đầu cho lý do đọc, trang cuối cho hành động hữu ích. Infographic: số thật cần nguồn; sơ đồ minh họa phải được mô tả đúng là sơ đồ. Comment chain là text package nếu công cụ chưa hỗ trợ tự đăng chuỗi. Reels: đọc thử lời thoại để chọn thời lượng; khi thiếu voice, bàn giao kịch bản hoặc dùng render không thoại đúng yêu cầu. B-roll không có voice trừ khi người dùng đổi format.

Nếu thiếu công cụ tạo ảnh/video, vẫn lưu nội dung/thiết kế/storyboard thật và phần thiếu. Không gọi bản thiết kế là PNG, hoặc timeline là video hoàn chỉnh.

## 6. QA và sửa

Kiểm tra chữ, nguồn, ngôi kể, CTA, asset/quyền dùng; mở ảnh/video thật để kiểm tra dấu tiếng Việt, vùng an toàn, chất lượng và kích thước. Với video, kiểm tra thời lượng, cảnh, audio/subtitle nếu có. Dùng checklist riêng hai style mới.

Lưu kết quả QA và vấn đề còn lại. Script kiểm tra cấu trúc/kích thước không thay việc đánh giá hình ảnh và nội dung. Chỉ ghi PASS phần đã kiểm tra bằng bằng chứng thực. Sửa tạo phiên bản mới; phần duyệt liên quan phải được đánh giá lại khi nội dung/media thay đổi.

## 7. Duyệt và đăng

Duyệt chữ, media và phạm vi đăng là ba thông tin cần lưu; người dùng có thể duyệt cùng một lần. Tôn trọng phạm vi đã được cho phép, không hỏi lại cùng một phê duyệt còn hiệu lực. Trước đăng xác minh bản hiện tại đúng bản được duyệt, đích chính xác và lịch/múi giờ cụ thể.

Công cụ đăng thực có thể dùng khi người dùng đã yêu cầu đăng. Lưu receipt: post/platform ID, permalink nếu có, đích, thời gian, trạng thái tool và danh sách media. Một lịch đã đặt hoặc việc gửi yêu cầu đăng thành công chưa chứng minh bài đã xuất hiện. Nếu chỉ có gói đăng tay, ghi chưa đăng và đưa caption/media thứ tự rõ ràng.

Lỗi đăng → lưu lỗi và điểm có thể tiếp tục, kiểm tra xem bài đã tồn tại trước khi thử lại để tránh trùng. Không xóa bài/ý tưởng khi chuyển bước. Không thu mật khẩu/API key vào hồ sơ content; sử dụng kết nối do 9B quản lý hoặc cơ chế môi trường người dùng tự thiết lập.

## 8. Đo lường và học

Đọc KPI thật từ nguồn/kênh hoặc tệp học viên đưa. Ghi kỳ đo, định nghĩa, múi giờ và dữ liệu thiếu. So sánh trong cùng mục tiêu, kênh và kỳ phù hợp. Đưa đề xuất thử nghiệm nhỏ cho hook/format/CTA dựa trên bằng chứng; không suy ra quan hệ nhân quả từ một bài.

## Lưu bền và chạy tiếp

`scripts/content.cjs` là nơi lưu hồ sơ/bài/ý tưởng/template/approval/receipt/KPI của gói. Dùng schema và trạng thái script thực; không tự tạo một kho song song chỉ tồn tại trong chat. Mỗi bài phải liên kết brief, nguồn, file, phiên bản, QA, duyệt và kết quả đăng để đọc lại được sau khi mở chat mới.

Các mốc cần phân biệt trong hồ sơ là: ý tưởng; chữ nháp; chữ đã duyệt; media đang làm; media đã tạo; QA; media đã duyệt; được phép đăng; đã lên lịch; đã đăng có receipt; có lỗi. Tên trạng thái chính xác theo trợ giúp của script. Không nâng mốc chỉ vì AI đã viết câu “hoàn tất”.

Khi chat mới hoặc `/tudong` chạy tiếp, đọc cấu hình và manifest trước, xác định bước còn thiếu rồi thực hiện bước đó. Giữ ID, nguồn, media và lịch sử; không viết lại từ đầu khi kết quả hiện tại còn dùng được.
