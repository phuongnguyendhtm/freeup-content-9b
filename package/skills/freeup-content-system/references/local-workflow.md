# Cách vận hành cho khách hàng

## Bắt đầu
Gửi link GitHub và yêu cầu cài cho agent đang dùng; không tải ZIP hay sao chép file. Mở chat mới sau khi bộ cài xác minh, nhắn /thietlapcontent. AI đọc hồ sơ đã có, chỉ hỏi phần thiếu. Lưu hồ sơ trong database/brand_config.json, nguồn tại database/expert_sources.json, ý tưởng tại database/idea_bank.json và thành phẩm trong media_output của project từ runtime.json. Không tạo bảng tính hoặc yêu cầu đăng nhập Google/Facebook.

## Chọn và sản xuất
Gửi “Tìm 3 ý tưởng về ...” hoặc /lapkehoach. AI trình ID ngắn, tiêu đề, nguồn, lý do phù hợp và góc triển khai ngay trong chat. Gửi “Duyệt ý [ID], viết bài và làm bộ ảnh ...” để bắt đầu ngay; AI dùng content.cjs new --idea ID và giữ liên kết với nguồn, không đợi lịch đêm. Người dùng có thể gửi chủ đề/brief trực tiếp bằng /vietbai mà không nghiên cứu trước.

## Hai luồng nguồn
- Chữ + ảnh: lưu nguyên văn bài/caption và đúng ảnh nguồn vào bản ghi nguồn; đề xuất AI và brief người dùng tách riêng. Thành phẩm dùng ảnh thương hiệu/phạm vi được phép, không tự đăng lại ảnh KOL.
- Video: lưu link/tác giả/thumbnail/số liệu và phân biệt phần thực sự đọc được. Khi người dùng chọn “Chuyển chữ video [ID/link]”, lấy phụ đề truy cập được hoặc dùng công cụ nhận dạng lời nói đã cài trên file video/audio có thật. Lưu transcript.txt và transcript.srt nếu có mốc thời gian; bản dịch đánh dấu riêng. Hiển thị bản chép lời và bản AI viết lại cạnh nhau trong bảng chat ngắn hoặc trang xem local. Bản dài dùng link file toàn văn, không làm mất phần gốc. Bản chép tự động cần ghi công cụ, thời điểm và chỗ nghe chưa rõ; không tự coi là đã xác minh từng chữ.

AI viết lại theo hồ sơ/giọng/góc nhìn người dùng đã cung cấp; không đổi câu chuyện người khác thành trải nghiệm “tôi”. Chưa rõ góc riêng thì hỏi đúng phần cần bổ sung hoặc trình góc đề xuất có nhãn. Chuyển chữ chỉ báo xong khi có transcript thật; chưa có công cụ/audio thì lưu trạng thái chờ và hướng khôi phục, không mua API hoặc tự tải mô hình lớn để lấp thiếu.

## Sửa, duyệt và lấy file
Gửi “Sửa bài [ID] ...”; AI mở đúng bản, sửa phần yêu cầu và trả bản mới. Gửi /duyetbai [ID] hoặc “Duyệt chữ và ảnh bài này” để ghi duyệt bundle, không đăng bài. /xemketqua xem caption/ảnh/video và folder; /mothumuc mở folder trên máy chạy agent. Mỗi folder có caption.txt, record.json, tệp media thực, index.html và nguồn/bản chép khi có. Khách copy caption, tải ảnh/video và tự đăng Facebook.

Lỗi công cụ phải nêu rõ phần chưa xong và đường dẫn bản dở; lỗi một bài không chặn các bài khác. /tudong là tự sản xuất trong phạm vi được giao, không tự xuất bản. Lịch 02/08 chỉ áp dụng chủ đã yêu cầu; máy học viên không tự nhận lịch/tài khoản của giảng viên.
