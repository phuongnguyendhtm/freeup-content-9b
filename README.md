# FREEUP Content 9B — Quà tặng cho học viên

Tạo bài viết, ảnh minh họa, ảnh cá nhân kèm câu nói, carousel và video theo thương hiệu của bạn. Hệ thống lưu nội dung và thành phẩm trong kho riêng trên máy chạy 9B.

**Trước khi cài:** mở 9BizClaw v3 đã khởi tạo, kết thúc các lượt chat đang chạy và giữ ứng dụng mở. Máy cần Internet trong lần cài đầu.

## Cài trong 3 bước

1. **[⬇️ TẢI BỘ CÀI CHO WINDOWS VÀ MAC](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.2.2.zip)**
2. **Nhấp phải tệp ZIP → Extract All / Giải nén tất cả**, rồi mở **thư mục mới được giải nén**. Trên **Windows**, mở **`CAI-DAT-9B.cmd`**; trên **Mac**, mở **`CAI-DAT-MAC.command`** trong thư mục đó. **Không mở tệp cài ngay trong cửa sổ xem ZIP.** Chờ báo **“Đã cài và xác minh”**. Chọn trợ lý/agent nếu bộ cài hỏi.
3. Mở **chat mới với đúng trợ lý vừa cài** trong 9B và gửi:

   ```text
   /caidat
   ```

Hệ thống dùng lại hồ sơ doanh nghiệp đã có; chỉ hỏi thông tin còn thiếu. Khi sẵn sàng, thử:

```text
/vietbai Viết một bài Facebook về [chủ đề] theo thương hiệu của tôi.
```

**[Hướng dẫn dùng cho học viên](./HUONG-DAN-HOC-VIEN.md)**

## Các lệnh thường dùng

| Lệnh | Bạn muốn làm gì? |
|---|---|
| `/vietbai` | Viết bài theo thương hiệu |
| `/minhhoa` | Làm ảnh minh họa một insight |
| `/anhchu` | Làm ảnh cá nhân kèm câu quan điểm |
| `/boanh` | Tạo carousel |
| `/tudong` | Làm chuỗi bước tạo content theo yêu cầu |
| `/xem` | Xem thành phẩm |
| `/mothumuc` | Mở thư mục chứa bài và ảnh/video |

Bạn cung cấp ảnh và kết nối tài khoản của mình khi cần. Hệ thống giữ hồ sơ và thành phẩm khi cài lại hoặc nâng đúng gói đã được xác minh. Máy học viên không cần Antigravity hoặc thư mục của giảng viên.

<details>
<summary><strong>Cài lần đầu, nâng bản cũ hoặc chưa cài được?</strong></summary>

- Khi bộ cài hỏi nâng cấp: **cài lần đầu → nhấn Enter**; **nâng bản cũ → nhập CO**. Bộ cài chỉ nâng đúng gói đã được xác minh.
- Giữ 9B mở và ngừng gửi chat trong lúc cài. Nếu chưa báo hoàn tất, chờ hoặc đọc thông báo trong cửa sổ cài.
- Nếu chưa tìm thấy 9B, mở ứng dụng và hoàn tất khởi tạo rồi chạy lại tệp cài. Trên Mac, nếu `.command` không mở, dùng Terminal tại thư mục đã giải nén để chạy `bash CAI-DAT-MAC.command`.
- Nếu tác vụ cài bằng chat trước đây đã báo `failed`, tác vụ đó không tự chạy tiếp. Tải bản 1.2.2 và mở tệp cài đúng hệ điều hành để tạo lượt cài mới.
- Nếu gặp lỗi, giữ thông báo/log để xử lý; chỉ dùng `/caidat` sau khi bộ cài báo thành công.

[Cài bằng chat, PowerShell và xử lý lỗi chi tiết](./docs/CAI-DAT-NANG-CAO.md)

</details>

<details>
<summary><strong>Google Sheet và mức hỗ trợ của bản tải này</strong></summary>

Bản đang tải là **1.2.2**, có **30 lệnh và 1 skill điều phối**. Quy trình content lưu trên máy; cài đặt cơ bản không yêu cầu Google Sheet hoặc Apps Script.

Nhánh `/nghiencuu`, kết nối Google Sheet trực tiếp và tự xử lý quyết định duyệt trên Sheet đang ở bản thiết kế, **chưa có trong bản tải 1.2.2**. Kết nối ảnh AI, voice và đăng Facebook được kiểm tra khi dùng công cụ tương ứng của học viên.

[Chi tiết công cụ, kiểm chứng và giới hạn](./docs/CAI-DAT-NANG-CAO.md#kiểm-chứng-và-nội-dung-gói)

</details>
