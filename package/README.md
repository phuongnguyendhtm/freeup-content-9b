# FREEUP Content 9B — bản học viên 1.5.1

Tự tạo bài viết, ảnh và video theo hồ sơ doanh nghiệp của bạn. Có **8 skill: 1 điều phối + 7 nhóm chức năng**, cùng các nhánh nội dung/thiết kế bên trong. Bạn dùng lệnh hoặc nhắn câu bình thường; AI phối hợp các nhóm, không cần bạn gọi từng bước.

## Cài trên Windows hoặc Mac
1. [Tải ZIP 1.5.1](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.5.1.zip). Nhấp phải ZIP, chọn **Extract All / Giải nén tất cả**, mở thư mục đã giải nén.
2. Giữ 9BizClaw v3 đã khởi tạo đang mở, kết thúc các lượt chat đang chạy. Windows mở **CAI-DAT-9B.cmd**; Mac mở **CAI-DAT-MAC.command**. Không mở tệp cài trong cửa sổ xem ZIP. Nhấn Enter nếu cài mới, nhập CO nếu nâng bản đã cài. Chờ báo **Đã cài và xác minh**.
3. Mở chat mới với đúng trợ lý vừa cài, gửi **/thietlapcontent** hoặc “Kiểm tra hồ sơ doanh nghiệp tôi đã cung cấp và thiết lập content. Chỉ hỏi phần còn thiếu.”

Máy học viên không cần bản Antigravity/thư mục giảng viên. Bộ cài tìm runtime trên máy; mỗi doanh nghiệp giữ hồ sơ/nguồn/ảnh/giọng/màu/tài khoản riêng. Internet cần cho tải gói và công cụ lần đầu.


## Bảng chọn bằng ảnh
Nhắn **hệ thống content** để 9B trả ảnh bảng chọn. Trả lời số 1–9 kèm chủ đề; chọn 0 để lập lịch nhiều định dạng. 9B trả ảnh hướng dẫn của dạng đã chọn và lệnh mẫu có thể sửa. Chọn bằng số hoặc tên trong chat; ảnh không phải nút bấm thực thi.

Ví dụ: “Chọn 3. Dùng ảnh tôi đã tải, quote ‘Bắt đầu nhỏ, làm đều mỗi ngày’, màu thương hiệu, tỉ lệ 4:5.” Hoặc “Chọn 5. Làm carousel 6 trang về [chủ đề], dùng màu đã lưu.” Chỉ hỏi thông tin/ảnh còn thiếu, dùng hồ sơ đã có.

Ảnh hướng dẫn lưu tại **freeup-content-data/help/content-menu/1.5.1/**; thành phẩm vẫn ở media_output. Ảnh AI trong bảng chỉ minh họa, không thay ảnh cá nhân học viên. Nếu công cụ gửi ảnh không được cấp quyền, 9B trả danh sách/lệnh và đường dẫn thật; không tự sửa quyền 9B.

## 7 nhóm lệnh
| Lệnh | Bạn muốn làm gì? |
|---|---|
| `/thietlapcontent` | Đọc hồ sơ doanh nghiệp đã có, bổ sung phần thiếu, quản lý thương hiệu, ảnh và kết nối kênh. |
| `/lapkehoach` | Chọn nhiều nguồn chuyên gia theo ngành, tìm ý tưởng, lập và duyệt lịch sản xuất, thiết lập theo dõi định kỳ. |
| `/vietbai` | Viết bài, viết từ ý tưởng/bài mẫu, làm chuỗi bình luận hoặc điều phối tạo đầy đủ chữ và media khi được yêu cầu. |
| `/thietkeanh` | Tạo ảnh đơn, ảnh minh họa insight, ảnh cá nhân kèm câu quan điểm, carousel, infographic và quản lý mẫu thiết kế. |
| `/taovideo` | Tạo video có lời thoại, Reels hoặc video cảnh minh họa không thoại, kèm kịch bản, phụ đề và tệp video khi có công cụ. |
| `/duyetvadang` | Ghi duyệt đúng bản chữ/ảnh/video, phạm vi kênh và thời gian; đăng hoặc hẹn đăng bằng kết nối thật. |
| `/xemketqua` | Xem bài/ảnh/video, mở thư mục, đọc số liệu hiệu quả và đồng bộ bảng khi được yêu cầu. |

Một nhóm có nhiều nhánh. Ví dụ /thietkeanh hiểu “ảnh minh họa insight”, “ảnh tôi kèm câu quan điểm”, “carousel” hoặc “infographic”. Các kiểu ảnh không bị gộp thành một kiểu; mỗi nhánh vẫn có hướng dẫn và tiêu chí kiểm riêng. /vietbai được giữ nguyên.

## Quy trình làm việc tự động
**Thiết lập → tìm ý tưởng → đề xuất lịch → bạn duyệt lịch → AI tạo chữ và ảnh/video → bạn duyệt thành phẩm → đăng → xem kết quả.**

Để bắt đầu, nhắn:

> Làm content 7 ngày cho doanh nghiệp tôi. Dùng hồ sơ đã có, chọn nhiều nguồn chuyên gia phù hợp ngành và đề xuất định dạng cho từng bài. Cho tôi duyệt lịch trước; sau khi tôi duyệt, tự làm chữ và ảnh/video rồi chờ tôi duyệt thành phẩm trước khi đăng.

Hoặc dùng /lapkehoach với cùng yêu cầu. Khi lịch có ID/bản, nhắn “Tôi duyệt lịch [ID] bản [số bản]. Tự làm bài và ảnh/video, cho tôi xem để duyệt trước khi đăng.” 9B lưu hàng đợi và thực hiện sản xuất đã được phép; không cần gọi từng skill.

Duyệt lịch chỉ cho phép sản xuất. Duyệt thành phẩm/phạm vi kênh và giờ mới cho phép đăng. Khi bạn đã duyệt đúng bản và yêu cầu đủ rõ, hệ thống tiếp tục trong quyền đó; không hỏi lại cùng việc.

## Chạy định kỳ và nhiều nguồn
Bạn đưa nhiều tên/link chuyên gia hoặc giao 9B tìm và chọn theo ngành, khách hàng, thị trường và mục tiêu doanh nghiệp. Nguồn có bật/tắt và được quét luân phiên. Gói cài mới chưa chọn sẵn ngành hay chuyên gia. Nghiên cứu để xây góc nhìn riêng có nguồn; câu chuyện, ảnh và thành tích phải thuộc doanh nghiệp bạn hoặc được ghi đúng là ví dụ.

Nhắn “Mỗi ngày lúc 7h tìm ý tưởng; thứ Sáu lúc 16h đề xuất lịch tuần sau. Tiếp tục các bài của lịch đã duyệt, chờ tôi duyệt thành phẩm rồi đăng.” /lapkehoach với cùng câu cũng được. 9B phải tạo lịch native thật và kiểm job/run history; máy/Gateway cần hoạt động, không ngủ. Thiếu kết nối thì báo phần chưa bật.

## Xem thành phẩm, sửa màu hoặc kiểu ảnh
Bài/ảnh/video lưu vào **freeup-content-data/media_output/ngày/ID-bài/** trên máy chạy 9B. Nhắn “Cho tôi xem các bài vừa làm” hoặc /xemketqua. Nhắn “Mở thư mục bài [ID]” hoặc /xemketqua Mở thư mục bài [ID]. Điện thoại xem qua kênh chat đã kết nối hỗ trợ gửi tệp.

Nhắn “Dùng màu xanh #123456 và màu vàng #FFD700 cho thương hiệu tôi” hoặc “Ưu tiên carousel khi hướng dẫn nhiều bước”. Hệ thống lưu cấu hình riêng, không sửa skill chung. Sửa một bài chỉ ảnh hưởng bài đó; yêu cầu “từ nay” mới lưu ưu tiên lâu dài.

## Cài qua chat và nâng bản
[Đọc câu lệnh cài vào chat](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/CAI-DAT-9B.txt) · [Hướng dẫn cài nâng cao](INSTALLER.md). Nếu chat bị chặn công cụ quản trị, cài từ tệp ngoài chat là luồng thủ công của gói, vẫn tuân theo native policy. Gộp skill chưa giải quyết chính sách từ chối cài.

Cài mới có 8 skill. Nâng máy từng cài bản cũ giữ dữ liệu và shortcut cũ để tương thích, nên máy đó có thể còn nhiều tên cũ trong danh sách; gói mới không cài thêm 33 shortcut. Không tự xóa skill hoặc sửa riêng của học viên. Dùng 7 lệnh nhóm từ bản này hoặc câu bình thường.

## Kiểm chứng
Gói và các quy trình lưu/duyệt/hàng đợi được kiểm bằng fixture độc lập. Chưa xác nhận cài bản này trực tiếp trên máy học viên hoặc Mac. Nguồn thực, lịch nền, tạo ảnh/video AI và tài khoản đăng cần công cụ/kết nối thật trên máy; cài skill chưa tự bật các kết nối đó. Chỉ báo cài xong khi native inventory đủ 8 skill của gói eligible, kho và công cụ media đã được xác minh.

Menu 1.5.1 đã có logo và linh vật FREEUP. Nhận diện menu không thay màu/ảnh của doanh nghiệp trong bài thật.
