# Lưu dữ liệu và kiểm tra phiên bản

Lịch có duyệt và tự sản xuất dùng `scripts/campaign.cjs` cùng **automation.md**: research-profile/sources/scan-next/collect/stories/plan/approve/queue/claim/finish/block/retry/spec/register/status. `content.cjs plan` bên dưới giữ tương thích với kho lịch cũ, chỉ là danh sách biên tập; không cấp quyền hay tạo hàng đợi. Dùng campaign.cjs cho `/lich` từ bản 1.4.1. `content.cjs new --task TASK_ID` chống tạo lại post của một việc đang tiếp tục. Đừng tự ghi trạng thái/approval vào JSON để vượt helper.

Tài liệu này dành cho AI điều khiển helper; học viên chỉ dùng lệnh chat. Dùng Node do 9B cung cấp và truyền argument array qua exec khi có thể. Tất cả lệnh nhận `--project <path>`; nếu bỏ thì helper lấy `runtime.json` của skill. Không đổi project giữa các bước trong một bài. Với content.cjs, --file/--path/--receipt dùng **đường dẫn tuyệt đối** vì chúng được tính từ cwd; renderer tính input/media tương đối từ project.

## Kho riêng sau cài

`<workspace>/freeup-content-data/` có `project_config.json`, `database/` (brand_config, strategy, idea_bank, ideation_pipeline, post_inventory, media_assets, preferences, metrics), `media-input/` (personal_image, image_stock, celebrity_image, background-video, music, logo, mascot), `templates/` và `media_output/`.

`init` tạo file còn thiếu, giữ dữ liệu đã có. `/caidat` chỉ hỏi phần chưa đủ; đọc brand và strategy trước khi thay đổi. Học viên có thể sao lưu toàn bộ `freeup-content-data` để chuyển máy. Không dùng đường dẫn máy giảng viên.

## Lệnh helper

Chạy `node "{baseDir}/scripts/content.cjs" help` để đọc giao diện. Ví dụ dưới đây là đối số của helper, không phải lệnh bắt học viên gõ.

| Tác vụ | Đối số |
|---|---|
| Khởi tạo/kiểm tra | `init`, `doctor` |
| Kiểm hồ sơ | `profile` — complete/missing/question_groups từ dữ liệu đã lưu; đọc nguồn đang có trước khi hỏi phần missing |
| Xem thành phẩm | `outputs [--id <ID>]` — caption, file thật, đường dẫn và trang index.html offline; không phải link truy cập điện thoại |
| Mở thư mục | `open [--id <ID> hoặc --all true] --confirm "chỉ dẫn mở thư mục của học viên"` — mặc định bài cập nhật gần nhất, --all true mở toàn kho; chỉ gọi khi học viên yêu cầu, mở Explorer trên máy chạy 9B |
| Bổ sung hồ sơ | `setup --file brand-input.json` — nhận từng phần, merge giữ trường cũ; các field: brand_name, target_audience, founder, products, usp, tone_of_voice, content_goal, profile_provenance, pronouns, forbidden_words, brand_identity; configured chỉ true khi profile đủ |
| Chiến lược | `strategy --file strategy-input.json` — content_pillars là mảng không rỗng; mỗi trụ cột gồm tên, đối tượng, góc nhìn và nguồn phù hợp |
| Ý tưởng | `ideas --file ideas.json` — mảng hoặc object có topic và sources; `ideas` để xem kho |
| Bài mới | `new --topic "..." --format story --mode produce --goal authority [--idea <idea-ID>]` |
| Chuyển format | `new --topic "..." --format carousel --parent <ID-goc>` — tạo job mới, giữ bài gốc và nguồn |
| Xem bài | `list`, `show --id <ID>` |
| Lưu nội dung | `update --id <ID> --file content-fields.json` |
| Ghi media local | `artifact --id <ID> --path <file> --role slide-01` — từng slide role riêng; lần sửa cùng role tạo version mới |
| Ghi native asset | `artifact --id <ID> --native <UUID> --receipt <receipt.json>` — receipt có success:true và asset_id đúng ID do tool trả |
| QA | `qa --id <ID> --file qa.json`, rồi `validate --id <ID>` |
| Duyệt chữ | `approve --id <ID> --by "học viên" --note "chỉ dẫn thật" --scope content` |
| Duyệt media | `approve --id <ID> --by "học viên" --note "chỉ dẫn thật" --scope media` |
| Duyệt đăng | `approve --id <ID> --by "học viên" --note "chỉ dẫn thật" --scope publish --channel <ID-kenh> --at now` hoặc ISO có múi giờ |
| Ghi lịch tool đã tạo | `schedule --id <ID> --schedule-id <ID-that> --channel <ID-kenh> --at <ISO-offset> --evidence <receipt>` |
| Ghi bài đã đăng | `published --id <ID> --channel <ID-kenh> --url <permalink> --evidence <receipt>` |
| Feedback | `feedback --id <ID> --text "..." --scope current`; dùng permanent và --by chỉ khi học viên yêu cầu lưu làm quy tắc lâu dài |
| KPI | `metrics --id <ID> --file metrics.json` — cần source, observed_at, định nghĩa và các số liệu thật |
| Mẫu | `templates`; `templates --file template.json` — cần id/name/format/definition, ID mới khi sửa |
| Kho ảnh | `assets [--file assets.json]` — mỗi item cần kind/source/path hoặc native_asset_id; path local được kiểm có thật |
| Kênh | `channels [--file channels.json]` — mỗi item cần id/platform/verification_evidence từ tool; không lưu token/cookie |
| Lịch biên tập | `plan [--file plan.json]` — mỗi item cần topic/format/planned_at; trạng thái EDITORIAL_PLAN không phải lịch native |

Các format: story, founder-quote, visual-insight, image, carousel, infographic, comment-chain, reels, broll. Mode: produce, review, plan. `new` trả ID và folder thật; dùng kết quả đó, không tự đặt ID. `caption.txt` là bản đăng. Lưu nội dung gốc ở `master_content.md` cùng folder. Cả hai đều nằm trong hash QA/phê duyệt; sửa sau duyệt sẽ không được đăng bằng duyệt cũ.

Field được `update` hỗ trợ: big_idea, sources, quote, quote_candidates, quote_type, layout, preset, source_photo, headline, headline_candidates, visual_format, concepts, selected_concept, mia, text_placement, cta, design_record, comments, blocker, parent_id. Không sửa trực tiếp status/qa/approval/artifacts bằng update. Lưu storyboard/timeline/render-job vào file cùng folder và ghi đường dẫn trong design_record. Sources chứa nguồn và giới hạn của claim; ví dụ giả định phải ghi rõ là giả định.

Kho ảnh: chỉ thêm file học viên đã cấp hoặc native asset ID tool trả bằng `assets --file` cùng kind, path/native_asset_id, source, quyền dùng do học viên cung cấp, inspected_at và mô tả khách quan. Không xác định danh tính từ khuôn mặt. Việc ghi registry không thay cho mở ảnh. Với ý tưởng đã lưu, dùng `new --idea`; helper cập nhật `ideation_pipeline.json`, job_ids và trạng thái NEW/IN_PROGRESS/PRODUCED. Khi tudong không chỉ định ID, lọc NEW/IN_PROGRESS và tiếp tục job chưa xong, không làm lại PRODUCED. Thêm cùng topic+sources sẽ nhận lại ID thay vì duplicate. Muốn format mới cho ý đã làm, dùng ID đó rõ ràng; ý không bị xóa sau format đầu.

## QA và trạng thái

Mở caption/master và toàn bộ media thật trước QA. JSON cơ sở:

```json
{"reviewer":"9B đã mở bản thực","viewed_actual_artifact":true,"content_pass":true,"media_pass":true,"notes":"Kết quả kiểm tra cụ thể"}
```

Story/comment-chain chỉ chữ có thể không cần media, nhưng vẫn phải đọc bản chữ thật. Comment-chain cần `comments` là mảng chuỗi không rỗng đúng thứ tự. Founder Quote thêm `scores` (big_idea 20, quote 15, photo 15, composition 15, typography 10, color 10, personal_brand 10, mobile 5), `hard_rejection:false`, tổng ít nhất 90. Visual Insight thêm `checks` là 10 boolean; từ hai mục sai phải sửa. Xem tài liệu từng kiểu để đánh giá đúng nội dung.

`qa` chụp hash chữ và media. `validate` kiểm file tồn tại, hash, dữ liệu bắt buộc và QA; sai trả exit code 2. Duyệt chữ chuyển CONTENT_APPROVED với bài chỉ chữ hoặc PENDING_MEDIA với format cần media. Duyệt media không cấp quyền đăng. Duyệt đăng ghi đúng kênh và thời gian; helper từ chối lịch khác hoặc kênh khác. Chỉ ghi SCHEDULED/PUBLISHED sau khi native tool đã trả bằng chứng thật. Không viết receipt giả để qua kiểm tra.

BLOCKED_TOOL chỉ dùng khi năng lực/asset cần thiết chưa có: ghi blocker và trả phần đã tạo. DRAFT → CONTENT_READY → MEDIA_READY → READY_FOR_REVIEW → APPROVED → SCHEDULED/PUBLISHED là các mốc thực, không phải lời hứa. Khi sửa chữ/media, chạy QA và nhận duyệt phù hợp cho phiên bản mới.

## Native capabilities

Tra danh sách tool thực trong phiên 9B. Ưu tiên native business documents và media library của học viên khi có. `company_media_generate` dùng ID asset thật và trả native asset; nếu local file chưa import, dùng công cụ import được hỗ trợ hoặc renderer local. Không gửi local path như một native UUID. Khi không có native publisher/Sheets/voice, vẫn làm content và xuất file; giải thích năng lực cần kết nối cho bước còn lại.

`/lien_ket_kenh` dùng màn hình hoặc tool kết nối của 9B; học viên tự đăng nhập/OAuth. Không yêu cầu dán cookie/mật khẩu vào chat. Sau kết nối, xác minh account và kênh; kết nối không đồng nghĩa duyệt đăng. `/sheets_action` chỉ đồng bộ với bảng học viên cung cấp và connector có thật, không bắt Sheets cho kho nội bộ. `/ke_hoach_content` tạo lịch biên tập trong kho; lịch này chưa phải lịch đã đặt trên nền tảng.
