# Các nội dung cần chỉnh sửa KHSX

Nguồn: [Ghi chú họp](../input/note_meeting_2026_10_11.md), đối chiếu source `FastBusinessOnline` và các xác nhận của người dùng.

## 1. Kế hoạch gọi hàng và kế hoạch sản xuất năm

| Mã | Nội dung cần sửa |
|---|---|
| KH-01 | Kiểm tra việc lấy dữ liệu Kế hoạch gọi hàng năm khi lập KHSX năm và xử lý trường hợp đầu vụ Trường không lên được nhu cầu như note phản ánh. Chức năng lấy dữ liệu đã có; kiểm tra dữ liệu thiếu/sai, không xây lại thành chức năng mới. |
| KH-03 | Thêm thao tác nhập tỷ lệ tăng trưởng một lần cho tất cả các dòng Kế hoạch gọi hàng. Hiện đã có trường tăng trưởng từng dòng và tính lại số lượng theo tỷ lệ; bổ sung thao tác hàng loạt trên nền này. |
| KH-04 | Tự mặc định số kế hoạch khi tạo KHSX năm. Trường Số KH hiện bắt buộc nhập; bổ sung/hoàn thiện việc cấp số tự động. |

## 2. Lệnh sản xuất

| Mã | Nội dung cần sửa |
|---|---|
| LSX-01 | Khôi phục và hoàn thiện lấy KHSX năm vào LSX. Source đã có handler và filter/form, nhưng menu lấy dữ liệu này đang bị comment trong cả `.f` và `.xml`; kiểm tra phần xử lý trước khi mở lại. |
| LSX-02 | Cho một LSX kế thừa nhiều PGH thuộc nhiều kênh Bán lẻ, Trường, Công sở; kiểm tra ràng buộc khiến một LSX hiện chỉ lấy được một kênh. Bộ chọn hiện đã hỗ trợ ba loại PGH nhưng mỗi lần lọc chọn một loại; mở rộng việc kết hợp dữ liệu nhiều kênh trên cùng LSX. “Dùng chung” là cách phân bổ hàng, không phải kênh thứ tư. |
| LSX-03 | Cho thêm mặt hàng ngoài PGH vào LSX; lưu phần chưa có PGH để ghép với PGH phát sinh sau. Hiện mã hàng ở tab Chi tiết chỉ đọc, nút thêm dòng bị comment trong bản XML; cần bổ sung cách nhập hàng và theo dõi phần đã ghép/chưa ghép. |
| LSX-04 | Sửa trường hợp cùng mã hàng trên một PGH Công sở không chia được thành nhiều LSX cho nhiều nhà gia công dù vẫn còn số lượng. Source đã theo dõi SL đã chuyển LSX và kiểm tra tổng SL sản xuất không vượt SL duyệt cộng điều chuyển PGH; rà soát điều kiện chọn/lưu và cách tính phần còn lại, giữ kiểm soát tổng số lượng. |
| LSX-05 | Thêm nhập tên logo, ghi chú may mác và số lượng theo từng mã hàng; lưu dữ liệu để nạp lại, thể hiện trên mẫu in gửi email. Thiết kế chi tiết bên dưới. Cần chốt giới hạn 3 trường/kênh trong ghi chú đầu so với 5 logo ở phần chi tiết. |
| LSX-06 | Kế thừa đầy đủ ghi chú từ PGH Trường và Bán lẻ sang LSX. Bản XML hiện chỉ nạp ghi chú nguồn từ PGH Công sở; phần chuyển ghi chú sang chi tiết LSX đã có, cần bổ sung dữ liệu nguồn của hai loại còn lại và kiểm tra toàn bộ đường lấy PGH. |
| LSX-07 | Kế thừa tệp đính kèm PGH sang LSX cho Trường và Bán lẻ; hoàn thiện email LSX kèm hình sản phẩm và mẫu in có logo. Giữ luồng Công sở đã có theo note, bổ sung các kênh và nội dung còn thiếu. |
| LSX-08 | Thêm mã giao dịch LSX sửa hàng học sinh, phân biệt sửa hàng Công sở: xuất một hoặc nhiều mã hàng cũ để tạo một mã hàng mới. Hỗ trợ sửa theo PGH, sửa để nhập kho dự trữ và kết hợp hai mục đích trên cùng phiếu; liên kết được các bước xuất hàng cũ, sửa và nhập thành phẩm. |
| LSX-09 | Tab Chi tiết: đổi “SL gọi hàng” thành “SL SX KH”, “SL thực tế” thành “SL SX TT”. Hai cột đã có trong source; sửa nhãn hiển thị. |

### Nhập logo trên LSX

- Thêm nút ở tab Chi tiết để mở màn hình nhập logo.
- Phần đầu có 5 ô nhập tên logo; lưới có Mã hàng và 5 cột số lượng, tiêu đề lấy theo tên logo.
- Khi mở, lấy danh sách hàng từ chi tiết LSX và nạp lại số lượng logo đã lưu.
- Lưu vào tab “log” theo note: `ma_hang`, `stt_logo`, `ten_logo`, `so_luong`; đây là dữ liệu phân bổ logo.
- Thể hiện phân bổ logo trên mẫu in đính kèm email.

## 3. Phiếu gọi hàng và phân quyền

| Mã | Nội dung cần sửa |
|---|---|
| PGH-01 | Xử lý việc sửa sai/thiếu PGH sau khi đã sinh LSX cho một phần chủng loại. Source đang chặn sửa/xóa khi đã phát sinh sản xuất, nhập kho, điều chuyển PGH hoặc hoạch định. Nghiên cứu phiếu điều chỉnh tăng/giảm số lượng gắn với PGH gốc, tránh phải hủy phần LSX đã triển khai; phương án điều chỉnh âm/dương cần chốt. |
| PGH-02 | Cấp quyền cho admin bỏ duyệt PGH từ khâu cuối về khâu đầu mà không cần đúng người đã duyệt. Kiểm soát điều kiện có chứng từ liên quan; quyền bỏ duyệt không tự gỡ các khóa sửa/xóa PGH đã phát sinh. |

## 4. Kho và phát hàng

| Mã | Nội dung cần sửa |
|---|---|
| KHO-01 | Cải tiến nhập kho nhiều mặt hàng của nhiều LSX trong một lần thao tác. Phiếu nhập kho đã có liên kết LSX ở từng dòng, bộ chọn và chức năng phân bổ; kiểm tra điểm đang vướng để mở rộng cách chọn/gộp hàng, không xây lại liên kết LSX. Cần xác định thao tác vướng ở Phiếu nhập kho hay Phiếu nhập kho thực tế. |
| KHO-02 | Cho nhập kho vượt SL trên PGH. Kiểm tra bộ chọn phần chưa nhập và cách phân bổ hiện có; bổ sung xử lý phần vượt nhưng vẫn giữ liên kết PGH/LSX. Chốt giới hạn được vượt; note chưa yêu cầu cho vượt SL của LSX. |
| KHO-03 | Phiếu phát hàng: thêm nhập size và số lượng thay quét QR; tìm mã hàng có tồn. Một mã phù hợp thì tự lấy; nhiều mã thì chọn theo quy tắc cần chốt; không tìm thấy mã hoặc không đủ tồn thì cần thống nhất cách xử lý. Chênh lệch với thực tế được xử lý qua kiểm kê. |
| KHO-04 | Phiếu phát hàng: cho sửa trực tiếp Mã hàng ở tab Phát hàng thay vì xóa dòng rồi quét lại. Trường Mã hàng hiện khai báo chỉ đọc; mở cách sửa và cập nhật lại thông tin phụ thuộc mã hàng. |
| KHO-06 | Phiếu xuất điều chuyển, tab Gọi hàng: đổi “SL gọi hàng” thành “SL SX TT”. Tab này hiện đã có liên kết PGH/LSX và chức năng phân bổ; đối chiếu giá trị cột trước khi đổi nhãn. |

## 5. Lỗi phiếu hoạch định và báo cáo

| Mã | Nội dung cần sửa |
|---|---|
| LOI-01 | Sửa lỗi lưu Phiếu hoạch định; kiểm tra bước lưu/ghi nhận, liên kết PGH và nhánh tự sinh điều chuyển khi sử dụng tồn kho chung. Cần phiếu mẫu và thao tác gây lỗi. |
| BC-02 | Sửa BC2 — Tiến độ LSX chi tiết. Đối chiếu màn hình `rpt_tdlsxct.aspx`, controller `rptProductionProgressAccordingDetailedPO` với báo cáo người dùng phản ánh và số liệu đúng. |
| BC-04 | Sửa BC4 — Theo dõi điều chuyển giữa các PGH. Xác định đúng báo cáo, kiểm tra chứng từ nguồn và số lượng điều chuyển; cần trường hợp số liệu sai. |
| BC-05 | Sửa BC5 — Theo dõi KHSX năm. Xác định đúng báo cáo, kiểm tra dữ liệu kế hoạch, PGH, LSX và nhập kho liên quan; cần kỳ/năm và chỉ tiêu đang sai. |
