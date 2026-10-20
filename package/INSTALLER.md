# Bộ cài native

Cài hiện tại: đọc [INSTALL.md](../INSTALL.md) ở gốc repository; dùng root install.cjs theo nền tảng. Không lấy ZIP cũ để cài bản 1.6.0.

bootstrap.cjs kiểm checksum, inventory, receipt và cài qua native CLI. install-job.cjs đưa thao tác 9B ra ngoài lượt chat đang chạy; sau launch phải kết thúc lượt rồi kiểm status ở lượt mới. Không gọi trực tiếp để thử vượt lỗi/policy.

Codex/Claude Code dùng root installer để đặt đúng thư mục skill và runtime project. Sheet mẫu chuẩn và schema nằm trong conductor; đọc reference trước thiết lập.
