# Visual Insight: một ý hiểu được qua hình

## Mục tiêu

Biến một insight thành hình tối giản mà người xem hiểu trong 2–3 giây. Hình phải biểu đạt quan hệ/nguyên nhân/kết quả của ý, không chỉ là một quote card trang trí. Mỗi visual có đúng một kết luận; hai ý ngang nhau nên tách thành hai bài.

Đọc Brand DNA và brief của học viên. Không dùng nhân vật/linh vật/logo của người tặng. Có linh vật của học viên và asset đúng được xác nhận thì có thể dùng; không có thì bỏ.

## Quy trình sáng tạo

1. Viết insight trong một câu đơn giản và nhận diện quan hệ cần nhìn thấy.
2. Tạo 3 concept thực sự khác nhau; mỗi concept ghi format, chủ thể, quan hệ, ít chữ và lý do dễ nhớ.
3. Chấm 1–5 cho: đúng insight; hiểu nhanh; dễ nhớ; làm được với asset/công cụ hiện có. Chọn concept mạnh nhất và giải thích gọn.
4. Tạo 3 headline; ưu tiên 5–12 từ, kết luận rõ. Chọn một headline và viết chính xác mọi nhãn sẽ xuất hiện.
5. Xác định bố cục, khoảng trắng, accent và chữ ký nhỏ nếu brand có.
6. Tạo thiết kế/ảnh thật, mở kết quả và QA. Không chấm hình từ prompt.

## Sáu format

| Mã | Format | Cách dùng |
|---|---|---|
| A | Visual Metaphor | Một vật thể/tình huống thể hiện ý trừu tượng: nút thắt, ống nghẽn, domino, cầu, pin |
| B | So sánh | Hai trạng thái cạnh nhau, cùng tiêu chí để nhìn ra khác biệt |
| C | Cùng vật thể, nhiều trạng thái | Thay mức đầy, hướng, kích thước, số lượng hoặc màu để biểu đạt thay đổi |
| D | Sơ đồ cực đơn giản | Chỉ các nút và đường nối cần để hiểu luồng/quan hệ |
| E | Object Collection | 3–7 vật thể thành một bộ; mỗi nhãn 1–3 từ |
| F | Big Idea Poster | Headline lớn + một hình/chi tiết duy nhất cho quan điểm mạnh |

Vật thể có thể dùng: đường đi, bình chứa, thang, ống, đồng hồ, ổ cắm, nút giao, hàng đợi, nam châm, cân, hộp, dây nối, mạng lưới. Chọn theo ý, không dùng cùng một ẩn dụ cho mọi bài.

## Quy cách thiết kế

- Mặc định 1080×1350, 4:5; đổi khi brief cần và công cụ hỗ trợ.
- Nền trắng/sáng, chữ tối rõ, nhiều khoảng trống và một accent theo brand đã xác nhận.
- Thường 3–7 thành phần hình; một headline; 1–3 nhãn. Không có đoạn văn dài trên ảnh.
- Hình biểu đạt ý trước; font hỗ trợ dấu tiếng Việt, hierarchy rõ trên điện thoại.
- Linh vật tùy chọn: góc dưới/cạnh chữ ký/cạnh kết luận, thường 5–15% diện tích; nếu là nhân vật chính phải có lý do kể chuyện. Không tạo bản sao linh vật của người tặng.
- Tránh robot AI, neon/cyberpunk, logo lớn, CTA lớn và chi tiết chỉ để trang trí khi chúng không phục vụ insight.

Chưa có nhận diện: dùng nền trắng, chữ đen/xám và accent tạm được nói rõ là đề xuất. Không tự dựng logo hay tuyên bố đó là palette chính thức.

## Caption

Giọng theo Brand DNA; nếu chưa có dùng tôi/bạn, câu ngắn và thực tế. Hook một câu → thực tế 3–6 dòng → nguyên nhân → nguyên tắc dễ nhớ → CTA nhẹ. Thường 150–350 từ hoặc theo brief. Caption đào sâu insight, không kể lại vị trí từng vật thể trong hình. Không áp Story Ads bảy phần hay chốt bán cho mọi bài.

## Hồ sơ cần lưu

INSIGHT; 3 concept và điểm; concept chọn/lý do; 3 headline và headline chọn; chữ trên ảnh chính xác; bố cục chủ thể/quan hệ/vùng chữ; accent/font; linh vật có/không và nguồn; asset thật và đã xem chưa; prompt/tệp thiết kế; caption/CTA; 2 biến thể tiếp theo; QA; output thực với phiên bản/kích thước.

## Khung prompt ảnh

```text
Tạo Visual Insight tối giản 4:5 1080x1350.
Thông điệp: [insight đã chọn].
Format và concept: [A–F + chủ thể/quan hệ].
Bố cục: [vùng và khoảng trắng].
Headline chính xác: [chữ đã chọn]. Chỉ có nhãn: [nhãn ngắn].
Nền sáng, chữ tối rõ, accent [màu brand hoặc đề xuất tạm đã nêu].
[Linh vật: reference asset đúng + vai trò/vị trí/diện tích, hoặc không dùng].
Chữ ký [tên đã xác nhận] rất nhỏ nếu có.
Người xem hiểu ý trong 2–3 giây; không đoạn văn, không chi tiết thừa.
```

Điền khung thành prompt hoàn chỉnh trước khi gửi công cụ. Dùng reference asset ID thật khi API yêu cầu; không đưa placeholder vào bản render. Native image tool và renderer cục bộ có schema riêng; đọc schema thật trước gọi.

## QA sau khi mở ảnh

1. Đúng một insight?
2. Hiểu ý trong 3 giây?
3. Hình vẫn nói được ý khi chưa đọc caption?
4. Chữ đã rút gọn hợp lý và đúng tiếng Việt?
5. Bỏ được chi tiết chỉ để trang trí?
6. Visual giúp nhớ ý hơn một quote card thông thường?
7. Linh vật hỗ trợ ý hoặc đã bỏ khi gây nhiễu?
8. Headline rõ trên màn hình nhỏ?
9. Không biến thành poster bán hàng hoặc infographic nhồi chữ?
10. Bỏ logo/brand vẫn có giá trị?

Từ 2 câu không đạt → tạo lại concept/bố cục liên quan. Ghi tiêu chí chưa kiểm tra khi chưa có preview, không đánh PASS thay người xem.
