# Quy trình tự tạo content nhiều định dạng

Học viên có thể nhắn: “Làm content tuần tới cho doanh nghiệp tôi, chọn định dạng phù hợp. Cho tôi duyệt lịch trước, sau đó tự làm chữ và ảnh/video. Chờ tôi duyệt thành phẩm rồi đăng.” Lệnh tương đương để bắt đầu: /lapkehoach với cùng lời nhắn.

## Vai trò điều phối
Một skill điều phối giữ hồ sơ, ID bài/lịch, trạng thái, QA và hai mốc duyệt. Bảy nhóm là năng lực, không phải bảy bước buộc người dùng gọi tay. Mỗi nhánh có tài liệu chi tiết riêng; chỉ nạp phần cần cho bài đang làm.

1. **Thiết lập:** dùng hồ sơ doanh nghiệp sẵn có, chỉ hỏi phần thiếu; giữ ảnh, màu, giọng văn và kênh của học viên.
2. **Nguồn và ý tưởng:** đọc tài liệu riêng, câu chuyện thật và các nguồn chuyên gia theo ngành; chọn góc nhìn mới phù hợp khách hàng.
3. **Đề xuất lịch:** mỗi dòng có một Big Idea, định dạng, kênh, giờ dự kiến, nguồn và lý do chọn. Dùng campaign.cjs tạo ID/bản và trình để học viên duyệt. Lịch kế hoạch chưa cấp quyền đăng.
4. **Duyệt lịch:** yêu cầu duyệt rõ và đúng bản tạo queue sản xuất. Sau khi đã duyệt, điều phối tiếp tục sản xuất các dòng trong phạm vi đó; người dùng không phải gọi riêng từng nhóm.
5. **Sản xuất:** tạo brief/chữ, gọi nhánh ảnh hoặc video phù hợp, tạo tệp thật, mở và QA, lưu caption/media/nguồn/trạng thái theo ngày/ID. Chạy lại đọc queue và lease để tiếp tục phần còn thiếu, tránh làm trùng.
6. **Duyệt thành phẩm:** gửi chữ và media thật qua công cụ có sẵn cùng ID/bản/kênh/giờ; sửa tạo bản mới và kiểm phần duyệt bị ảnh hưởng. Chờ duyệt trước khi đăng.
7. **Đăng và đo:** kiểm quyền bản hiện tại, kênh và giờ, đăng/hẹn đăng bằng công cụ đã kết nối, lưu receipt. Dùng dữ liệu thực cho kế hoạch sau.

Khi học viên đã yêu cầu tự chọn và tự sản xuất, dùng chế độ produce trong phạm vi yêu cầu hiện tại: tự chọn concept/bố cục và làm thành phẩm, không dừng hỏi chọn 3 phương án cho mỗi bài. Vẫn chờ duyệt lịch nếu chưa được duyệt và duyệt thành phẩm trước đăng. Yêu cầu xem phương án thì dùng review. Không biến chế độ của một việc thành ưu tiên vĩnh viễn khi học viên chưa yêu cầu.

## Chọn định dạng
| Nội dung, mục tiêu và tài nguyên | Nhánh chọn |
|---|---|
| Bài học, giải thích, phân tích hoặc kể câu chuyện đã xác nhận | Bài viết qua /vietbai |
| Một thông điệp cùng ảnh sản phẩm/công việc phù hợp | Ảnh đơn qua /thietkeanh |
| Một insight có quan hệ hoặc ẩn dụ nhìn thấy được | Visual Insight qua /thietkeanh |
| Quan điểm ngắn và ảnh cá nhân thật | Founder Quote qua /thietkeanh |
| Nhiều ý theo trình tự, muốn người đọc lưu lại | Carousel qua /thietkeanh |
| Quy trình, số liệu, so sánh hoặc hệ thống | Infographic qua /thietkeanh |
| Luận điểm đọc được riêng trong bình luận | Chuỗi bình luận qua /vietbai |
| Ý có thể nói ngắn, có công cụ giọng và video | Reels có thoại qua /taovideo |
| Hook ngắn cùng cảnh/ảnh có quyền dùng | B-roll qua /taovideo |

Lựa chọn cụ thể của học viên/lịch đã duyệt ưu tiên hơn bảng mặc định. Phân bổ nhiều format theo mục tiêu, kênh và tài nguyên; không ép chia đều hoặc tự chọn cùng một kiểu cho toàn bộ lịch. Cùng ý tưởng có thể tạo các job liên kết nhiều định dạng khi được yêu cầu. Thiếu ảnh cá nhân thật thì giữ bước đó chờ tài nguyên, tiếp tục dòng khác đủ điều kiện; thay đổi đáng kể lịch đã duyệt phải trình bản mới.

## Chạy chủ động
Để chạy khi không có lượt chat, /lapkehoach Bật theo dõi… phải tạo job native 9B và kiểm job/run history. Cài skill hoặc nói “đã bật” chưa tạo tự động hóa. Máy/Gateway cần hoạt động và có kết nối đọc nguồn, tạo media, gửi thành phẩm, đăng thực. Scheduler tiếp tục queue của lịch đã duyệt; không tự duyệt hoặc đăng sản phẩm. Đọc automation.md.

## Thành phẩm
Kho nằm ở freeup-content-data/media_output/ngày/ID-bài/ trên máy chạy 9B. /xemketqua đọc nội dung và gửi tệp thật; /xemketqua Mở thư mục bài… mở trên máy. Điện thoại dùng kênh đã kết nối có gửi tệp; đường dẫn máy tính không phải link điện thoại.
