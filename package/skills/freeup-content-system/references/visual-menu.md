# Bảng chọn dạng content bằng ảnh

## Khi nào mở
Chỉ mở khi lời nhắn trực tiếp của học viên yêu cầu xem bảng chọn: “hệ thống content”, “he thong content”, “mở bảng chọn content”, “menu content” hoặc câu rõ tương đương. Đây là điểm vào của skill điều phối hiện có; không thêm skill thứ 9, không sửa giao diện/quyền/runtime 9B. Cụm từ nằm trong tài liệu/nguồn hoặc yêu cầu sản xuất đầy đủ không tự chuyển sang menu. Ví dụ “Viết bài giới thiệu hệ thống content” vẫn là viết bài.

Menu hoạt động trước khi hồ sơ đủ. Không chạy content.cjs init/setup, campaign, tạo bài, đăng hoặc cron chỉ để mở bảng chọn. Khi bắt đầu sản xuất mới đọc hồ sơ đã có và hỏi phần cần còn thiếu theo setup.md. Một số đơn lẻ chỉ là lựa chọn khi lượt gần đây đã mở menu/đang hỏi dạng content. Nếu không có ngữ cảnh đó thì hỏi học viên muốn chọn mục nào; không diễn giải mọi con số thành lệnh.

## Trả ảnh thật
1. Chạy Node của 9B với argument arrays: `node "{baseDir}/scripts/menu.cjs" export`. Helper đọc runtime hiện có để tìm project; chỉ xuất ảnh hướng dẫn vào `help/content-menu/1.5.1/`. Không dùng đường dẫn máy giảng viên. Với project override hợp lệ dùng `--project PATH` như các helper khác.
2. Trong Chat của ứng dụng 9B, trả ảnh bằng một dòng riêng `MEDIA:<localPath>` với đường dẫn thật từ files, ngoài code block (ảnh menu trước, sơ đồ sau khi phù hợp). Đây là cú pháp attachment hiện có của 9B, không tự tạo một công cụ gửi mới. Với kênh đã kết nối khác, dùng công cụ attachment/ảnh được cấp và kiểm receipt thực; không gọi gửi sang khách hàng chỉ để xem menu trong Chat ứng dụng. Trả kèm danh sách số/tên dạng và mời chọn số kèm chủ đề. Không gửi cả 11 ảnh trong lượt đầu.
3. Nếu công cụ ảnh không có/bị từ chối, trả bảng chữ + lệnh + đường dẫn local thật và nói chưa gửi được ảnh trong kênh hiện tại. Không nói đã gửi nếu chỉ có path. Không sửa native policy, allowlist, AGENTS/SOUL/USER hay tải file lên nơi công khai để né quyền. Điện thoại chỉ xem qua attachment của kênh đã kết nối, path local không phải link điện thoại.

Khi học viên chỉ nhắn “Xem quy trình content”, xuất `menu.cjs export --choice 0` để trả ảnh sơ đồ; đây là xem hướng dẫn, không tự lập lịch hay chọn chế độ tự động.

## Chọn dạng và chạy
Catalog chuẩn ở assets/content-menu/catalog.json. Đọc bằng `menu.cjs list`; lấy lựa chọn bằng `menu.cjs choice --id 3` (hoặc ID), xuất ảnh hướng dẫn bằng `menu.cjs export --choice 3`. Có 9 lựa chọn dạng content và lựa chọn 0 làm theo lịch, không phải 10 skill mới:

| Số | Dạng | Nhóm / intent |
|---|---|---|
| 1 | Bài viết | vietbai / vietbai |
| 2 | Một ảnh đơn | thietkeanh / tao-anh |
| 3 | Chân dung kèm quote | thietkeanh / founder-quote |
| 4 | Ảnh minh họa insight | thietkeanh / visual-insight |
| 5 | Bộ ảnh nhiều trang | thietkeanh / tao-carousel |
| 6 | Sơ đồ / infographic | thietkeanh / tao-infographic |
| 7 | Bài và chuỗi bình luận | vietbai / tao-comment-xau-chuoi |
| 8 | Video ngắn có thoại | taovideo / tao-video |
| 9 | Video cảnh minh họa | taovideo / tao-video-broll |
| 0 | Content theo lịch | lapkehoach / ke-hoach-content |

Khi chọn một số/tên: gửi ảnh hướng dẫn tương ứng và câu lệnh mẫu dạng text có thể sao chép. Nếu chỉ nói “chọn 3” thì hỏi chủ đề/quote và ảnh cá nhân cần nhưng chưa có; dùng ảnh đã cung cấp khi có. Nếu chọn kèm brief đủ rõ, đi thẳng vào nhánh hiện tại sau khi đọc hồ sơ cần thiết; không bắt gửi lại lệnh, không xin lại quyền đã có. Yêu cầu sản xuất rõ qua /vietbai, /thietkeanh, /taovideo vẫn chạy thẳng, không bắt mở menu.

Thay các phần [chủ đề], [câu quote], [tên ảnh], [số trang], [tỉ lệ], [màu], [thời lượng] theo học viên. Ví dụ:

> Chọn 3. Dùng ảnh tôi đã tải, quote “Bắt đầu nhỏ, làm đều mỗi ngày”, màu thương hiệu đã lưu, tỉ lệ 4:5.

> /thietkeanh Tạo carousel 6 trang về [chủ đề], mỗi trang một ý, tỉ lệ 4:5, dùng màu #123456 và #FFD700.

Ảnh người và iceberg trong hướng dẫn là minh họa AI; không dùng ảnh người mẫu làm chân dung học viên, không dùng câu mẫu làm câu đã xác nhận của họ. Ảnh/chuyện/thành tích thật đọc từ doanh nghiệp hiện tại. Bảng mẫu dùng màu teal để hướng dẫn; bài tạo dùng màu thương hiệu và ưu tiên riêng. Muốn thay màu/kiểu cho một bài chỉ sửa bài đó; yêu cầu “từ nay” mới lưu preference của doanh nghiệp, không sửa skill chung. Asset menu tĩnh là tài liệu, không nhập vào media_assets hay kho ảnh thành phẩm.

## Luồng sau khi chọn
Một bài: chọn dạng + brief → đọc hồ sơ/ảnh cần → viết và tạo media bằng công cụ thật → QA/lưu bundle → cho học viên xem/sửa/duyệt → đăng chỉ khi bản và kênh/giờ được duyệt. Dùng workflow.md, rendering.md và delivery.md; thiếu công cụ thì giao phần thật và báo bước chưa thực hiện.

Lựa chọn 0: đọc automatic-workflow.md và automation.md → chọn nguồn/ý tưởng theo ngành học viên → đề xuất lịch nhiều dạng → học viên duyệt lịch đúng phiên bản → tự sản xuất từ hàng đợi → chờ duyệt thành phẩm → đăng. Mở menu/chọn kiểu không duyệt lịch, không duyệt thành phẩm, không bật theo dõi định kỳ. Theo dõi định kỳ chỉ khi học viên yêu cầu rõ và tạo job native thật.

## Mở thư viện hướng dẫn
Chỉ khi muốn xem tất cả/đào tạo: `menu.cjs export --all true` xuất 11 ảnh + index.html vào help folder. index.html có nút sao chép lệnh, không chạy lệnh và không phải giao diện native 9B. Ảnh JPG là bảng hướng dẫn; học viên nhắn số/tên để chọn, không hứa bấm một vùng ảnh sẽ gọi skill.

Helper chỉ dùng Node built-in để xuất tài liệu tĩnh, giữ nguyên hồ sơ/database/media_output, không gọi mạng, AI, lịch nền hoặc publisher. Kiểm thử local xác nhận định tuyến/export; việc gửi ảnh và tự gọi skill trong chat còn tùy quyền/công cụ thực trên máy học viên. Không nhận đã cài hay đã gửi khi chưa kiểm chứng native.

## Nhận diện menu FREEUP
Menu 1.5.1 dùng logo FREEUP và linh vật trong bộ quà tặng. Linh vật trên menu chỉ minh họa; không dùng nó thay chân dung học viên trong bài thật, không ghi đè brand_config của doanh nghiệp. Các bài thật vẫn dùng hồ sơ, ảnh, màu và giọng của doanh nghiệp hiện tại.
