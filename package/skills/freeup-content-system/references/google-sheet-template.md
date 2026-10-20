# Sheet mẫu bắt buộc của hệ thống FREEUP Content

Áp dụng khi `/thietlapcontent`, thiết lập bảng, nghiên cứu → kho ý tưởng, đồng bộ, duyệt/sửa/sản xuất/đăng qua Google Sheets. Đọc cả [google-sheet-template.json](google-sheet-template.json): đây là contract lấy từ Sheet giảng viên cung cấp, xác minh ngày 20/10/2026; không phải quyền sửa bảng gốc.

- **Nguồn chuẩn:** https://docs.google.com/spreadsheets/d/1h2hgN1vqZVsaPOpVw2GJBy9Jb1pwUCMAXn4JXYLDl4I/edit
- **Tạo bản sao:** https://docs.google.com/spreadsheets/d/1h2hgN1vqZVsaPOpVw2GJBy9Jb1pwUCMAXn4JXYLDl4I/copy
- **File schema đóng gói:** `references/google-sheet-template.json`, đi cùng mọi bản cài. Link là workbook gốc; JSON là cấu trúc/công thức/hướng dẫn làm sạch, không phải một bảng khác.

## Quy tắc chọn bảng

1. Đọc `database/sheets-binding.json` của project học viên. Nếu có, đọc metadata/header/công thức thực từ Google, kiểm cùng template rồi dùng lại. Không nhân bản thêm mỗi lần setup.
2. Chưa có binding nhưng học viên đã cung cấp bảng riêng: đọc và kiểm mẫu trước. Đúng mẫu thì nối vào; sai mẫu báo cụ thể chỗ lệch và đề xuất dùng bản sao chuẩn. Không xóa/đổi cấu trúc bảng học viên đã có.
3. Chưa có bảng riêng: dùng **Drive copy toàn bộ workbook nguồn**, tên `Content - <doanh nghiệp học viên>`, trong Drive học viên. Deep link `gid` không giới hạn phạm vi copy. Không dùng Sheets create trống, không dựng lại bằng CSV/XLSX, không tự thay bằng Lark/Notion. Nếu phiên có công cụ copy thì agent tự làm; `/copy` là cách dự phòng khi công cụ không hỗ trợ.
4. Copy thất bại/nguồn chưa được chia sẻ: báo đúng quyền thiếu và giữ phần local; không tạo bảng khác để lấp chỗ trống. Không tự mở quyền nguồn hay dùng Google của giảng viên.

## Làm sạch chỉ trên bản sao vừa tạo

Sheet nguồn có dữ liệu FreeUp thật; chỉ lấy cấu trúc. Xác nhận ID bản sao **khác source_spreadsheet_id** trước mọi ghi. Áp dụng `fresh_copy_cleanup_only` trong JSON: clear **giá trị** các hàng nhập liệu/nhận xét/link/id/số liệu, thay hướng dẫn bằng `guide_rows`, làm trống giá trị chiến lược để điền hồ sơ học viên đã đọc. Giữ header, định dạng, dropdown/validation, hàng/cột cố định và conditional formatting; giữ công thức ở tab 02/04. Không dùng deleteRows, không clear toàn bộ bảng.

Các range ghi trong JSON theo grid mẫu 1001 hàng. Trước khi clear, đọc grid thực bản sao và mở rộng đến hàng cuối thực nếu nguồn lớn hơn; không vượt columnCount. Không clear tab 02/04 vì đó là bảng công thức. Công thức Xem bộ ảnh ở các dòng bài cũ là dữ liệu bài cũ và được làm sạch cùng dòng; tạo công thức theo J của chính bài mới khi có ảnh.

Xác minh bản sao không còn nội dung/link Drive/Facebook, người phụ trách, nguồn/chuyên gia, job ID, đường dẫn máy, hash hay số liệu của giảng viên. Không bật hay chạy script/lịch/webhook sao chép từ nguồn; nếu có code liên kết, rà nguồn đích trước, không giữ ID/deployment/tài khoản giảng viên. Việc nhân bản Sheet không tự chứng minh đã kết nối cơ chế sự kiện.

Không chạy quy trình làm sạch này cho bảng học viên đang dùng hoặc khi nâng skill. Dùng lại dữ liệu người đó.

## Bảy tab phải giữ

| Tab | Vai trò | Ai ghi |
|---|---|---|
| 00. Hướng dẫn | Cách thao tác và giới hạn tự động | Thiết lập theo guide_rows; giữ tùy chỉnh của học viên sau đó |
| 01. Ngân hàng ý tưởng | Ý tưởng nghiên cứu, URL, brief, duyệt | AI ghi đề xuất; học viên chọn/duyệt |
| 02. Ý tưởng đã duyệt | Lọc từ tab 01 | Công thức; không ghi tay |
| 03. Sản xuất | Chữ, ảnh, feedback, tiến độ, đăng | AI cập nhật đúng dòng; giữ cột M/N/O/P/Q của học viên |
| 04. Lịch đăng | Tổng hợp lịch từ tab 03 | Công thức; không ghi tay |
| 05. Nguồn & cố vấn | Nguồn nghiên cứu có URL/cách áp dụng | Dữ liệu phù hợp doanh nghiệp hiện tại |
| 06. Chiến lược | Mục tiêu, trụ cột, hướng triển khai | Từ hồ sơ/tài liệu đã cung cấp |

Locale `vi_VN`, timezone `Asia/Saigon` của mẫu được giữ; thay timezone chỉ khi học viên yêu cầu. Header/công thức chính xác nằm trong JSON. Sheet ID/gid bản sao phải đọc từ API; không dùng gid nguồn để đoán vị trí đích.

## Kiểm và lưu liên kết

Đọc metadata và hàng header của từng tab; đọc A2 dạng FORMULA ở 02/04. Chuẩn hóa **kết quả đọc thật** thành snapshot `{spreadsheetId, sheets:[{title, headers:[...], formula_a2:...}]}`. Không tự tạo kết quả đọc hoặc lấy JSON mẫu giả làm snapshot của Google. Sau làm sạch và kiểm quyền trên bảng riêng, chạy:

```text
node <baseDir>/scripts/sheet-template.cjs check --file <snapshot.json>
node <baseDir>/scripts/sheet-template.cjs bind --file <snapshot.json>
```

Helper từ chối source ID, thiếu tab, sai header/công thức, hoặc tự thay binding sang bảng khác. Snapshot chỉ xác minh schema, **không** chứng minh quyền ghi, đã dọn dữ liệu hay đã bật tự động. Kiểm các bước đó bằng công cụ thực riêng. Trả link thật của bản sao và lưu binding trong project, không sửa mã skill để nhúng ID của học viên.

## Trạng thái không đồng nghĩa đã có worker

Luồng: nghiên cứu → Chờ duyệt ý tưởng → Đã duyệt ý tưởng → Chờ sản xuất/Đang viết/Đang tạo ảnh → Chờ duyệt → Cần sửa hoặc Đã duyệt thành phẩm → đăng trong phạm vi được duyệt.

Đổi trạng thái chỉ tự kích hoạt khi kết nối và worker/lịch/sự kiện của **chính máy/tài khoản học viên** đã bật và chạy thử thành công. Chưa có thì ghi `automation_state: not_verified`, dùng lệnh để đọc bảng và làm việc; không hứa kích hoạt ngay. Chỉ tạo lịch khi học viên yêu cầu tự động/định kỳ; dùng cơ chế native của nền tảng. Không cần Apps Script để cài skill, copy hoặc đồng bộ theo lệnh. Muốn phản ứng ngay theo Sheet có thể cần cầu nối riêng được hỗ trợ; đó là bước thiết lập riêng, không tự cấp từ quyền cài.

Một bài lỗi: `Tạm dừng`, ghi rõ nguyên nhân/bước xử lý vào Z của dòng đó, lưu phần làm dở rồi tiếp tục bài khác đã được phép. Duyệt ý tưởng chỉ cho phép sản xuất; duyệt thành phẩm phải gắn đúng bản, tài khoản và thời gian trước đăng. Cần sửa phải đọc nhận xét mới của học viên, không suy từ trạng thái đơn lẻ. Không dùng hàng đợi/Google connector/đường dẫn riêng trên máy giảng viên.
