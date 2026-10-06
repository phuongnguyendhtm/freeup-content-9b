# Cài hệ thống Content vào 9B

Bạn cần máy Windows hoặc Mac có **9BizClaw v3 đã khởi tạo** và Internet. Bản 1.2.1 có 31 skill, 30 lệnh tiếng Việt và kho nội dung riêng; không cần thư mục Antigravity của giảng viên.

## Cài trong 3 bước

1. **Mở 9B.** Kết thúc các lượt chat đang chạy và giữ 9B mở trong lúc cài.
2. **[Tải bộ cài Content 1.2.1](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.2.1.zip)** → giải nén → trên Windows nhấp đúp **CAI-DAT-9B.cmd**, trên Mac mở **CAI-DAT-MAC.command**. Cài lần đầu thì nhấn Enter khi được hỏi nâng cấp. Nếu được hỏi agent, chọn agent bạn muốn dùng làm content. Chờ bộ cài tải công cụ ảnh/video và kiểm tra; lần đầu có thể mất vài phút.
3. **Khi bộ cài báo “Đã cài và xác minh”** (`Da cai va xac minh`), mở **chat mới với đúng agent** trong 9B và gửi:

   ```text
   /caidat
   ```

Hệ thống dùng lại hồ sơ doanh nghiệp và tài liệu bạn đã cung cấp; chỉ hỏi phần bắt buộc còn thiếu hoặc mâu thuẫn. Hồ sơ đã đủ thì bạn có thể tạo content ngay.

**Mac:** nếu `.command` không mở được, mở Terminal tại thư mục đã giải nén và chạy `bash CAI-DAT-MAC.command`. Hãy giữ cửa sổ cài mở cho tới khi có kết quả. Nếu lần cài qua chat trước đó báo `failed`, tải bản mới và chạy tệp này; đừng chờ tác vụ cũ tự tiếp tục.

## Dùng ngay sau khi cài

| Lệnh | Công việc |
|---|---|
| `/vietbai` | Viết bài theo thương hiệu |
| `/minhhoa` | Tạo Visual Insight |
| `/anhchu` | Tạo Founder Quote từ ảnh cá nhân thật |
| `/boanh` | Tạo carousel |
| `/tudong` | Tạo content theo yêu cầu |
| `/xem` | Xem thành phẩm |
| `/mothumuc` | Mở thư mục thành phẩm trên máy chạy 9B |

Ví dụ:

```text
/tudong Làm một bài Facebook và carousel 5 trang về [chủ đề],
tạo thành phẩm và cho tôi xem.
```

Nội dung, caption và ảnh/video được lưu riêng trên máy chạy 9B. Mỗi bài có thư mục theo ngày/ID và trang `index.html` để xem trên máy tính. Xem trên điện thoại cần kênh đã kết nối hỗ trợ gửi tệp và 9B gửi tệp thành công.

## Khi cần hỗ trợ

<details>
<summary>Tôi đã cài bản cũ, chọn gì khi bộ cài hỏi nâng cấp?</summary>

Nhập **CO** nếu bạn muốn nâng bản cũ của cùng bộ quà tặng này. Bộ cài vẫn kiểm nguồn gói và quyền sở hữu trước khi nâng, đồng thời giữ hồ sơ, bài, ảnh và ý tưởng riêng. Nếu báo file khác hoặc file đã sửa riêng, giữ lỗi để xử lý; không chọn nâng để vượt lỗi chính sách.

</details>

<details>
<summary>Tôi không tìm thấy tệp cài.</summary>

Bạn cần mở **thư mục đã giải nén**, không mở trực tiếp tệp trong ZIP. Tải đúng bộ cài bằng link ở bước 2; không dùng **Code → Download ZIP** của GitHub. Windows dùng **CAI-DAT-9B.cmd**; Mac dùng **CAI-DAT-MAC.command**.

</details>

<details>
<summary>Bộ cài báo chưa tìm thấy 9B hoặc chưa cài hoàn tất.</summary>

Kiểm tra 9BizClaw v3 đã được mở và khởi tạo trên chính máy này. Nếu bộ cài vẫn báo lỗi, giữ nội dung lỗi và đường dẫn báo cáo để gửi người hỗ trợ. Chỉ dùng `/caidat` sau khi bộ cài xác minh thành công. [Hướng dẫn nâng cao và xử lý lỗi](./docs/CAI-DAT-NANG-CAO.md).

</details>

<details>
<summary>Tôi không thấy lệnh trong chat 9B.</summary>

Mở chat mới với đúng agent đã cài. Có thể dùng `/skill freeup-content-system` rồi ghi yêu cầu. Nếu chat mới vẫn báo lỗi của ứng dụng, xem [hướng dẫn xử lý lỗi](./docs/CAI-DAT-NANG-CAO.md#khi-9b-báo-prepared-model-runtime-plugin-generation-was-superseded).

</details>

<details>
<summary>Tôi có phải cài Apps Script hoặc kết nối Google Sheet ngay không?</summary>

Không cần cho quy trình tạo content và lưu thành phẩm cục bộ của bản 1.2. Đồng bộ Sheets chỉ dùng được khi phiên 9B có bộ kết nối thật. Luồng nghiên cứu thị trường → điền Sheet → duyệt trên Sheet để kích hoạt tạo/đăng bài là phần đang được thiết kế, chưa có sẵn trong bộ cài này.

</details>

<details>
<summary>Hệ thống có tự đăng Facebook sau khi cài không?</summary>

Việc cài hệ thống không cấp quyền đăng bài. Bạn cần kết nối kênh bằng công cụ có thật trong 9B và yêu cầu đăng cụ thể. Khi chưa có công cụ đăng, hệ thống xuất nội dung để bạn đăng tay.

</details>

[Cách cài khác và thông tin kỹ thuật](./docs/CAI-DAT-NANG-CAO.md)
