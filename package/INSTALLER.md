# Hướng dẫn bộ cài cho 9B

Đường đi sử dụng: **ZIP đính kèm chat → giải nén an toàn → bootstrap → native skills install từng thư mục**. ZIP upload trong chat là file đầu vào, không phải archive cài qua Skills Upload. Native CLI nhận thư mục có SKILL.md, không nhận ZIP. Nếu policy native từ chối, không thử copy trực tiếp hay đổi policy để cài.

Chạy bằng Node của runtime 9bizclaw đang hoạt động. CLI:

```text
node bootstrap.cjs --plan
node bootstrap.cjs --plan --agent <id>
node bootstrap.cjs --apply --agent <id> --install-deps
```

Nếu nâng bản cũ của cùng gói đã được học viên cho phép, kiểm receipt `freeup-gift-origin.json` với `package_id: freeup-content-student-gift` và kiểm quyền sở hữu/hash qua bộ cài. Dùng `--plan --upgrade`, đọc kế hoạch rồi `--apply --upgrade --install-deps` với cùng agent. Giữ kho `freeup-content-data` ngoài skill: hồ sơ, bài, ảnh và ý tưởng không bị thay bằng dữ liệu mặc định. Không dùng --upgrade để vượt policy-denied, xung đột skill khác hoặc file riêng chưa được quản lý. Khi bắt đầu từ máy chưa cài gói, dùng lệnh cài thông thường ở trên.

Tuỳ chọn: `--install-root <runtime-root>`, `--state-dir <state-dir>`, `--cli <native-openclaw.mjs>`, `--workspace <expected-workspace>`, `--upgrade`. `--workspace` là kiểm tra workspace do native xác nhận, không phải tạo một workspace tuỳ ý. Dùng --state-dir/--cli cho runtime custom hoặc fixture kiểm thử; không dùng để lách chính sách của phiên.

Manifest là nguồn tên/thư mục skill. Cài conductor và 30 skill lệnh ở cùng cấp vì native discovery ngừng đọc sâu khi đã gặp một SKILL.md. Tên skill lệnh bản 1.1 dùng tiếng Việt không dấu, không có gạch nối hoặc gạch dưới: `/caidat`, `/vietbai`, `/minhhoa`, `/anhchu`, `/boanh`, `/tudong`, `/xem`, `/mothumuc`… Không ghi AGENTS/SOUL/USER để giả lệnh.

Bộ cài đọc inventory bằng native CLI của agent được chọn, nhận workspaceDir. Trước cài kiểm name/folder conflict; skill không thuộc gói thì dừng. Nếu allowlist hạn chế, chỉ bổ sung agent được chọn, không đổi các agent khác hoặc defaults. Cài lại cùng phiên bản idempotent; cùng gói khác phiên bản cần --upgrade. Native install thất bại phải giữ báo lỗi và kết quả từng skill, không báo đã cài tất cả.

Sau cài, runtime.json của conductor dùng đường dẫn project tương đối; helper init tạo database/brand/media_output còn thiếu và giữ dữ liệu hiện có. Kho `freeup-content-data` nằm ngoài skill để nâng cấp không mất dữ liệu. Không copy project mẫu đã điền thương hiệu. Dependency install dùng package-lock chính gói, tải Chrome/FFmpeg lần đầu và lưu trong skill; Internet cần cho bước này. Renderer viết vào kho học viên.

Tiếp tục `/caidat` bằng kiểm tra hồ sơ có sẵn trước: cấu hình riêng, thông tin học viên đã cung cấp, tài liệu truy cập được và hồ sơ doanh nghiệp native khi có công cụ. Chỉ hỏi mục bắt buộc còn thiếu hoặc mâu thuẫn. Không yêu cầu nhập lại một hồ sơ đầy đủ. Bản 1.1 vẫn hiểu lệnh chat cũ theo bảng tương thích trong references/commands.md; các tên ngắn là lệnh native của gói mới.

Thành phẩm lưu cục bộ theo ngày/ID bài trong media_output. `/xem` đọc tệp thật và gửi qua công cụ đính kèm khả dụng; `/mothumuc` mở thư mục trên máy chạy 9B. Không mặc định đường dẫn này mở được trên điện thoại. Việc xem trên điện thoại cần kênh đã kết nối hỗ trợ gửi tệp và kết quả gửi thành công.

Để kiểm chứng logic helper: `node <conductor>/scripts/system-smoke.cjs --project <thu-muc-kiem-thu-moi>`. Để kiểm renderer sau cài dependencies: `node <conductor>/scripts/render-smoke.cjs --project <thu-muc-kiem-thu-moi>`. Đây là fixture tổng hợp, không đăng/kết nối tài khoản. Không trộn fixture với kho content thật.

Nếu toolset của phiên không có read/exec hoặc không được đọc ZIP, báo đúng capability còn thiếu. Có thể để học viên giải nén bằng chức năng chuẩn rồi cung cấp folder; policy-denied native install cần quản trị viên xử lý, không tự sửa config bảo mật. Khi công cụ tạo ảnh/giọng đọc/đăng bài chưa có, tiếp tục phần content/render cơ sở và xuất file thật.

Kiểm chứng đã có: bản 1.0 cài native đầy đủ 30 skill trên workspace trống, cài lại giữ dữ liệu, cùng kiểm renderer/dependencies. Bản 1.1 cập nhật manifest 31 skill/30 lệnh và đã qua kiểm tra cấu trúc/tên lệnh, 33 kiểm tra hồ sơ và 12 kiểm tra helper hệ thống. Chưa chạy lại toàn bộ lượt cài native 31 skill cho bản 1.1; bộ cài đọc manifest động và vẫn kiểm inventory/eligible trên máy học viên trước báo hoàn tất.
