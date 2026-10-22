# Tóm tắt module lập kế hoạch sản xuất và GAP

Phạm vi: Đối chiếu hồ sơ khảo sát năm 2025, HDSD tháng 12/2025, báo giá bổ sung ngày 10/03/2026 và HDSD khai báo luồng duyệt tháng 04/2026 trong thư mục input. Chức năng được mô tả trong HDSD là căn cứ về cách sử dụng; báo giá là phạm vi đề xuất bổ sung, chưa chứng minh đã triển khai hoặc nghiệm thu. GAP dưới đây phân biệt yêu cầu bổ sung đã ghi nhận và vấn đề cần xác minh.

## 1. Bài toán về module lập kế hoạch sản xuất

Phương Thảo cần liên kết nhu cầu gọi hàng, tồn kho, hàng đang sản xuất và kết quả nhập kho để xác định **cần sản xuất thêm bao nhiêu, phục vụ phiếu gọi hàng nào**, đồng thời theo dõi việc giao nhà gia công và đáp ứng nhu cầu từng kênh.

- **Nhu cầu nhiều kênh:** Bán lẻ, trường học và công sở. Có kế hoạch năm và nhu cầu bổ sung phát sinh; phiếu gọi hàng phải qua duyệt/xác nhận theo nghiệp vụ.
- **Cân đối nguồn đáp ứng:** Tận dụng tồn kho từng kênh, tồn kho chung, phần đã hoạch định và phần dở dang trên lệnh sản xuất để hạn chế phát lệnh dư hoặc thiếu.
- **Ưu tiên và điều chuyển:** Phân bổ theo ngày cần hàng, cho phép điều chỉnh thứ tự; điều chuyển số lượng giữa các phiếu gọi hàng, kể cả khác kênh, và xác định có cần sản xuất bù hay không.
- **Phát lệnh và giao gia công:** Tổng hợp nhu cầu thành lệnh sản xuất, kèm định mức nguyên vật liệu, bảng size, mẫu biểu và hồ sơ đính kèm.
- **Theo dõi thực hiện:** Nhập kho thành phẩm, phân bổ cho phiếu gọi hàng, theo dõi tiến độ lệnh sản xuất và tình hình thực hiện kế hoạch năm.

Lưu ý phạm vi: Tài liệu hoạch định năm 2025 tập trung vào bán lẻ và trường; công sở có quy trình phiếu gọi hàng và phát lệnh nhưng chưa có mô tả rõ việc tham gia cùng thuật toán hoạch định hai kênh này.

## 2. Giải pháp mà FBO đáp ứng

| Nhóm nghiệp vụ | Giải pháp được mô tả trong hồ sơ/HDSD |
|---|---|
| Kế hoạch năm | Kế hoạch gọi hàng bán lẻ lấy số bán năm trước cộng mức tăng trưởng do người dùng nhập. Kế hoạch sản xuất bán lẻ kế thừa nhu cầu và trừ tồn tại thời điểm lập; kế hoạch kênh trường nhập thủ công. Hồ sơ khảo sát có yêu cầu import Excel. |
| Phiếu gọi hàng | Quản lý phiếu bán lẻ, trường và công sở; duyệt/bỏ duyệt, gửi email thông báo. Bán lẻ và trường có bước KH xác nhận và tích chọn tính hoạch định. |
| Hoạch định thành phẩm | Chọn phiếu gọi hàng, sắp xếp theo ngày cần hàng, lấy nguồn đáp ứng và tính số lượng cần thêm. Ưu tiên tồn kho kênh trước, sau đó tồn kho chung; trừ lần lượt theo thứ tự dòng. Cho phép kiểm tra, điều chỉnh và lưu kết quả. |
| Phát lệnh sản xuất | Kế thừa phiếu gọi hàng, kế hoạch năm hoặc phiếu hoạch định; tổng hợp theo mã hàng; tính nguyên vật liệu theo BOM; in bộ hồ sơ và gửi email nhà gia công. |
| Điều chuyển nhu cầu | Phiếu điều chuyển giữa các phiếu gọi hàng ghi giảm phiếu xuất, ghi tăng phiếu nhận. Hồ sơ khảo sát mô tả xử lý dừng sản xuất hoặc lập lệnh bổ sung khi cần sản xuất bù. |
| Nhập kho và phân bổ | Lấy phiếu gọi hàng từ lệnh sản xuất và phân bổ thành phẩm nhập kho theo hệ số hoặc theo thứ tự từ trên xuống. |
| Báo cáo | Bảng kê phiếu gọi hàng và cảnh báo quá hạn; tiến độ LSX chi tiết/tổng hợp; theo dõi điều chuyển giữa các phiếu gọi hàng; thực hiện kế hoạch sản xuất năm. |
| Luồng duyệt công sở | HDSD tháng 04/2026 mô tả khai báo kiểu duyệt theo bộ phận/loại chứng từ, quyền duyệt và người duyệt. |

Theo HDSD 2025, công thức hiển thị là:

**SL cần thêm = SL gọi hàng − SL tồn kho kênh − SL tồn kho chung − SL đã hoạch định − SL dở dang LSX.**

Hồ sơ khảo sát giải thích tồn khả dụng phải trừ phần đã giữ chỗ; phần đã hoạch định và dở dang là nguồn đáp ứng tương lai còn lại. Khi triển khai cần thống nhất định nghĩa từng số để tránh trừ trùng.

## 3. Điểm bất cập GAP

### 3.1 Các nhu cầu bổ sung đã được ghi nhận trong báo giá

| GAP | Nội dung bổ sung FAST đề xuất | Ý nghĩa nghiệp vụ |
|---|---|---|
| G01. Liên kết hoạch định với điều chuyển kho | Khi lưu phiếu hoạch định, tạo phiếu xuất điều chuyển một bước từ kho chung về kho riêng; gửi email theo danh sách cấu hình; đổi tên cột thành “Tồn kho kênh”. | Gắn phần tồn kho chung được phân bổ với chứng từ điều chuyển kho cụ thể. Cần phân biệt với điều chuyển nhu cầu giữa các phiếu gọi hàng đã có. |
| G02. Thông tin quản lý nguyên vật liệu trên LSX | Thêm/xóa dòng, cho phép trống mã và nhập tên vật tư; thêm SL thực xuất, SL yêu cầu xuất kho = SL định mức × (1 + % cho phép). | Bổ sung khả năng ghi nhận nhu cầu xuất và lượng xuất thực tế ngoài dữ liệu BOM phục vụ mẫu in. Báo giá chưa mô tả tự động lập phiếu xuất kho. |
| G03. Thông tin chi tiết và hồ sơ LSX | Thêm tổng SL gọi hàng; đơn giá, thành tiền, loại vải chính, logo, ngày trả; nút điền SL thực tế bằng SL gọi hàng; phân biệt loại PGH khi kế thừa; kế thừa và gửi kèm tệp từ PGH. | Giảm nhập lại và bổ sung thông tin giao gia công. Nút điền mặc định SL thực tế chưa phải bằng chứng về số thực hiện. |
| G04. Nghiệp vụ phiếu gọi hàng công sở | Thêm giao dịch may mẫu, mã bộ phận, thông tin theo loại giao dịch, giới hạn chọn thành phẩm, đồng bộ tổng hợp xuống chi tiết, mẫu in và quyền xem theo cấp dưới. | Hoàn thiện dữ liệu đầu vào và quyền truy cập cho công sở/may mẫu. |
| G05. Bảo mật thông tin gia công | Ẩn/hiện mã và tên gia công trên báo cáo tiến độ theo danh sách user được phép. | Hạn chế lộ thông tin nhà gia công trên các báo cáo được nêu trong báo giá. |

Báo giá ngày 10/03/2026: PGH công sở 35 triệu, phiếu hoạch định 3 triệu, LSX 6 triệu, báo cáo tiến độ 1 triệu; tổng 45 triệu đồng. Đây là hạng mục chào bổ sung, cần đối chiếu nghiệm thu để biết trạng thái thực tế.

### 3.2 Các GAP hoặc quy tắc cần xác minh thêm

Các điểm dưới đây là nhận định qua đối chiếu tài liệu, không phải kết luận phần mềm đang có lỗi.

| Điểm cần làm rõ | Căn cứ và ảnh hưởng |
|---|---|
| Chống tính trùng nhu cầu và nguồn đáp ứng | HSKS mô tả nhu cầu còn lại đã trừ phần ra lệnh/nhập kho/hoạch định; HDSD lại nêu công thức trừ các nguồn đáp ứng trên SL gọi hàng. Cần chốt cách tính, giữ chỗ và chuyển số giữa hoạch định → LSX → nhập kho, nhất là khi chạy nhiều phiếu. |
| Sửa, hủy, tính lại và lưu nhiều lần | Chưa có quy tắc đầy đủ về hoàn trả giữ chỗ, cập nhật lệnh đã phát, đảo điều chuyển kho và ngăn tạo chứng từ trùng khi sửa/hủy/lưu lại phiếu hoạch định. |
| Nguồn cung có về kịp ngày cần hàng hay không | Có ưu tiên theo ngày cần hàng nhưng chưa mô tả cách chỉ sử dụng hàng dở dang/hoạch định có ngày hoàn thành phù hợp. Có đủ số lượng tổng chưa chứng minh đáp ứng đúng hạn. |
| Lập lịch theo năng lực sản xuất | Chưa thấy mô tả tính tải nhà gia công/chuyền, lịch công đoạn, thời gian sản xuất và tự động xếp lịch. Nếu mục tiêu cải tiến bao gồm những việc này thì cần bổ sung phạm vi. |
| Hoạch định nguyên vật liệu | BOM hiện được mô tả để tính định mức/in hồ sơ. Chưa có mô tả đầy đủ về cân đối tồn NVL, hàng mua đang về và đề xuất mua theo thời điểm cần. |
| Phạm vi công sở trong hoạch định | Thuật toán hoạch định nêu rõ hai kênh bán lẻ và trường; cần xác nhận công sở, may mẫu có tham gia chung hay chỉ phát LSX trực tiếp. |
| Ưu tiên phân bổ và làm tròn | HSKS yêu cầu danh sách PGH khi nhập kho sắp theo ngày cần hàng giảm dần, trong khi ý nghĩa ưu tiên ngày gần nhất cần được chốt rõ. Quy tắc làm tròn theo hệ số chưa nêu trường hợp đúng 0,5 và xử lý phần chênh để tổng phân bổ bằng tổng nhập. |
| Tính nhất quán của tài liệu | HDSD 2025 có nội dung duyệt công sở ghi nhầm bán lẻ; tài liệu duyệt 2026 có tiêu đề/ ví dụ đề nghị chi tiền, tạm ứng lương dù phần thao tác chọn PGH công sở. Cần chuẩn hóa trước khi dùng làm tiêu chí nghiệm thu. |

**Kết luận:** Theo tài liệu, FBO có nền tảng hoạch định số lượng thành phẩm từ nhu cầu, tồn kho và nguồn đáp ứng đang thực hiện. Báo giá tập trung hoàn thiện dữ liệu, chứng từ, điều chuyển kho và quyền truy cập. Các yêu cầu lập lịch theo năng lực, đảm bảo ngày giao và hoạch định NVL cần được xác nhận thành phạm vi riêng nếu Phương Thảo mong muốn.

## Nguồn đối chiếu

1. `HSKS.2025.PHUONGTHAO_Final.docx`: Kế hoạch năm; Phiếu gọi hàng; Điều chuyển; Phiếu nhập kho; Lệnh sản xuất; Hoạch định thành phẩm; Báo cáo.
2. `HDSD.2025.PHUONGTHAO.docx`: Mục 1–3 và 10–14, cùng phần phiếu gọi hàng và duyệt.
3. `Báo giá bổ sung tính năng phần mềm Fast Business Online_Công ty Đồng Phục Phương Thảo_QLSX.doc`: Báo giá 10/03/2026, hạng mục 1–4.
4. `HDSD.2026. Khai báo luồng duyệt PGH công sở.docx`: Danh mục kiểu duyệt; Khai báo kiểu duyệt; Quyền duyệt; Người duyệt.
