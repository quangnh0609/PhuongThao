# SRS - Tích hợp Website Phương Thảo với FBO

## 1. Thông tin tài liệu

| Thuộc tính | Nội dung |
|---|---|
| Mã tài liệu | PT-SRS-001 |
| Phiên bản | 1.1 |
| Ngày cập nhật | 17/10/2026 |
| Căn cứ | BRD PT-BRD-001 phiên bản 1.5 |
| Phạm vi | Các chức năng xây dựng trên FBO: khai báo bộ phận, INT-API-002 (tạo BL1), INT-API-004 (tạo TL1), đẩy tồn (INT-API-001) và đẩy kết quả HĐĐT (INT-API-003) sang Website |
| Tài liệu liên quan | `API_Tao_hoa_don_ban_le.md`: đặc tả INT-API-002 gửi đội Website |

Ngoài phạm vi SRS này (dùng chức năng có sẵn của FBO): hàm tính tồn tại thời điểm hiện tại, phát hành HĐĐT lên Portal, quy tắc hạch toán BL1/TL1, phân quyền chức năng.

## 2. Quy ước chung

### 2.1. Xác thực và cấu hình

| Chiều gọi | Token | Cấp và thay đổi |
|---|---|---|
| Website → FBO (INT-API-002, INT-API-004) | Token do FBO cấp | Token không hết hạn. Cấp một lần qua chat; khi cần đổi thì cấp lại qua chat |
| FBO → Website (INT-API-001, INT-API-003) | Token do Website cấp | Như trên |

Header: `Content-Type: application/json`, `Authorization: Bearer <token>`.

Cấu hình chung của hệ thống (không khai báo theo bộ phận): URL INT-API-001, URL INT-API-003, token Website cấp.

### 2.2. Định dạng dữ liệu

| Kiểu | Quy ước |
|---|---|
| `date` | `dd/MM/yyyy HH:mm:ss` |
| `decimal` | Số lẻ theo khai báo số lẻ tiền và số lượng trên FBO; vượt số lẻ thì trả `INVALID_REQUEST` |
| `string` | Không vượt độ dài cột tương ứng trên FBO; vượt thì trả `INVALID_REQUEST`. Trường có độ dài ghi trong bảng Input theo giá trị đó |

### 2.3. Response và mã lỗi

Mọi response có cấu trúc:

| Trường | Kiểu | Mô tả |
|---|---|---|
| `success` | boolean | `true` khi xử lý thành công; `false` khi bị từ chối |
| `error_code` | string | Mã lỗi; `null` khi thành công |
| `error_message` | string | Lý do lỗi cụ thể, nêu rõ trường và giá trị gây lỗi, ví dụ `customer_code 'KH999' khong co trong danh muc khach hang` |
| `data` | object | Dữ liệu kết quả, hoặc chi tiết lỗi |
| `data.errors[]` | array | Chỉ có với `INVALID_REQUEST`: liệt kê toàn bộ lỗi kiểm tra định dạng tìm thấy, mỗi phần tử gồm `field` (đường dẫn trường, ví dụ `items[0].quantity`), `value`, `message` |

| HTTP status | Trường hợp |
|---|---|
| 200 | `success: true` (kể cả trả lại kết quả trùng) |
| 400 | `INVALID_REQUEST` |
| 401 | `UNAUTHORIZED` |
| 409 | `REQUEST_CONFLICT`, `DOCUMENT_NUMBER_EXISTS` |
| 422 | Các lỗi nghiệp vụ khác (thiếu danh mục, thiếu tồn, vượt lượng hoàn...) |
| 500 | `INTERNAL_ERROR` |

Website chỉ gọi lại tự động qua hàng đợi retry khi timeout, mất kết nối hoặc HTTP 500; các lỗi 4xx cần sửa dữ liệu hoặc khai báo rồi mới gửi lại.

### 2.4. Giới hạn

| Nội dung | Giới hạn |
|---|---|
| Số dòng `items` mỗi request INT-API-002/004 | Tối đa 200 dòng; vượt thì `INVALID_REQUEST` |
| Timeout Website chờ response INT-API-002/004 | 30 giây; quá thời gian thì Website gọi lại cùng mã |
| Số dòng mỗi batch FBO đẩy tồn (INT-API-001) | Tối đa 500 dòng |
| Timeout FBO chờ Website (INT-API-001/003) | 30 giây; quá thời gian coi là gửi lỗi |

## 3. Danh mục bộ phận

### 3.1. Bổ sung trường

Thêm một trường vào tab **Thông tin bán lẻ** của Danh mục bộ phận; không tạo tab "Khai báo Web" riêng.

| Trường | Kiểu | Mặc định | Mô tả |
|---|---|---|---|
| Đồng bộ web | Checkbox | Không tick | Tick thì bộ phận được bán qua Website: nhận BL1/TL1 từ API và có tồn được đẩy sang Website |

### 3.2. Trường có sẵn được tích hợp sử dụng

| Nơi khai báo | Trường | Dùng cho |
|---|---|---|
| Danh mục bộ phận, tab Thông tin bán lẻ | Mã kho bán | Kho xuất của BL1, kho nhập của TL1, kho được đẩy tồn sang Website |
| Danh mục bộ phận, tab Thông tin bán lẻ | Mã khách CH | Mã khách của BL1 khi `customer_code` để trống |
| Danh mục bộ phận, tab Thông tin bán lẻ | Nhân viên | Nhân viên bán của BL1 khi `sale_code` để trống |
| Danh mục bộ phận xuất HĐĐT | Voucher Book, Mã thuế, khai báo phát hành HĐĐT | Mẫu, ký hiệu, thuế suất và phát hành HĐĐT của BL1, HĐĐT điều chỉnh của TL1 (mục 4.6.3, 4.6.4) |

### 3.3. Quy tắc

- Bộ phận chỉ được dùng trong INT-API-002 khi Trạng thái = 1 (còn sử dụng) và đã tick Đồng bộ web; ngược lại trả `DEPARTMENT_NOT_FOUND`.
- Phạm vi đẩy tồn sang Website: Mã kho bán của các bộ phận đang sử dụng và đã tick Đồng bộ web. Biến động tồn ở kho khác không đẩy.
- Bỏ tick Đồng bộ web: dừng nhận BL1 mới cho bộ phận và dừng đẩy tồn kho bán của bộ phận. Website tự xử lý hiển thị tồn của bộ phận đã dừng. TL1 của các BL1 đã tạo trước đó vẫn được nhận, vì TL1 lấy bộ phận theo BL1 gốc.

## 4. INT-API-002 - Tạo hóa đơn bán lẻ (BL1) theo lần giao

### 4.1. Thông tin API

| Thuộc tính | Đặc tả |
|---|---|
| Mã API | INT-API-002 |
| Hệ thống cung cấp | FBO |
| Hệ thống gọi | Website |
| Mục đích | Tạo hóa đơn bán lẻ (BL1), trừ tồn và khởi tạo HĐĐT MTT cho một lần giao |
| URL | `{FBO_BASE_URL}/api/v1/integration/shipments/sales` |
| Method | POST |
| Header | Theo mục 2.1, token do FBO cấp |
| Tham chiếu BRD | ORD-BR-003, ORD-BR-005, ORD-BR-009, INT-BR-001, INT-BR-003, INV-BRU-003, INT-BRU-001 |

### 4.2. Input

**Thông tin chứng từ**

| Trường | Kiểu | Bắt buộc | Độ dài | Mô tả |
|---|---|---|---|---|
| `shipment_code` | string | Có | 12 | Mã lần giao trên Website; một đơn hàng có thể giao nhiều lần. Dùng làm số chứng từ BL1 trên FBO và làm khóa chống trùng (mục 4.3) |
| `shipment_date` | date | Có | | Ngày giờ giao hàng, không lớn hơn thời điểm FBO nhận request. Dùng làm ngày chứng từ BL1 và ngày HĐĐT (hai ngày này phải trùng nhau) |
| `order_code` | string | Có | | Mã đơn hàng trên Website |
| `order_date` | date | Có | | Ngày giờ đặt hàng, dùng để tham chiếu |
| `department_code` | string | Có | | Mã bộ phận ghi nhận doanh thu. FBO lấy kho xuất theo Mã kho bán của bộ phận |
| `customer_code` | string | Không | | Mã khách hàng để ghi nhận doanh thu, không dùng hạch toán công nợ. Để trống thì lấy Mã khách CH của bộ phận |
| `sale_code` | string | Không | | Mã NVBH. Để trống thì lấy Nhân viên của bộ phận |
| `items` | array | Có | | Danh sách dòng giao, từ 1 đến 200 dòng |
| `paid_on_cash` | decimal | Có | | Số tiền thanh toán bằng tiền mặt; không có thì truyền 0 |
| `paid_on_bank` | decimal | Có | | Số tiền thanh toán bằng chuyển khoản, QR, thẻ; không có thì truyền 0 |

**`items[]` - Dòng giao**

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `shipment_line_id` | string | Có | Mã dòng giao, duy nhất trong lần giao. INT-API-004 dùng mã này để hoàn theo dòng |
| `order_line_id` | string | Có | Mã dòng đơn gốc; cùng một dòng đơn có thể xuất hiện ở nhiều lần giao |
| `item_code` | string | Có | Mã sản phẩm (dùng chung bộ mã với FBO). Nhiều dòng có thể cùng mã sản phẩm |
| `quantity` | decimal | Có | Số lượng giao lần này, > 0 |
| `price` | decimal | Có | Đơn giá chưa chiết khấu |
| `discount_rate` | decimal | Có | Tỷ lệ chiết khấu theo %; ví dụ 50% thì truyền 50. Không có thì truyền 0 |
| `discount_amount` | decimal | Có | Số tiền chiết khấu trên một sản phẩm. Không có thì truyền 0 |
| `amount` | decimal | Có | Số tiền phải thanh toán của dòng sau chiết khấu |

Website không truyền thuế; FBO xác định thuế suất và tính tiền thuế theo mục 4.6.3. FBO ghi nhận nguyên các giá trị tiền và chiết khấu Website gửi, không kiểm tra tính nhất quán giữa `price`, `discount_rate`, `discount_amount`, `amount` và số tiền thanh toán; Website chịu trách nhiệm tính đúng (ORD-BR-009).

**Thông tin phát hành HĐĐT**

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `buyer` | object | Không | Thông tin bên mua; để trống với khách lẻ không lấy hóa đơn |
| `buyer.name` | string | Không | Tên bên mua |
| `buyer.phone` | string | Không | Số điện thoại bên mua |
| `buyer.email` | string | Không | Email nhận thông báo phát hành HĐĐT |
| `buyer.tax_code` | string | Không | MST bên mua |
| `buyer.address` | string | Không | Địa chỉ bên mua |
| `buyer.identity_number` | string | Không | Số căn cước người mua |
| `buyer.passport` | string | Không | Số hộ chiếu người mua |
| `buyer.budget_code` | string | Không | Mã số QHNS bên mua |
| `payment_method` | string | Có | Hình thức thanh toán trên HĐĐT: `"1"` = TM, `"2"` = CK, `"3"` = TM/CK |
| `note` | string | Không | Ghi chú |

**Request mẫu: đơn D001 có 10 áo, lần giao G001 giao 4 áo**

```json
{
  "shipment_code": "G001",
  "shipment_date": "08/10/2026 14:30:00",
  "order_code": "D001",
  "order_date": "05/10/2026 09:15:00",
  "department_code": "ONLINE",
  "customer_code": "",
  "sale_code": "",
  "items": [
    {
      "shipment_line_id": "G001-1",
      "order_line_id": "D001-1",
      "item_code": "AO-001",
      "quantity": 4,
      "price": 100000,
      "discount_rate": 10,
      "discount_amount": 10000,
      "amount": 360000
    }
  ],
  "paid_on_cash": 0,
  "paid_on_bank": 360000,
  "buyer": {
    "name": "Nguyen Van A",
    "phone": "0900000000",
    "email": "a@example.com",
    "tax_code": "",
    "address": "Ha Noi",
    "identity_number": "",
    "passport": "",
    "budget_code": ""
  },
  "payment_method": "2",
  "note": ""
}
```

### 4.3. Xử lý

Trình tự dưới đây là trình tự duy nhất cho BE; mục 4.6 chỉ mô tả mapping trường.

1. **Kiểm tra request.** Token hợp lệ, nếu không trả `UNAUTHORIZED`. Kiểm tra định dạng, kiểu, trường bắt buộc, độ dài (mục 2.2), số dòng `items` (mục 2.4), `quantity` > 0, không trùng `shipment_line_id`, `shipment_date` không lớn hơn thời điểm nhận. Có lỗi thì trả `INVALID_REQUEST`, liệt kê toàn bộ lỗi trong `data.errors[]`.
2. **Chống trùng theo `shipment_code`** (INT-BR-001, INT-BRU-001). Mở transaction và khóa theo `shipment_code`, để hai request cùng mã gửi đồng thời được xử lý lần lượt. Cột số chứng từ của BL1 nguồn Web có ràng buộc duy nhất.
   - Chưa có BL1 với số này: xử lý tiếp như yêu cầu mới.
   - Đã có BL1 nguồn Web, mã băm nội dung giống: không tạo thêm chứng từ, không trừ tồn lại; trả lại response của lần xử lý trước với `is_duplicate: true`.
   - Đã có BL1 nguồn Web, mã băm khác: trả `REQUEST_CONFLICT`.
   - Đã có BL1 tạo tay cùng số chứng từ: trả `DOCUMENT_NUMBER_EXISTS`.
   - Yêu cầu trước bị từ chối (ví dụ không đủ tồn) thì chưa có BL1, nên gửi lại cùng mã được xử lý như yêu cầu mới.

   Chống trùng chạy trước kiểm tra danh mục, nên lần gửi lại của một yêu cầu đã thành công luôn nhận kết quả cũ, kể cả khi danh mục đã thay đổi sau đó.
3. **Kiểm tra danh mục và khai báo.** Gặp lỗi thì trả mã tương ứng, `error_message` nêu rõ trường và giá trị:

   | Kiểm tra | Mã lỗi |
   |---|---|
   | `department_code` có trong Danh mục bộ phận, Trạng thái = 1 và đã tick Đồng bộ web | `DEPARTMENT_NOT_FOUND` |
   | Bộ phận đã khai báo Mã kho bán; có Mã khách CH khi `customer_code` trống; có Nhân viên khi `sale_code` trống | `DEPARTMENT_CONFIG_MISSING` |
   | `customer_code` (nếu truyền) có trong danh mục khách hàng | `CUSTOMER_NOT_FOUND` |
   | `sale_code` (nếu truyền) có trong danh mục nhân viên bán hàng | `EMPLOYEE_NOT_FOUND` |
   | `item_code` có trong danh mục vật tư, đang sử dụng và có theo dõi tồn kho | `PRODUCT_NOT_FOUND` |
   | Bộ phận có khai báo đang sử dụng (Trạng thái = 1) trong Danh mục bộ phận xuất HĐĐT | `INVOICE_CONFIG_NOT_FOUND` |
   | Ngày của `shipment_date` không thuộc kỳ đã khóa sổ | `PERIOD_LOCKED` |

4. **Kiểm tra tồn.** Cộng `quantity` của các dòng theo mã hàng (nhiều dòng cùng mã được cộng dồn). Khóa tồn của các mã hàng này tại kho xuất đến hết transaction, rồi so tổng lượng với tồn hiện tại (hàm tính tồn có sẵn của FBO). Có mã hàng thiếu tồn thì **chặn cả yêu cầu**: rollback, không ghi gì, trả `INSUFFICIENT_STOCK` kèm danh sách mã thiếu, tồn hiện tại và phiên bản tồn (mục 4.4).
5. **Ghi chứng từ.** Trong cùng transaction: ghi header, chi tiết, tab Xác thực theo mục 4.6; Trạng thái = 2 - Chuyển sổ cái; trừ tồn đúng lượng của lần giao, không trừ theo cả đơn; hạch toán như BL1 tạo tay; ghi mã băm nội dung, log API; đưa BL1 vào hàng đợi phát hành HĐĐT. Commit.
6. **Trả response.** Sau commit, đọc tồn mới của các mã hàng trong lần giao và gắn phiên bản tồn theo mục 6.2; cập nhật bảng Tồn đã gửi Website theo mục 6.3 bước 6; trả response. Website cập nhật tồn mới và nhả lượng giữ của lần giao trong cùng một lần xử lý (INV-BRU-003).
7. **Phát hành HĐĐT MTT** lên Portal bằng chức năng phát hành có sẵn, bất đồng bộ, ngày HĐĐT = ngày BL1. Kết quả được FBO chủ động gửi qua INT-API-003 (mục 7). Lỗi HĐĐT không làm tạo lại BL1 hay trừ tồn lại. Trường hợp phát hành lỗi (ví dụ Portal không chấp nhận ngày HĐĐT do Website gọi bù muộn), người dùng tự xử lý trên FBO; FBO không tự động xử lý thêm.

### 4.4. Output

| Trường | Kiểu | Mô tả |
|---|---|---|
| `success` | boolean | `true` khi đã tạo BL1 (hoặc trả lại kết quả trùng); `false` khi bị từ chối |
| `error_code` | string | Mã lỗi theo mục 4.5; `null` khi thành công |
| `error_message` | string | Lý do lỗi cụ thể (mục 2.3) |
| `data.shipment_code` | string | Mã lần giao |
| `data.order_code` | string | Mã đơn hàng |
| `data.sales_document_code` | string | Số chứng từ BL1 trên FBO (= `shipment_code`) |
| `data.is_duplicate` | boolean | `true` khi là kết quả trả lại của yêu cầu đã xử lý trước đó |
| `data.inventory[]` | array | Tồn mới của các mặt hàng trong lần giao |
| `data.inventory[].warehouse_code` | string | Mã kho |
| `data.inventory[].item_code` | string | Mã sản phẩm |
| `data.inventory[].quantity` | decimal | Tồn thực tế sau khi trừ, là số thay thế (không phải lượng cộng/trừ) |
| `data.inventory[].version` | integer | Phiên bản tồn, dạng epoch ms (mục 6.2); Website bỏ qua bản có phiên bản cũ hơn bản đang dùng |
| `data.invoice_status` | string | Trạng thái HĐĐT: `PENDING` khi vừa tạo BL1 |

**Response mẫu: tạo BL1 thành công**

```json
{
  "success": true,
  "error_code": null,
  "error_message": null,
  "data": {
    "shipment_code": "G001",
    "order_code": "D001",
    "sales_document_code": "G001",
    "is_duplicate": false,
    "inventory": [
      { "warehouse_code": "ONLINE", "item_code": "AO-001", "quantity": 96, "version": 1791444610000 }
    ],
    "invoice_status": "PENDING"
  }
}
```

**Response mẫu: không đủ tồn**

Mỗi phần tử là một mã hàng thiếu tồn: `quantity` là tổng lượng yêu cầu của các dòng cùng mã, `stock_quantity` là tồn hiện tại tại kho xuất, `version` là phiên bản của số tồn đó. Website cập nhật tồn theo `stock_quantity` và `version` với cùng quy tắc phiên bản.

```json
{
  "success": false,
  "error_code": "INSUFFICIENT_STOCK",
  "error_message": "Khong du ton tai kho ONLINE: AO-001 can 4, ton 2",
  "data": {
    "shipment_code": "G001",
    "order_code": "D001",
    "items": [
      {
        "warehouse_code": "ONLINE",
        "item_code": "AO-001",
        "quantity": 4,
        "stock_quantity": 2,
        "version": 1791444610000
      }
    ]
  }
}
```

**Response mẫu: sai dữ liệu**

```json
{
  "success": false,
  "error_code": "INVALID_REQUEST",
  "error_message": "Du lieu khong hop le: 2 loi",
  "data": {
    "errors": [
      { "field": "shipment_code", "value": "G0010000000001", "message": "Vuot qua 12 ky tu" },
      { "field": "items[0].quantity", "value": 0, "message": "Phai lon hon 0" }
    ]
  }
}
```

**Response mẫu: trùng mã, khác nội dung**

```json
{
  "success": false,
  "error_code": "REQUEST_CONFLICT",
  "error_message": "shipment_code G001 da ton tai voi noi dung khac",
  "data": { "shipment_code": "G001", "sales_document_code": "G001" }
}
```

### 4.5. Mã lỗi

| Mã lỗi | HTTP | Ý nghĩa |
|---|---|---|
| `UNAUTHORIZED` | 401 | Token không hợp lệ |
| `INVALID_REQUEST` | 400 | Thiếu trường bắt buộc, sai kiểu/định dạng, vượt độ dài hoặc số lẻ, `shipment_code` quá 12 ký tự, quá 200 dòng, `quantity` ≤ 0, trùng `shipment_line_id`, `shipment_date` lớn hơn thời điểm nhận |
| `REQUEST_CONFLICT` | 409 | `shipment_code` đã được xử lý với nội dung khác |
| `DOCUMENT_NUMBER_EXISTS` | 409 | Đã có BL1 tạo tay cùng số chứng từ với `shipment_code` |
| `DEPARTMENT_NOT_FOUND` | 422 | `department_code` không có trong danh mục, ngừng sử dụng hoặc chưa tick Đồng bộ web |
| `DEPARTMENT_CONFIG_MISSING` | 422 | Bộ phận thiếu Mã kho bán, hoặc thiếu Mã khách CH/Nhân viên khi `customer_code`/`sale_code` để trống |
| `CUSTOMER_NOT_FOUND` | 422 | `customer_code` không có trong danh mục khách hàng |
| `EMPLOYEE_NOT_FOUND` | 422 | `sale_code` không có trong danh mục nhân viên bán hàng |
| `PRODUCT_NOT_FOUND` | 422 | `item_code` không có trong danh mục vật tư, ngừng sử dụng hoặc không theo dõi tồn; `error_message` nêu lý do |
| `INVOICE_CONFIG_NOT_FOUND` | 422 | Bộ phận chưa có khai báo đang sử dụng trong Danh mục bộ phận xuất HĐĐT |
| `PERIOD_LOCKED` | 422 | Ngày chứng từ thuộc kỳ đã khóa sổ |
| `INSUFFICIENT_STOCK` | 422 | Kho xuất không đủ tồn cho ít nhất một mã hàng |
| `INTERNAL_ERROR` | 500 | Lỗi hệ thống FBO; Website gọi lại cùng `shipment_code` qua hàng đợi retry |

### 4.6. Mapping request sang chứng từ BL1

Đối chiếu màn hình "Xem hóa đơn" BL1 (tab Chi tiết, tab Xác thực) với request.

Nguồn giá trị:
- **Request**: lấy từ trường của request.
- **Mặc định**: giá trị cố định khi tạo từ API.
- **Danh mục/Cấu hình**: BE tra từ danh mục hoặc khai báo trên FBO.
- **Tính**: BE tính từ các trường khác.
- **Portal**: điền sau khi phát hành HĐĐT.

#### 4.6.1. Thông tin chung (header)

| Trường trên BL1 | Nguồn | Giá trị | Quy tắc |
|---|---|---|---|
| Cửa hàng | Request | `department_code` | Phải có trong danh mục bộ phận và bật đồng bộ web |
| Mã khách | Request / Danh mục | `customer_code` | Trống thì lấy Mã khách CH của bộ phận (Danh mục bộ phận, tab Thông tin bán lẻ) |
| Nhân viên bán | Request / Danh mục | `sale_code` | Trống thì lấy Nhân viên của bộ phận (Danh mục bộ phận, tab Thông tin bán lẻ) |
| Số phiếu đặt may / Ngày | | | Không dùng |
| Diễn giải | Request | `note` | |
| Số hóa đơn | Request | `shipment_code` | Tối đa 12 ký tự |
| Ngày hóa đơn | Request | Phần ngày của `shipment_date` | |
| Giờ hóa đơn | Request | Phần giờ của `shipment_date` | |
| Trạng thái | Mặc định | `2` - Chuyển sổ cái | Trừ tồn và hạch toán ngay, hạch toán như BL1 tạo tay |

#### 4.6.2. Chi tiết (tab Chi tiết, mỗi phần tử `items[]` là một dòng)

| Trường trên BL1 | Nguồn | Giá trị | Quy tắc |
|---|---|---|---|
| Mã hàng | Request | `items[].item_code` | |
| Tên mặt hàng | Danh mục | Theo danh mục vật tư | |
| ĐVT | Danh mục | Theo danh mục vật tư | |
| Kho | Danh mục | Mã kho bán của bộ phận (Danh mục bộ phận, tab Thông tin bán lẻ) | |
| Số lượng | Request | `items[].quantity` | |
| Giá bán | Request | `items[].price` | |
| TLCK (%) | Request | `items[].discount_rate` | |
| Chiết khấu | Request | `items[].discount_amount` | Tiền chiết khấu trên một sản phẩm |
| Thanh toán | Request | `items[].amount` | |
| Mã dòng giao | Request | `items[].shipment_line_id` | Trường mới |
| Mã dòng đơn | Request | `items[].order_line_id` | Trường mới |

#### 4.6.3. Tổng, thuế và thanh toán

| Trường trên BL1 | Nguồn | Giá trị | Quy tắc |
|---|---|---|---|
| Tổng cộng | Tính | Σ `quantity` | |
| Tiền hàng nt | Tính | Σ (`quantity` × `price`) | |
| Tổng chiết khấu | Tính | Σ (`quantity` × `discount_amount`) | `discount_amount` là chiết khấu trên một sản phẩm. Ví dụ request mẫu: 4 × 10 000 = 40 000 |
| Thuế | Danh mục / Tính | Thuế suất theo Mã thuế của bộ phận trong Danh mục bộ phận xuất HĐĐT | FBO tính tiền thuế như BL1 tạo tay; Website không truyền thuế |
| Tiền đặt cọc | Mặc định | `0` | |
| Tổng thanh toán | Tính | Σ `amount` | |
| Tiền mặt (check + số tiền) | Request | `paid_on_cash` | Tick khi > 0. Không đối chiếu tổng tiền mặt và tiền thẻ với Tổng thanh toán |
| Tiền thẻ (check + số tiền) | Request | `paid_on_bank` | Tick khi > 0 |
| Nhận của KH | Mặc định | `0` | |
| Tiền thừa | Mặc định | `0` | |

#### 4.6.4. Thông tin xác thực HĐĐT (tab Xác thực)

| Trường trên BL1 | Nguồn | Giá trị | Quy tắc |
|---|---|---|---|
| Xác thực | Mặc định | `1` - Có | |
| Xử lý | Mặc định | `0` - Không xử lý | |
| Ghi chú | Request | `note` | |
| Tình trạng | Mặc định / Portal | `0` - Chưa xác thực | Cập nhật theo kết quả Portal: `1` Chờ xác thực, `2` Đã xác thực |
| Thư (Email) | Request | `buyer.email` | |
| Mã số thuế | Request | `buyer.tax_code` | |
| Tên người mua | Request | `buyer.name` | |
| Địa chỉ | Request | `buyer.address` | |
| Mã số QHNS | Request | `buyer.budget_code` | |
| Số hộ chiếu | Request | `buyer.identity_number` hoặc `buyer.passport` | Số căn cước và số hộ chiếu dùng chung trường này: có `identity_number` thì lấy, trống thì lấy `passport` |
| Hình thức tt | Request | `payment_method` | |
| Mẫu hóa đơn | Danh mục | Ký tự đầu của Voucher Book trong Danh mục bộ phận xuất HĐĐT | Ví dụ Voucher Book `1C26MAB` → Mẫu `1` |
| Ký hiệu | Danh mục | Phần còn lại của Voucher Book trong Danh mục bộ phận xuất HĐĐT | Ví dụ Voucher Book `1C26MAB` → Ký hiệu `C26MAB` |
| Số chứng từ (số HĐĐT) | Portal | Số HĐĐT Portal trả về | Điền sau khi phát hành |

#### 4.6.5. Trường mới cần bổ sung trong DB

| Trường | Gắn với | Mục đích |
|---|---|---|
| Nguồn chứng từ (Web) | Header | Phân biệt BL1 tạo từ API với BL1 tạo tay; dùng cho chống trùng và gửi kết quả HĐĐT |
| Mã đơn hàng web (`order_code`) | Header | Liên kết đơn - lần giao - hóa đơn; tra cứu khi hoàn hàng |
| Ngày đặt hàng (`order_date`) | Header | Tham chiếu |
| Mã dòng giao (`shipment_line_id`) | Chi tiết | Hoàn hàng theo dòng giao |
| Mã dòng đơn (`order_line_id`) | Chi tiết | Liên kết dòng đơn gốc |
| Số điện thoại người mua (`buyer.phone`) | Header hoặc Xác thực | Hiện đang hiển thị cùng tên khách; cần chốt lưu ở danh mục khách hay trên chứng từ |
| Mã băm nội dung request | Header hoặc bảng log | So sánh khi gửi lại cùng `shipment_code` để trả kết quả cũ hoặc `REQUEST_CONFLICT` |
| Response đã trả | Bảng log | Trả lại nguyên response khi nhận yêu cầu trùng |
| Log API (request, response, thời điểm, kết quả) | Bảng riêng | Đối soát và hỗ trợ xử lý lỗi |

Người dùng không sửa/xóa tay chứng từ BL1/TL1 nguồn Web; FBO không xây dựng chức năng chặn riêng.

## 5. INT-API-004 - Hoàn hàng theo lần giao

### 5.1. Thông tin API

| Thuộc tính | Đặc tả |
|---|---|
| Mã API | INT-API-004 |
| Hệ thống cung cấp | FBO |
| Hệ thống gọi | Website |
| Mục đích | Tạo phiếu trả lại bán lẻ (TL1) cho một lần giao (một BL1), nhập lại tồn và khởi tạo HĐĐT điều chỉnh giảm cho HĐĐT của BL1 đó |
| URL | `{FBO_BASE_URL}/api/v1/integration/returns` |
| Method | POST |
| Header | Theo mục 2.1, token do FBO cấp |
| Tham chiếu BRD | ORD-BR-005, ORD-BR-009, INV-BR-003, INVH-BR-002, INVH-BR-003, INT-BR-001, ORD-BRU-004, ORD-BRU-009, INVH-BRU-001, INVH-BRU-003, INT-BRU-001, ISS-009 |

Nguyên tắc:
- Một yêu cầu hoàn chỉ tham chiếu **một lần giao** (`shipment_code`). Khách trả hàng thuộc nhiều lần giao thì Website tách thành nhiều yêu cầu, mỗi yêu cầu một `return_code`.
- Hủy phần chưa giao không gọi API này.
- Lần giao chỉ được hoàn sau khi INT-API-002 của lần giao đó đã thành công (đã có BL1); chưa có BL1 thì FBO từ chối (ISS-009).

### 5.2. Input

**Thông tin chứng từ**

| Trường | Kiểu | Bắt buộc | Độ dài | Mô tả |
|---|---|---|---|---|
| `return_code` | string | Có | 12 | Mã lần hoàn trên Website. Dùng làm số chứng từ TL1 trên FBO và làm khóa chống trùng (mục 5.3) |
| `return_date` | date | Có | | Ngày giờ nhận hàng hoàn, không nhỏ hơn ngày giờ BL1 gốc và không lớn hơn thời điểm FBO nhận request. Dùng làm ngày lập TL1 |
| `shipment_code` | string | Có | 12 | Mã lần giao được hoàn, chính là số chứng từ BL1 gốc |
| `order_code` | string | Có | | Mã đơn hàng trên Website; phải khớp với BL1 gốc |
| `reason` | string | Không | | Lý do hoàn |
| `items` | array | Có | | Danh sách dòng hoàn, từ 1 đến 200 dòng |
| `refund_on_cash` | decimal | Có | | Số tiền hoàn bằng tiền mặt, truyền số dương; không có thì truyền 0 |
| `refund_on_bank` | decimal | Có | | Số tiền hoàn bằng chuyển khoản, QR, thẻ, truyền số dương; không có thì truyền 0 |
| `note` | string | Không | | Ghi chú |

**`items[]` - Dòng hoàn**

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `return_line_id` | string | Có | Mã dòng hoàn, duy nhất trong lần hoàn |
| `shipment_line_id` | string | Có | Mã dòng giao được hoàn; phải thuộc BL1 của `shipment_code` |
| `item_code` | string | Có | Mã sản phẩm; phải khớp với dòng giao |
| `quantity` | decimal | Có | Số lượng hoàn, > 0 |
| `price` | decimal | Có | Đơn giá chưa chiết khấu |
| `discount_rate` | decimal | Có | Tỷ lệ chiết khấu theo %. Không có thì truyền 0 |
| `discount_amount` | decimal | Có | Số tiền chiết khấu trên một sản phẩm. Không có thì truyền 0 |
| `amount` | decimal | Có | Giá trị hoàn của dòng sau chiết khấu |

Giá trị hoàn do Website phân bổ; FBO dùng nguyên số liệu, không tính lại và không kiểm tra tính nhất quán giữa các trường tiền (ORD-BR-009). Thuế của TL1 FBO tính theo thuế suất của BL1 gốc, như TL1 tạo tay.

**Request mẫu: hoàn 2 áo thuộc lần giao G001 (đã giao 4 áo)**

```json
{
  "return_code": "R001",
  "return_date": "12/10/2026 10:00:00",
  "shipment_code": "G001",
  "order_code": "D001",
  "reason": "Khach doi y",
  "items": [
    {
      "return_line_id": "R001-1",
      "shipment_line_id": "G001-1",
      "item_code": "AO-001",
      "quantity": 2,
      "price": 100000,
      "discount_rate": 10,
      "discount_amount": 10000,
      "amount": 180000
    }
  ],
  "refund_on_cash": 0,
  "refund_on_bank": 180000,
  "note": ""
}
```

### 5.3. Xử lý

1. **Kiểm tra request.** Token, định dạng, kiểu, trường bắt buộc, độ dài, số dòng, `quantity` > 0, không trùng `return_line_id`, `return_date` không lớn hơn thời điểm nhận. Lỗi thì trả `UNAUTHORIZED` hoặc `INVALID_REQUEST` kèm `data.errors[]`.
2. **Chống trùng theo `return_code`** (INT-BR-001, INT-BRU-001). Mở transaction, khóa theo `return_code`; cột số chứng từ của TL1 nguồn Web có ràng buộc duy nhất.
   - Chưa có TL1 với số này: xử lý tiếp như yêu cầu mới.
   - Đã có TL1 nguồn Web, mã băm giống: không tạo thêm chứng từ, không nhập tồn lại; trả lại response cũ với `is_duplicate: true`.
   - Đã có TL1 nguồn Web, mã băm khác: trả `REQUEST_CONFLICT`.
   - Đã có TL1 tạo tay cùng số chứng từ: trả `DOCUMENT_NUMBER_EXISTS`.
   - Yêu cầu trước bị từ chối thì chưa có chứng từ, gửi lại cùng mã được xử lý như yêu cầu mới.
3. **Kiểm tra BL1 gốc.** Tìm BL1 nguồn Web có số chứng từ = `shipment_code` và khóa BL1 này đến hết transaction, để hai lần hoàn đồng thời của cùng lần giao được xử lý lần lượt.
   - Không có: trả `SHIPMENT_NOT_FOUND`.
   - `order_code` không khớp BL1: trả `INVALID_REQUEST`.
   - `return_date` nhỏ hơn ngày giờ BL1: trả `INVALID_REQUEST`.
   - Ngày của `return_date` thuộc kỳ đã khóa sổ: trả `PERIOD_LOCKED`.
4. **Kiểm tra từng dòng.** Có một dòng sai thì từ chối cả yêu cầu:
   - `shipment_line_id` thuộc BL1 và `item_code` khớp dòng đó; sai thì trả `SHIPMENT_LINE_NOT_FOUND`.
   - Số lượng: tổng `quantity` của các dòng hoàn cùng `shipment_line_id` trong request + tổng lượng đã hoàn của dòng giao ở các TL1 trước ≤ lượng đã giao của dòng; vượt thì trả `RETURN_QUANTITY_EXCEEDED` (ORD-BRU-004).
   - Giá trị: tổng `amount` của các dòng hoàn cùng `shipment_line_id` trong request + tổng giá trị đã hoàn của dòng giao ≤ giá trị dòng giao trên BL1 (`amount` của dòng BL1); vượt thì trả `RETURN_AMOUNT_EXCEEDED` (ORD-BRU-009).
5. **Ghi chứng từ.** Trong cùng transaction:
   - Tạo TL1 theo mục 5.6: số chứng từ = `return_code`, ngày = `return_date`, tham chiếu BL1 gốc. Cửa hàng, khách hàng và thông tin người mua lấy theo BL1 gốc.
   - Trạng thái = 2 - Chuyển sổ cái; nhập toàn bộ `quantity` vào Mã kho bán của bộ phận trên BL1 gốc; hạch toán như TL1 tạo tay.
   - Ghi trạng thái HĐĐT điều chỉnh theo bước 7; ghi mã băm, log API. Commit.
6. **Trả response.** Sau commit, đọc tồn mới của các mã hàng được hoàn, gắn phiên bản tồn theo mục 6.2; cập nhật bảng Tồn đã gửi Website theo mục 6.3 bước 6; trả response.
7. **HĐĐT điều chỉnh giảm**, tham chiếu HĐĐT gốc của BL1 (INVH-BR-002, INVH-BRU-003):
   - HĐĐT gốc đã xác thực: đưa TL1 vào hàng đợi phát hành HĐĐT điều chỉnh ngay (`adjustment_invoice_status` = `PENDING`).
   - HĐĐT gốc chưa xác thực: vẫn nhận hoàn, xử lý chứng từ và tồn như bước 5; đánh dấu TL1 chờ HĐĐT gốc (`adjustment_invoice_status` = `WAITING_ORIGINAL`). Khi HĐĐT gốc phát hành thành công, FBO tự đưa TL1 vào phát hành theo mục 7.1 bước 4.
   - Kết quả HĐĐT điều chỉnh được FBO chủ động gửi qua INT-API-003 (mục 7); lỗi HĐĐT không làm tạo lại TL1 hay nhập tồn lại.

### 5.4. Output

| Trường | Kiểu | Mô tả |
|---|---|---|
| `success` | boolean | `true` khi đã tạo TL1 (hoặc trả lại kết quả trùng); `false` khi bị từ chối |
| `error_code` | string | Mã lỗi theo mục 5.5; `null` khi thành công |
| `error_message` | string | Lý do lỗi cụ thể (mục 2.3) |
| `data.return_code` | string | Mã lần hoàn |
| `data.shipment_code` | string | Mã lần giao được hoàn |
| `data.order_code` | string | Mã đơn hàng |
| `data.return_document_code` | string | Số chứng từ TL1 trên FBO (= `return_code`) |
| `data.is_duplicate` | boolean | `true` khi là kết quả trả lại của yêu cầu đã xử lý trước đó |
| `data.items[]` | array | Kết quả từng dòng hoàn |
| `data.items[].return_line_id` | string | Mã dòng hoàn |
| `data.items[].shipment_line_id` | string | Mã dòng giao |
| `data.items[].returned_quantity` | decimal | Số lượng đã ghi nhận hoàn |
| `data.inventory[]` | array | Tồn mới của các mặt hàng được hoàn |
| `data.inventory[].warehouse_code` | string | Mã kho |
| `data.inventory[].item_code` | string | Mã sản phẩm |
| `data.inventory[].quantity` | decimal | Tồn thực tế sau khi nhập lại, là số thay thế |
| `data.inventory[].version` | integer | Phiên bản tồn (mục 6.2) |
| `data.adjustment_invoice_status` | string | `PENDING`: đang chờ phát hành HĐĐT điều chỉnh. `WAITING_ORIGINAL`: chờ HĐĐT gốc phát hành thành công rồi mới điều chỉnh |

**Response mẫu: thành công**

```json
{
  "success": true,
  "error_code": null,
  "error_message": null,
  "data": {
    "return_code": "R001",
    "shipment_code": "G001",
    "order_code": "D001",
    "return_document_code": "R001",
    "is_duplicate": false,
    "items": [
      { "return_line_id": "R001-1", "shipment_line_id": "G001-1", "returned_quantity": 2 }
    ],
    "inventory": [
      { "warehouse_code": "ONLINE", "item_code": "AO-001", "quantity": 92, "version": 1791774005000 }
    ],
    "adjustment_invoice_status": "PENDING"
  }
}
```

**Response mẫu: hoàn vượt lượng đã giao**

```json
{
  "success": false,
  "error_code": "RETURN_QUANTITY_EXCEEDED",
  "error_message": "Dong giao G001-1: hoan 3, da giao 4, da hoan 2",
  "data": {
    "return_code": "R002",
    "shipment_code": "G001",
    "items": [
      {
        "shipment_line_id": "G001-1",
        "quantity": 3,
        "shipped_quantity": 4,
        "returned_quantity": 2
      }
    ]
  }
}
```

Mỗi phần tử là một dòng giao bị vượt: `quantity` là tổng lượng hoàn của dòng giao trong request, `shipped_quantity` là lượng đã giao, `returned_quantity` là tổng lượng đã hoàn trước đó; lượng còn được hoàn = 4 - 2 = 2.

**Response mẫu: hoàn vượt giá trị dòng giao**

```json
{
  "success": false,
  "error_code": "RETURN_AMOUNT_EXCEEDED",
  "error_message": "Dong giao G001-1: gia tri hoan 200000, gia tri giao 360000, da hoan 180000",
  "data": {
    "return_code": "R003",
    "shipment_code": "G001",
    "items": [
      {
        "shipment_line_id": "G001-1",
        "amount": 200000,
        "shipped_amount": 360000,
        "returned_amount": 180000
      }
    ]
  }
}
```

`amount` là tổng giá trị hoàn của dòng giao trong request, `shipped_amount` là giá trị dòng giao trên BL1, `returned_amount` là tổng giá trị đã hoàn trước đó; giá trị còn được hoàn = 360 000 - 180 000 = 180 000.

### 5.5. Mã lỗi

| Mã lỗi | HTTP | Ý nghĩa |
|---|---|---|
| `UNAUTHORIZED` | 401 | Token không hợp lệ |
| `INVALID_REQUEST` | 400 | Thiếu trường bắt buộc, sai kiểu/định dạng, vượt độ dài hoặc số lẻ, mã quá 12 ký tự, quá 200 dòng, `quantity` ≤ 0, trùng `return_line_id`, `order_code` không khớp BL1, `return_date` nhỏ hơn ngày BL1 hoặc lớn hơn thời điểm nhận |
| `REQUEST_CONFLICT` | 409 | `return_code` đã được xử lý với nội dung khác |
| `DOCUMENT_NUMBER_EXISTS` | 409 | Đã có TL1 tạo tay cùng số chứng từ với `return_code` |
| `SHIPMENT_NOT_FOUND` | 422 | Không có BL1 nguồn Web với số chứng từ = `shipment_code` (lần giao chưa được tạo hóa đơn bán lẻ) |
| `SHIPMENT_LINE_NOT_FOUND` | 422 | `shipment_line_id` không thuộc BL1, hoặc `item_code` không khớp dòng giao |
| `RETURN_QUANTITY_EXCEEDED` | 422 | Lượng hoàn lũy kế vượt lượng đã giao của dòng |
| `RETURN_AMOUNT_EXCEEDED` | 422 | Giá trị hoàn lũy kế vượt giá trị dòng giao |
| `PERIOD_LOCKED` | 422 | Ngày chứng từ thuộc kỳ đã khóa sổ |
| `INTERNAL_ERROR` | 500 | Lỗi hệ thống FBO; Website gọi lại cùng `return_code` qua hàng đợi retry |

### 5.6. Mapping request sang phiếu trả lại bán lẻ (TL1)

Đối chiếu màn hình "Xem phiếu trả lại bán lẻ" (tab Hàng trả, Hàng bán, Xác thực) với request. Về HĐĐT, TL1 là hóa đơn điều chỉnh cho HĐĐT của BL1 tương ứng. Nguồn giá trị dùng như mục 4.6; thêm nguồn **BL1 gốc**: lấy từ BL1 có số hóa đơn = `shipment_code`.

#### 5.6.1. Thông tin chung (header)

| Trường trên TL1 | Nguồn | Giá trị | Quy tắc |
|---|---|---|---|
| Cửa hàng | BL1 gốc | Cửa hàng của BL1 | |
| Mã khách, tên - SĐT | BL1 gốc | Mã khách của BL1 | |
| Mã giao dịch | Mặc định | `1` | Website không truyền |
| Số hóa đơn, ngày | BL1 gốc | Số hóa đơn và ngày hóa đơn của BL1 | BL1 được tìm theo `shipment_code` |
| Diễn giải | Request | `reason` - `note` | Ghép theo dạng `<reason> - <note>`; trường nào trống thì bỏ trường đó và dấu ` - `. Ví dụ `Khach doi y - Hang loi chi`; chỉ có `reason` thì `Khach doi y` |
| Số chứng từ | Request | `return_code` | Tối đa 12 ký tự |
| Ngày lập | Request | Phần ngày của `return_date` | |
| Giờ hóa đơn | Request | Phần giờ của `return_date` | |
| Trạng thái | Mặc định | `2` - Chuyển sổ cái | Nhập tồn và hạch toán ngay, hạch toán như TL1 tạo tay |

#### 5.6.2. Hàng trả (tab Hàng trả, mỗi phần tử `items[]` là một dòng)

Các dòng của tab Hàng trả được nạp từ BL1 gốc; dòng nào có trong request thì tick Trả lại và ghi số lượng, giá trị hoàn.

| Trường trên TL1 | Nguồn | Giá trị | Quy tắc |
|---|---|---|---|
| Trả lại | Request | Tick | Tick khi dòng giao có trong `items[]` |
| Mã hàng | Request | `items[].item_code` | Phải khớp dòng BL1 có `shipment_line_id` tương ứng |
| Tên mặt hàng | Danh mục | Theo danh mục vật tư | |
| ĐVT | Danh mục | Theo danh mục vật tư | |
| Kho | Danh mục | Mã kho bán của bộ phận | Bộ phận theo BL1 gốc |
| SL trả lại | Request | `items[].quantity` | |
| SL hóa đơn | BL1 gốc | Số lượng của dòng BL1 | |
| SL đã trả | Tính | Tổng SL trả lại của dòng ở các TL1 trước | |
| SL còn lại | Tính | SL hóa đơn - SL đã trả | Tổng `quantity` của dòng giao trong request ≤ SL còn lại, vượt thì trả `RETURN_QUANTITY_EXCEEDED` |
| Giá bán | Request | `items[].price` | |
| TLCK (%) | Request | `items[].discount_rate` | |
| Chiết khấu | Request | `items[].discount_amount` | Tiền chiết khấu trên một sản phẩm |
| Thanh toán | Request | `items[].amount` | |
| Mã dòng hoàn | Request | `items[].return_line_id` | Trường mới |
| Mã dòng giao | Request | `items[].shipment_line_id` | Trường mới, liên kết dòng BL1 gốc |

#### 5.6.3. Hàng bán (tab Hàng bán)

Không dùng. Đổi hàng là nghiệp vụ riêng, chưa thuộc phạm vi tích hợp (ORD-BRU-005); TL1 tạo từ API không có dòng Hàng bán.

#### 5.6.4. Tổng và thanh toán

| Trường trên TL1 | Nguồn | Giá trị | Quy tắc |
|---|---|---|---|
| Tổng cộng | Mặc định | `0` | Là tổng SL tab Hàng bán; không có hàng bán |
| Tổng giá trị trả | Tính | Σ `amount` | |
| Tổng giá trị đổi | Mặc định | `0` | Không có hàng bán |
| Tổng thanh toán | Tính | Tổng giá trị đổi - Tổng giá trị trả | Chỉ trả hàng thì ghi số âm, ví dụ trả 180 000 → `-180 000` |
| Tiền mặt (check + số tiền) | Request | `-refund_on_cash` | Ghi số âm; tick khi `refund_on_cash` > 0 |
| Tiền thẻ (check + số tiền) | Request | `-refund_on_bank` | Ghi số âm; tick khi `refund_on_bank` > 0 |
| Tiền khách nợ | Mặc định | `0` | |
| Nhận của KH | Mặc định | `0` | |
| Tiền thừa | Mặc định | `0` | |

#### 5.6.5. Thông tin xác thực HĐĐT điều chỉnh (tab Xác thực)

| Trường trên TL1 | Nguồn | Giá trị | Quy tắc |
|---|---|---|---|
| Xác thực | Mặc định | `1` - Có | |
| Xử lý | Mặc định | `0` - Không xử lý | |
| Ghi chú | Request | `note` | |
| Tình trạng | Mặc định / Portal | `0` - Chưa xác thực | Cập nhật theo kết quả Portal |
| Thư (Email), Mã số thuế, Tên người mua, Địa chỉ, Số hộ chiếu, Mã số QHNS | BL1 gốc | Theo tab Xác thực của BL1 | Hóa đơn điều chỉnh giữ thông tin người mua của hóa đơn gốc |
| Hình thức tt | BL1 gốc | Hình thức tt của BL1 | |

Các trường Mẫu hóa đơn, Ký hiệu, Số chứng từ và nhóm trường "đc" do hệ thống tự điền từ kết quả phát hành HĐĐT; không lấy từ request và không cần lưu thêm.

#### 5.6.6. Trường mới cần bổ sung trong DB

| Trường | Gắn với | Mục đích |
|---|---|---|
| Nguồn chứng từ (Web) | Header | Phân biệt TL1 tạo từ API với TL1 tạo tay |
| Mã đơn hàng web (`order_code`) | Header | Liên kết đơn - lần giao - lần hoàn |
| Mã dòng hoàn (`return_line_id`) | Hàng trả | Đối chiếu kết quả từng dòng |
| Mã dòng giao (`shipment_line_id`) | Hàng trả | Liên kết đúng dòng BL1 gốc |
| Mã băm nội dung request, response đã trả | Header hoặc bảng log | Chống trùng theo `return_code` |
| Trạng thái chờ HĐĐT gốc | Xác thực | Đánh dấu TL1 chờ HĐĐT của BL1 gốc phát hành thành công mới phát hành điều chỉnh (mục 7.1 bước 4) |

## 6. Đẩy tồn sang Website (INT-API-001)

API nhận tồn do Website thiết kế và cung cấp; mục này mô tả quy tắc xử lý và dữ liệu phía FBO gửi. Tham chiếu BRD: INV-BR-001, INT-BRU-003, INT-BRU-004.

### 6.1. Các đường cập nhật tồn

| Đường | Thời điểm | Nội dung |
|---|---|---|
| Response INT-API-002 / INT-API-004 | Ngay khi tạo BL1 / TL1 | Tồn mới của các mặt hàng trong chứng từ (mục 4.4, 5.4). Website dùng để cập nhật tồn và nhả lượng giữ của lần giao |
| Job định kỳ | 5 phút một lần | Tồn của các mặt hàng có biến động so với lần gửi thành công gần nhất, gồm mọi biến động ngoài BL1/TL1 (nhập mua, bán tại cửa hàng, điều chuyển, kiểm kê, chứng từ tạo tay...) |
| Đẩy toàn bộ | Khi tick Đồng bộ web cho bộ phận, khi go-live, hoặc bấm tay để đối soát | Toàn bộ tồn trong phạm vi, không xét biến động |

Độ trễ tối đa 5 phút với các biến động ngoài BL1/TL1 được chấp nhận. Số tồn lấy bằng hàm tính tồn tại thời điểm hiện tại có sẵn của FBO.

### 6.2. Phạm vi và phiên bản tồn

- **Phạm vi:** Mã kho bán của các bộ phận có Trạng thái = 1 và đã tick Đồng bộ web (mục 3.3). Biến động ở kho khác không đẩy.
- **Phiên bản tồn (`version`):** số mili giây Unix (epoch ms), dùng chung cho response INT-API-002/004, job định kỳ và đẩy toàn bộ. Quy tắc lấy:
  - `version` = thời điểm **bắt đầu đọc** tồn, lấy theo giờ của DB server (một nguồn giờ duy nhất).
  - Chỉ đọc dữ liệu đã commit. Với INT-API-002/004, đọc tồn **sau khi commit** chứng từ, không tính trong transaction.
  - Không dùng thời điểm gửi.

  Nhờ vậy, số tồn mang `version` = v luôn đã gồm mọi chứng từ commit trước v; bản có `version` lớn hơn không bao giờ cũ hơn bản có `version` nhỏ hơn.

  Ví dụ lý do: BL1 G001 tính tồn 96 trong transaction lúc t0 nhưng commit lúc t2; job đọc tồn lúc t1 (giữa t0 và t2) chưa thấy G001 nên ra 100 với version t1 > t0. Nếu lấy version trong transaction, Website sẽ dùng 100 thay cho 96 và bán vượt 4 áo đến chu kỳ sau. Khi đọc sau commit, response G001 có version t3 > t2 > t1 nên Website giữ 96 và bỏ qua bản 100.

### 6.3. Job định kỳ 5 phút

FBO lưu bảng **Tồn đã gửi Website** theo kho + mã hàng: số tồn, `version`, thời điểm gửi thành công.

1. Không chạy chồng: lần chạy trước chưa xong thì bỏ qua chu kỳ này.
2. Ghi nhận thời điểm bắt đầu làm `version`, rồi tính tồn hiện tại của mọi mã hàng trong phạm vi.
3. So với bảng Tồn đã gửi Website; chỉ lấy các dòng có số tồn khác, hoặc chưa có trong bảng.
4. Gửi sang Website theo dữ liệu ở mục 6.4, chia batch tối đa 500 dòng.
5. Website xác nhận nhận thành công thì cập nhật bảng cho các dòng của batch, **chỉ khi `version` vừa gửi lớn hơn `version` đang lưu** của dòng đó. Lỗi hoặc timeout thì không cập nhật; chu kỳ sau các dòng này tự được gửi lại vì vẫn chênh lệch. Không cần hàng đợi retry riêng cho tồn.
6. Khi INT-API-002/004 trả response thành công, FBO cũng cập nhật bảng cho các mặt hàng trong response với cùng điều kiện `version`, để job không gửi lặp lại.

Đẩy toàn bộ dùng cùng cách gửi, bỏ qua bước 3; chạy được cho một bộ phận hoặc tất cả bộ phận.

### 6.4. Dữ liệu FBO gửi

Tên trường theo API của Website; FBO cung cấp các dữ liệu sau cho mỗi dòng:

| Dữ liệu | Mô tả |
|---|---|
| Mã kho | Mã kho bán của bộ phận |
| Mã hàng | Mã sản phẩm |
| Số tồn | Tồn thực tế tại thời điểm `version`, là số thay thế (không phải lượng cộng/trừ) |
| `version` | Phiên bản tồn (mục 6.2) |

FBO chỉ coi một batch là gửi thành công khi Website trả HTTP 200 và `success: true`.

## 7. Đẩy kết quả HĐĐT sang Website (INT-API-003)

API nhận kết quả HĐĐT do Website thiết kế và cung cấp, dùng chung cho HĐĐT của BL1 và HĐĐT điều chỉnh của TL1; mục này mô tả quy tắc xử lý và dữ liệu phía FBO gửi. Tham chiếu BRD: INVH-BR-001, INVH-BR-002, INVH-BR-003, INT-BR-003, INT-BRU-004, INVH-BRU-003.

### 7.1. Thời điểm gửi

Gắn vào chức năng phát hành HĐĐT lên Portal có sẵn của FBO, áp dụng cho cả phát hành tự động sau khi tạo BL1/TL1 và phát hành lại bằng tay (bấm "Xuất HĐ"):

1. Phát hành HĐĐT lên Portal, nhận kết quả.
2. Cập nhật thông tin HĐĐT vào chứng từ (Tình trạng, Số chứng từ, số xác thực...).
3. Nếu phát hành thành công (Tình trạng = 2 - Đã xác thực) và chứng từ có nguồn Web: đưa bản ghi vào hàng đợi gửi Website và gửi ngay.
4. Nếu chứng từ là BL1 nguồn Web vừa phát hành thành công và có TL1 đang chờ HĐĐT gốc (`WAITING_ORIGINAL`): bỏ trạng thái chờ của các TL1 đó và đưa vào phát hành HĐĐT điều chỉnh, lần lượt theo ngày giờ lập rồi số chứng từ TL1. Mỗi TL1 sau khi phát hành lại đi qua bước 1-3.

Phát hành thất bại thì không gửi Website; người dùng tự xử lý trên FBO rồi phát hành lại bằng tay. HĐĐT gốc chưa phát hành thành công thì các TL1 liên quan tiếp tục ở trạng thái chờ. Chứng từ tạo tay (không có nguồn Web) không gửi.

### 7.2. Dữ liệu FBO gửi

Tên trường theo API của Website; FBO cung cấp:

| Dữ liệu | BL1 | TL1 | Mô tả |
|---|---|---|---|
| Loại hóa đơn | Có | Có | `ORIGINAL` (HĐĐT của BL1) hoặc `ADJUSTMENT` (HĐĐT điều chỉnh giảm của TL1) |
| Mã đơn hàng (`order_code`) | Có | Có | |
| Mã lần giao (`shipment_code`) | Có | Có | Với TL1 là lần giao được hoàn |
| Mã lần hoàn (`return_code`) | | Có | |
| Số chứng từ FBO | Có | Có | Số BL1 hoặc số TL1 |
| Mẫu, ký hiệu, số HĐĐT | Có | Có | Theo kết quả phát hành |
| Ngày HĐĐT | Có | Có | |
| Mã của cơ quan thuế, mã tra cứu, link tra cứu | Có | Có | Nếu Portal trả về |
| Mẫu, ký hiệu, số HĐĐT gốc | | Có | HĐĐT của BL1 được điều chỉnh |

Website chỉ được coi là đã nhận khi trả HTTP 200 và `success: true`. Callback HĐĐT không mang số tồn.

### 7.3. Hàng đợi gửi lại

- FBO chỉ coi là gửi xong khi Website xác nhận nhận thành công (mục 7.2).
- Gọi lỗi, timeout hoặc Website trả không thành công: xếp bản ghi về **cuối hàng đợi** và gửi lại khi đến lượt, cùng nội dung.
- Không giới hạn số lần gửi lại; retry đến khi thành công. Bản ghi lỗi không chặn các bản ghi khác vì luôn được xếp cuối.
- Hàng đợi lưu trong DB, không mất khi khởi động lại dịch vụ.

### 7.4. Màn hình theo dõi

Màn hình liệt kê các bản ghi trong hàng đợi chưa gửi thành công:

| Cột | Mô tả |
|---|---|
| Loại, số chứng từ, mã đơn | Nhận diện chứng từ |
| Số lần đã gửi | Đếm cả lần gọi đầu |
| Lần gửi gần nhất | Thời điểm |
| Lỗi gần nhất | Mã/mô tả lỗi Website trả về hoặc lỗi kết nối |

Sắp theo số lần đã gửi giảm dần để kế toán phát hiện bản ghi bị lỗi lặp lại; có nút gửi lại ngay cho bản ghi được chọn.

### 7.5. Trường mới cần bổ sung trong DB

| Trường | Gắn với | Mục đích |
|---|---|---|
| Hàng đợi gửi Website (loại, số chứng từ, nội dung, số lần gửi, lần gửi gần nhất, lỗi gần nhất, trạng thái) | Bảng riêng | Gửi lại và theo dõi |
| Tồn đã gửi Website (kho, mã hàng, số tồn, `version`, thời điểm gửi) | Bảng riêng | Tính biến động cho job 5 phút (mục 6.3) |

## 8. Truy vết BRD

Các mã BRD có phần việc của FBO:

| Mã BRD | Nội dung phía FBO | Mục SRS |
|---|---|---|
| INV-BR-001, INT-BRU-003 | Trả tồn mới trong response, job 5 phút, phiên bản tồn | 4.4, 5.4, 6 |
| ORD-BR-003 | Tạo BL1, trừ tồn đúng lượng lần giao | 4.3 |
| INVH-BR-001 | HĐĐT MTT riêng cho từng lần giao, gửi kết quả gắn mã đơn, mã lần giao | 4.3 bước 7, 7 |
| ORD-BR-005, INVH-BRU-001 | Hoàn theo một lần giao, theo dòng giao | 5.1, 5.3 |
| INV-BR-003 | Nhập toàn bộ hàng hoàn vào Mã kho bán của bộ phận trên BL1 gốc | 5.3 bước 5 |
| INVH-BR-002 | HĐĐT điều chỉnh giảm tham chiếu HĐĐT gốc | 5.3 bước 7, 7.2 |
| INVH-BR-003, INVH-BRU-003 | Hoàn khi HĐĐT gốc chưa xong; phát hành điều chỉnh sau khi gốc thành công | 5.3 bước 7, 7.1 bước 4 |
| ORD-BR-006 | Lưu mã đơn, mã lần giao, mã dòng, liên kết BL1 - TL1 | 4.6.5, 5.6.6 |
| INT-BR-001, INT-BRU-001 | Chống trùng theo `shipment_code`, `return_code` | 4.3 bước 2, 5.3 bước 2 |
| INT-BR-002 | Kết quả riêng từng lần giao/lần hoàn trong response và log | 4.4, 5.4, 4.6.5 |
| INT-BR-003, INT-BRU-004 | Response kèm tồn mới; đẩy HĐĐT ngay sau khi phát hành thành công, gửi lại đến khi Website xác nhận | 4.4, 5.4, 7.1, 7.3 |
| INT-BR-004 | Chặn tạo BL1 khi thiếu tồn | 4.3 bước 4 |
| ORD-BR-009, ORD-BRU-009 | Dùng nguyên giá trị, chiết khấu Website gửi; kiểm tra tổng hoàn không vượt giá trị dòng giao; FBO tính thuế theo cấu hình | 4.2, 4.6.3, 5.3 bước 4 |
| ORD-BRU-004 | Lượng hoàn lũy kế không vượt lượng giao của dòng | 5.3 bước 4 |
| INVH-BRU-002 | Lỗi HĐĐT không tạo lại chứng từ, không trừ/nhập tồn lại | 4.3 bước 7, 5.3 bước 7 |
| INV-BRU-003 | Response tạo BL1 kèm tồn mới để Website nhả lượng giữ cùng lúc | 4.3 bước 6 |
| ISS-009 | Từ chối hoàn khi lần giao chưa có BL1 | 5.3 bước 3 |

## 9. Lịch sử thay đổi

| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 17/10/2026 | 1.0 | Bản đầu: danh mục bộ phận, INT-API-002, INT-API-004, quy tắc đẩy tồn và đẩy kết quả HĐĐT |
| 17/10/2026 | 1.1 | Cập nhật sau review: bổ sung thông tin tài liệu, quy ước chung (token, định dạng, response lỗi kèm lý do, HTTP status, giới hạn), truy vết BRD. FBO tính thuế theo cấu hình. Kiểm tra tồn cộng theo mã hàng; chống trùng và kiểm tra tồn trong transaction có khóa; gộp trình tự xử lý BE vào 4.3; chống trùng chạy trước kiểm tra danh mục. Sửa công thức Tổng chiết khấu; FBO không kiểm tra nhất quán số tiền. Phiên bản tồn lấy theo thời điểm bắt đầu đọc dữ liệu đã commit. Thêm mã lỗi `DEPARTMENT_CONFIG_MISSING`, `CUSTOMER_NOT_FOUND`, `EMPLOYEE_NOT_FOUND`, `PERIOD_LOCKED`, `DOCUMENT_NUMBER_EXISTS`; `INSUFFICIENT_STOCK` trả kèm tồn hiện tại và phiên bản. Bổ sung xử lý TL1 chờ HĐĐT gốc, dữ liệu FBO gửi INT-API-001/003, mẫu lỗi `RETURN_AMOUNT_EXCEEDED`, quy tắc ghép Diễn giải TL1. Bỏ chặn sửa/xóa tay và chi tiết kết nối Portal |
