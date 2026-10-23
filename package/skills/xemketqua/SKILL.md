---
name: xemketqua
description: "Xem bài/ảnh/video, mở thư mục, đọc số liệu hiệu quả và đồng bộ bảng khi được yêu cầu."
user-invocable: true
---

# /xemketqua

Đọc hệ thống cùng cấp tại `{baseDir}/../freeup-content-system/SKILL.md`, rồi references/commands.md và local-workflow.md trong hệ thống. Dùng chung project từ runtime.json, không tạo kho song song.

Các nhánh: /xem — Xem bài, caption, ảnh hoặc video thật đã tạo; /mothumuc — Mở thư mục chứa thành phẩm trên máy đang chạy 9B; /ketqua — Phân tích số liệu content thật và lưu bài học. Câu tiếng Việt bình thường dùng cùng luồng.

Đọc hồ sơ doanh nghiệp đã có, chỉ hỏi phần thiếu. Lưu bài/nguồn/ảnh/video trên máy và trả bản xem trong chat. Duyệt bài chỉ ghi nhận đúng phiên bản để xuất thành phẩm; người dùng tự đăng. Không kết nối/đồng bộ Google Sheets, không gọi công cụ đăng Facebook hoặc hẹn đăng. Khi cần công cụ còn thiếu, báo rõ và giữ phần đã làm.
