# FREEUP Content — bản dùng trong chat · 1.7.0

Học viên gửi cho agent trên 9BizClaw, OpenClaw, Claude Code hoặc Codex:

```text
Cài hệ thống content từ https://github.com/phuongnguyendhtm/freeup-content-9b cho agent tôi đang dùng. Tự tải và cài đúng nền tảng, giữ dữ liệu đã có. Dùng bản làm việc trong chat và lưu trên máy, không kết nối Google Sheets, không đăng Facebook tự động. Đọc hồ sơ doanh nghiệp sẵn có và chỉ hỏi phần thiếu.
```

Agent tự cài, không cần tải ZIP hoặc thư mục Antigravity. Dành cho agent: đọc [INSTALL.md](INSTALL.md), chạy install.cjs cho đúng host.

## Cách sử dụng

1. /thietlapcontent: dùng hồ sơ doanh nghiệp đã có, chỉ bổ sung phần thiếu.
2. /lapkehoach: tìm ý tưởng hoặc gửi chủ đề/link của bạn.
3. Nhắn “Duyệt ý [ID], viết bài và làm ảnh” hoặc /vietbai kèm yêu cầu: bắt đầu ngay.
4. /thietkeanh hoặc /taovideo khi cần; xem và yêu cầu sửa ngay trong chat.
5. /duyetbai: chốt đúng bản thành phẩm để xuất file.
6. /xemketqua hoặc /mothumuc: lấy caption, ảnh/video và tự đăng.

Lệnh /vietbai được giữ nguyên. Không kết nối Google Sheets, không Apps Script, không skill đăng/hẹn đăng Facebook. Đọc nguồn Facebook/Instagram qua Apify là chức năng nghiên cứu riêng, chỉ cần khi bạn dùng nguồn đó.

Dữ liệu nằm trong kho freeup-content-data ngoài skill. Mỗi bài có thư mục trong media_output với caption.txt, record.json, ảnh/video thật và index.html. Máy tính mở folder trực tiếp; điện thoại xem qua file/kênh chat được host hỗ trợ, đường dẫn ổ đĩa không tự truy cập từ điện thoại.

Có hai luồng nguồn: chữ + ảnh; video được chọn → bản chép lời → bản viết lại theo góc riêng. Giữ bản gốc riêng với AI. Công cụ ảnh/video/chép lời chỉ báo sẵn sàng khi được kiểm trên máy; cài skill không tự cung cấp AI hay tài khoản dịch vụ.

Lịch nghiên cứu/báo cáo dùng lịch native khi người dùng yêu cầu, lưu local và giao trong chat; không tự áp lịch của giảng viên lên máy học viên. Dữ liệu cũ được giữ, skill đăng của gói cũ được đưa ra ngoài thư mục đang nạp khi nâng cấp hợp lệ.

[Hướng dẫn học viên](HUONG-DAN-HOC-VIEN.md) · [Cài đặt](INSTALL.md)
