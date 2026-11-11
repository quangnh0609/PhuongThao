# Điểm vào mã nguồn KHSX

Các ánh xạ dưới đây được đối chiếu trực tiếp với thuộc tính Controller trong ASPX. Đây là điểm tra cứu kỹ thuật, chưa phải kết luận về phạm vi hợp đồng hoặc nghiệm thu.

| Nghiệp vụ | Trang trong `Main/` | Controller | Điểm đọc tiếp trong `App_Data/Controllers/` |
|---|---|---|---|
| Kế hoạch sản xuất | `mctkhsx.aspx` | `MRPProductionPlanning` | `Dir/`, `Filter/`, `Grid/` có tệp cùng tên; `Templates/Upload/MRPProductionPlanning.xml` |
| Kế hoạch sản xuất năm | `zvkhsanxuatnam.aspx` | `zvkhsanxuatnam` | `Dir/zvkhsanxuatnam.f`, `Grid/zvkhsanxuatnam.f`, `Grid/zvkhsanxuatnamct.f`, `Filter/zvkhsanxuatnamImport.f`, `Templates/Upload/zvkhsanxuatnam.xml` |
| Hoạch định sản xuất | `mpshdsx.aspx` | `MPSRun` | `Filter/MPSRun.f`, `Flow/MPS.xml` |
| Truy vấn, xác nhận kế hoạch sản xuất | `mpsinquiry.aspx` | `MPSInquiry` | `Filter/MPSInquiry.f`, `Grid/MPSDetail.f` để tra cứu tiếp; quan hệ nạp cần kiểm tra trong source |
| Hoạch định nhu cầu nguyên vật liệu | `mrphdnvl.aspx` | `MRPRun` | `Filter/MRPRun.f`, `Flow/MRP.xml` |
| Truy vấn MRP | `mrpinquiry.aspx` | `MRPInquiry` | Tìm `MRPInquiry`, `MRPDetail`, `MRPRelease` trong chỉ mục controller |
| Chức năng dùng MOTran | `coctsx1.aspx` | `MOTran` | `Dir/MOTran.f`, `Dir/MOTran.xml`, `Grid/MOTran.f`, `Grid/MOTran.xml`, `Filter/MOTran.f`, `Report/MOTran.xml` |

## Bảng đã xác nhận từ khai báo

- `Dir/MRPProductionPlanning.f`: `<dir table="mctkhsx">`; khóa khai báo gồm `ngay_ct, so_dh, so_lsx, ma_sp, ma_kho`.
- `Dir/zvkhsanxuatnam.f`: `<dir table="zvkhsanxuatnam">`, `code="nam, ma_kho"`.
- `Templates/Upload/zvkhsanxuatnam.xml`: `baseTable="zvkhsanxuatnam, zvkhsanxuatnamct"`; cấu hình nhập bắt đầu dòng 6, nhận XLSX, có ánh xạ cột và kiểm tra dữ liệu.
- `Dir/zvkhsanxuatnam.f` có các đoạn `<Encrypted>`; chỉ có thể mô tả phần khai báo và logic đọc được.

## Các tên để mở rộng tra cứu

`MOAnnualProductionPlanFilter`, `MOAnnualProductionPlanForm`, `MPSVersionList`, `MPSEditPlan`, `MPSRelease`, `MRPEditPlan`, `MRPItemSitePolicy`, `MRPSalesForecast`, `MRPPeriodList`, `RODTran`, `RODDetail`, `RODtoKHGHNMultiGrid`.

Các tên này có tệp trong cây source; cần lần theo tham chiếu để xác nhận quan hệ với chức năng đang sửa. Với nhóm `zv*`, chỉ coi là mã mang tiền tố này, chưa khẳng định nguồn gốc hay phạm vi tùy biến từ quy tắc đặt tên.

Tra cứu tên tiếng Việt tại [màn hình](screens.md), theo Controller tại [chỉ mục controller](controllers.md), và theo bảng tại [tham chiếu dữ liệu](data-references.md).
