# Cùng quy trình, công cụ theo host hiện tại

Skill dùng trên 9BizClaw, OpenClaw, Codex local và Claude Code. `{baseDir}` trong các hướng dẫn là thư mục thực chứa SKILL.md đang đọc; lấy từ host và thay trước khi gọi công cụ. Đường dẫn tương đối của alias trỏ tới conductor cùng thư mục skills. Không cần Antigravity hoặc thư mục của người tạo.

- Runtime project ở `runtime.json` của conductor; kho nằm ngoài thư mục skill, được giữ qua nâng cấp. Chạy Node 20+ có trên máy; 9B ưu tiên Node đi kèm runtime. Không đoán đường dẫn `D:\...` của giảng viên.
- Chỉ gọi công cụ được phiên hiện tại cung cấp. Tên `company_media_generate`, business documents, connected-apps và native cron trong reference là nhánh 9B khi có; trên Claude/Codex dùng tool tương đương đã kết nối. Không giả có tool 9B ở host khác.
- Hồ sơ: đọc file/tài liệu/ngữ cảnh của đúng doanh nghiệp, chỉ hỏi phần thiếu. Bước đọc managed onboarding USER.md chỉ áp dụng 9B, không tạo/sửa USER.md trên host khác.
- Media: dùng công cụ sinh ảnh có thực, hoặc renderer local và dependencies trong conductor. Không coi tệp JSON/HTML là PNG/MP4 đã render. Kiểm file và doctor trước khi báo khả năng.
- Định kỳ: chỉ tạo bằng lịch nền mà host hỗ trợ, theo yêu cầu người dùng; kiểm job thực. Không coi cài skill hoặc một cột trạng thái là đã bật tự động. Khi thiếu cơ chế nền, chạy theo lệnh trong chat.
- Gói kết thúc ở duyệt và xuất thành phẩm local; người dùng tự đăng. Không cần kết nối Google hoặc Facebook.

Lệnh `/vietbai`, `/thietkeanh`... là skill command khi host có hỗ trợ; nếu UI không nhận dấu `/`, dùng câu tiếng Việt tương đương. Claude web/Cowork cần cơ chế cài skill của chính host, không suy ra từ thư mục Claude Code.
