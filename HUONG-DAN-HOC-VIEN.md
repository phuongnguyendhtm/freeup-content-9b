# Cài hệ thống Content vào 9B

Bạn cần máy Windows hoặc Mac có **9BizClaw v3 đã khởi tạo** và Internet. Bản 1.3.1 có 34 skill, 33 lệnh tiếng Việt và kho nội dung riêng; không cần thư mục Antigravity của giảng viên.

## Cài trong 3 bước

1. **Mở 9B.** Kết thúc các lượt chat đang chạy và giữ 9B mở trong lúc cài.
2. **[Tải bộ cài Content 1.3.1](https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/distribution/FREEUP-CONTENT-9B-HOC-VIEN-v1.3.1.zip)** → **nhấp phải ZIP và chọn Extract All / Giải nén tất cả** → mở thư mục mới được giải nén. Trên Windows nhấp đúp **CAI-DAT-9B.cmd**, trên Mac mở **CAI-DAT-MAC.command**. Không mở tệp cài ngay trong cửa sổ xem ZIP. Cài lần đầu thì nhấn Enter khi được hỏi nâng cấp. Nếu được hỏi agent, chọn agent bạn muốn dùng làm content. Chờ bộ cài tải công cụ ảnh/video và kiểm tra; lần đầu có thể mất vài phút.
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

