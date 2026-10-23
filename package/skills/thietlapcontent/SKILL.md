---
name: thietlapcontent
description: "Đọc hồ sơ doanh nghiệp đã có, bổ sung phần thiếu, quản lý thương hiệu, ảnh và tài nguyên riêng."
user-invocable: true
---

# /thietlapcontent

Đọc hệ thống cùng cấp tại `{baseDir}/../freeup-content-system/SKILL.md`, rồi references/commands.md và local-workflow.md trong hệ thống. Dùng chung project từ runtime.json, không tạo kho song song.

Các nhánh: /caidat — Kiểm tra hồ sơ doanh nghiệp đã có và chỉ hỏi phần còn thiếu; /anhminh — Nhập và chọn ảnh cá nhân học viên cho content; /anhkho — Tìm và ghi nguồn ảnh minh họa được phép dùng; /nhanvat — Tìm ảnh tham khảo nhân vật với nguồn và quyền dùng. Câu tiếng Việt bình thường dùng cùng luồng.

Đọc hồ sơ doanh nghiệp đã có, chỉ hỏi phần thiếu. Lưu bài/nguồn/ảnh/video trên máy và trả bản xem trong chat. Duyệt bài chỉ ghi nhận đúng phiên bản để xuất thành phẩm; người dùng tự đăng. Không kết nối/đồng bộ Google Sheets, không gọi công cụ đăng Facebook hoặc hẹn đăng. Khi cần công cụ còn thiếu, báo rõ và giữ phần đã làm.
