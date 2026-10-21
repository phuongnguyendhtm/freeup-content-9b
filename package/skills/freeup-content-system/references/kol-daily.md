# Quét nguồn KOL mỗi ngày, chọn 3 bài trong toàn nhóm

Dùng khi người dùng yêu cầu theo dõi cố vấn/KOL hằng ngày, tìm bài nổi bật hoặc top 3 đưa vào Ngân hàng ý tưởng. Đọc original-source.md trước lưu bản gốc. Không tự tạo lịch chỉ vì người dùng bổ sung một link; tạo/cập nhật lịch khi họ yêu cầu quét định kỳ. Dùng lịch native đã có nếu phù hợp, tránh lịch trùng.

## Đầu vào và phạm vi

- Đọc sống tab 05. Nguồn & cố vấn. Chỉ các dòng Creator / chuyên gia có Bật tham khảo = Bật và link cụ thể mới tham gia top 3. Các nhóm Web/blog/tài liệu/nội bộ dùng để đối chiếu, không thay bài KOL nhằm đủ số.
- Facebook, Instagram, TikTok và YouTube là nền tảng nguồn. Một dòng có một link chính thức cho một KOL/nền tảng; có thể thêm nhiều dòng cho cùng người ở các nền tảng khác nhau. Giữ link và bật/tắt của người dùng. Không suy tài khoản từ tên; chỉ thêm link khác khi xác minh bằng liên kết chính thức và trong phạm vi người dùng giao.
- Mỗi ca thử đọc tất cả link KOL đang bật; lấy bài mới trong 72 giờ, dùng lịch sử để so hiệu suất. Nhiều nguồn vượt thời lượng thì lưu tiến độ/độ phủ và báo chưa quét hết, không gọi kết quả là tốt nhất toàn bộ nguồn.
- Công cụ phải có thật trên máy chạy. Tài khoản connected chưa chứng minh đọc được KOL bên thứ ba. API Display/Insights chỉ hỗ trợ tài khoản sở hữu/được ủy quyền không được nhận là bộ quét mọi KOL. Bài riêng tư/đăng nhập/quota/policy bị chặn: ghi giới hạn, không vượt chặn hoặc tự mua dịch vụ dữ liệu.

## Cách chọn bài

1. Mở bài và kiểm nội dung/ảnh thật. Video: phân biệt caption, thumbnail, transcript và phần đã xem; không nhận đã phân tích toàn video từ caption. Chấm độ phù hợp với doanh nghiệp 0–100, kèm lý do cụ thể; tối thiểu 60 để vào nhóm chọn.
2. Lưu views, likes, comments, shares thật cùng lúc đọc/bằng chứng. Thiếu giữ trống, không coi bằng 0. Số UI làm tròn phải ghi xấp xỉ; không tự biến thành số chính xác. Không suy lead/doanh thu từ các số này.
3. Ưu tiên hiệu suất tương đối: so một chỉ số với trung vị ít nhất 5 bài của cùng KOL, nền tảng, định dạng và nhóm tuổi bài tương đương. Từ 2 lần nền có thể ghi vượt nền; đây là quy tắc chọn của hệ thống, không phải một định nghĩa viral chung. Không so thẳng views Facebook với YouTube hoặc video ngắn với video dài.
4. Thiếu dữ liệu nền: ghi Chưa đủ dữ liệu viral, chỉ xếp theo giá trị biên tập/độ mới. Không bịa tỷ lệ tăng trưởng, không gọi là viral đã xác minh. Lý do chọn và giới hạn luôn đi cùng bài.
5. Khử trùng permalink với kho 01 và nguồn đã dùng tại 03; cùng nội dung đăng lại ở nhiều nền tảng chỉ chọn một khi xác minh trùng. Không làm 3 góc AI từ một bài để đủ 3.

Dùng scripts/kol-daily.cjs --file <kết quả đọc thật.json>. Input gồm now, sources [{id,name,url,enabled}], coverage [{sourceId,status,reason,evidence}], knownSourceUrls và candidates. Candidate có advisorUrl, publishedAt ISO, sourceFormat, score, sourceCapture (thêm creatorUrl đã xác minh), observedMetrics {views/likes/comments/shares,observedAt,evidence} và baseline khi có. Baseline có creatorUrl/platform/format/metric/ageWindowHours/evidence và samples [{url,value,publishedAt,observedAt,evidence}]. Không tự tạo các bằng chứng để hợp thức hóa dữ liệu.

Helper giữ tối đa **3 bài tổng cộng**; chưa đủ bài có bằng chứng thì giao ít hơn. Các bài được chọn thuộc nguồn đã đọc, không bảo đảm phủ nguồn bị chặn. `coverageComplete` và báo cáo phải nêu rõ phần này.

## Ngân hàng và bàn giao

Ghi output mode kol_daily vào đúng bảng riêng: D/N đúng ảnh nguồn; E nguyên văn theo original-source.md trong quyền được phép lưu; F đề xuất triển khai riêng, không ghi đè yêu cầu người dùng; M permalink; O điểm biên tập; R/S/T lượt thích/bình luận/chia sẻ đã quan sát; U lý do chọn, số view, thời điểm đo và giới hạn viral/nguồn. Bài lỗi giữ local và báo rõ; không lấy bài web khác thay vào quota KOL.

Trạng thái mới Chờ duyệt ý tưởng, chưa cho sản xuất hoặc đăng. Sau ghi, đọc lại đúng ID và ô đã ghi. Báo cáo gồm tối đa 3 bài, KOL/nền tảng/link, lý do nổi bật, số liệu thật, độ phủ nguồn và lỗi kết nối. Giữ quyền gửi/kênh/thời gian báo cáo người dùng đã chọn; không tự gửi thêm nơi khác.

Máy/Gateway, mạng, kết nối và cơ chế lịch phải hoạt động. Cài skill chưa tự bật thu thập cả bốn nền tảng; chỉ báo từng nguồn dùng được sau lần đọc bài cụ thể thành công.

## Chọn bộ thu thập khi chưa có tài khoản

Đề xuất thử ScrapeCreators trước cho nhu cầu đọc profile/posts công khai của cả bốn nền tảng. Theo trang chính thức được kiểm tra 21/10/2026, có 100 credit thử không cần thẻ; gói nạp 47 USD/25.000 credit, không hết hạn. Giá và số credit từng endpoint phải kiểm tra lại trước tư vấn/mua: https://scrapecreators.com/#pricing ; tài liệu https://docs.scrapecreators.com/ . Facebook chỉ trả các bài công khai nhìn thấy khi không đăng nhập, không bảo đảm đầy đủ timeline. Không gọi bộ đọc này đã chạy nếu chưa kết nối và thử bài cụ thể.

Apify là lựa chọn dự phòng khi cần Actor chuyên biệt; trang https://apify.com/pricing hiện có Free với 5 USD credit/tháng, Starter 19 USD/tháng và tính thêm theo mức dùng/Actor. Chọn sau thử cùng các link nguồn, không khẳng định rẻ hơn chỉ từ giá gói.

Người dùng tự tạo tài khoản; kết nối trong phần Connections của máy chạy bằng công cụ native được hỗ trợ, không yêu cầu gửi API key trong chat hoặc ghi key vào Sheet/GitHub. Học viên dùng tài khoản/quota riêng. Chỉ mua/nạp/bật tự nạp khi người dùng chấp thuận cụ thể; thử miễn phí trước, đo credit thực cho từng nguồn. Khi chưa có kết nối, báo “Chưa kết nối bộ thu thập nguồn công khai”, giữ lịch đã được chọn và tiếp tục các nguồn đọc được. Lỗi nguồn không làm kẹt các nguồn sau.
