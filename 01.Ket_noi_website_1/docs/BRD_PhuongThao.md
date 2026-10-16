# BRD - Tích hợp Website Phương Thảo với FAST

## 1. Thông tin tài liệu

| Thuộc tính | Nội dung |
|---|---|
| Mã tài liệu | PT-BRD-001 |
| Phiên bản | 1.3 |
| Ngày cập nhật | 15/10/2026 |
| Trạng thái | Đã chốt ISS-004, ISS-007 và phân bổ giá trị; còn nội dung đặc tả tiếp tại mục 10 |
| Phạm vi | Tồn kho, giữ phần chưa giao và phần đã giao chờ tạo HĐBH, giao hàng nhiều lần, HĐBH/HĐĐT theo lần giao và hoàn hàng theo lần giao |
| Tài liệu tiếp nối | SRS (đặc tả chức năng và API), UAT Checklist, User Guide |

### 1.1. Nguồn yêu cầu

| Mã nguồn | Nguồn | Cách sử dụng |
|---|---|---|
| SRC-001 | Chị Thủy | Nhu cầu kinh doanh, quy hoạch tài liệu và quy ước truy vết |
| SRC-002 | Chị Thủy | Các trao đổi nghiệp vụ tồn kho, đơn hàng và hủy/hoàn |
| SRC-003 | Chị Thủy | Tài liệu giải pháp FAST hiện có, dùng đối chiếu phạm vi/khả năng đáp ứng |
| SRC-004 | Yêu cầu cập nhật trong chat ngày 08/10/2026 | Trạng thái theo giao hàng, giữ phần chưa giao, hóa đơn theo từng lần giao và hoàn đúng lần giao |
| SRC-005 | Yêu cầu cập nhật trong chat ngày 08/10/2026 | FBO chủ động đẩy tồn kho, kết quả HĐĐT MTT và hóa đơn điều chỉnh khi có thông tin mới |
| SRC-006 | Trao đổi chốt trong chat ngày 15/10/2026 | Giữ lượng đã giao đến khi FBO tạo HĐBH; phản hồi tạo HĐBH kèm tồn mới và phiên bản tồn; gọi bù qua hàng đợi retry; hoàn khi HĐĐT gốc chưa hoàn tất; Website phân bổ giá trị; bộ mã hai bên khớp nhau |

Phiên bản 1.1 thay thế mô hình ghi nhận bán ngay khi thanh toán của phiên bản 1.0. Xác nhận đã thanh toán chỉ làm đơn đủ điều kiện giữ/giao hàng; từng lần giao mới là mốc gửi FBO để ghi nhận bán, trừ tồn và phát hành HĐĐT MTT. Phiên bản 1.3 gộp lượng đã giao đang chờ FBO tạo HĐBH vào tồn bị giữ; Website chỉ nhả lượng này khi FBO phản hồi tạo HĐBH thành công kèm tồn mới. Chi tiết kỹ thuật được phát triển trong SRS.

### 1.2. Quy ước đánh mã

Mã yêu cầu: `<Module>-BR-<Số thứ tự>`. Mã quy tắc: `<Module>-BRU-<Số thứ tự>`. Module: `INV` (tồn kho), `ORD` (đơn hàng), `INVH` (hóa đơn), `INT` (tích hợp). Mã nội dung cần đặc tả tiếp: `ISS-<Số thứ tự>`.

Mã giữ ổn định qua các phiên bản; yêu cầu/quy tắc bị thay thế được ghi rõ và không tái sử dụng cho nội dung khác. SRS, chức năng/API, test case và User Guide tham chiếu mã BRD để truy vết.

## 2. Bối cảnh và mục tiêu

Website Phương Thảo sử dụng tồn thực tế từ FBO để bán hàng. Đơn đã được Website xác nhận thanh toán có thể giao một lần hoặc nhiều lần. Website giữ phần hàng chưa giao và phần đã giao nhưng FBO chưa tạo HĐBH; mỗi lần giao tạo giao dịch bán và HĐĐT riêng tại FBO/Portal. Khi hoàn hàng, cần xác định đúng lần giao và hóa đơn gốc để xử lý tồn, chứng từ và hóa đơn điều chỉnh tương ứng.

- Quản lý tồn khả dụng, không bán lại phần hàng đã dành cho đơn xác nhận hoặc đã giao nhưng FBO chưa trừ tồn.
- Giữ toàn bộ hàng chưa giao của đơn Đã xác nhận, phần chưa giao của đơn Hoàn thành 1 phần và lượng của các lần giao Chờ tạo HĐBH.
- Hỗ trợ nhiều lần giao trên một đơn; mỗi lần có danh sách hàng, số lượng và giá trị riêng.
- Tạo HĐBH và phát hành HĐĐT MTT cho từng lần giao, không xuất lại toàn bộ đơn mỗi lần giao.
- Hoàn hàng đúng lần giao, đúng dòng giao, đúng hóa đơn gốc; giữ lịch sử giao/hoàn.
- Theo dõi lỗi và gọi bù từng lần giao/hoàn đến khi FBO ghi nhận, không ghi nhận trùng.

## 3. Phạm vi và bên tham gia

| Bên/hệ thống | Vai trò |
|---|---|
| Khách hàng | Đặt hàng, nhận hàng một hoặc nhiều lần, yêu cầu hủy/hoàn |
| Nhân sự Phương Thảo | Xác nhận và theo dõi giao hàng, hủy phần chưa giao, tiếp nhận/kiểm tra hoàn hàng |
| Website | Quản lý đơn, trạng thái giao, từng lần giao/hoàn, tồn bị giữ và tồn khả dụng; phân bổ giá trị cho từng dòng giao/hoàn; gọi FBO yêu cầu bán/hoàn và gọi bù khi lỗi; cung cấp API nhận tồn và kết quả do FBO chủ động gửi |
| PMKT FBO | Quản lý tồn thực tế; tạo HĐBH/trừ tồn cho từng lần giao và phản hồi kèm tồn mới; xử lý chứng từ hoàn và nhập lại tồn phù hợp; chủ động gửi tồn và kết quả HĐĐT mới cho Website |
| Portal HĐĐT FAST | Phát hành HĐĐT MTT và HĐĐT điều chỉnh liên kết với FBO |

Website đã tự xử lý xác nhận thanh toán. Xây dựng/thay đổi cơ chế thanh toán và thực hiện hoàn tiền nằm ngoài phạm vi. Trạng thái trước Đã xác nhận do Website hiện có quản lý; không giữ hàng cho các trạng thái trước xác nhận trong mô hình này. Không có yêu cầu giữ hàng theo Chờ thanh toán hoặc tự nhả hàng theo thời hạn thanh toán T từ phiên bản 1.1.

Website và FBO dùng chung bộ mã hàng/biến thể, kho và đơn vị tính; không cần bảng ánh xạ mã. Phạm vi kho bán online được xác định trong SRS. Nhập lại hàng không đủ điều kiện bán không làm tăng tồn cấp cho Website.

## 4. Khái niệm và trạng thái

| Khái niệm/trạng thái | Ý nghĩa |
|---|---|
| Đã xác nhận | Khách đã thanh toán, chưa giao hàng; giữ toàn bộ số lượng còn cần giao |
| Hoàn thành 1 phần | Đã giao một phần, còn hàng cần giao; giữ phần chưa giao và lượng của các lần giao Chờ tạo HĐBH |
| Hoàn thành | Đã giao toàn bộ số lượng cần giao; chỉ còn giữ lượng của các lần giao Chờ tạo HĐBH, nếu có |
| Lần giao | Một giao dịch giao hàng có mã riêng, thuộc một đơn; có dòng hàng, số lượng, ngày, kho và giá trị riêng |
| Dòng giao | Một dòng của lần giao, tham chiếu dòng đơn gốc; cùng dòng đơn có thể xuất hiện ở nhiều lần giao |
| Lần hoàn | Một yêu cầu hoàn có mã riêng, trỏ đến một lần giao và các dòng giao tương ứng |
| Chờ tạo HĐBH | Trạng thái lần giao đã giao thực tế nhưng FBO chưa phản hồi tạo HĐBH/trừ tồn thành công, kể cả khi đang gọi bù do lỗi |
| Đã tạo HĐBH | Trạng thái lần giao đã được FBO phản hồi tạo HĐBH/trừ tồn thành công kèm tồn mới; Website đã nhả lượng giữ của lần giao |
| Tồn thực tế | Tồn do FBO cung cấp trong phạm vi kho cấp hàng cho Website |
| Phiên bản tồn | Thời điểm cập nhật hoặc số thứ tự tăng dần FBO gửi kèm mỗi bản tồn; dùng để loại bản tồn cũ đến sau |
| Tồn bị giữ | Lượng chưa giao của các đơn Đã xác nhận và Hoàn thành 1 phần, cộng lượng đã giao của các lần giao Chờ tạo HĐBH |
| Kết quả đồng bộ lần giao | Kết quả HĐBH, trừ tồn và HĐĐT của từng lần giao, độc lập với trạng thái giao hàng của đơn. HĐĐT có thể hoàn tất sau HĐBH và không ảnh hưởng tồn bị giữ |

Luồng trạng thái: `Đã xác nhận → Hoàn thành 1 phần → Hoàn thành`. Nếu giao hết trong một lần, chuyển trực tiếp `Đã xác nhận → Hoàn thành`. Giao thêm nhưng chưa hết thì vẫn Hoàn thành 1 phần.

Luồng trạng thái lần giao: `Chờ tạo HĐBH → Đã tạo HĐBH`.

Trạng thái đơn phản ánh giao thực tế, không chờ FBO hoặc HĐĐT thành công mới ghi nhận đã giao. Lỗi tích hợp được theo dõi tại lần giao; không dùng Đã thanh toán/Đã xuất HĐ làm trạng thái thay thế cho tiến độ giao trong mô hình này.

## 5. Danh mục yêu cầu kinh doanh

| Mã | Yêu cầu cập nhật | Trách nhiệm |
|---|---|---|
| INV-BR-001 | FBO chủ động gọi API Website cập nhật tồn thực tế khi có thay đổi, kể cả thay đổi ngoài đơn Website; mỗi bản tồn kèm phiên bản tồn | FBO và Website |
| INV-BR-002 | Website tính và hiển thị tồn khả dụng theo tồn FBO và tồn bị giữ (phần chưa giao và phần đã giao chờ tạo HĐBH) | Website |
| ORD-BR-001 | Kiểm tra đủ tồn khi chấp nhận xác nhận/giữ hàng; không giữ vượt lượng khả dụng khi nhiều đơn đồng thời được xác nhận | Website |
| ORD-BR-002 | Ngừng áp dụng: giữ Chờ thanh toán và tự hủy theo T của phiên bản 1.0 được thay thế bởi giữ phần chưa giao theo SRC-004 | Website |
| ORD-BR-003 | Mỗi lần giao gửi riêng FBO để tạo HĐBH, trừ tồn và khởi tạo HĐĐT cho đúng lượng/giá trị lần giao | Website và FBO |
| INVH-BR-001 | Mỗi lần giao có HĐĐT MTT riêng, liên kết mã đơn, mã lần giao và HĐBH tương ứng | FBO/Portal và Website |
| ORD-BR-004 | Hủy hợp lệ phần chưa giao thì nhả lượng giữ của phần đó; không tạo trả hàng/nhập lại tồn cho lượng chưa giao, chưa xuất tại FBO | Website |
| ORD-BR-005 | Hoàn một phần/toàn bộ phải chỉ rõ lần giao, dòng giao và số lượng hoàn | Website và FBO |
| INV-BR-003 | Chỉ tăng tồn bán online theo kết quả FBO khi hàng hoàn đủ điều kiện nhập lại kho bán | FBO và Website |
| INVH-BR-002 | HĐĐT điều chỉnh giảm tham chiếu đúng HĐĐT gốc của lần giao bị hoàn | FBO/Portal |
| ORD-BR-006 | Giữ lịch sử đơn, các lần giao, các lần hoàn, số lượng/giá trị và liên kết chứng từ/hóa đơn | Website và FBO |
| INT-BR-001 | Không xử lý trùng cùng lần giao hoặc cùng lần hoàn khi gửi lại | Website và FBO |
| INT-BR-002 | Theo dõi riêng kết quả bán/tồn/HĐĐT của từng lần giao và kết quả từng lần hoàn | Website và FBO |
| ORD-BR-007 | Phân biệt tiến độ giao thực tế với kết quả FBO; tiếp tục giữ lượng đã giao cho đến khi FBO phản hồi tạo HĐBH thành công kèm tồn mới | Website và FBO |
| ORD-BR-008 | Một đơn có nhiều lần giao; kiểm soát số lượng từng dòng giao không vượt phần còn cần giao | Website |
| INT-BR-003 | FBO phản hồi kết quả tạo HĐBH theo lần giao kèm tồn mới; FBO chủ động gửi kết quả HĐĐT MTT theo lần giao và kết quả hoàn/HĐĐT điều chỉnh khi có thông tin mới; bảo đảm gửi lại khi Website chưa xác nhận tiếp nhận | FBO và Website |
| INT-BR-004 | Hàng đã giao thực tế bắt buộc được FBO ghi nhận bán; yêu cầu bán/hoàn gọi FBO bị lỗi được Website gọi bù qua hàng đợi retry cho đến khi FBO ghi nhận | Website và FBO |
| INVH-BR-003 | Hoàn hàng vẫn thực hiện bình thường khi HĐĐT gốc của lần giao chưa hoàn tất; FBO tạo hóa đơn điều chỉnh và HĐĐT điều chỉnh sau khi HĐĐT gốc hoàn tất | FBO/Portal và Website |
| ORD-BR-009 | Website gửi giá trị, chiết khấu và thuế đã phân bổ đến từng dòng giao/dòng hoàn; FBO dùng nguyên số liệu, không tự phân bổ | Website và FBO |

Các yêu cầu hiện hành đã cập nhật theo SRC-004, SRC-005 và SRC-006; ORD-BR-002 giữ lại mã để truy vết nội dung đã ngừng áp dụng.

## 6. Quy tắc nghiệp vụ

| Mã | Quy tắc |
|---|---|
| INV-BRU-001 | Tồn khả dụng = Tồn thực tế FBO đang sử dụng - Tồn bị giữ; tính cùng mặt hàng, kho và đơn vị tính |
| INV-BRU-002 | Tồn bị giữ gồm lượng chưa giao của đơn Đã xác nhận và Hoàn thành 1 phần, cộng lượng đã giao của các lần giao Chờ tạo HĐBH ở mọi trạng thái đơn |
| ORD-BRU-001 | Kiểm tra tồn và giữ hàng khi xác nhận phải bảo đảm các đơn đồng thời không sử dụng vượt lượng khả dụng |
| ORD-BRU-002 | Ngừng áp dụng quy tắc giữ Chờ thanh toán tối đa T của phiên bản 1.0 |
| ORD-BRU-003 | Hủy phần chưa giao hợp lệ làm giảm lượng giữ, không tự cộng tồn thực tế FBO |
| INV-BRU-003 | Khi giao Q: lần giao ở trạng thái Chờ tạo HĐBH, Q chuyển từ phần chưa giao sang phần chờ tạo HĐBH nên tổng tồn bị giữ không đổi. Khi FBO phản hồi tạo HĐBH thành công kèm tồn mới, Website cập nhật tồn mới và nhả Q trong cùng một lần xử lý; không nhả Q khi chưa có tồn mới, không tính giảm hai lần |
| INV-BRU-004 | Website không tự cộng/trừ tồn thực tế theo trạng thái đơn; tồn thực tế lấy từ FBO |
| ORD-BRU-004 | Lượng hoàn đề nghị mới + tổng lượng hoàn thành công trước đó + lượng hoàn đang xử lý của từng dòng giao không vượt lượng đã giao của dòng đó; không chỉ kiểm tra tổng lượng toàn đơn |
| INV-BRU-005 | Hoàn tiền hoặc yêu cầu hoàn không mặc định làm tăng tồn bán được; tăng tồn theo xác nhận nhập lại kho bán của FBO |
| INVH-BRU-001 | Mỗi hóa đơn điều chỉnh giảm gắn đúng lần giao và HĐĐT gốc; hoàn liên quan nhiều lần giao phải tách thành các yêu cầu tương ứng từng lần giao |
| INT-BRU-001 | Cùng mã lần giao/yêu cầu gửi lại không tạo thêm HĐBH, trừ tồn hoặc HĐĐT; mỗi lần giao mới có mã riêng. Cùng lần hoàn gửi lại không nhập kho/điều chỉnh thêm lần nữa |
| ORD-BRU-005 | Hoàn hàng không xóa lịch sử đã giao và không tự mở lại lượng cần giao/giữ hàng; giao bù/đổi hàng là nghiệp vụ riêng chưa xác lập trong phạm vi |
| ORD-BRU-006 | Website xác nhận khách đã thanh toán thì đơn Đã xác nhận và giữ toàn bộ phần chưa giao; chưa gửi tạo HĐBH chỉ vì đã thanh toán |
| ORD-BRU-007 | Trạng thái đơn dựa trên lượng giao thực tế lũy kế: chưa giao là Đã xác nhận, giao một phần là Hoàn thành 1 phần, giao hết là Hoàn thành; độc lập kết quả FBO |
| INT-BRU-002 | Đồng bộ lỗi/chưa rõ kết quả: giữ nguyên tiến độ giao đã ghi nhận, lần giao vẫn Chờ tạo HĐBH và tiếp tục được giữ; Website gọi bù cùng mã lần giao, không tạo lần giao mới để thử lại |
| INVH-BRU-002 | HĐĐT lỗi được xử lý tiếp riêng, không ghi nhận bán/trừ tồn lại; không điều chỉnh hóa đơn của lần giao khác |
| ORD-BRU-008 | Lượng còn cần giao mỗi dòng = lượng xác nhận - lượng đã giao lũy kế - lượng chưa giao đã hủy hợp lệ; không trừ lượng hoàn khỏi lịch sử đã giao |
| INT-BRU-003 | Website cung cấp API nhận tồn/kết quả; FBO chủ động đẩy, không phụ thuộc Website polling. Số tồn được cập nhật qua luồng đẩy tồn và qua phản hồi tạo HĐBH (kèm tồn mới của các mặt hàng trong lần giao); callback HĐĐT không mang số tồn. Mỗi bản tồn kèm phiên bản tồn; Website bỏ qua bản có phiên bản cũ hơn bản đang dùng. Website lưu an toàn trước khi xác nhận, chống sự kiện trùng/cũ |
| INT-BRU-004 | Lời gọi API lỗi được đưa vào hàng đợi retry; đến lượt thì gọi lại cùng sự kiện/cùng mã; lỗi tiếp thì xếp lại vào hàng đợi. Áp dụng cho cả chiều Website → FBO (bán, hoàn) và FBO → Website (tồn, kết quả hóa đơn) |
| INVH-BRU-003 | Hoàn khi HĐĐT gốc của lần giao chưa hoàn tất: FBO vẫn nhận hoàn, xử lý chứng từ hoàn và tồn bình thường; sau khi HĐĐT gốc hoàn tất, FBO tạo hóa đơn điều chỉnh cho phần hoàn, phát hành HĐĐT điều chỉnh tham chiếu HĐĐT gốc và gửi kết quả cho Website |
| ORD-BRU-009 | Website phân bổ giá trị, chiết khấu và thuế đến từng dòng giao/dòng hoàn trước khi gửi FBO; tổng giá trị các lần giao không vượt giá trị đơn, tổng giá trị các lần hoàn không vượt giá trị lần giao tương ứng |

Phần đã giao chờ tạo HĐBH là kiểm soát đồng bộ: hàng đã rời kho nhưng FBO chưa trừ tồn, nên tiếp tục giữ để không bán lại. Website không tự trừ tồn thực tế; số tồn chỉ thay đổi khi nhận bản tồn mới từ FBO.

## 7. Luồng nghiệp vụ và giải pháp

Sơ đồ chia làn theo hệ thống; mũi tên cùng làn là nghiệp vụ nội bộ, giữa làn là trao đổi dữ liệu. Xác nhận thanh toán do Website có sẵn xử lý.

### 7.1. Tồn thực tế và xác nhận giữ hàng

```mermaid
sequenceDiagram
    participant FBO as PMKT FBO
    participant WEB as Website
    actor KH as Khách hàng
    FBO->>WEB: Chủ động đẩy tồn mới theo hàng/kho<br/>kèm phiên bản tồn
    WEB-->>FBO: Xác nhận tiếp nhận tồn
    WEB->>WEB: Bỏ qua bản tồn cũ hơn bản đang dùng<br/>Tính tồn khả dụng
    WEB-->>KH: Hiển thị lượng có thể đặt
    Note over WEB: Đầu vào: Website đã xác nhận thanh toán
    WEB->>WEB: Kiểm tra tồn và xác nhận giữ hàng
    alt Đủ tồn
        WEB->>WEB: Đơn Đã xác nhận<br/>Giữ toàn bộ phần chưa giao
    else Không đủ tồn tại thời điểm xác nhận
        WEB->>WEB: Ghi nhận thiếu hàng để xử lý<br/>Không giữ vượt tồn khả dụng
    end
    Note over WEB,FBO: Chưa tạo HĐBH/HĐĐT chỉ vì khách đã thanh toán
```

Trước Đã xác nhận không giữ hàng; nếu Website đã nhận tiền nhưng không đủ tồn lúc xác nhận, cần chính sách xử lý thiếu hàng theo ISS-008, không giả định thanh toán sẽ tự được hoàn.

### 7.2. Giao một phần hoặc toàn bộ

```mermaid
sequenceDiagram
    participant WEB as Website
    participant FBO as PMKT FBO
    participant PORTAL as Portal HĐĐT FAST
    WEB->>WEB: Xác nhận một lần giao thực tế<br/>Mã lần giao, dòng hàng, số lượng và giá trị đã phân bổ
    WEB->>WEB: Cập nhật Hoàn thành 1 phần hoặc Hoàn thành<br/>Lần giao: Chờ tạo HĐBH
    Note over WEB: Lượng đã giao vẫn nằm trong tồn bị giữ<br/>để không bán lại hàng đã giao
    WEB->>FBO: Gửi riêng dữ liệu lần giao<br/>Không gửi lại toàn bộ số lượng đơn
    opt Lỗi hoặc mất phản hồi
        WEB->>WEB: Đưa vào hàng đợi retry<br/>Gọi bù cùng mã lần giao đến khi FBO ghi nhận
    end
    FBO->>FBO: Tạo HĐBH và trừ tồn đúng lần giao<br/>Không xử lý trùng mã lần giao
    FBO-->>WEB: Phản hồi tạo HĐBH thành công<br/>kèm tồn mới và phiên bản tồn
    WEB->>WEB: Cập nhật tồn mới và nhả lượng giữ của lần giao<br/>Lần giao: Đã tạo HĐBH
    FBO->>PORTAL: Phát hành HĐĐT MTT cho lần giao này
    PORTAL-->>FBO: Kết quả và thông tin hóa đơn
    FBO->>WEB: Chủ động đẩy kết quả HĐĐT theo mã lần giao<br/>Gửi lại nếu chưa được xác nhận
    WEB-->>FBO: Xác nhận tiếp nhận kết quả
    WEB->>WEB: Liên kết đơn, lần giao, HĐBH và HĐĐT<br/>Theo dõi phần chưa hoàn tất
```

Phản hồi tạo HĐBH thành công phải kèm tồn mới của các mặt hàng trong lần giao; Website chỉ nhả lượng giữ của lần giao khi đã cập nhật tồn mới này. HĐĐT MTT có thể hoàn tất sau HĐBH và không ảnh hưởng tồn bị giữ. Một đơn có thể có nhiều HĐBH/HĐĐT, mỗi bộ gắn một lần giao. Lời gọi lỗi/mất phản hồi được Website gọi bù cùng mã lần giao qua hàng đợi retry, không tạo giao dịch mới; FBO gửi lại sự kiện HĐĐT chưa được Website xác nhận tiếp nhận.

### 7.3. Hủy phần chưa giao

```mermaid
sequenceDiagram
    actor KH as Khách hàng
    participant WEB as Website
    participant FBO as PMKT FBO
    KH->>WEB: Yêu cầu hủy phần chưa giao
    WEB->>WEB: Kiểm tra điều kiện và phần chưa giao<br/>Không bao gồm các lần giao đã xác nhận
    alt Hủy hợp lệ, chưa xuất tại FBO
        WEB->>WEB: Ghi nhận lượng chưa giao bị hủy<br/>Nhả lượng giữ tương ứng
        Note over WEB,FBO: Không tạo trả hàng/nhập lại tồn<br/>Hóa đơn các lần đã giao không đổi
    else Phần đã giao thực tế, kể cả Chờ tạo HĐBH
        Note over WEB,FBO: Không thuộc phạm vi hủy<br/>Lần giao Chờ tạo HĐBH tiếp tục được gọi bù và giữ tồn
    end
```

Nếu phần chưa giao đã hủy hết, trạng thái kết thúc đơn được đặc tả trong SRS: đơn chưa giao có thể Hủy; đơn đã giao một phần kết thúc nghĩa vụ giao phần còn lại nhưng không xóa lịch sử đã giao. Không coi hủy phần chưa giao là hoàn hàng của hóa đơn đã xuất.

### 7.4. Hoàn hàng theo lần giao và hóa đơn gốc

```mermaid
sequenceDiagram
    actor KH as Khách hàng
    participant WEB as Website
    participant FBO as PMKT FBO
    participant PORTAL as Portal HĐĐT FAST
    KH->>WEB: Hoàn hàng thuộc lần giao cụ thể
    WEB->>WEB: Kiểm tra mã lần giao, dòng giao<br/>Lượng còn được hoàn và giá trị hoàn đã phân bổ
    WEB->>FBO: Gửi yêu cầu hoàn của lần giao<br/>Tham chiếu HĐBH và HĐĐT tương ứng
    opt Lỗi hoặc mất phản hồi
        WEB->>WEB: Đưa vào hàng đợi retry<br/>Gọi bù cùng mã lần hoàn
    end
    FBO->>FBO: Xử lý chứng từ hoàn và tồn theo tình trạng hàng<br/>Không nhập lại tồn trùng
    alt HĐĐT gốc của lần giao đã hoàn tất
        FBO->>PORTAL: Phát hành HĐĐT điều chỉnh giảm<br/>tham chiếu đúng hóa đơn gốc
        PORTAL-->>FBO: Kết quả và hóa đơn điều chỉnh
    else HĐĐT gốc chưa hoàn tất
        Note over FBO,PORTAL: Vẫn nhận hoàn và xử lý tồn bình thường<br/>Sau khi HĐĐT gốc hoàn tất, tạo hóa đơn điều chỉnh<br/>và phát hành HĐĐT điều chỉnh cho phần hoàn
    end
    FBO->>WEB: Chủ động đẩy tồn mới nếu thay đổi (kèm phiên bản tồn)<br/>và kết quả hoàn/hóa đơn điều chỉnh qua API tương ứng
    WEB-->>FBO: Xác nhận tiếp nhận
    WEB->>WEB: Cập nhật theo FBO<br/>Lưu lần hoàn gắn đúng lần giao/dòng giao
```

Một yêu cầu hoàn tích hợp chỉ tham chiếu một lần giao. Khách trả hàng thuộc hai lần giao thì Website tách hai yêu cầu, mỗi yêu cầu điều chỉnh hóa đơn tương ứng. Tổng lượng hoàn được kiểm soát theo từng dòng giao, gồm cả các yêu cầu hoàn đang xử lý.

### 7.5. Ví dụ

Đơn D001 mua 10 áo, tồn ban đầu 100, không có biến động khác:

| Sự kiện | Trạng thái đơn | Đã giao lũy kế | Tồn bị giữ | Tồn FBO đang dùng | Tồn khả dụng |
|---|---|---:|---:|---:|---:|
| Xác nhận sau thanh toán | Đã xác nhận | 0 | 10 | 100 | 90 |
| Giao G001: 4 áo, Chờ tạo HĐBH | Hoàn thành 1 phần | 4 | 10 (6 chưa giao + 4 chờ HĐBH) | 100 | 90 |
| FBO phản hồi tạo HĐBH G001 kèm tồn 96 | Hoàn thành 1 phần | 4 | 6 | 96 | 90 |
| Giao G002: 6 áo, FBO tạo HĐBH xong kèm tồn 90 | Hoàn thành | 10 | 0 | 90 | 90 |
| Hoàn 2 áo thuộc G001, đủ điều kiện nhập kho bán | Hoàn thành, có lịch sử hoàn | 10 | 0 | 92 | 92 |

G001 tạo HĐBH/HĐĐT số 1 cho 4 áo; G002 tạo HĐBH/HĐĐT số 2 cho 6 áo. Hoàn 2 áo của G001 chỉ điều chỉnh HĐĐT số 1. Không điều chỉnh số 2, không mở lại lượng giữ vì có hoàn.

Nếu Website nhả 4 áo của G001 trước khi có tồn 96, khả dụng sẽ tạm thành 100 - 6 = 94 và bán vượt 4 áo; vì vậy lượng giữ chỉ được nhả cùng lúc cập nhật tồn mới kèm phản hồi tạo HĐBH. Nếu sau đó một bản tồn có phiên bản cũ hơn (ví dụ 100) đến muộn do retry, Website bỏ qua và giữ tồn 96.

## 8. Phân chia trách nhiệm

| Nghiệp vụ | Website | FBO/Portal |
|---|---|---|
| Tồn thực tế | Nhận, bỏ qua bản tồn cũ theo phiên bản tồn | Quản lý và đẩy dữ liệu kèm phiên bản tồn |
| Xác nhận và giữ hàng | Kiểm tra tồn, giữ phần chưa giao và phần chờ tạo HĐBH, tính khả dụng | Không tạo bán khi chỉ xác nhận thanh toán |
| Lần giao và trạng thái đơn | Quản lý mã/dòng/số lượng, tiến độ thực tế; phân bổ giá trị, chiết khấu, thuế | Nhận dữ liệu lần giao, dùng nguyên giá trị đã phân bổ |
| HĐBH/trừ tồn theo lần giao | Gửi, gọi bù khi lỗi; nhả lượng giữ khi nhận phản hồi thành công kèm tồn mới | Tạo chứng từ/trừ tồn riêng, chống trùng; phản hồi kèm tồn mới và phiên bản tồn |
| HĐĐT MTT | Cung cấp API nhận, xác nhận và lưu hóa đơn theo lần giao | Portal phát hành; FBO chủ động đẩy kết quả mới |
| Hủy phần chưa giao | Xác nhận hủy/nhả lượng giữ hợp lệ | Không nhập lại hàng chưa xuất |
| Hoàn hàng | Chỉ rõ lần giao/dòng giao, giá trị hoàn và hóa đơn gốc; gọi bù khi lỗi; nhận kết quả qua API | Chứng từ/tồn và hóa đơn điều chỉnh đúng giao dịch; HĐĐT gốc chưa xong thì điều chỉnh sau khi hoàn tất; chủ động đẩy kết quả mới |
| Lỗi/đối soát | Hàng đợi retry gọi bù yêu cầu bán/hoàn; theo dõi từng lần giao/hoàn, chống sự kiện trùng/cũ | Hàng đợi retry gửi lại sự kiện chưa được xác nhận; chống trùng theo mã lần giao/lần hoàn |

## 9. Tiêu chí nghiệm thu nghiệp vụ

| Mã | Tiêu chí | Tham chiếu |
|---|---|---|
| AC-001 | Tính đúng khả dụng = tồn FBO - tồn bị giữ (gồm phần chưa giao và phần đã giao chờ tạo HĐBH), không tính giảm hai lần | INV-BR-001, INV-BR-002, INV-BRU-001, INV-BRU-003 |
| AC-002 | Nhiều đơn xác nhận đồng thời không giữ vượt tồn khả dụng | ORD-BR-001 |
| AC-003 | Đã xác nhận giữ toàn bộ phần chưa giao; Hoàn thành 1 phần giữ phần còn lại và phần chờ tạo HĐBH; Hoàn thành chỉ còn giữ phần chờ tạo HĐBH nếu có; không giữ trước xác nhận | INV-BRU-002, ORD-BRU-006 |
| AC-004 | Đơn 10 giao 4 rồi 6 tạo hai HĐBH, mỗi lần trừ đúng 4 hoặc 6; không xuất lại 10 ở mỗi lần | ORD-BR-003, ORD-BR-008 |
| AC-005 | Mỗi lần giao có HĐĐT riêng, liên kết đúng HĐBH, đơn và lần giao | INVH-BR-001 |
| AC-006 | Kiểm soát hoàn theo dòng giao, không vượt lượng của lần giao dù toàn đơn vẫn còn lượng ở lần khác | ORD-BR-005, ORD-BRU-004 |
| AC-007 | Hàng hoàn đủ điều kiện bán tăng tồn theo FBO; hàng lỗi không tăng tồn bán online | INV-BR-003 |
| AC-008 | Hoàn G001 điều chỉnh hóa đơn G001, không hóa đơn G002; yêu cầu có hàng từ hai lần giao được tách | INVH-BR-002 |
| AC-009 | Gửi lại cùng lần giao/hoàn không tạo thêm chứng từ, trừ/nhập tồn hoặc hóa đơn | INT-BR-001 |
| AC-010 | Giao thực tế nhưng FBO lỗi vẫn ghi đúng tiến độ, lần giao vẫn Chờ tạo HĐBH và giữ tồn; Website gọi bù cùng mã lần giao đến khi FBO ghi nhận | ORD-BR-007, INT-BR-004, INT-BRU-002 |
| AC-011 | Hủy phần chưa giao không nhập lại tồn hoặc điều chỉnh hóa đơn của phần đã giao | ORD-BR-004 |
| AC-012 | HĐĐT lỗi xử lý tiếp riêng, không ghi nhận bán lại; hoàn không tự mở lại lượng giữ/giao | INVH-BRU-002, ORD-BRU-005 |
| AC-013 | Tồn và HĐĐT mới được FBO chủ động đẩy dù Website không gọi tra cứu; gồm HĐĐT điều chỉnh. Callback lỗi/mất xác nhận được gửi lại; sự kiện trùng/cũ và bản tồn có phiên bản cũ không gây xử lý lại hoặc ghi đè dữ liệu mới | INV-BR-001, INT-BR-003, INT-BRU-003, INT-BRU-004 |
| AC-014 | Khi nhận phản hồi tạo HĐBH thành công, Website cập nhật tồn mới và nhả lượng giữ của lần giao trong cùng một lần xử lý; khả dụng không tăng tạm thời | INV-BRU-003, INT-BR-003 |
| AC-015 | Hoàn khi HĐĐT gốc chưa hoàn tất vẫn được xử lý tồn; HĐĐT điều chỉnh được phát hành sau khi HĐĐT gốc hoàn tất, tham chiếu đúng hóa đơn gốc và gửi kết quả về Website | INVH-BR-003, INVH-BRU-003 |
| AC-016 | FBO dùng nguyên giá trị, chiết khấu, thuế Website gửi cho từng dòng giao/hoàn; tổng không vượt giá trị đơn/lần giao | ORD-BR-009, ORD-BRU-009 |

## 10. Quyết định đã chốt và nội dung cần đặc tả tiếp

### 10.1. ISS-004 - Đối chiếu tồn với từng lần giao (đã chốt 15/10/2026)

- Lượng đã giao được giữ trong tồn bị giữ khi lần giao ở trạng thái Chờ tạo HĐBH; không dùng khái niệm "lượng đã giao chưa phản ánh trong tồn" riêng.
- Website chỉ nhả lượng giữ khi FBO phản hồi tạo HĐBH thành công. Phản hồi này kèm tồn mới của các mặt hàng trong lần giao; Website cập nhật tồn và nhả lượng giữ trong cùng một lần xử lý.
- Website nhả lượng giữ khi HĐBH tạo xong, không chờ HĐĐT.
- Mỗi bản tồn (qua luồng đẩy tồn hoặc kèm phản hồi tạo HĐBH) có phiên bản tồn; bản cũ đến sau không ghi đè bản mới.

SRS cần đặc tả định dạng phiên bản tồn và cấu trúc tồn mới trong phản hồi tạo HĐBH.

### 10.2. ISS-007 - Hủy/hoàn khi lần giao hoặc hóa đơn chưa hoàn tất (đã chốt 15/10/2026)

| Tình huống | Nguyên tắc |
|---|---|
| Không rõ lần giao đã được FBO tạo HĐBH/trừ tồn chưa | Website gọi bù cùng mã lần giao qua hàng đợi retry; FBO chống trùng theo mã, không tạo giao dịch mới; Website không tự cộng tồn |
| Chưa giao thực tế và chưa xuất FBO | Hủy phần chưa giao theo chính sách Website; không tạo nhập lại hàng |
| Lần giao thực tế đã xảy ra nhưng FBO chưa ghi nhận bán do lỗi | Không coi là hủy hàng chưa giao; FBO bắt buộc ghi nhận; Website gọi bù đến khi thành công, trong thời gian chờ vẫn giữ tồn |
| FBO đã ghi nhận lần giao và có HĐĐT gốc | Hoàn đúng dòng giao, chứng từ bán và hóa đơn gốc của lần giao |
| FBO đã ghi nhận lần giao nhưng HĐĐT gốc chưa hoàn tất | Vẫn hoàn bình thường; FBO xử lý chứng từ hoàn và tồn ngay, tạo hóa đơn điều chỉnh và HĐĐT điều chỉnh sau khi HĐĐT gốc hoàn tất; không điều chỉnh hóa đơn lần giao khác |

### 10.3. ISS-008 - Điểm chốt giao hàng và chính sách số lượng

Đã chốt 15/10/2026: Website phân bổ giá trị, chiết khấu và thuế cho từng dòng giao/dòng hoàn trước khi gửi; FBO dùng nguyên số liệu (ORD-BR-009, ORD-BRU-009).

Còn cần chốt trong SRS: thao tác xác nhận một lần giao thực tế, chỉnh/hủy lần giao ghi sai, chính sách hủy phần chưa giao và biểu diễn kết thúc đơn sau hủy. Vì chỉ giữ sau xác nhận, cần chính sách khi khách đã trả tiền nhưng không đủ tồn ở thời điểm xác nhận.

### 10.4. ISS-009 - Hoàn hàng khi lần giao còn Chờ tạo HĐBH

Cần chốt trình tự khi khách hoàn hàng thuộc lần giao mà FBO chưa tạo HĐBH (đang gọi bù): Website giữ yêu cầu hoàn đến khi lần giao Đã tạo HĐBH rồi mới gửi FBO, hay FBO nhận cả hai và tự xử lý theo thứ tự. Trong mọi trường hợp, yêu cầu hoàn không được xử lý trước yêu cầu bán của cùng lần giao.

## 11. Lịch sử thay đổi

| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 06/10/2026 | 1.0 | Baseline theo mô hình bán khi thanh toán, được chốt trong chat |
| 08/10/2026 | 1.1 | Đổi sang giữ phần chưa giao, trạng thái theo tiến độ giao, bán/HĐĐT theo lần giao, hoàn chỉ định lần giao và hóa đơn gốc; cập nhật các mã hiện hành và ghi nhận mã ngừng áp dụng |
| 08/10/2026 | 1.2 | FBO chủ động đẩy tồn và kết quả bán/hoàn/HĐĐT mới; Website cung cấp API nhận và xác nhận; bổ sung retry, chống trùng và sự kiện cũ |
| 15/10/2026 | 1.3 | Gộp lượng đã giao chờ tạo HĐBH vào tồn bị giữ; phản hồi tạo HĐBH kèm tồn mới và phiên bản tồn; Website gọi bù qua hàng đợi retry; hoàn khi HĐĐT gốc chưa hoàn tất; Website phân bổ giá trị; bộ mã hai bên khớp nhau. Thêm INT-BR-004, INVH-BR-003, ORD-BR-009, INT-BRU-004, INVH-BRU-003, ORD-BRU-009, AC-014 đến AC-016, ISS-009; đóng ISS-004, ISS-007 |

Từ 15/10/2026 tài liệu được xuất dạng HTML tại `output/` của thư mục nghiệp vụ; các bản PDF cũ đã bỏ.
