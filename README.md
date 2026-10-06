# FREEUP Content 9B — Hệ thống content cho học viên

**Bản 1.1:** 31 skill, 30 lệnh tiếng Việt và kho bài/ảnh/video riêng trên máy học viên. Máy cần có **9BizClaw v3 đã khởi tạo và đang dùng được**, cùng Internet trong lần tải đầu. Hệ thống hoạt động độc lập với bộ Antigravity và thư mục của giảng viên.

## Cách cài nhanh trong chat 9B

1. Mở 9B và chọn agent muốn dùng làm content.
2. Sao chép nguyên đoạn dưới đây vào chat của agent đó:

```text
Đọc https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/CAI-DAT-9B.txt và cài hệ thống content 1.1 cho agent 9B đang dùng. Tôi cho phép cài các skill qua bộ cài native, tải công cụ ảnh/video và nâng phiên bản cũ của cùng gói khi bộ cài xác minh được nguồn gói, giữ hồ sơ và dữ liệu riêng. Sau khi cài và kiểm tra thành công, chạy /caidat, dùng hồ sơ doanh nghiệp đã có và chỉ hỏi phần còn thiếu.
```

3. Chờ 9B tải gói, cài skill và kiểm tra. Nếu có nhiều agent và chưa xác định được phiên đang dùng, chọn agent khi 9B hỏi. Chỉ xem là cài xong khi 9B báo kiểm tra thành công.
4. Hệ thống chạy `/caidat`, tái sử dụng hồ sơ đã có và chỉ hỏi thông tin còn thiếu. Bắt đầu bằng `/vietbai`, `/minhhoa`, `/anhchu`, `/boanh` hoặc `/tudong`.

[Yêu cầu cài đầy đủ](./CAI-DAT-9B.txt) · [Hướng dẫn học viên](./HUONG-DAN-HOC-VIEN.md)

Nếu chat không đọc được đường dẫn, mở [CAI-DAT-9B.txt](./CAI-DAT-9B.txt), sao chép toàn bộ nội dung và dán vào 9B. Nếu chat không tải được ZIP, dùng cách đính kèm dưới đây. Khi phiên không có quyền đọc tệp/chạy bộ cài, 9B sẽ nói rõ bước còn thiếu; dùng cách PowerShell trên cùng máy hoặc cách được quản trị viên cho phép.

## Cài bằng ZIP đính kèm

1. [Tải ZIP bản 1.1](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.1.zip).
2. Đính kèm nguyên ZIP vào **chat 9B** của agent muốn dùng; dùng chức năng gửi tệp trong chat.
3. Mở [câu lệnh dành cho ZIP đính kèm](./package/CAI-DAT-9B.txt), sao chép toàn bộ và dán vào cùng chat. Không chọn ZIP trong màn hình Skills Upload.
4. Chờ kiểm tra thành công và thực hiện `/caidat`.

ZIP được đối chiếu SHA-256 trước khi cài:

```text
450CB4B06548CCABAA7E0AF7473BCB30083567D959CA8337143B9E35747CD0B4
```

## Dùng sau khi cài

| Lệnh | Tác dụng |
|---|---|
| `/caidat` | Kiểm hồ sơ, chỉ hỏi phần thiếu |
| `/vietbai` | Viết bài theo thương hiệu |
| `/minhhoa` | Tạo Visual Insight |
| `/anhchu` | Tạo Founder Quote từ ảnh cá nhân |
| `/boanh` | Tạo carousel |
| `/tudong` | Chạy quy trình theo yêu cầu |
| `/xem` | Xem thành phẩm trong chat |
| `/mothumuc` | Mở thư mục thành phẩm trên máy chạy 9B |

Ví dụ: `/tudong Làm một bài Facebook và carousel 5 trang về [chủ đề], tạo thành phẩm và cho tôi xem.`

Bài và ảnh/video được lưu theo ngày/ID trong `freeup-content-data/media_output/` ở workspace của agent. Mỗi bài có `index.html` để xem trên máy tính. Điện thoại xem qua kênh đã kết nối hỗ trợ gửi tệp, sau khi 9B xác minh đã gửi thành công. [Chi tiết kho thành phẩm và hồ sơ](./HUONG-DAN-HOC-VIEN.md).

## Cài bằng PowerShell trên máy chạy 9B

Tải script về tệp, xem script trước khi chạy. Script đối chiếu SHA-256 của bản 1.1 trước khi giải nén và cài. Có thể dùng `main` hoặc mã commit đầy đủ 40 ký tự ở biến `$contentRef`; mã commit cố định cả script và ZIP tại một bản đã xuất bản.

```powershell
$contentRepo = 'phuongnguyendhtm/freeup-content-9b'
$contentRef = 'main'
$contentInstaller = Join-Path $env:TEMP 'freeup-content-install.ps1'
Invoke-WebRequest "https://raw.githubusercontent.com/$contentRepo/$contentRef/install-from-github.ps1" -OutFile $contentInstaller -UseBasicParsing
Get-Content -LiteralPath $contentInstaller
& $contentInstaller -Repository $contentRepo -Ref $contentRef -Apply -InstallDependencies
```

Nếu máy có nhiều agent, thêm `-Agent ten-agent` cho agent muốn dùng. Nếu bộ cài yêu cầu chọn agent, chạy lại với lựa chọn đó. Nếu máy đã có phiên bản cũ của đúng bộ quà tặng và bộ cài xác minh receipt, thêm `-Upgrade`; dữ liệu và hồ sơ riêng được giữ lại. Dừng khi có xung đột skill khác hoặc chính sách native từ chối.

Nếu tệp bị đánh dấu tải từ Internet, mở tệp để xem trước rồi dùng `Unblock-File -LiteralPath $contentInstaller` nếu bạn đã tin cậy bản phát hành. Lệnh này chỉ bỏ dấu trên đúng tệp đó. Nếu chính sách chạy script vẫn chặn, dùng cách cài trong chat 9B ở đầu trang hoặc quy trình được tổ chức cho phép; không tự đổi chính sách toàn máy.

Chỉ kiểm tra kế hoạch, chưa cài:

```powershell
& $contentInstaller -Repository $contentRepo -Ref $contentRef
```

Các tùy chọn:

| Tùy chọn | Ý nghĩa |
|---|---|
| `-Apply` | Cài qua bộ cài native sau khi kế hoạch thành công |
| `-InstallDependencies` | Tải công cụ ảnh/video; dùng cùng `-Apply` |
| `-Agent ten-agent` | Chọn agent của 9B |
| `-Upgrade` | Nâng phiên bản cùng gói đã được xác minh |
| `-InstallRoot 'đường-dẫn-9B'` | Chỉ định thư mục runtime nếu không tự tìm được |
| `-Destination 'thư-mục-tải'` | Đổi nơi lưu bản tải; không đổi kho thành phẩm của agent |
| `-Ref main` hoặc `-Ref mã-commit` | Chọn nhánh main hoặc commit cố định; `-Commit` cũng được hiểu |

Sau khi cài, mở chat 9B và chạy `/caidat`. Hệ thống đọc hồ sơ có sẵn, chỉ hỏi phần còn thiếu. Dùng `/vietbai`, `/minhhoa`, `/anhchu`, `/boanh`, `/tudong`, `/xem` và `/mothumuc`.

Thành phẩm nằm trong `freeup-content-data/media_output/ngày/ID-bài/` bên trong workspace của agent. `/mothumuc` mở thư mục trên máy chạy 9B. Điện thoại xem qua kênh đã kết nối hỗ trợ gửi tệp, khi việc gửi được xác minh thành công.



## Nếu 9B báo lỗi khi chuẩn bị model

Nếu thấy `prepared model runtime plugin generation was superseded`, lượt chat đã dừng trước khi model chạy công cụ. Lỗi có thể xuất hiện khi cấu hình model vừa thay đổi hoặc 9B đang nạp lại cấu hình.

1. Chờ thao tác đổi model hoặc cài đặt đang chạy hoàn tất.
2. Gửi lại câu lệnh trong một tin nhắn mới.
3. Nếu lỗi tiếp tục lặp lại, thoát hẳn 9B, mở lại rồi gửi câu lệnh cài.

Nếu chat chưa hoạt động, có thể dùng bộ cài PowerShell ở trên để cài qua công cụ native. Khi bộ cài báo kiểm tra thành công, mở chat 9B và chạy `/caidat`.

## Thành phần và mức kiểm chứng

- [package/](./package/): 101 tệp nguyên bản, gồm manifest, checksum và bộ cài native. Giữ nguyên thư mục này khi dùng mã nguồn; các tài liệu tải từ GitHub nằm bên ngoài gói.
- [distribution/](./distribution/): ZIP độc lập 1.1.
- [install-from-github.ps1](./install-from-github.ps1): bộ tải/cài Windows, mặc định chỉ kiểm kế hoạch; chọn `-Apply` để cài.

Bản 1.0 đã được kiểm cài native trên workspace Windows trống; bản 1.1 đã kiểm 31 skill/30 lệnh, hồ sơ, helper và bộ tải/cài. Danh sách skill và công cụ ảnh/video được kiểm trên máy học viên trước khi báo hoàn tất. Chi tiết và giới hạn nằm trong [hướng dẫn học viên](./HUONG-DAN-HOC-VIEN.md).

Gói không chứa hồ sơ doanh nghiệp, ảnh, API key hoặc tài khoản của giảng viên. Các dịch vụ ảnh AI, voice và đăng bài dùng công cụ/tài khoản đã kết nối của học viên.
