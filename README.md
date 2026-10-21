# FREEUP Content — cài bằng link GitHub · 1.6.2

**Học viên gửi câu này cho agent đang dùng trên OpenClaw, 9BizClaw, Claude Code hoặc Codex:**

```text
Cài hệ thống content từ https://github.com/phuongnguyendhtm/freeup-content-9b cho agent tôi đang dùng. Tự đọc hướng dẫn, tải và cài đúng nền tảng; giữ dữ liệu đã có. Sau cài, thiết lập bằng hồ sơ doanh nghiệp sẵn có, chỉ hỏi phần thiếu và dùng Sheet mẫu được đóng gói trong skill.
```

Agent tự tải mã, xác định nền tảng, cài 8 skill, kiểm tra rồi thiết lập. **Học viên không phải tải ZIP, giải nén hoặc chép thư mục.** Máy mới không cần Antigravity, bộ content cũ hoặc thư mục của giảng viên.

**Dành cho agent nhận link:** đọc [INSTALL.md](INSTALL.md), dùng [install.cjs](install.cjs). Mã skill nằm sẵn trong [package/skills](package/skills). Có Git thì clone; thiếu Git thì [downloader](scripts/download.cjs) tự tải tệp tại một commit và kiểm SHA-256. Cài cho nền tảng đang nhận yêu cầu, không cài vào tất cả ứng dụng trên máy.

## Sheet đã có mẫu chuẩn

Skill bắt buộc dùng [Sheet mẫu của giảng viên](https://docs.google.com/spreadsheets/d/1h2hgN1vqZVsaPOpVw2GJBy9Jb1pwUCMAXn4JXYLDl4I/edit), theo [reference](package/skills/freeup-content-system/references/google-sheet-template.md) và [schema đóng gói](package/skills/freeup-content-system/references/google-sheet-template.json).

Agent dùng lại bản sao riêng đã kết nối; chưa có thì nhân bản nguyên workbook vào Drive học viên. Giữ 7 tab, cột, công thức và định dạng; làm sạch dữ liệu FreeUp trên bản sao vừa tạo rồi dùng hồ sơ doanh nghiệp học viên. Không tự dựng Sheet tùy ý và không ghi vào bảng gốc. Chưa có quyền Google thì báo kết nối còn thiếu, không tạo bảng thay thế.

## Sau khi cài

Gửi **`/thietlapcontent`**. AI đọc hồ sơ/tài liệu doanh nghiệp đã có, chỉ hỏi dữ kiện thiếu hoặc mâu thuẫn, rồi thiết lập kho và bảng riêng. Dùng câu tiếng Việt bình thường cũng được.

| Lệnh | Công việc |
|---|---|
| `/thietlapcontent` | Kiểm hồ sơ, bổ sung phần thiếu, kết nối Sheet mẫu riêng |
| `/lapkehoach` | Nghiên cứu thị trường/nguồn, kho ý tưởng và lịch nội dung |
| `/vietbai` | Viết bài hoặc làm trọn bài và media theo brief |
| `/thietkeanh` | Ảnh insight, ảnh cá nhân kèm câu chữ, carousel, infographic |
| `/taovideo` | Kịch bản và video khi có công cụ phù hợp |
| `/duyetvadang` | Duyệt đúng thành phẩm, đăng/hẹn giờ trong phạm vi đã duyệt |
| `/xemketqua` | Xem bài/ảnh/video, mở thư mục và đọc kết quả có nguồn |

**Luồng:** hồ sơ → nghiên cứu → kho ý tưởng → duyệt ý tưởng → tạo chữ và media → duyệt thành phẩm → đăng → đo kết quả. Mỗi doanh nghiệp có ảnh, giọng văn, màu và tài khoản riêng. Nhắn “hệ thống content” để xem bảng chọn.

Thành phẩm nằm trong `freeup-content-data/media_output/ngày/loại - ngày - tiêu đề/`, có caption, ảnh/video thật và trang xem. Agent trả đường dẫn thực; điện thoại xem qua Drive hoặc kênh chat đã kết nối có hỗ trợ gửi file.

## Những bước được kiểm riêng

- OpenClaw/9B dùng bộ cài native, giữ chính sách ứng dụng. Riêng 9B cài nền sau khi lượt chat kết thúc; kiểm kết quả ở lượt mới.
- Codex local/Claude Code cài vào thư mục skill được nền tảng hỗ trợ, rồi kiểm host đã nạp ở lượt mới. Claude web/Cowork cần công cụ quản lý skill của chính host; thư mục Claude Code không tự cài vào tài khoản web.
- Cài skill chưa tự kết nối Google/Facebook hoặc bật lịch nền. Đổi trạng thái Sheet tự chạy chỉ khi worker/sự kiện của học viên đã được thiết lập và chạy thử. Không cần Apps Script để cài skill, copy mẫu hoặc đồng bộ theo lệnh.

[Hướng dẫn học viên](HUONG-DAN-HOC-VIEN.md) · [Cài cho agent / xử lý thiếu công cụ](INSTALL.md) · [Theo nền tảng](package/skills/freeup-content-system/references/host-compatibility.md)

Các ZIP 1.5.2 trở về trước trong distribution là bản lưu lịch sử. Luồng cài hiện tại dùng mã nguồn 1.6.2 ở repository này.

Bản 1.6.2: Ngân hàng ý tưởng tách nguyên văn bài và ảnh gốc nguồn khỏi góc triển khai AI. Đọc [quy tắc bản gốc](package/skills/freeup-content-system/references/original-source.md). Bản cũ chưa đối chiếu được ghi rõ, không tự coi là nguyên văn.

Quét nhóm cố vấn mỗi ngày: thêm link KOL tại tab05, bật tham khảo, nhờ /lapkehoach theo dõi. [Quy tắc top3](package/skills/freeup-content-system/references/kol-daily.md) chọn tối đa3 bài tổng cộng, lưu nguồn nguyên bản và nhãn dữ liệu viral. Cần công cụ đọc từng nguồn và lịch native thực trên máy học viên; không nhận đã hỗ trợ đủ4 nền tảng chỉ từ việc cài skill.
