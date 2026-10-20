# FREEUP Content 1.6.1 — payload 8 skill

Học viên gửi [link GitHub](https://github.com/phuongnguyendhtm/freeup-content-9b) và yêu cầu cài cho agent. Agent đọc [INSTALL.md](../INSTALL.md) rồi chạy installer theo host. Không yêu cầu tải/giải nén ZIP.

Nguồn skill ở skills/. Conductor có reference google-sheet-template.md/.json bắt buộc dùng; Sheet riêng phải nhân bản mẫu giảng viên, không tự dựng bảng. Kho doanh nghiệp được lưu ngoài skill và giữ khi nâng.

bootstrap.cjs và install-job.cjs là adapter native OpenClaw/9BizClaw. Không dùng chép thư mục để vượt native install policy. Root install.cjs hỗ trợ thêm Codex local/Claude Code. Hướng dẫn chi tiết và giới hạn host nằm tại INSTALL.md ở gốc repository.
