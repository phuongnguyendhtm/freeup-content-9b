# Bắt đầu dùng hệ thống content

1. Mở agent bạn muốn dùng và gửi:

   > Cài hệ thống content từ https://github.com/phuongnguyendhtm/freeup-content-9b cho agent tôi đang dùng. Tự tải/cài đúng nền tảng, giữ dữ liệu cũ, dùng hồ sơ doanh nghiệp đã có và Sheet mẫu đóng gói trong skill.

2. Agent thực hiện tải/cài. Với 9BizClaw, khi agent báo đã khởi chạy, kết thúc lượt đó; mở lượt mới yêu cầu “Kiểm tra kết quả cài vừa rồi”. Chờ xác nhận cài xong trước bước tiếp. Nếu thiếu quyền/công cụ, agent nêu đúng phần cần bổ sung.
3. Gửi `/thietlapcontent`. Hệ thống dùng lại hồ sơ đã có, chỉ hỏi phần thiếu; dùng Sheet riêng đã kết nối hoặc nhân bản Sheet mẫu chuẩn vào Drive của bạn. Chưa kết nối Google thì kết nối tài khoản của bạn qua ứng dụng đang dùng.

Không cần tải ZIP hoặc có thư mục content cũ. Claude web/Cowork chỉ tự cài khi phiên có công cụ cài skill được hỗ trợ; nếu chỉ có chat, agent nêu bước cài còn thiếu.

Sau đó gửi `/vietbai [chủ đề]`, `/thietkeanh Carousel: [chủ đề]`, hoặc “Làm content 7 ngày, dùng hồ sơ đã có, đề xuất ý tưởng để tôi duyệt trước”. `/xemketqua` xem các bài đã tạo. Duyệt ý tưởng cho phép sản xuất; duyệt thành phẩm đúng bản/kênh/thời gian mới cho phép đăng.

Sheet giữ 7 tab của mẫu. Agent không tự chọn bố cục khác. Tự động theo trạng thái/định kỳ cần kết nối và cơ chế nền đã kiểm chứng, không chỉ cài skill là có.
