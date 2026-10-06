# Quà tặng Hệ thống Content cho 9B — bản học viên 1.3.0

Gói này tạo một hệ thống content riêng trên máy học viên. Máy chỉ cần có **9bizclaw v3 đang dùng được**; không cần bản Antigravity, thư mục của giảng viên, tài khoản giảng viên hay kho ảnh cũ.

## Cài trên Windows bằng một lần mở tệp

1. Mở và khởi tạo 9BizClaw v3 trên máy của bạn; giữ 9B đang mở và dừng các lượt chat đang chạy.
2. Nhấp phải ZIP → **Extract All / Giải nén tất cả**. Mở **thư mục mới được giải nén**, rồi mở **CAI-DAT-9B.cmd** ở trong đó; không mở tệp cài trực tiếp trong cửa sổ xem ZIP. Bộ cài tìm runtime trên máy này, cho chọn agent nếu cần, chờ 9B rảnh rồi cài 34 skill và tải công cụ ảnh/video. Internet cần cho lần tải đầu.
3. Chỉ tiếp tục khi cửa sổ bộ cài báo hoàn tất kiểm tra. Mở **lượt/chat mới cùng agent** trong 9B và gõ **/caidat**. Dữ liệu doanh nghiệp đã có sẽ được dùng lại; chỉ hỏi phần còn thiếu.

Nếu bạn có bản cũ, bộ cài hỏi quyền nâng đúng gói đã được xác minh. Nếu tổ chức từ chối cài skill, giữ lỗi để quản trị viên xử lý theo chính sách của tổ chức.

## Cài trên Mac bằng cửa sổ riêng

1. Mở và khởi tạo 9BizClaw v3. Kết thúc các lượt chat đang chạy, giữ 9B mở.
2. Giải nén ZIP, mở **CAI-DAT-MAC.command** trong thư mục đã giải nén. Nếu macOS yêu cầu xác nhận tệp tải về, dùng **nhấp phải → Open / Mở**. Chỉ mở tệp từ đúng ZIP trên trang Git này.
3. Cài lần đầu thì nhấn Enter ở câu hỏi nâng cấp; nếu đã có bộ quà tặng cũ, nhập **CO** để nâng. Chờ cửa sổ báo **“Da cai va xac minh”**. Sau đó mở chat mới cùng agent vừa cài và gõ **/caidat**.

Nếu tệp `.command` không mở được, mở Terminal tại thư mục đã giải nén và chạy `bash CAI-DAT-MAC.command`. Cách này không cần quyền thực thi của tệp. Bộ cài cần Node 20 trở lên; nó ưu tiên Node đi kèm 9B. Nếu không tìm thấy runtime hoặc Node, giữ nguyên thông báo lỗi để hỗ trợ tìm đúng bản 9B trên máy bạn. Tác vụ cài cũ đã báo `failed` không thể tiếp tục; hãy chạy tệp của bản 1.3.0 để tạo lượt cài mới.

## Cài bằng chat 9B

Đính kèm ZIP vào chat và dán CAI-DAT-9B.txt. 9B khởi chạy bộ cài nền, trả đường dẫn kết quả rồi kết thúc lượt ngay. Bộ cài chờ lượt chat kết thúc mới thay đổi skill/cấu hình. Ở lượt mới, yêu cầu kiểm tra job_file; chỉ khi completed mới dùng /caidat. Không gửi yêu cầu liên tục trong lúc cài. ZIP trong chat là tệp đầu vào, không phải tệp cho màn hình Skills Upload.

Nếu 9B báo prepared model runtime plugin generation was superseded trước khi đọc gói, dùng CAI-DAT-9B.cmd trên Windows hoặc CAI-DAT-MAC.command trên Mac. Lỗi đó thuộc lượt chạy của ứng dụng; mã trong Git chưa chạy nên không thể tự sửa lỗi này từ cùng lượt chat.

## Bạn nhận được gì

- 33 lệnh chat bằng tên tiếng Việt ngắn, một skill điều phối và kho dữ liệu riêng theo thương hiệu.
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

Bản 1.1 đã cài native đủ 31 skill trên 9BizClaw v3 / OpenClaw 2026.8.1 và kiểm công cụ Chrome/FFmpeg. Bản 1.2 thay cơ chế khởi chạy cài đặt; kiểm bằng runtime mô phỏng độc lập, kiểm cài lại/nâng cấp/giữ dữ liệu, hồ sơ và helper. Chưa thực hiện lượt cài native mới toàn bộ bản 1.2 trên máy học viên khác. Mỗi máy vẫn phải đạt inventory 34 skill eligible và doctor trước khi báo cài hoàn tất.

Tài khoản đăng bài, voice và ảnh AI được kiểm khi dùng bước tương ứng, không mặc định đã được cấu hình sẵn.

Trong gói không có `.env`, API key, cookie, account đăng bài, Brand DNA của giảng viên hay đường dẫn tới kho G:. Model của 9B dùng cấu hình sẵn của học viên.

## Thành phần dành cho 9B

`CAI-DAT-9B.cmd`: khởi chạy trên Windows. `CAI-DAT-MAC.command`: khởi chạy trên macOS. `install-job.cjs`: cài nền/chờ 9B rảnh và lưu trạng thái. `bootstrap.cjs`: phát hiện runtime, lập kế hoạch, cài qua native installer và kiểm kết quả. `distribution-manifest.json`: danh sách 34 skill. `skills/freeup-content-system/`: hướng dẫn, defaults, mẫu và công cụ tự chứa. Các skill cùng cấp cung cấp 33 lệnh. Đọc `INSTALLER.md` khi cần chẩn đoán kỹ thuật.

## Nguồn chuyên gia và tự sản xuất sau duyệt lịch

Bản 1.3.0 thêm ba lệnh: **/nguon**, **/duyetlich**, **/theodoi**. Có **33 lệnh tiếng Việt và 1 skill điều phối**. Thông tin doanh nghiệp, nguồn, giọng văn, câu chuyện và ảnh của mỗi học viên được lưu riêng; không cần thư mục Antigravity của giảng viên.

Luồng sử dụng: chọn nguồn → đọc bài/video truy cập được → chọn insight phù hợp khách hàng → đề xuất lịch → bạn duyệt lịch → tự tạo bài và ảnh theo skill hiện có → bạn duyệt thành phẩm → đăng qua kênh đã kết nối → xem số liệu để cải tiến.

Nguồn khởi đầu cho ngành marketing: **Alex Hormozi, Russell Brunson và Dan Koe**. Bạn đổi nguồn/ngành bằng chat. Hệ thống xây bài mới theo góc nhìn riêng, dùng câu chuyện/ảnh bạn cung cấp; nếu chưa có câu chuyện thật thì dùng nhận định hoặc ví dụ giả định được ghi rõ. Có lưu URL và lý do chọn ý tưởng.

**Duyệt lịch cho phép sản xuất bài và ảnh. Thành phẩm vẫn chờ bạn duyệt trước khi đăng.** Sửa lịch sẽ tạo bản mới; chạy lại tiếp tục bài đang làm và giữ bài cũ. Không có quyền đọc một nguồn thì báo nguồn đó chưa đọc được và tiếp tục các nguồn khác.

Gửi lần lượt trong 9B sau khi cài:

```text
/nguon Dùng Alex Hormozi, Russell Brunson và Dan Koe để tìm ý tưởng marketing.
```

```text
/timy Tìm 10 ý tưởng từ các nguồn đã chọn, ưu tiên phù hợp khách hàng của tôi.
```

```text
/lich Đề xuất lịch 7 ngày, gồm bài viết, Visual Insight và Founder Quote khi có ảnh phù hợp.
Tạo lịch có nguồn, Big Idea và giờ dự kiến. Dùng giọng văn, câu chuyện và màu thương hiệu đã lưu.
```

Sau khi xem lịch, thay ID/bản bằng thông tin 9B vừa trả:

```text
/duyetlich [ID lịch] bản [số bản]. Tự làm bài và ảnh, cho tôi xem thành phẩm trước khi đăng.
```

Muốn duy trì định kỳ:

```text
/theodoi Bật quét nguồn mỗi ngày lúc 7h, gửi lịch tuần mới vào thứ Sáu lúc 16h.
Tiếp tục các bài của lịch tôi đã duyệt. Thành phẩm chờ tôi duyệt rồi mới đăng.
Kiểm tra lịch chạy thật và báo rõ phần nào chưa kết nối được.
```

Đổi giờ, tắt theo dõi hoặc thay màu/ảnh bằng lời nói trong chat. /theodoi dùng lịch native của 9B; máy chạy 9B cần bật, Gateway hoạt động và không ngủ. Đường dẫn lưu lịch: freeup-content-data/content-calendar/index.html; bài/ảnh vẫn trong media_output/ngày/ID-bài/. Điện thoại xem/duyệt qua kênh chat đã kết nối và gửi tệp được xác minh.

Các script điều phối đã được kiểm bằng dữ liệu mô phỏng: duyệt đúng bản, chống trùng, khôi phục công việc, chặn thiếu tài nguyên và không tự đăng. Quét nguồn thực, lịch nền/headless, ảnh AI và tài khoản đăng cần kiểm trên máy học viên; cài gói không đồng nghĩa các kết nối đó đã hoạt động.

