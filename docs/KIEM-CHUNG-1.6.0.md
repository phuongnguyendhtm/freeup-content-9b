# Kiểm chứng bản 1.6.0

Ngày 20/10/2026, trên Windows, đã chạy **52 kiểm tra qua** với kho/agent giả lập độc lập:

- 9 kiểm tra installer đa nền tảng, đường dẫn có dấu/khoảng trắng, cài lại/nâng cấp, giữ hồ sơ, từ chối sửa riêng, schema/binding Sheet và downloader cố định commit/kiểm hash.
- 17 kiểm tra adapter native: cài mới, inventory, receipt, cài lại/nâng cấp, policy từ chối, checksum và timeout có giới hạn.
- 14 kiểm tra worker cài 9B: chờ đúng trạng thái rảnh, giao việc sang lượt mới, nhiều agent, khóa và từ chối native.
- 12 kiểm tra kho content: hồ sơ thiếu, ý tưởng, tệp thành phẩm, phiên bản, duyệt và phạm vi đăng.

Không cài đè môi trường vận hành của giảng viên trong lượt kiểm này; không đăng bài hay sửa Sheet nguồn. Schema Sheet lấy từ metadata/header/công thức đọc thật của workbook nguồn ngày 20/10/2026. Các kiểm tra Codex/Claude xác minh tệp và runtime trên filesystem fixture; chưa thay thế kiểm inventory trên từng máy học viên, hay cài thực trên macOS/Linux. OpenClaw/9B cần CLI native hỗ trợ contract đang dùng; runtime từ chối thì dừng đúng lỗi.

Chạy lại bằng Node 20+:

```text
node --test tests/install.test.cjs
node package/bootstrap-smoke.cjs --output <thu-muc-kiem-thu>
node package/install-job-smoke.cjs --output <thu-muc-kiem-thu>
node package/skills/freeup-content-system/scripts/system-smoke.cjs --project <thu-muc-kiem-thu>
```

Trong môi trường sandbox Windows có hạn chế rename ở thư mục temp, đặt FREEUP_TEST_DIR vào thư mục kiểm thử được phép trước khi chạy bộ đầu tiên.
