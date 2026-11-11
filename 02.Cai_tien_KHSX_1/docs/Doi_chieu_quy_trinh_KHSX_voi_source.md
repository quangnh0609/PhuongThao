# Đối chiếu quy trình KHSX với source

Ngày đối chiếu: 11/11/2026. Source gốc: `D:\Project\PhuongThao\FastBusinessOnline`. Ưu tiên source khi mô tả hành vi hiện có; ghi chú họp là nguồn yêu cầu thay đổi. Phần xử lý mã hóa được bổ sung bằng xác nhận trực tiếp của người dùng khi có, ghi rõ nguồn xác nhận thay vì suy ra chức năng không tồn tại. Chỉ đọc source, không sửa hoặc chạy chứng từ/database.

## 1. Nhận diện ba kênh

| Kênh | Trang | Controller | Bảng / mã chứng từ |
|---|---|---|---|
| Bán lẻ | `Main/pghrod.aspx` | `RODTran` | `m100$…`, `d100$…`; `ROD` |
| Trường | `Main/pgh.aspx` | `ODTran` | `m99$…`, `d99$…`; `OD1` |
| Công sở | `Main/pghoo1.aspx` | `OOTran` | `m101$…`, `d101$…`; `OO1` |

Căn cứ trực tiếp: bộ chọn PGH vào LSX khai báo `loai_pgh`: **1 Công sở, 2 Bán lẻ, 3 Trường**, rồi ánh xạ sang bảng **101, 100, 99**. Xem [MOGoodsRequestFilter.xml:33](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Filter/MOGoodsRequestFilter.xml:33) và [ánh xạ bảng tại dòng 82](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Filter/MOGoodsRequestFilter.xml:82).

Các màn hình duyệt tương ứng là `dpghrod.aspx` → `RODApproval`, `dpgh.aspx` → `ODApproval`, `dpghoo1.aspx` → `OOApproval`. PGH có trạng thái Chờ duyệt, Duyệt, Đang chuyển hàng. Ví dụ [RODTran.f:200](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Dir/RODTran.f:200). Chưa xác nhận số cấp duyệt từ dữ liệu cấu hình runtime.

Không dùng cùng mã `loai_pgh` cho mọi màn hình: bộ chọn của Phiếu hoạch định dùng **1 Bán lẻ, 2 Trường**; bộ chọn của LSX dùng **1 Công sở, 2 Bán lẻ, 3 Trường**.

## 2. Căn cứ cho các mũi tên trong workflow

| Quan hệ | Bằng chứng trong source | Mức kết luận |
|---|---|---|
| Kế hoạch gọi hàng năm → PGH Trường | [ODDetail.f:339](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/ODDetail.f:339) có menu lấy Kế hoạch gọi hàng năm; [ODDetail.xml:361](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/ODDetail.xml:361) mở `ODFilter`; [ODMultiForm.f:11](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Filter/ODMultiForm.f:11) chỉ định `zvkhgoihangnam`; [ODMultiGrid.f:23](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/ODMultiGrid.f:23) tham chiếu bảng kế hoạch gọi hàng năm. | Có đường kế thừa được khai báo. `ODFilter.f:30` lại ghi table `zvkhsanxuatnam`; cần kiểm tra runtime trước khi kết luận đường này hoạt động đúng mọi trường hợp. |
| Kế hoạch gọi hàng năm → PGH Bán lẻ | [RODDetail.f:336](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/RODDetail.f:336) có menu; [RODDetail.xml:364](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/RODDetail.xml:364) mở `RODtoKHGHNFilter`; [RODtoKHGHNFilter.f:30](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Filter/RODtoKHGHNFilter.f:30) và [RODtoKHGHNMultiGrid.f:23](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/RODtoKHGHNMultiGrid.f:23) trỏ kế hoạch gọi hàng năm. | Có đường kế thừa. Không lần nhầm sang `RODFilter` chỉ vì trùng tiền tố; handler hiện đọc được gọi `RODtoKHGHNFilter`. |
| PGH đã duyệt của ba kênh → LSX trực tiếp | [MOGoodsRequest.f:270](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/MOGoodsRequest.f:270) có menu PGH; [MOGoodsRequest.xml:273](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/MOGoodsRequest.xml:273) mở bộ chọn; [MOGoodsRequestMultiGrid.xml:205](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/MOGoodsRequestMultiGrid.xml:205) ánh xạ đủ ba bảng. | Có quan hệ kế thừa cho ba loại. Bộ lọc trực tiếp yêu cầu trạng thái PGH 2/3, chưa dừng SX, còn số lượng và `sl_hoach_dinh = 0` tại dòng 225–233. Không có nghĩa chọn tự do mọi PGH đã duyệt. |
| PGH Bán lẻ/Trường → Phiếu hoạch định | [PP1Detail.xml:310](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/PP1Detail.xml:310) mở `PP1GoodsRequestFilter`; [PP1GoodsRequestFilter.f:32](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Filter/PP1GoodsRequestFilter.f:32) chỉ có Tất cả/Bán lẻ/Trường; [PP1GoodsRequestMultiGrid.xml:188](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/PP1GoodsRequestMultiGrid.xml:188) chỉ nối bảng 100/99. | Nhánh chọn nhiều PGH hiện đọc được chỉ lấy hai kênh. Có điều kiện trạng thái, `tinh_hoach_dinh = 1` và phần số lượng còn lại ở dòng 181–185. |
| Phiếu hoạch định → LSX | [MOGoodsRequest.f:282](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/MOGoodsRequest.f:282) có menu hoạch định; [MOGoodsRequest.xml:279](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/MOGoodsRequest.xml:279) mở bộ chọn; [MOProductionPlanningMultiGrid.xml:168](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/MOProductionPlanningMultiGrid.xml:168) đọc bảng 900. | Có đường kế thừa, yêu cầu phiếu hoạch định trạng thái 1 và số lượng chưa chuyển hết LSX tại dòng 173–178. |
| Phiếu hoạch định → xuất điều chuyển kho | [PP1Tran.xml:75](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Dir/PP1Tran.xml:75) ghi phần sử dụng tồn; dòng 82–84 kiểm tra tồn kho chung và gọi `FastBusiness$Voucher$AutoGenerate$PP1`. | Có nhánh gọi tự sinh theo điều kiện, dùng `reference_pxb` và bảng điều chuyển. Thân stored procedure không có trong phần source đã đọc nên chưa xác nhận toàn bộ trường dữ liệu/chứng từ được sinh. |
| LSX → Sản xuất | [MOTran.xml:198](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Dir/MOTran.xml:198) khai báo trạng thái Lập chứng từ, Kế hoạch, Sản xuất, Hoàn thành, Đóng. | “Sản xuất” trong flow là trạng thái/nghiệp vụ của LSX; chưa chứng minh một màn hình thực hiện riêng hoặc bắt buộc đi tuần tự mọi trạng thái. |
| LSX → nhập kho | [IRTran.f:196](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Dir/IRTran.f:196) gắn `IRGoodsRequest`; [IRGoodsRequest.xml:41](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/IRGoodsRequest.xml:41) lưu liên kết SX1; [IRGoodsRequest.xml:534](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/IRGoodsRequest.xml:534) có nút lấy gọi hàng từ LSX; [IRMOGoodsRequestMultiGrid.xml:191](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/IRMOGoodsRequestMultiGrid.xml:191) đọc `phsx` và `ghsx`, chọn phần còn chưa nhập. | Có liên kết nhập theo LSX qua Phiếu nhập kho `IRTran` (`Main/inctpnd.aspx`). Không đồng nhất với `WHTran` — Phiếu nhập kho thực tế. |

“Tất cả” trong bộ chọn Phiếu hoạch định nghĩa là tất cả loại được khai báo tại bộ chọn đó, không suy ra bao gồm Công sở. `PP1GoodsRequestMultiForm.xml` còn có nhánh xử lý `OO1`, nhưng truy vấn chọn hiện tại không lấy bảng 101; đoạn xử lý còn tồn tại không đủ để khẳng định người dùng có thể chọn Công sở qua nhánh này.

## 3. Chức năng có mã nhưng chưa xác nhận đang mở

**Lấy KHSX năm vào LSX:** [MOGoodsRequest.f:273](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/MOGoodsRequest.f:273) và [MOGoodsRequest.xml:391](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/MOGoodsRequest.xml:391) bọc menu `commandArgument="30"` trong comment XML. Bản XML vẫn có handler mở `MOAnnualProductionPlanFilter` tại dòng 275–277, cùng filter/form liên quan. Kết luận chính xác là **menu tại vị trí này bị tắt, một phần mã đã tồn tại**; không kết luận toàn bộ chức năng chưa phát triển, cũng chưa khẳng định không có điểm gọi khác.

**Kế hoạch năm theo kênh:** [zvkhgoihangnam.xml:66](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Dir/zvkhgoihangnam.xml:66) khai báo trường kênh 1 Bán lẻ, 2 Trường, có `inactivate="true"`. Có trường trong khai báo chưa đủ để kết luận người dùng đang nhập được trường này. Chưa thấy căn cứ nối kế hoạch gọi hàng năm vào Công sở. Với quan hệ Kế hoạch gọi hàng năm → KHSX năm, người dùng xác nhận khi lập KHSX năm có lấy dữ liệu kế hoạch gọi hàng. Đã bổ sung quan hệ này vào workflow. Source có [action `goi_hang` tại zvkhsanxuatnam.f:178](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Dir/zvkhsanxuatnam.f:178) và [cột “SL KH gọi hàng” tại dòng 33 của grid chi tiết](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Grid/zvkhsanxuatnamct.f:33); phần xử lý action và clientScript bị mã hóa nên chưa xác nhận được truy vấn nguồn, bộ lọc và công thức lấy dữ liệu.

**Sửa hàng, email và logo:** tiếp tục giữ trong danh sách yêu cầu cải tiến. Đối chiếu lần này chưa đủ căn cứ để đưa chúng thành bước bắt buộc chung trong flow hiện hành.

**Phát hàng:** [PHTran.f:125](D:/Project/PhuongThao/FastBusinessOnline/App_Data/Controllers/Dir/PHTran.f:125) khai báo Phiếu phát hàng với tên tiếng Anh `School Sales Receipt`; không đủ căn cứ nối chứng từ này làm đầu ra chung cho cả ba kênh. Workflow hiện tại dừng ở nhập kho và nhánh xuất điều chuyển, không suy diễn chuỗi bán/giao hàng phía sau.

## 4. Giới hạn của việc xác nhận bằng source

- Cây source có cả `.f` mã hóa và một số `.xml` đọc được. Có khác biệt nội dung giữa các bản; chưa xác nhận runtime ưu tiên nạp bản nào. Các kết luận về SQL/JavaScript ở XML được ghi là theo bản đọc được, không tự coi đó là bản triển khai đang chạy.
- Chưa thực thi hệ thống, truy vấn database hoặc đọc được thân các stored procedure chỉ xuất hiện dưới dạng lời gọi.
- Xác nhận có menu/handler/quan hệ bảng khác với xác nhận chức năng chạy thành công. Các lỗi note nêu vẫn cần dữ liệu tái hiện.
- Chưa có căn cứ lấy chức năng nền MPS/MRP làm quy trình tùy biến chính của Phương Thảo chỉ vì cùng tên “kế hoạch sản xuất”.

Workflow đã hiệu chỉnh: [Quy trình ba kênh](Quy_trinh_KHSX_theo_note_hop.md).
