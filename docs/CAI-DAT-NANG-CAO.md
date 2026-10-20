# Hướng dẫn cài hiện tại

Từ bản 1.6.0, bắt đầu bằng link GitHub và yêu cầu cài; agent tự tải/cài. Xem [INSTALL.md](../INSTALL.md) cho các nền tảng và kiểm chứng. Không dùng hướng dẫn tải ZIP của bản cũ cho cài mới.

Nếu thiếu Git, agent tải `scripts/download.cjs` bằng công cụ HTTPS có sẵn và chạy bằng Node 20+. Script cố định một commit và tải/kiểm các tệp, không cần học viên giải nén. Không có Node thì dùng Node đi kèm 9B; host khác cần bổ sung runtime trước khi chạy helper.

Khi 9B báo job còn chạy/chờ: kết thúc lượt để worker kiểm trạng thái rảnh. Lượt mới dùng `package/install-job.cjs status --file <job_file>`. Nếu thất bại, đọc log cụ thể; không giữ lượt chat poll liên tục, không sửa policy để chữa lỗi ứng dụng.

Skill có file riêng đã sửa: installer giữ bản đó và báo xung đột. Đối chiếu thay đổi trước khi nâng; không xóa thư mục dữ liệu, không dùng force để ghi đè toàn bộ.

Sheet bắt buộc dùng [reference đóng gói](../package/skills/freeup-content-system/references/google-sheet-template.md). Lỗi quyền nguồn/copy phải báo rõ, không tự tạo bảng thay thế. Bản sao cũ của học viên không được làm sạch lại khi nâng skill.
