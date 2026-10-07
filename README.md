# FREEUP Content 9B — Quà tặng cho học viên

Tạo bài viết, ảnh minh họa, ảnh cá nhân kèm câu nói, carousel và video theo thương hiệu của bạn. Hệ thống lưu nội dung và thành phẩm trong kho riêng trên máy chạy 9B.

**Trước khi cài:** mở 9BizClaw v3 đã khởi tạo, kết thúc các lượt chat đang chạy và giữ ứng dụng mở. Máy cần Internet trong lần cài đầu.

## Cài trong 3 bước

1. **[⬇️ TẢI BỘ CÀI CHO WINDOWS VÀ MAC](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.3.1.zip)**
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

## Nguồn chuyên gia và tự sản xuất sau duyệt lịch

Bản 1.3.1 có ba lệnh điều khiển nguồn/lịch: **/nguon**, **/duyetlich**, **/theodoi**. Có **33 lệnh tiếng Việt và 1 skill điều phối**. Thông tin doanh nghiệp, nguồn, giọng văn, câu chuyện và ảnh của mỗi học viên được lưu riêng; không cần thư mục Antigravity của giảng viên.

Luồng sử dụng: chọn nguồn → đọc bài/video truy cập được → chọn insight phù hợp khách hàng → đề xuất lịch → bạn duyệt lịch → tự tạo bài và ảnh theo skill hiện có → bạn duyệt thành phẩm → đăng qua kênh đã kết nối → xem số liệu để cải tiến.

**Mỗi học viên chọn nguồn theo doanh nghiệp và ngành nghề của mình.** 9B đọc hồ sơ đã có, chỉ hỏi tiêu chí còn thiếu; học viên có thể gửi nhiều tên/link chuyên gia hoặc giao 9B tìm nguồn phù hợp ngành, thị trường, khách hàng và mục tiêu. Danh sách có thể gồm chuyên gia Việt Nam/quốc tế, thương hiệu, website, hiệp hội và bản tin. Không giới hạn ở ba chuyên gia hay ngành marketing; máy mới chưa bật sẵn nguồn nào. Hệ thống xây bài mới theo giọng văn, màu thương hiệu, ảnh và câu chuyện của học viên; có lưu URL và lý do chọn ý tưởng. Chưa có câu chuyện thật thì dùng nhận định hoặc ví dụ giả định được ghi rõ.

**Duyệt lịch cho phép sản xuất bài và ảnh. Thành phẩm vẫn chờ bạn duyệt trước khi đăng.** Sửa lịch sẽ tạo bản mới; chạy lại tiếp tục bài đang làm và giữ bài cũ. Không có quyền đọc một nguồn thì báo nguồn đó chưa đọc được và tiếp tục các nguồn khác.

Gửi lần lượt trong 9B sau khi cài:

```text
/nguon Đọc hồ sơ doanh nghiệp tôi đã cung cấp. Tìm chuyên gia và nguồn ý tưởng phù hợp ngành, khách hàng, thị trường và mục tiêu của tôi. Cho tôi xem danh sách đề xuất; chỉ hỏi thông tin còn thiếu.
```

```text
/timy Tìm 10 ý tưởng từ các nguồn đã chọn, ưu tiên phù hợp khách hàng của tôi.
```

```text
/lich Đề xuất lịch 7 ngày, gồm bài viết, Visual Insight và Founder Quote khi có ảnh phù hợp.
Tạo lịch có nguồn, Big Idea và giờ dự kiến. Dùng giọng văn, câu chuyện và màu thương hiệu đã lưu.
```

Sau khi xem lịch, thay ID/bản bằng thông tin 9B vừa trả:

```text
/duyetlich [ID lịch] bản [số bản]. Tự làm bài và ảnh, cho tôi xem thành phẩm trước khi đăng.
```

Muốn duy trì định kỳ:

```text
/theodoi Bật quét nguồn mỗi ngày lúc 7h, gửi lịch tuần mới vào thứ Sáu lúc 16h.
Tiếp tục các bài của lịch tôi đã duyệt. Thành phẩm chờ tôi duyệt rồi mới đăng.
Kiểm tra lịch chạy thật và báo rõ phần nào chưa kết nối được.
```

Đổi giờ, tắt theo dõi hoặc thay màu/ảnh bằng lời nói trong chat. /theodoi dùng lịch native của 9B; máy chạy 9B cần bật, Gateway hoạt động và không ngủ. Đường dẫn lưu lịch: freeup-content-data/content-calendar/index.html; bài/ảnh vẫn trong media_output/ngày/ID-bài/. Điện thoại xem/duyệt qua kênh chat đã kết nối và gửi tệp được xác minh.

Các script điều phối đã được kiểm bằng dữ liệu mô phỏng: duyệt đúng bản, chống trùng, khôi phục công việc, chặn thiếu tài nguyên và không tự đăng. Quét nguồn thực, lịch nền/headless, ảnh AI và tài khoản đăng cần kiểm trên máy học viên; cài gói không đồng nghĩa các kết nối đó đã hoạt động.

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
- Nếu tác vụ cài bằng chat trước đây đã báo `failed`, tác vụ đó không tự chạy tiếp. Tải bản 1.3.1 và mở tệp cài đúng hệ điều hành để tạo lượt cài mới.
- Nếu gặp lỗi, giữ thông báo/log để xử lý; chỉ dùng `/caidat` sau khi bộ cài báo thành công.

[Cài bằng chat, PowerShell và xử lý lỗi chi tiết](./docs/CAI-DAT-NANG-CAO.md)

</details>

<details>
<summary><strong>Google Sheet và mức hỗ trợ của bản tải này</strong></summary>

Bản đang tải là **1.3.1**, có **33 lệnh và 1 skill điều phối**. Quy trình content lưu trên máy; cài đặt cơ bản không yêu cầu Google Sheet hoặc Apps Script.

Theo dõi nguồn, duyệt lịch và hàng đợi sản xuất đã có trong gói 1.3.1. Quét nguồn và lịch nền dùng công cụ thật của 9B, cần kiểm trên máy học viên. Kết nối Google Sheet trực tiếp và tự xử lý ô duyệt trên Sheet vẫn chưa có trong bản tải này. Ảnh AI, voice và đăng bài dùng kết nối riêng của học viên.

[Chi tiết công cụ, kiểm chứng và giới hạn](./docs/CAI-DAT-NANG-CAO.md#kiểm-chứng-và-nội-dung-gói)

</details>
