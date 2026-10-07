# Bộ cài content 1.4.1 cho 9B

Đường đi: ZIP tải/đính kèm → kiểm hash và giải nén an toàn → install-job → chờ gateway rảnh → bootstrap → native skills install từng thư mục. Không cài/thay cấu hình ngay trong lượt model đang xử lý yêu cầu cài. Không đưa ZIP cho Skills Upload hoặc skills install.

## Giao việc từ chat

Chạy bằng Node của 9B: `node install-job.cjs launch --agent <id> --install-deps --upgrade`. launch kiểm checksum toàn bộ gói, runtime/agent và tạo job ngoài thư mục gói. Trả job_file/log_file rồi kết thúc lượt chat ngay, không poll/sleep/gọi /thietlapcontent trong cùng lượt. --upgrade cần quyền nâng cùng package đã xác minh, không vượt ownership hoặc policy.

Worker có thời gian bàn giao, rồi kiểm gateway.restart.preflight hai lần liên tiếp. Chỉ bắt đầu khi safe=true, counts hợp lệ và không có công việc đang chạy. Busy hoặc Gateway tạm chưa phản hồi thì chờ có giới hạn; thiếu trạng thái an toàn, runtime không hỗ trợ preflight hoặc bị từ chối quyền truy cập thì dừng trước khi cài. Đây là kiểm tra trước khi cài, không phải khóa ngăn người dùng mở lượt khác; trong lúc cài hãy để 9B rảnh. Không dùng restart/skipDeferral/đổi policy.

Lượt chat mới kiểm: `node install-job.cjs status --file <job_file>`. completed mới chứng minh cài xong; waiting/running chưa hoàn tất. Đọc log/report khi failed. Bộ cài giữ báo lỗi và không biến lỗi policy thành thành công.

## Cài từ cửa sổ ngoài chat

Trên Windows mở CAI-DAT-9B.cmd; trên macOS mở CAI-DAT-MAC.command sau khi giải nén nguyên gói. Các tệp tìm Node/runtime của 9B trên máy học viên và chạy `node install-job.cjs run --select-agent --install-deps`; chọn nâng bản cũ nếu có yêu cầu. Bản Mac đọc install-root.json trong Application Support khi có; nếu không có Node hoặc runtime thì báo lỗi, không đoán đích. Có thể chỉ định --install-root, --agent cho bản cài tùy chỉnh. Không hạ ExecutionPolicy. Root install-from-github.ps1 dành cho Windows, mặc định chỉ lập kế hoạch; -Apply dùng job run chờ gateway rảnh.

## Native installer và dữ liệu

bootstrap --plan là kiểm tra chỉ đọc. bootstrap --apply là API kỹ thuật cho worker sau idle gate, không phải đường cài trực tiếp trong chat. Manifest liệt kê 8 skill cùng cấp: điều phối và 7 nhóm /thietlapcontent, /lapkehoach, /vietbai, /thietkeanh, /taovideo, /duyetvadang, /xemketqua. Không ghi AGENTS/SOUL/USER để giả lệnh.

Runtime/agent/workspace lấy từ native CLI. Chỉ thêm allowlist cho agent đích, giữ defaults và agent khác. Receipt freeup-gift-origin.json xác minh cùng package_id freeup-content-student-gift và hash trước nâng. Foreign/edited skills bị từ chối. Cài lại cùng bản giữ dữ liệu. Chỉ timeout native skill install được kiểm lại trạng thái và retry tối đa một lần khi ownership khớp; policy denial không retry.

Kho freeup-content-data ngoài skill, init chỉ tạo phần thiếu. Hồ sơ, bài, ý tưởng, ảnh không bị thay khi nâng. npm ci dùng package-lock của conductor, tải Chrome/FFmpeg riêng; không phụ thuộc node_modules hay cache của bộ Antigravity. completed cần inventory 8 skill eligible, kho thực và kiểm dependencies khi yêu cầu cài media. Không báo thành công chỉ vì đã tạo job.

/thietlapcontent trong lượt mới đọc hồ sơ/tài liệu/native business data có quyền truy cập trước; chỉ hỏi phần bắt buộc thiếu/mâu thuẫn. Không dùng thông tin giảng viên hoặc buộc nhập lại hồ sơ đủ. Thành phẩm lưu theo ngày/ID; /xemketqua gửi tệp thật khi công cụ cho phép, /xemketqua Mở thư mục: mở trên máy chạy 9B. Điện thoại cần kênh đã kết nối và receipt gửi tệp thực.

## Kiểm chứng

Bản 1.1 đã cài native đủ 31 skill trên 9BizClaw v3 / OpenClaw 2026.8.1 và kiểm công cụ Chrome/FFmpeg. Bản 1.2 thay cơ chế khởi chạy cài đặt; kiểm bằng runtime mô phỏng độc lập, kiểm cài lại/nâng cấp/giữ dữ liệu, hồ sơ và helper. Chưa thực hiện lượt cài native mới toàn bộ bản 1.2 trên máy học viên khác. Mỗi máy vẫn phải đạt inventory 8 skill eligible và doctor trước khi báo cài hoàn tất.

Chạy install-job-smoke.cjs, bootstrap-smoke.cjs và các scripts/profile-smoke.cjs, scripts/system-smoke.cjs trong vùng fixture riêng. Không trộn fixture vào dữ liệu người dùng. Không có API key/tài khoản/kho ảnh giảng viên trong gói.
