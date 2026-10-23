# Quét nguồn KOL mỗi ngày, chọn 3 bài trong toàn nhóm

Dùng khi người dùng yêu cầu theo dõi cố vấn/KOL hằng ngày, tìm bài nổi bật hoặc top 3 đưa vào Ngân hàng ý tưởng. Đọc original-source.md trước lưu bản gốc. Không tự tạo lịch chỉ vì người dùng bổ sung một link; tạo/cập nhật lịch khi họ yêu cầu quét định kỳ. Dùng lịch native đã có nếu phù hợp, tránh lịch trùng.

## Đầu vào và phạm vi

- Đọc database/expert_sources.json trong project; chỉ nguồn KOL được người dùng bật mới tham gia. Nguồn web/tài liệu dùng đối chiếu, không lấp quota KOL.
- Facebook, Instagram, TikTok và YouTube là nền tảng nguồn. Một dòng có một link chính thức cho một KOL/nền tảng; có thể thêm nhiều dòng cho cùng người ở các nền tảng khác nhau. Giữ link và bật/tắt của người dùng. Không suy tài khoản từ tên; chỉ thêm link khác khi xác minh bằng liên kết chính thức và trong phạm vi người dùng giao.
- Mỗi ca thử đọc tất cả link KOL đang bật; lấy bài mới trong 72 giờ, dùng lịch sử để so hiệu suất. Nhiều nguồn vượt thời lượng thì lưu tiến độ/độ phủ và báo chưa quét hết, không gọi kết quả là tốt nhất toàn bộ nguồn.
- Công cụ phải có thật trên máy chạy. Tài khoản connected chưa chứng minh đọc được KOL bên thứ ba. API Display/Insights chỉ hỗ trợ tài khoản sở hữu/được ủy quyền không được nhận là bộ quét mọi KOL. Bài riêng tư/đăng nhập/quota/policy bị chặn: ghi giới hạn, không vượt chặn hoặc tự mua dịch vụ dữ liệu.

## Cách chọn bài

1. Mở bài và kiểm nội dung/ảnh thật. Video: phân biệt caption, thumbnail, transcript và phần đã xem; không nhận đã phân tích toàn video từ caption. Chấm độ phù hợp với doanh nghiệp 0–100, kèm lý do cụ thể; tối thiểu 60 để vào nhóm chọn.
2. Lưu views, likes, comments, shares thật cùng lúc đọc/bằng chứng. Thiếu giữ trống, không coi bằng 0. Số UI làm tròn phải ghi xấp xỉ; không tự biến thành số chính xác. Không suy lead/doanh thu từ các số này.
3. Ưu tiên hiệu suất tương đối: so một chỉ số với trung vị ít nhất 5 bài của cùng KOL, nền tảng, định dạng và nhóm tuổi bài tương đương. Từ 2 lần nền có thể ghi vượt nền; đây là quy tắc chọn của hệ thống, không phải một định nghĩa viral chung. Không so thẳng views Facebook với YouTube hoặc video ngắn với video dài.
4. Thiếu dữ liệu nền: ghi Chưa đủ dữ liệu viral, chỉ xếp theo giá trị biên tập/độ mới. Không bịa tỷ lệ tăng trưởng, không gọi là viral đã xác minh. Lý do chọn và giới hạn luôn đi cùng bài.
5. Khử trùng permalink với idea_bank và nguồn đã dùng tại post_inventory; cùng nội dung đăng lại ở nhiều nền tảng chỉ chọn một khi xác minh trùng. Không làm 3 góc AI từ một bài để đủ 3.

Dùng scripts/kol-daily.cjs --file <kết quả đọc thật.json>. Input gồm now, sources [{id,name,url,enabled}], coverage [{sourceId,status,reason,evidence}], knownSourceUrls và candidates. Candidate có advisorUrl, publishedAt ISO, sourceFormat, score, sourceCapture (thêm creatorUrl đã xác minh), observedMetrics {views/likes/comments/shares,observedAt,evidence} và baseline khi có. Baseline có creatorUrl/platform/format/metric/ageWindowHours/evidence và samples [{url,value,publishedAt,observedAt,evidence}]. Không tự tạo các bằng chứng để hợp thức hóa dữ liệu.

Helper giữ tối đa **3 bài tổng cộng**; chưa đủ bài có bằng chứng thì giao ít hơn. Các bài được chọn thuộc nguồn đã đọc, không bảo đảm phủ nguồn bị chặn. `coverageComplete` và báo cáo phải nêu rõ phần này.

## Ngân hàng và bàn giao

Lưu bản gốc và bằng chứng vào source_library qua campaign.cjs collect; lưu ý tưởng local qua content.cjs ideas với topic, nguồn, góc AI và lý do. Chống trùng URL với kho đã có. Trình tối đa 3 bài trong chat/báo cáo; người dùng duyệt bằng lời nhắn để bắt đầu sản xuất. Không đọc/ghi cột bảng tính. Đọc local-workflow.md.

## Bộ đọc nguồn

Đọc collection-routing.md và collection-routing.json. Lựa chọn hiện tại: Facebook/Instagram dùng Apify; YouTube API chính thức, TikTok và chuyển lời nói thành chữ dùng phương án miễn phí được kiểm chứng. Chưa kết nối hoặc hết quota thì báo rõ, không tự mua hay đổi dịch vụ. Giữ nguyên top 3 và lịch native đã được chủ chọn.
