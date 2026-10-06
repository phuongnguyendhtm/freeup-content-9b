# Thư viện template và dữ liệu thiết kế

## Mẫu có sẵn

`assets/templates/catalog.json` là danh mục bố cục generic, không chứa ảnh/case riêng của người tặng. Nó dùng để chọn thiết kế, không phải lời khẳng định mọi layout đã được render hay một API native có cùng schema. Xem giao diện của `scripts/render-media.cjs` để viết dữ liệu render đúng phiên bản gói.

Nhóm mẫu gồm ảnh đơn, Visual Insight A–F, Founder Quote P01–P06, carousel, infographic, comment chain, Reels và B-roll. Học viên có thể dùng ngay nguyên tắc bố cục và bổ sung asset của mình.

## `/show_templates`

Đọc danh mục có sẵn cùng template đã lưu trong kho học viên. Hiển thị ID, loại, mô tả, khi dùng, tỷ lệ, điều kiện asset và preview thật nếu có. Chỉ nói có preview khi tệp tồn tại. Không coi template của thương hiệu khác là nhận diện của học viên.

## `/luumau`

Khi người dùng gửi mẫu/mô tả, xem tài liệu hoặc ảnh thật trước. Tách:

- Mục tiêu/thông điệp và loại format.
- Hierarchy, vùng headline/quote/body/signature, số chữ và khoảng trắng.
- Tỷ lệ/kích thước; màu/font được phép dùng và có tại runtime.
- Yêu cầu asset như ảnh cá nhân, sơ đồ, icon hoặc video.
- Nguồn/điều kiện dùng; phần học theo cấu trúc chung và phần cần tạo mới.

Lưu template ID riêng trong kho học viên, không ghi đè mẫu gốc. Nếu chưa có render, trạng thái là bố cục thiết kế, không phải template đã kiểm chứng. Chỉ lưu Golden Example khi người dùng đã duyệt output thực.

## Dữ liệu nội dung theo format

Đây là các trường biên tập cần có, **không thay schema CLI/renderer**:

| Format | Trường cần chuẩn bị |
|---|---|
| Ảnh đơn | Big Idea, headline/quote, subtext nếu cần, caption, màu/font, asset |
| Visual Insight | Insight, concept A–F, headline, nhãn, chủ thể/quan hệ/bố cục, caption |
| Founder Quote | Big Idea, quote/type/source, ảnh thật, P01–P06, preset, highlight, caption |
| Carousel | Cover, danh sách trang đúng thứ tự, mỗi trang một ý, trang kết, caption |
| Infographic | Tựa, loại quan hệ, khối/nút/bước, nguồn số liệu, caption |
| Comment chain | Post body, danh sách bình luận đúng thứ tự, CTA |
| Reels | Thoại, thời lượng từng scene, nội dung screen, asset, phụ đề, audio, caption |
| B-roll | Hook, scene/timeline, asset/nhạc được phép dùng, caption |

## Đặt tên, phiên bản và manifest

Mỗi output thuộc một bài ID và phiên bản. Lưu nguồn/thiết kế/caption/file media trong bundle của bài theo script. Với carousel, manifest là danh sách file theo thứ tự, không chỉ tên thư mục. Với video, lưu duration thực và audio/subtitle nếu có. Output AI/native có ID cần export/download bằng khả năng công cụ trước khi ghi đường dẫn local.

Không đặt đường dẫn ổ đĩa người tặng trong template. Asset mẫu không tồn tại phải được loại bỏ hoặc ghi yêu cầu bổ sung. Dữ liệu hồ sơ học viên, receipt đăng và feedback nằm trong kho riêng, không đóng lại vào ZIP skill để chia sẻ cho người khác.

## Feedback và KPI

Lưu feedback cùng bài/phiên bản và mức áp dụng: chỉ bài này, style này hoặc toàn brand theo yêu cầu người dùng. Template được cập nhật từ feedback đã rõ. KPI không tự trở thành luật thiết kế; ghi kỳ/nguồn và giả thuyết thử nghiệm, sau đó kiểm chứng ở các bài tiếp theo.
