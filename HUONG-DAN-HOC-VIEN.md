# Quà tặng Hệ thống Content cho 9B — bản học viên 1.1

Gói này tạo một hệ thống content riêng trên máy học viên. Máy chỉ cần có **9bizclaw v3 đang dùng được**; không cần bản Antigravity, thư mục của giảng viên, tài khoản giảng viên hay kho ảnh cũ.

## Cài từ GitHub riêng

Mở [FREEUP Content 9B](https://github.com/phuongnguyendhtm/freeup-content-9b) và làm theo cách cài trong chat ở README. Có thể sao chép đoạn sau vào chat 9B của agent muốn dùng:

```text
Đọc https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/CAI-DAT-9B.txt và cài hệ thống content 1.1 cho agent 9B đang dùng. Tôi cho phép cài các skill qua bộ cài native, tải công cụ ảnh/video và nâng phiên bản cũ của cùng gói khi bộ cài xác minh được nguồn gói, giữ hồ sơ và dữ liệu riêng. Sau khi cài và kiểm tra thành công, chạy /caidat, dùng hồ sơ doanh nghiệp đã có và chỉ hỏi phần còn thiếu.
```

Nếu chat không đọc được link, mở [CAI-DAT-9B.txt](./CAI-DAT-9B.txt), sao chép toàn bộ và dán vào chat. Nếu chat không tải được gói, [tải ZIP](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.1.zip), đính kèm ZIP vào chat và dán [câu lệnh cho ZIP đính kèm](./package/CAI-DAT-9B.txt). Dùng tệp đính kèm chat; không chọn ZIP trong màn hình Skills Upload.

Chờ 9B cài qua bộ cài native, tạo kho riêng và kiểm công cụ ảnh/video. Quá trình tải cần Internet. Sau khi kiểm tra thành công, hệ thống thực hiện `/caidat`: dùng lại hồ sơ doanh nghiệp đã có và chỉ hỏi phần còn thiếu.

Nếu phiên 9B không cho đọc ZIP hoặc chạy bộ cài, 9B sẽ nói rõ quyền/năng lực còn thiếu. Có thể dùng [bộ cài PowerShell trên cùng máy](./README.md#cài-bằng-powershell-trên-máy-chạy-9b). Chính sách từ chối cài skill cần được quản trị viên của bạn xử lý; không đổi chính sách bảo mật tự động.

## Bạn nhận được gì

- 30 lệnh chat bằng tên tiếng Việt ngắn, một skill điều phối và kho dữ liệu riêng theo thương hiệu.
- Quy trình: thiết lập → chiến lược 5 trụ cột × 5 góc độ → nghiên cứu/ý tưởng → viết → ảnh/carousel/infographic/comment chain/Reels/B-roll → QA → duyệt → đăng qua công cụ đã kết nối → KPI và cải tiến.
- Hai kiểu mới: **Visual Insight** (một insight, ba concept, hình A–F) và **Founder Quote** (ảnh cá nhân thật, quote ngắn, bố cục P01–P06).
- 18 mẫu nội dung/bố cục cơ sở và cách lưu mẫu riêng của bạn.
- Công cụ xuất PNG và MP4 cục bộ; dữ liệu không phụ thuộc Google Sheets. Có thể dùng Sheets khi bạn đã kết nối.

## Dùng ngay

```text
/caidat
Kiểm tra hồ sơ doanh nghiệp và tài liệu tôi đã cung cấp.
Nếu đủ thì dùng ngay; nếu thiếu thì chỉ hỏi những phần còn thiếu.
```

```text
/tudong Làm content về [chủ đề], gồm một bài Facebook,
một Visual Insight và carousel 5 trang.
Dùng ví dụ giả định nếu chưa có case thật. Tạo thành phẩm và cho tôi xem.
```

```text
/anhchu Dùng ảnh tôi vừa gửi. Chủ đề: [quan điểm].
Chọn quote ngắn, bố cục phù hợp và tạo ảnh 4:5.
```

```text
/xem
```

Các lệnh chính: `/caidat`, `/timy`, `/ytuong`, `/vietlai`, `/vietbai`, `/anh`, `/minhhoa`, `/anhchu`, `/trang`, `/boanh`, `/sodo`, `/binhluan`, `/video`, `/canhphu`, `/anhminh`, `/anhkho`, `/nhanvat`, `/luumau`, `/mau`, `/lich`, `/kenh`, `/bang`, `/duyetchu`, `/duyetanh`, `/duyetdang`, `/dang`, `/tudong`, `/ketqua`, `/xem`, `/mothumuc`.

Nếu menu lệnh chưa hiện, mở chat mới cùng agent hoặc dùng: `/skill freeup-content-system` rồi ghi yêu cầu. Câu tiếng Việt như “Dùng hệ thống content, tạo carousel từ bài này” cũng sử dụng cùng quy trình.

## Kho của bạn và việc kết nối

Bộ cài dùng workspace mà chính 9B xác nhận. Kho lâu dài nằm ở `freeup-content-data` trong workspace đó; gồm thương hiệu, chiến lược, ý tưởng, bài, ảnh đầu vào, thành phẩm và feedback. 9B cho biết đường dẫn thực sau cài. Sao lưu cả kho này để giữ dữ liệu khi chuyển máy. Cài lại cùng phiên bản giữ dữ liệu; nâng cấp chỉ khi bạn yêu cầu.

Câu lệnh cài đặt của bản này cũng cho phép nâng bản cũ của đúng bộ quà tặng đã được xác minh, giữ hồ sơ và thành phẩm của bạn. Hệ thống kiểm nguồn gói trước khi nâng; skill khác hoặc thay đổi riêng chưa được quản lý sẽ được báo rõ để xử lý.

Mỗi bài có thư mục riêng theo cấu trúc `freeup-content-data/media_output/ngày/ID-bài/`. Trong đó lưu nội dung, caption, thông tin bài, các phiên bản ảnh/video và kết quả kiểm tra. Tạo nhiều định dạng từ cùng chủ đề sẽ liên kết bằng ID; không ghi đè bài trước.

Trong thư mục bài có `index.html` để mở chữ và ảnh/video cùng một chỗ trên máy tính, kể cả khi xem ngoại tuyến. Ảnh tạo bằng công cụ doanh nghiệp của 9B được sao chép vào thư mục bài khi công cụ cấp tệp thật. Nếu chưa xuất được tệp, ảnh vẫn xem ở thư viện ảnh của 9B; hệ thống báo rõ thư mục bài hiện chỉ có thông tin tham chiếu, chưa có ảnh để chuyển sang máy khác.

Gõ `/xem` để xem bài mới nhất hoặc `/xem [ID]` để xem một bài cụ thể. 9B đọc tệp thật, đưa nội dung vào chat và gửi ảnh/video dưới dạng tệp đính kèm khi công cụ của phiên hỗ trợ; đồng thời cung cấp đường dẫn thư mục thực. Gõ `/mothumuc` hoặc `/mothumuc [ID]` để mở thư mục thành phẩm trên máy chạy 9B. Có thể yêu cầu `/mothumuc tất cả` để mở kho thành phẩm.

Thư mục nằm trên máy đang chạy 9B. Điện thoại xem được nội dung và ảnh/video khi bạn dùng kênh chat đã kết nối có hỗ trợ gửi tệp, và 9B đã gửi tệp thành công vào kênh đó. Đường dẫn cục bộ trên máy tính không tự mở được trên điện thoại. Hệ thống không tự đưa bài lên một trang công khai hoặc tạo liên kết đám mây.

Ở lần `/caidat` đầu và các lần kiểm tra sau, 9B đọc cấu hình riêng, tài liệu doanh nghiệp đã gửi, thông tin trong phiên và hồ sơ doanh nghiệp native mà nó có quyền đọc. Thông tin đã rõ và còn dùng được sẽ được tái sử dụng; chỉ hỏi các mục bắt buộc còn thiếu hoặc mâu thuẫn. Hồ sơ đủ thì chuyển sang tạo content ngay. Logo, ảnh cá nhân, giọng đọc và kênh đăng được hỏi khi định dạng/bước đang làm cần đến chúng; thiếu những tài nguyên đó không bắt bạn khai lại hồ sơ.

Bạn cung cấp ảnh cá nhân/logo/clip/nhạc được phép dùng. Không có ảnh của giảng viên trong gói. Nếu muốn tạo ảnh AI hoặc tìm stock, 9B cần công cụ native đang hoạt động. Công cụ local vẫn tạo bố cục từ ảnh bạn cung cấp và HTML/SVG do AI thiết kế.

Reels/B-roll local xuất video dọc từ ảnh/clip, phụ đề trên từng cảnh và audio bạn cung cấp. Giọng đọc tự sinh cần công cụ voice đã kết nối; bộ quà tặng không kèm tài khoản voice, avatar hoặc dịch vụ trả phí. Ảnh đứng và cắt cảnh là khả năng cơ sở của renderer; AI có thể tạo thiết kế HTML riêng cho các concept.

Đăng bài cần bạn kết nối tài khoản/kênh của mình qua 9B và yêu cầu đăng cụ thể. Duyệt phần chữ hoặc ảnh chưa cấp quyền đăng. Chỉ dẫn `/duyetdang` ghi bài, kênh, phiên bản và thời gian; hệ thống chỉ lưu trạng thái đã đăng khi có ID/permalink thực. Khi chưa có công cụ đăng, 9B xuất gói nội dung để bạn đăng tay.

## Mức kiểm chứng

Trên Windows với 9bizclaw v3 / OpenClaw 2026.8.1, bản 1.0 đã cài native đủ 30 skill trên workspace trống, cài lại giữ dữ liệu và kiểm xuất ảnh/video bằng dependencies mới. Bản 1.1 đã kiểm cấu trúc 31 skill/30 lệnh, vượt qua 33 kiểm tra hồ sơ và 12 kiểm tra helper hệ thống. Chưa chạy lại toàn bộ lượt cài native 31 skill của bản 1.1; bộ cài sẽ kiểm danh sách skill và khả năng sử dụng trên máy học viên trước báo hoàn tất.

Tài khoản đăng bài, voice và ảnh AI được kiểm khi dùng bước tương ứng, không mặc định đã được cấu hình sẵn.

Trong gói không có `.env`, API key, cookie, account đăng bài, Brand DNA của giảng viên hay đường dẫn tới kho G:. Model của 9B dùng cấu hình sẵn của học viên.

## Thành phần dành cho 9B

`bootstrap.cjs`: phát hiện runtime, lập kế hoạch, cài qua native installer và kiểm kết quả. `distribution-manifest.json`: danh sách 31 skill. `skills/freeup-content-system/`: hướng dẫn, defaults, mẫu và công cụ tự chứa. Các skill cùng cấp cung cấp 30 lệnh. Đọc `INSTALLER.md` khi cần chẩn đoán kỹ thuật.
