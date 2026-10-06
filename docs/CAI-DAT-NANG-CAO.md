# Cài đặt nâng cao — FREEUP Content 9B 1.2.2

Học viên bắt đầu bằng [hướng dẫn 3 bước](../HUONG-DAN-HOC-VIEN.md). Các cách cài và thông tin bên dưới dành cho trường hợp cần lựa chọn khác hoặc xử lý lỗi.

**Bản 1.2.2:** 31 skill, 30 lệnh tiếng Việt, kho bài/ảnh/video riêng. Máy học viên cần **9BizClaw v3 đã khởi tạo** và Internet cho lần tải đầu. Gói hoạt động độc lập với Antigravity và thư mục của giảng viên.

## Cách cài dễ nhất trên Windows

1. [Tải ZIP 1.2.2](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.2.2.zip).
2. Giải nén nguyên ZIP ra thư mục mới, giữ 9B đang mở và dừng các lượt chat đang chạy.
3. Mở **CAI-DAT-9B.cmd**, chọn agent nếu được hỏi. Nếu đã có bản cũ, chỉ chọn nâng khi đó là cùng gói đã được xác minh. Chờ cửa sổ báo hoàn tất kiểm tra; lần tải công cụ ảnh/video có thể mất vài phút.
4. Mở **lượt/chat mới cùng agent** trong 9B và gõ **/caidat**. Hệ thống dùng lại hồ sơ doanh nghiệp đã có và chỉ hỏi phần còn thiếu.

Tệp cài tìm 9B trên máy học viên; không cần đường dẫn hay tài khoản của giảng viên. Giữ 9B rảnh trong khi bộ cài làm việc. Nếu bộ cài báo failed/chưa hoàn tất, giữ lỗi để xử lý trước khi dùng.

## Cài trên Mac khi chat báo `failed`

1. [Tải ZIP 1.2.2](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.2.2.zip) và giải nén ra thư mục riêng. Không dùng lại ZIP 1.2 hoặc job đã báo `failed`.
2. Mở 9B và kết thúc các lượt chat đang chạy. Trong Finder, mở **CAI-DAT-MAC.command** từ thư mục đã giải nén; nếu macOS yêu cầu xác nhận, nhấp phải tệp và chọn **Open / Mở**. Nếu tệp không mở, mở Terminal tại thư mục đó và chạy `bash CAI-DAT-MAC.command`.
3. Cài lần đầu thì nhấn Enter ở câu hỏi nâng cấp. Chờ kết quả ở cửa sổ cài. Khi báo **“Da cai va xac minh”**, mở chat mới đúng agent và gõ `/caidat`.

Bản 1.2.2 chờ lại khi lệnh kiểm trạng thái native tạm không phản hồi. Nếu Gateway từ chối kết nối hoặc không hỗ trợ bước kiểm tra, bộ cài dừng trước khi cài skill và nêu lý do. Tệp `status.json`/`install.log` của lần cài cũ chỉ dùng để chẩn đoán; nó không tự tiếp tục. Máy Mac chưa được kiểm thử trực tiếp trong môi trường phát hành, vì vậy nếu bản mới vẫn không cài được, gửi **dòng lỗi đầu tiên** và đường dẫn `install.log` để xác định lỗi runtime trên máy đó.

## Windows báo `Cannot find module ... install-job.cjs`

Đường dẫn lỗi có dạng `%TEMP%\...zip...\install-job.cjs` nghĩa là Windows đã mở `CAI-DAT-9B.cmd` **bên trong ZIP**, chỉ tạm lấy tệp `.cmd` ra mà chưa giải nén các tệp đi kèm. Nhấp phải **tệp ZIP đã tải** → **Extract All / Giải nén tất cả** → mở **thư mục mới được giải nén** → chạy `CAI-DAT-9B.cmd` ở đó. Trong cùng thư mục phải thấy `install-job.cjs`, `bootstrap.cjs` và `distribution-manifest.json`. Bản 1.2.2 kiểm tra các tệp này và báo cách giải nén ngay, trước khi gọi Node. Lỗi này chưa cài skill; không cần xóa hồ sơ hay cài lại 9B.

## Cài bằng một câu lệnh trong chat 9B

Sao chép đoạn sau vào chat của agent muốn dùng:

```text
Đọc https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/CAI-DAT-9B.txt và cài hệ thống content 1.2.2 cho agent 9B đang dùng. Tôi cho phép cài skill qua bộ cài native, tải công cụ ảnh/video và nâng bản cũ của cùng gói đã được xác minh, giữ hồ sơ và dữ liệu riêng. Khởi chạy bộ cài nền rồi kết thúc lượt chat này ngay; không chờ cài hoặc chạy /caidat trong cùng lượt. Sau khi cài thành công, tôi sẽ mở lượt mới dùng /caidat; hãy dùng hồ sơ doanh nghiệp đã có và chỉ hỏi phần còn thiếu.
```

9B trả đường dẫn job_file và kết thúc lượt; đây là xác nhận đã khởi chạy, chưa phải cài xong. Bộ cài chờ lượt chat kết thúc rồi cài ngoài lượt đó. Sau vài phút, mở lượt mới yêu cầu **“Kiểm tra kết quả cài ở job_file đã cung cấp”**. Nếu còn chờ/đang chạy, kết thúc lượt và để bộ cài tiếp tục. Khi completed và kiểm tra thành công, dùng /caidat.

[Yêu cầu đầy đủ](../CAI-DAT-9B.txt) · [Hướng dẫn học viên](../HUONG-DAN-HOC-VIEN.md) · [Câu lệnh cho ZIP đính kèm](../package/CAI-DAT-9B.txt)

Nếu chat không đọc link, mở CAI-DAT-9B.txt và dán toàn bộ. Nếu không tải ZIP, tải thủ công rồi đính kèm ZIP vào chat; không chọn ZIP trong Skills Upload. Nếu phiên thiếu quyền đọc/chạy bộ cài, dùng CAI-DAT-9B.cmd trên Windows hoặc CAI-DAT-MAC.command trên Mac.

## Khi 9B báo prepared model runtime plugin generation was superseded

Bản 1.2.2 chuyển thao tác cài ra khỏi lượt model đang chạy để tránh thay skill/cấu hình ngay trong lượt đó. Nếu lỗi xuất hiện trước khi 9B đọc yêu cầu hoặc chạy công cụ, mã Git chưa thực thi: tải ZIP và mở tệp cài đúng hệ điều hành từ cửa sổ riêng. Sau khi kiểm tra cài thành công, mở lượt/chat mới dùng /caidat. Nếu chat mới vẫn báo cùng lỗi, đóng hẳn/mở lại 9B hoặc kiểm tra bản ứng dụng với bộ phận hỗ trợ; không cài đi cài lại để chữa lỗi model của ứng dụng.

## Lệnh và thành phẩm

| Lệnh | Công việc |
|---|---|
| /caidat | Kiểm hồ sơ có sẵn, chỉ hỏi phần thiếu |
| /vietbai | Viết bài theo thương hiệu |
| /minhhoa | Visual Insight |
| /anhchu | Founder Quote từ ảnh cá nhân thật |
| /boanh | Carousel |
| /tudong | Chạy quy trình content theo yêu cầu |
| /xem | Xem thành phẩm trong chat |
| /mothumuc | Mở thư mục thành phẩm trên máy chạy 9B |

Ví dụ: `/tudong Làm bài Facebook và carousel 5 trang về [chủ đề], tạo thành phẩm và cho tôi xem.`

Bài, caption và ảnh/video nằm trong `freeup-content-data/media_output/ngày/ID-bài/` của workspace agent. Mỗi bài có index.html để mở xem trên máy tính. Điện thoại xem qua kênh đã kết nối hỗ trợ gửi tệp, sau khi 9B xác minh gửi thành công. Dữ liệu riêng được giữ khi cài lại/nâng cấp cùng gói đã xác minh.

## Cài bằng PowerShell trên máy chạy 9B

Tải và xem script trước khi chạy. -Apply khởi chạy job từ cửa sổ riêng và chờ 9B rảnh; mặc định chỉ lập kế hoạch. Không chạy -Apply rồi chờ nó trong công cụ của lượt chat 9B đang hoạt động.

```powershell
$contentRepo = 'phuongnguyendhtm/freeup-content-9b'
$contentRef = 'main'
$contentInstaller = Join-Path $env:TEMP 'freeup-content-install.ps1'
Invoke-WebRequest "https://raw.githubusercontent.com/$contentRepo/$contentRef/install-from-github.ps1" -OutFile $contentInstaller -UseBasicParsing
Get-Content -LiteralPath $contentInstaller
& $contentInstaller -Repository $contentRepo -Ref $contentRef -Apply -InstallDependencies
```

Với máy có nhiều agent, PowerShell cần -Agent ten-agent ngay từ bước lập kế hoạch; cách mở CAI-DAT-9B.cmd có thể hỏi tương tác. Thêm -Upgrade để nâng đúng gói cũ đã được xác minh, -InstallRoot 'đường-dẫn-9B' cho runtime tùy chỉnh. -Ref nhận main hoặc mã commit đầy đủ 40 ký tự để cố định bản tải. -Destination chỉ đổi nơi lưu gói tải. Khi chính sách script/cài skill từ chối, dùng cách được tổ chức hỗ trợ; không đổi chính sách toàn máy.

## Kiểm chứng và nội dung gói

Bản 1.1 đã cài native đủ 31 skill trên 9BizClaw v3 / OpenClaw 2026.8.1 và kiểm công cụ Chrome/FFmpeg. Bản 1.2.2 thay cơ chế khởi chạy cài đặt; kiểm bằng runtime mô phỏng độc lập, kiểm cài lại/nâng cấp/giữ dữ liệu, hồ sơ và helper. Chưa thực hiện lượt cài native mới toàn bộ bản 1.2.2 trên máy học viên khác. Mỗi máy vẫn phải đạt inventory 31 skill eligible và doctor trước khi báo cài hoàn tất.

- [package/](../package/): nguồn gói tự chứa, manifest và checksum; giữ nguyên khi cài từ mã nguồn.
- [distribution/](../distribution/): ZIP 1.2.2, giữ ZIP 1.1 cho liên kết cũ.
- [install-from-github.ps1](../install-from-github.ps1): tải ZIP, kiểm SHA-256 và giải nén an toàn.

SHA-256 ZIP 1.2.2: `17C09A7491F08E036E400EF9624755ADA31963487DF30A9E57F1888AB927AA7D`.

Gói không chứa hồ sơ, ảnh, tài khoản hoặc API key của giảng viên. Ảnh AI, voice và đăng bài dùng công cụ/tài khoản đã kết nối của học viên. [Chi tiết kỹ thuật và giới hạn](../package/INSTALLER.md).
