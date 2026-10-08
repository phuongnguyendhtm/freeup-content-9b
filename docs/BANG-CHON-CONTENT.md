# Bảng chọn Content 9B — 1.5.0

Sau khi cài hoặc nâng gói 1.5.0, mở chat mới với trợ lý đã cài và nhắn:

> hệ thống content

9B trả ảnh bảng chọn. Nhắn số 1–9 kèm chủ đề; 0 để lập lịch. Ảnh là hướng dẫn để chọn bằng chat, không phải nút gọi skill. Khi chọn, 9B trả ảnh hướng dẫn và lệnh mẫu dạng text. Nếu đã có hồ sơ, ảnh hoặc màu thì dùng lại; chỉ hỏi phần thiếu.

| Số | Dạng | Nhóm lệnh |
|---|---|---|
| 1 | Bài viết | /vietbai |
| 2 | Một ảnh đơn | /thietkeanh |
| 3 | Chân dung kèm câu quote | /thietkeanh |
| 4 | Ảnh minh họa insight | /thietkeanh |
| 5 | Bộ ảnh nhiều trang | /thietkeanh |
| 6 | Sơ đồ / infographic | /thietkeanh |
| 7 | Bài và chuỗi bình luận | /vietbai |
| 8 | Video ngắn có thoại | /taovideo |
| 9 | Video cảnh minh họa | /taovideo |
| 0 | Content theo lịch | /lapkehoach |

## Lệnh có thể thay theo ý muốn

### 1. Bài viết

```text
/vietbai Viết bài về [chủ đề], mục tiêu [mục tiêu], dùng giọng thương hiệu đã lưu.
```

### 2. Một ảnh đơn

```text
/thietkeanh Tạo 1 ảnh đơn về [chủ đề], tỉ lệ [4:5 / 1:1 / 9:16], dùng màu thương hiệu và ảnh tôi đã cung cấp.
```

### 3. Chân dung kèm câu quote

```text
/thietkeanh Tạo ảnh chân dung kèm câu quote “[câu quote]”, dùng ảnh [tên ảnh], màu thương hiệu, tỉ lệ [4:5].
```

### 4. Ảnh minh họa insight

```text
/thietkeanh Tạo Visual Insight về [chủ đề], ưu tiên [ẩn dụ / mô hình / so sánh], chữ ngắn, dùng màu thương hiệu.
```

### 5. Bộ ảnh nhiều trang

```text
/thietkeanh Tạo carousel [số trang] về [chủ đề], mỗi trang một ý, tỉ lệ [1:1 / 4:5], dùng màu thương hiệu.
```

### 6. Sơ đồ / infographic

```text
/thietkeanh Tạo infographic về [quy trình / dữ liệu], gồm [các bước / thông tin], dùng màu thương hiệu. Chỉ dùng số liệu có nguồn.
```

### 7. Bài và chuỗi bình luận

```text
/vietbai Viết bài ngắn và chuỗi [số] bình luận về [chủ đề], dùng giọng thương hiệu.
```

### 8. Video ngắn có thoại

```text
/taovideo Tạo Reels [thời lượng] về [chủ đề], có lời thoại, phụ đề, tỉ lệ 9:16. Dùng tài nguyên tôi đã cung cấp.
```

### 9. Video cảnh minh họa

```text
/taovideo Tạo video B-roll [thời lượng] về [chủ đề], không thoại, có câu hook, dùng cảnh và ảnh tôi đã cung cấp.
```

### 0. Content theo lịch

```text
/lapkehoach Lập lịch content [7 ngày / 1 tháng] theo hồ sơ doanh nghiệp đã có. Chọn nhiều định dạng phù hợp, cho tôi duyệt lịch trước. Sau khi duyệt, tự sản xuất và chờ tôi duyệt thành phẩm rồi đăng.
```

Thay phần trong dấu [ ] bằng yêu cầu thật. Có thể ghi thêm màu HEX, tên ảnh đã tải, chữ trên ảnh, phong cách và kích thước. Muốn lưu cho các bài sau, nói “từ nay dùng…”; 9B lưu cấu hình riêng cho doanh nghiệp.

Ví dụ: “Chọn 3. Dùng ảnh tôi đã tải, quote ‘Bắt đầu nhỏ, làm đều mỗi ngày’, nền xanh #123456, chữ vàng #FFD700, tỉ lệ 4:5.”

## Quy trình
Một bài: mở bảng → chọn dạng + brief → 9B tạo chữ và ảnh/video → lưu thành phẩm → bạn xem/sửa/duyệt → đăng theo kênh và giờ đã duyệt.

Theo lịch: chọn 0 → chọn nguồn/ý tưởng theo doanh nghiệp → đề xuất lịch → bạn duyệt lịch → tự sản xuất → bạn duyệt thành phẩm → đăng → xem kết quả. Duyệt lịch chỉ cho phép sản xuất.

Hướng dẫn nằm ở freeup-content-data/help/content-menu/1.5.0/; bài thật ở freeup-content-data/media_output/ngày/ID-bài/. Nhắn /xemketqua để xem thành phẩm. Điện thoại xem qua kênh chat có hỗ trợ gửi attachment, không mở bằng đường dẫn máy tính.

## Phạm vi tích hợp
Bảng chọn nằm trong skill điều phối hiện có, gói vẫn có 8 skill / 7 nhóm lệnh. Không thay chính sách/quyền hay giao diện 9B. Mở menu chỉ xuất tài liệu, không tạo bài hoặc duyệt/đăng. Người trong hình mẫu là nhân vật AI; khi tạo chân dung thật phải dùng ảnh học viên. Nếu không có quyền gửi ảnh, 9B trả danh sách và đường dẫn, nói rõ ảnh chưa gửi được.

Đã kiểm export ảnh, ánh xạ 10 lựa chọn và giữ nguyên hồ sơ trên fixture local. Chưa xác nhận chạy trong chat 9B trên máy học viên; gửi ảnh, tạo media, theo dõi và đăng cần công cụ thật của máy đó.
