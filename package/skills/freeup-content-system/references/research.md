# Nghiên cứu nguồn và tạo ngân hàng ý tưởng

## Nguồn ưu tiên

1. Hồ sơ học viên và tài liệu kinh doanh thực được phép truy cập.
2. Câu chuyện/case/số liệu do học viên cung cấp hoặc xác nhận.
3. Nguồn công khai liên quan; ưu tiên tài liệu gốc khi cần xác minh dữ kiện.
4. Bài tham khảo để học cách đặt vấn đề và trình bày.

Nếu 9B có công cụ như `search_business_documents` và `read_business_document`, dùng theo schema thật đang có. Kết quả tìm kiếm là bước tìm nguồn; phải đọc tài liệu phù hợp trước khi trích claim. Khi tên công cụ khác hoặc không có, dùng công cụ/tệp thật hiện có và ghi cách truy cập.

Một URL chưa truy cập được không là nội dung đã đọc. Nguồn cần đăng nhập hoặc công cụ thiếu quyền: lưu trạng thái chưa đọc, tiếp tục phần có dữ liệu; yêu cầu học viên gửi nội dung khi đó là đầu vào thiết yếu. Không dùng browser session/tài khoản của người tặng.

## Trích xuất insight

Cho mỗi nguồn, ghi: URL/tệp/tài liệu ID; tiêu đề; ngày truy cập; đoạn hoặc tóm tắt hỗ trợ; dữ kiện so với ý kiến; điều còn chưa rõ. Không sao chép nguyên bài vào output; viết lại insight theo đối tượng học viên và dẫn nguồn nơi cần.

Mỗi ý tưởng lưu tối thiểu: ID, chủ đề, đối tượng, vấn đề, insight một câu, hook, trụ cột/góc nhìn, mục tiêu, format gợi ý, nguồn và trạng thái. Trùng insight → hợp nhất hoặc đổi góc nhìn có lý do. Không đổi một câu hook rồi coi là nhiều ý tưởng độc lập.

Chấm ưu tiên bằng bốn tiêu chí 1–5: liên quan đối tượng; hữu ích/có hành động; khác biệt góc nhìn; độ đủ của nguồn. Điểm giúp chọn bài, không dự đoán “viral” hoặc view chắc chắn. Ý tưởng từ suy luận có nhãn suy luận, không được gắn nguồn như thể tác giả nguồn nói nguyên câu đó.

## Ma trận chiến lược

Gợi ý 3–5 trụ cột theo sản phẩm/mục tiêu thật, rồi dùng các góc nhìn như vấn đề, nguyên nhân, cách làm, phản biện và bài học. Không điền một ma trận 25 ô bằng dữ kiện bịa. Nếu chưa có case, đề xuất analysis/how-to từ những kiến thức đã có và ví dụ giả định.

## Phân tích bài tham khảo với `/clone_post`

Đọc text và mở media truy cập được; ghi loại bài và bố cục. Tách cơ chế hook, đối tượng, Big Idea, cách phát triển, mật độ chữ và CTA. Chọn insight có thể phát triển độc lập, thay bằng luận cứ/tình huống của học viên rồi viết bản mới.

Không chuyển lời chứng thực/thành tích của tác giả nguồn sang học viên, không chép quote không có attribution, không dùng ảnh cá nhân hoặc tác phẩm thiết kế của nguồn làm output khi chưa có quyền dùng. Nếu muốn giữ format tương tự, học cấu trúc chung như hai cột, một ý mỗi trang hoặc text bên vùng trống; tạo bố cục và câu chữ mới.

## Tài nguyên media

Ưu tiên kho media học viên đã nhập. Nếu 9B có công cụ search/read media, đọc metadata và xem file trước khi chọn; xác minh chủ thể/danh tính bằng thông tin học viên, không suy đoán khuôn mặt. Ghi asset ID hoặc đường dẫn thật, nguồn và phạm vi dùng.

Ảnh stock/âm nhạc cần điều kiện dùng phù hợp. Ảnh người nổi tiếng không chứng minh chứng thực sản phẩm; lời quote của họ phải có nguồn đáng tin. Khi thiếu ảnh phù hợp, tiếp tục concept và mô tả asset cần bổ sung; không gán ID giả hoặc trỏ về thư mục của máy người tặng.

## Chuyển sang sản xuất

Lưu ngân hàng ý tưởng bằng CLI của gói. Hiển thị nhóm ưu tiên với ID, insight, format và điểm thiếu. Học viên chọn ID hoặc yêu cầu `/tudong` trong phạm vi đã nêu; AI đọc lại nguồn và brief của ID đó trước khi viết.
