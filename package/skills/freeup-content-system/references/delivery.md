# Bàn giao và xem kết quả

## Nơi lưu bản gốc

Mỗi học viên có kho riêng `<workspace>/freeup-content-data/`; không cần thư mục Antigravity của người tặng. Mỗi bài nằm trong `media_output/<ngày>/<ID-bài>/`, gồm `caption.txt`, `master_content.md`, hồ sơ bài, nguồn, thiết kế và các media đã xuất thực. Các lần sửa cùng vai trò tạo phiên bản mới. Khi bàn giao, dùng đường dẫn do helper trả, không tự đoán nơi cài 9B hoặc tên thư mục.

`/xem [ID]` đọc các tệp hiện có, cho xem nội dung trong chat và ảnh/video khi khả năng đính kèm của phiên cho phép. Chỉ liệt kê tệp có thật; receipt hay prompt không phải ảnh. Trang `index.html` của bài giúp xem chữ và media local trong một chỗ, mở được trên máy chứa kho dữ liệu. Đây là trang xem cục bộ, chưa phải đường dẫn Internet.

`/mothumuc [ID]` mở thư mục bài bằng ứng dụng quản lý tệp của máy đang chạy 9B, khi học viên yêu cầu mở. Nếu không có công cụ mở ứng dụng, trả đường dẫn thư mục thật và hướng dẫn sao chép đường dẫn vào thanh địa chỉ của File Explorer. Không hứa rằng một đường dẫn máy tính có thể bấm mở trên điện thoại.

## Ảnh tạo bằng công cụ doanh nghiệp của 9B

`company_media_generate` trả các bản ghi ảnh, có `id`, `mimeType`, `originalFilename`, `sizeBytes`, `mediaStatus` và `previewUrl`. Trong phiên chủ sở hữu nội bộ, công cụ còn có thể trả `localPath` của tệp thật. Dùng **đúng `localPath` vừa nhận** để ghi bản sao ảnh vào thư mục bài qua helper `artifact --id <ID-bài> --path <localPath-thật> --role image` (nhiều ảnh dùng vai trò riêng). Lưu native asset ID và receipt ở vai trò riêng để còn tìm lại trong thư viện 9B. Không suy ra đường dẫn từ asset ID, preview URL, nơi cài đặt hoặc tài liệu của người tặng.

Nếu công cụ chỉ trả native asset mà không cấp `localPath`, ảnh đã có ở **Hình ảnh doanh nghiệp → Ảnh AI** của 9B; thư mục bài lúc này chỉ có bản ghi tham chiếu/receipt. Chưa được nói ảnh đã nằm cùng caption. Dùng chức năng xuất/tải được phiên hỗ trợ để lưu bản thật, hoặc tiếp tục với renderer local phù hợp brief. Nếu chưa xuất được, nói rõ nơi xem ảnh và phần còn thiếu trong gói bàn giao.

Chat app tự hiển thị ảnh từ kết quả tạo của công cụ doanh nghiệp; không gọi `company_media_send` chỉ để xem lại ngay sau khi tạo. Khi cần gửi ảnh native vào **cuộc trò chuyện Telegram/Zalo hiện tại** và học viên đã yêu cầu nhận ở đó, công cụ nhận `assetIds` là mảng 1–10 ID thật và `caption` tùy chọn. Công cụ không nhận đường dẫn PNG local thay cho ID.

## Đính kèm tệp local vào chat

Theo chỉ dẫn runtime thực trong phiên. Khi runtime dùng trả lời cuối thông thường, mỗi tệp ảnh/video có thể dùng một dòng chỉ thị `MEDIA:<đường-dẫn-thật>` riêng, ở ngoài Markdown và ngoài khối mã; đường dẫn có khoảng trắng có thể đặt trong dấu ngoặc kép. Đây là đính kèm để runtime xử lý, không phải một dòng đường dẫn để người dùng đọc. Chỉ dùng tệp tồn tại, được phép đọc và nằm trong vùng truy cập media của phiên.

Nếu runtime yêu cầu trả lời qua công cụ `message`, dùng `message(action="send")`: một tệp trong field `media`, nhiều tệp qua `attachments: [{media: ...}]`, cùng nội dung được yêu cầu. Không dùng chỉ thị `MEDIA:` trong nhánh chỉ nhận công cụ message. Kiểm tra kết quả công cụ; nếu quyền đọc, giới hạn dung lượng hoặc kênh chặn đính kèm, giữ bản local và báo tình trạng thực. Không sửa chính sách truy cập hay đổi kênh gửi để vượt chặn.

Giao diện desktop 9B của bản được kiểm tra có bộ xem ảnh local riêng: tối đa **bốn ảnh mỗi tin**, tối đa **10 MiB mỗi tệp**, và chỉ nhận ảnh nằm trong vùng dữ liệu ứng dụng. Ảnh nằm ở workspace tùy chỉnh ngoài vùng này có thể không hiện trong chat, dù tệp vẫn tồn tại và xem được bằng trang local. Chia bộ ảnh dài thành các lượt tối đa bốn ảnh khi phiên cho phép bàn giao như vậy. Bộ xem này chưa chứng minh hỗ trợ phát MP4 trong desktop 9B; với video, bàn giao tệp thật và trang local để mở bằng trình duyệt/trình phát, hoặc gửi qua kênh có hỗ trợ được xác minh. Không áp dụng khả năng của ứng dụng OpenClaw khác thành lời hứa cho giao diện 9B.

Không gọi công cụ gửi tới tài khoản, số điện thoại hoặc nhóm khác chỉ vì chúng từng xuất hiện trong cấu hình. Chỉ bàn giao ở cuộc trò chuyện hiện tại hoặc đích học viên đã chỉ định và được phép dùng. Khi gửi nhiều ảnh, giữ thứ tự slide. Đưa caption dễ sao chép, ID bài, trạng thái QA và nơi lưu thật kèm kết quả.

## Xem trên điện thoại

Học viên có thể nhận chữ và ảnh trên điện thoại **nếu** đã kết nối kênh hỗ trợ trong 9B (ví dụ Telegram/Zalo), đang dùng cuộc trò chuyện được phép và runtime thực sự gửi được tệp. Máy chạy 9B/gateway phải hoạt động và kết nối khi tạo hoặc chuyển tệp. File local trên máy tính không tự đồng bộ sang điện thoại.

Không mặc định học viên có ứng dụng 9B trên điện thoại, không tự mở máy tính ra Internet, không dựng URL công khai và không coi `index.html` local là link cloud. Khi chưa có kênh nhận phù hợp, họ xem trên máy bằng `/xem` hoặc `/mothumuc`, hoặc chủ động sao lưu/chuyển tệp bằng dịch vụ họ chọn. Kết nối kênh và quyền gửi phải được xác minh qua công cụ thực; có cấu hình tên kênh chưa chứng minh đã gửi thành công.

## Căn cứ kỹ thuật của bản 9B được kiểm tra

Các tên module dưới đây dùng để truy vết hành vi, không phải đường dẫn phải có trên máy học viên:

- `company-media/plugin.js`, phần `safeToolAsset` và `withOwnerLocalPaths`: native ID/preview URL và điều kiện cấp đường dẫn local cho chủ sở hữu.
- Cùng module, phần đăng ký `company_media_generate`/`company_media_send`: Chat app tự xem ảnh tạo; gửi ID thật vào cuộc trò chuyện Telegram/Zalo hiện tại.
- `system-prompt-params-ltRWo8Rl.js`, phần `buildAssistantOutputDirectivesSection`: đính kèm bằng `MEDIA:` hoặc field của công cụ message tùy chế độ runtime.
- `parse-BW7ik-f7.js`, phần phân tích media: nhận đường dẫn Windows, đường dẫn được đặt trong ngoặc kép và chỉ thị ở dòng riêng.
- `chat-media-store.js` và `ipc/chat-controller.js` của desktop 9B: xem ảnh local có giới hạn số lượng/dung lượng/vùng dữ liệu; có chức năng đọc và hiện tệp ảnh trong thư mục.
- Tài liệu `nodes/media-playback.md` và `web/webchat.md`: media của chat được quản lý bởi gateway; truy cập từ xa cần kết nối và cơ chế xác thực phù hợp, không phải chia sẻ đường dẫn local.

Luôn tra năng lực thực của phiên học viên nếu phiên bản 9B khác bản đã kiểm tra.
