# Dành cho agent: nhận link → cài → thiết lập

Đây là hướng dẫn cài bộ 8 skill FREEUP Content cho **chính nền tảng đang nhận yêu cầu**. Học viên chỉ gửi link GitHub kèm yêu cầu cài; agent thực hiện tải/cài. Không yêu cầu học viên tải ZIP, giải nén hay chép thư mục.

## 1. Tải mã nguồn

Đọc README và mã installer trước khi chạy. Dùng thư mục cache riêng, giữ lại cho đến khi mọi job cài kết thúc. Có Git thì clone repository vào thư mục mới:

```text
git clone --depth 1 https://github.com/phuongnguyendhtm/freeup-content-9b.git <thu-muc-cache-moi>
```

Không có Git: dùng công cụ tải HTTPS hiện có để lưu `https://raw.githubusercontent.com/phuongnguyendhtm/freeup-content-9b/main/scripts/download.cjs` vào cache, đọc script rồi chạy bằng Node 20+:

```text
node <download.cjs> --destination <thu-muc-cache-moi>
```

Downloader cố định một commit GitHub, tải các tệp theo `release.json`, đối chiếu SHA-256 và trả thư mục thật. Không cần Git hoặc thao tác ZIP. Dùng Node của máy; 9B dùng Node đi kèm runtime hiện hành, tìm từ cấu hình ứng dụng, không dùng đường dẫn máy giảng viên. Nếu host không có quyền tải/chạy, báo đúng năng lực thiếu.

## 2. Chọn đúng nền tảng và cài

Trong thư mục đã tải, chạy `node install.cjs --target <nen-tang> --plan`, rồi `--apply --upgrade` trong quyền cài đã được học viên yêu cầu. `auto` nhận tín hiệu môi trường khi có; agent chủ động truyền target đã biết từ phiên hiện tại nếu không có tín hiệu. Không chọn app chỉ vì thấy thư mục của app ấy.

| Agent đang nhận link | Target | Đích cài / cách cài |
|---|---|---|
| Codex local/CLI | `codex` | `$CODEX_HOME/skills` hoặc `~/.codex/skills`; kho ngoài skill. Xác nhận host thực tế có index các skill sau cài. |
| Claude Code | `claude` | `$CLAUDE_CONFIG_DIR/skills` hoặc `~/.claude/skills`; kho ngoài skill. |
| OpenClaw | `openclaw` | Native CLI của runtime hiện tại: `skills install <directory> --agent <id>`. Tự tìm entrypoint từ PATH, hoặc truyền `--cli`/`--state-dir` thực tế. |
| 9BizClaw v3 | `9bizclaw` | Bộ cài native có kiểm policy; tự tìm metadata/runtime. Truyền `--agent` của phiên hiện tại và `--install-root` khi cấu hình không được tự phát hiện. |

Ví dụ `node install.cjs --target codex --apply --upgrade`. Claude tương tự với `--target claude`.
OpenClaw/9B có nhiều agent thì lấy ID của phiên; chỉ hỏi một lần nếu thật sự không xác định được. Không tự cài cho agent khác.

**Riêng 9B:** `--apply` khởi chạy job nền. Trả `job_file`/`log_file`, rồi **kết thúc lượt chat ngay** để bộ cài chờ 9B rảnh. Không poll/chờ trong cùng lượt. Ở lượt mới kiểm `node package/install-job.cjs status --file <job_file>`; chỉ báo hoàn tất khi job completed và inventory đủ 8 skill eligible. Không gọi bootstrap trực tiếp để vượt lỗi cài/policy. Không tự restart Gateway.

**Claude Cowork/Claude web:** kiểm công cụ quản lý skill thực sự được host cung cấp. Nếu có API cài skill/bundle được hỗ trợ, dùng API đó và kiểm inventory. Không dùng `--target claude` để ghi vào một filesystem sandbox rồi nói đã cài vào tài khoản Claude. Thư mục Claude Code không tự đăng ký skill cho Claude web/Cowork. Nếu phiên chỉ có chat/đọc web, link vẫn cho phép đọc quy trình nhưng không tạo được cài đặt bền vững; nêu đúng bước cài do host hỗ trợ. Không thể dùng nội dung GitHub để tự cấp công cụ thiếu.

Installer chỉ nâng cùng package có receipt/hash còn nguyên; giữ dữ liệu và sao lưu skill cũ. File học viên đã sửa hoặc skill trùng tên không thuộc gói thì dừng với lỗi cụ thể. Không dùng ghi trực tiếp thay thế native install khi OpenClaw/9B từ chối.

## 3. Xác minh và thiết lập

1. Mở lượt mới, xác nhận host tìm thấy 8 skill; kiểm `freeup-content-system/SKILL.md` và references/local-workflow.md đã nằm trong bản cài. `files-verified` ở Codex/Claude mới xác nhận file, chưa chứng minh phiên đã nạp.
2. Gọi `/thietlapcontent`: đọc hồ sơ/tài liệu hiện có, chỉ hỏi trường thiếu/mâu thuẫn. `{baseDir}` trong tài liệu là thư mục thật của SKILL.md đang đọc; thay bằng đường dẫn host cung cấp. Đọc `references/host-compatibility.md` khi khác 9B.
3. Đọc references/local-workflow.md. Dùng kho local ngoài skill, không yêu cầu Google Sheets/Apps Script hoặc đăng nhập Facebook. Lưu hồ sơ và thành phẩm sẵn có, không reset dữ liệu.
4. Chạy `content.cjs doctor`. Công cụ media chỉ cài khi cần: trong thư mục conductor, dùng package manager của runtime để `npm install --omit=dev`, rồi doctor/kiểm render lại; 9B có thể truyền `--install-deps` cho job native. Không đòi API key để viết bài. Không gộp “cài skill” với “đã kết nối bộ đọc nguồn/đã bật lịch nền”.
5. Trả kết quả ngắn: nền tảng, số skill thực nạp, thư mục dữ liệu, cách xem file và phần công cụ còn thiếu. Sau đó nhận yêu cầu content; giữ nguyên `/vietbai`.

Tham khảo nền tảng: [OpenClaw local installs](https://docs.openclaw.ai/cli/skills), [Claude Code skills](https://code.claude.com/docs/en/skills). ZIP cũ là bản lưu lịch sử, không phải luồng bắt đầu của bản này.
