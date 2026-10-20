# Kiểm chứng dữ liệu nguồn 1.6.1

Đã chạy 31 kiểm tra qua trong lượt cập nhật 20/10/2026: 7 trường hợp giữ nguyên văn/ảnh đúng bài/ảnh thiếu/literal formula/giới hạn ô; 3 kiểm tra helper Google với connector giả lập về ghi/readback, chống dữ liệu AI thay bản gốc và giữ yêu cầu nhân sự; 9 kiểm tra cài đặt/Sheet binding; 12 kiểm tra vòng đời content.

Đã cập nhật helper và reference trên máy giảng viên có sao lưu/hash. Mẫu Sheet đổi nhãn D/E ở ngân hàng và bảng lọc tương ứng; các bản ghi cũ có ghi chú chưa xác minh, giữ nguyên giá trị/duyệt/thành phẩm. Không nhận rằng các bản cũ đã được khôi phục nguyên văn. Không đăng bài hoặc dùng thử một bài bên ngoài để tạo bản sao toàn văn trong lượt kiểm này.

Kiểm tra mới chạy bằng `node --test tests/original-source.test.cjs`. Ghi nghiên cứu thật vẫn cần công cụ đọc nguồn/ảnh và quyền lưu phù hợp của người dùng hiện tại; một URL hay cờ imageVerified không chứng minh đã có bản gốc.
