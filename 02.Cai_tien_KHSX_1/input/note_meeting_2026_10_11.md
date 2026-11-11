I. BP KH hàng Học Sinh (Kênh bán lẻ và kênh trường): 
1. Xem lại phần tạo KHSX năm để chạy ra nhu cầu. LSX cho đầu vụ (trường) không lấy dữ liệu được cho Kế hoạch SX năm
2. LSX muốn bổ sung thêm mã hàng ngoài PGH: có thể khác kênh và dùng chung.
3. Trên LSX muốn tách nhiều cột để ghi chú may mác theo trường hoặc có thể chia kênh (nếu có). 1 lệnh tối đa là 3 trường hoặc 3 kênh (Bán lẻ, trường, dùng chung)
4. Trên PGH trường, bán lẻ có ghi chú thì trên LSX cũng kéo ghi chú đó chạy sang (Phần PGH công sở thì kéo được sang rồi).
5. Gửi mail tự động LSX có đính kèm file hình ảnh SP trường (KD trường và bán lẻ đính kèm file hình ảnh như kênh công sở từ PGH sang LSX và sinh ra mail).
- 
6. Thêm mã giao dịch LSX cho phần hàng sửa học sinh (khác tính chất hàng sửa công sở). ví dụ Sửa hàng A về hàng B.
7. Trên 1 PGH có thể sinh ra nhiều LSX (chia theo chủng loại, ví dụ có 3 chủng loại), đã tạo ra LSX của 1, 2 chủng loại rồi.  Nhưng triển khai LSX của chủng loại thứ 3 phát hiện có sai thiếu, hoặc bổ sung thêm thì ko thể bỏ ghi PGH để sửa được vì đã sinh ra LSX. Vậy có thể làm PGH điều chỉnh âm, dương số lượng nhầm thiếu kia ko?
II. BP KHCS:
1. Trên PGH 1 mã hàng không thể tách thành 2 LSX cho 2 nhà GC, mặc dù SL 1 NGC đang chưa đủ theo PGH. 
2. Có 3 Báo cáo đang bị lỗi
- BC2. BC tiến độ LSX chi tiết bị lỗi
- BC4. BC theo dõi điều chuyển giữa các PGH
- BC5. Theo dõi KHSX năm
III. Phần hệ thống:
 Phân quyền cho TK admin có thể bỏ quyền duyệt PGH từ khâu cuối về khâu đầu mà ko phải người duyệt mới được bỏ duyệt. Vì thao tác mỗi lần sửa phiếu qua nhiều khâu khá mất thời gian.
 
 
 
 Hàng học sinh chia 4 kho
 - Tổng chung
 - Tổng kênh bán lẻ
 - Tổng kênh trường
 - Tổng bồi hàng
 
 
Kế hoạch gọi hàng
- SL bán năm trước đang chưa tự động tính => Cần tự tính (ok, do năm trước chưa có số liệu)
- Tăng trưởng tự nhập, cho phép nhập 1 phát cho tất cả các dòng => Bổ sung

Kế hoạch sản xuất năm
- Số KH phải default


Lệnh sản xuất
- Thiếu lấy kế hoạch sản xuất năm


Kiểm tra xem tại sao 1 LSX chỉ được 1 kênh

Lệnh sản xuất cho phép bổ sung thêm mặt hàng ngoài phiếu gọi hàng => Lưu lại mặt hàng chưa có Phiếu gọi hàng để mapping với phiếu goi jhangf trong tương lai
Lệnh sản xuất khi kế thừa phiếu gọi hàng, cho phép chọn nhiều phiếu gọi hàng cửa nhiều kênh khác nhau
Lệnh sản xuất, tab chi tiết cho phép nhập SL tương ứng cho từng logo để phục vụ mẫu in, gửi email
- Thêm một tab log, bấm nút bên tab chi tiết, hiển thị filter để nhập
	+ Master: có 5 trường để ghi tên 5 loại logo
	+ Detail: 6 cột, 1 cột mã hàng, 5 cột số lượng tương ứng với 5 logo, header ăn theo tên trên master
	+ Khi load thì load danh sách vật tư theo chi tiết, các cột số lượng load theo dữ liệu đã lưu lần trước
	+ Tab log có các cột: Mã hàng, stt_logo, ten_logo, so_luong
- Thể hiện logo này trên mẫu in đính kèm email

Ghi chú của PGH được chạy sang ghi chú của LSX (hiện tại chỉ đang được 1 hoặc vài loại phiếu, cần kiểm tra cho tất cả các loại phiếu gọi hàng)

Lệnh sản xuất kế thừa phiếu gọi hàng thì kế thừa luôn cả tệp đính kèm

Lệnh sản xuất cho trường hợp sửa hàng, cần xuất một hoặc nhiều mã hàng cũ để tạo một mã hàng mới. Tích hợp để tạo được LSX, sau đó chạy cho các ô tiếp theo. Có thể sẽ có trường hợp sửa theo phiếu gọi hàng (VD gọi hàng xong thì có thể sẽ sản xuất mới hoặc sửa từ mặt hàng đang có), sửa để nhập kho lưu trữ, kết hợp 2 loại trên cùng một phiếu


Báo cáo số 2, 4, 5 lỗi

fix lỗi lưu phiếu hoạch định

Nghiên cứu phương án để có thể nhập kho nhiều mặt hàng của nhiều LSX cho tiện hơn, kho đang kêu vướng mắc

----------------
Phiếu phát hàng
- Trường hợp đông quá không quét mã QR, nghiên cứu phương pháp để có thể chọn mã size và số lượng ==> Hệ thống kiểm tra và tìm về mã hàng có tồn kho để lưu vào
- Nếu không tìm được mã hàng thì sao
- Nếu tìm được 1 mã hàng thì lấy luôn
- Nếu tìm được 2 mã hàng thì đưa quy tắc lấy được 1 mã hàng => Chênh lệch so với thực tế thì tiến hành kiểm kê

Phiếu phát hàng
- Cho phép sửa luôn mã trong cột Mã hàng ở tab phát hàng, thay vì phải xóa dòng và quét lại mã mới

Phiếu nhập kho, cho phép nhập kho nhiều hơn số lượng trên PGH

Phiếu xuất điều chuyển, tab gọi hàng để làm gì???

Lệnh sản xuất
- Tab Chi tiết, đổi tên cột
	+ SL gọi hàng = SL SX KH
	+ SL thực tế = SL SX TT
Phiếu xuất điều chuyển, tab gọi hàng, sửa tên
	+ SL gọi hàng = SL SX TT