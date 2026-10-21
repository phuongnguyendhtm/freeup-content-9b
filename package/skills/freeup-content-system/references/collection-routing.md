# Bộ đọc nguồn theo lựa chọn ngày 21/10/2026

Đọc cùng collection-routing.json trước thu thập nguồn. Đây là lựa chọn nhà cung cấp, không phải bằng chứng kết nối hoặc đã đọc được bài. Học viên dùng tài khoản và quota riêng, không có khóa hay tài khoản của người tạo trong gói. Giữ lựa chọn riêng đã được học viên xác nhận nếu họ đã đổi; không reset khi cập nhật skill.

| Nguồn | Bộ đọc được chọn | Phần cần xác minh |
|---|---|---|
| Facebook | Apify, Actor apify/facebook-posts-scraper | Kết nối ACTIVE, đúng profile/bài công khai, nguyên văn/ảnh/số liệu có thật |
| Instagram | Apify, Actor apify/instagram-post-scraper | Kết nối ACTIVE, đúng tác giả, caption/ảnh carousel và số liệu thật |
| YouTube | YouTube Data API chính thức trong quota miễn phí | Kênh công khai và công cụ có quyền đọc. Danh sách uploads có thể lấy qua channels.list → playlistItems.list → videos.list; cache channel/playlist ID và gộp video ID để tiết kiệm quota |
| TikTok | Công cụ đọc công khai miễn phí thực có hoặc file/link người dùng cung cấp | Chỉ ghi READ khi đã đọc được nội dung. Display API tài khoản đã cấp quyền không phải bộ quét KOL tùy ý; nếu không đọc được thì BLOCKED kèm lý do, không tự gọi Apify/ScrapeCreators cho TikTok |
| Chuyển video thành chữ | Phụ đề truy cập được hoặc Whisper chạy trên máy | Chỉ video được chọn; phải có phụ đề hoặc file âm thanh/video truy cập được. Không tự mua API chép lời hoặc cài mô hình lớn khi chưa kiểm cấu hình/phạm vi |

## Kết nối và chi phí

Trên 9BizClaw/OpenClaw dùng connection manager native, không lấy trạng thái connector của Codex làm bằng chứng. Với Apify: list trước; đã active thì dùng lại, đang chờ thì giữ link cũ, chưa kết nối thì tạo một link add khi người dùng yêu cầu sử dụng. Hiển thị đúng link xác thực trả về. Không hỏi API key trong chat, không lưu key vào Sheet, project công khai hoặc GitHub. Trên host khác dùng kết nối thật của host đó.

Chỉ chạy trong hạn mức Free khi chưa có chấp thuận chi phí khác. 5 USD/tháng của Apify là ngân sách dùng chung, không phải mỗi nền tảng có 5 USD. Kiểm tra gói/balance/mức giá Actor và phí thêm bằng công cụ thực có trước lượt chạy; nếu chưa xác định được ngân sách thì báo chờ kiểm tra, không chạy trả phí dựa vào phỏng đoán. Không nâng gói, nạp tiền hoặc bật tự nạp. Hết quota thì dừng nguồn Apify, báo lý do rõ và tiếp tục các nguồn miễn phí; nguồn lỗi không chặn nguồn sau. Không tự chuyển nhà cung cấp khác khi gặp lỗi.

Lưu run ID, Actor, thời điểm, số kết quả và chi phí thực nếu được trả về. Lấy ít bài mới/nguồn và cache dữ liệu đã đọc; không quét lại cả lịch sử mỗi ca. Giữ giới hạn top 3 tổng cộng của ca đã được chọn. Trước gọi Actor, lấy schema native hiện tại; dùng đúng input của Actor và giới hạn kết quả/chi phí được API hỗ trợ, không suy từ một schema của Actor khác.

Giá được kiểm tra 21/10/2026: Free credit 5 USD/tháng ở https://apify.com/pricing ; mục giá Free trong https://apify.com/apify/instagram-post-scraper công bố 2,70 USD/1.000 kết quả; https://apify.com/apify/facebook-posts-scraper công bố 5 USD/1.000 bài, thêm 2 USD/1.000 khi dùng bộ lọc ngày. Kiểm tra lại ở lượt dùng thực; không lấy giá “from” dành cho tier khác để hứa quota Free. Credit không đồng nghĩa số lượt chạy, và việc đọc lại kết quả hoặc tùy chọn thêm có thể có phí.

## Video và bản viết lại

Giữ caption bài đăng, bản chép lời, bản dịch (nếu có) và bản AI viết lại thành các trường/file riêng. Không nhận title/description/thumbnail là đã chép lời video. API tải phụ đề YouTube chính thức cần quyền chỉnh sửa video; thiếu quyền không được nhận đã tải được toàn bộ phụ đề KOL. Tài liệu: https://developers.google.com/youtube/data/reference/rest/v3/captions/download .

Whisper mã nguồn mở https://github.com/openai/whisper chạy trên máy, không tính phí API nhận dạng; vẫn cần tài nguyên máy và nguồn audio thực. Không mặc định Whisper đã được cài. Bản chép tự động phải ghi công cụ/thời điểm, mốc thời gian và chỗ nghe chưa rõ. AI viết lại dùng hồ sơ, giọng và góc nhìn người dùng đã cung cấp; không biến câu chuyện của KOL thành trải nghiệm cá nhân giả. Việc chọn nhà cung cấp không tự tạo tab/video worker hoặc bật sản xuất/đăng bài chưa được thiết lập.
