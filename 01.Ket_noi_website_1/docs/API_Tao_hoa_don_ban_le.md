# API tạo hóa đơn bán lẻ theo lần giao

Tài liệu dành cho đội phát triển Website Phương Thảo, mô tả API do FBO cung cấp để Website gửi dữ liệu từng lần giao hàng. Căn cứ SRS PT-SRS-001 phiên bản 1.1.

## 1. Tổng quan

Mỗi lần giao hàng thực tế, Website gọi API này một lần với đúng các dòng hàng và số lượng của lần giao đó. FBO sẽ:

1. Tạo hóa đơn bán lẻ cho lần giao, số chứng từ chính là `shipment_code`.
2. Trừ tồn kho theo số lượng giao.
3. Trả về tồn mới của các mặt hàng trong lần giao.
4. Phát hành hóa đơn điện tử máy tính tiền (HĐĐT) ở chế độ bất đồng bộ. Kết quả HĐĐT được FBO gửi về Website sau, qua API nhận kết quả hóa đơn của Website (mô tả ở tài liệu riêng).

Một đơn hàng giao nhiều lần thì gọi nhiều lần, mỗi lần một `shipment_code` khác nhau. Không gửi lại toàn bộ số lượng của đơn.

| Thuộc tính | Giá trị |
|---|---|
| URL | `{FBO_BASE_URL}/api/v1/integration/shipments/sales` |
| Method | `POST` |
| Header | `Content-Type: application/json`<br>`Authorization: Bearer <token>` |
| Token | Do FBO cấp, không hết hạn. Cấp một lần qua chat; khi cần đổi thì FBO cấp lại qua chat |
| Giới hạn | Tối đa 200 dòng `items` mỗi request. Website nên đặt timeout 30 giây |

## 2. Request

Các trường ngày giờ có định dạng `dd/MM/yyyy HH:mm:ss`. Trường chuỗi không vượt độ dài cột tương ứng trên FBO; số tiền và số lượng không vượt số lẻ khai báo trên FBO.

### 2.1. Thông tin chứng từ

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `shipment_code` | string(12) | Có | Mã lần giao trên Website, tối đa 12 ký tự, duy nhất trên toàn hệ thống. Dùng làm số chứng từ trên FBO và làm khóa chống trùng (mục 4) |
| `shipment_date` | string | Có | Ngày giờ giao hàng, không lớn hơn thời điểm gửi. Đây cũng là ngày của hóa đơn bán lẻ và HĐĐT |
| `order_code` | string | Có | Mã đơn hàng trên Website |
| `order_date` | string | Có | Ngày giờ đặt hàng |
| `department_code` | string | Có | Mã bộ phận ghi nhận doanh thu. FBO tự xác định kho xuất theo bộ phận này |
| `customer_code` | string | Không | Mã khách hàng. Để trống thì FBO dùng mã khách lẻ mặc định của bộ phận |
| `sale_code` | string | Không | Mã nhân viên bán hàng. Để trống thì FBO dùng nhân viên mặc định của bộ phận |
| `items` | array | Có | Danh sách dòng hàng của lần giao, từ 1 đến 200 dòng (mục 2.2) |
| `paid_on_cash` | decimal | Có | Số tiền thanh toán bằng tiền mặt. Không có thì truyền `0` |
| `paid_on_bank` | decimal | Có | Số tiền thanh toán bằng chuyển khoản, QR, thẻ. Không có thì truyền `0` |

### 2.2. `items[]` - Dòng hàng

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `shipment_line_id` | string | Có | Mã dòng giao, duy nhất trong lần giao. Cần lưu lại để dùng khi gửi hoàn hàng theo dòng |
| `order_line_id` | string | Có | Mã dòng của đơn hàng gốc. Một dòng đơn có thể xuất hiện ở nhiều lần giao |
| `item_code` | string | Có | Mã sản phẩm (dùng chung bộ mã với FBO). Nhiều dòng có thể cùng mã sản phẩm |
| `quantity` | decimal | Có | Số lượng giao lần này, lớn hơn 0 |
| `price` | decimal | Có | Đơn giá chưa chiết khấu |
| `discount_rate` | decimal | Có | Tỷ lệ chiết khấu theo %, ví dụ 50% thì truyền `50`. Không có thì truyền `0` |
| `discount_amount` | decimal | Có | Số tiền chiết khấu trên một sản phẩm. Không có thì truyền `0` |
| `amount` | decimal | Có | Số tiền phải thanh toán của dòng sau chiết khấu |

FBO ghi nhận nguyên các giá trị tiền và chiết khấu Website gửi, không tự tính lại và không kiểm tra tính nhất quán giữa các trường. Website cần tính đúng trước khi gửi. Website không gửi thuế: FBO tính thuế theo cấu hình thuế của bộ phận.

### 2.3. Thông tin phát hành HĐĐT

| Trường | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| `buyer` | object | Không | Thông tin người mua. Bỏ trống với khách lẻ không lấy hóa đơn |
| `buyer.name` | string | Không | Tên người mua |
| `buyer.phone` | string | Không | Số điện thoại |
| `buyer.email` | string | Không | Email nhận thông báo phát hành HĐĐT |
| `buyer.tax_code` | string | Không | Mã số thuế người mua |
| `buyer.address` | string | Không | Địa chỉ |
| `buyer.identity_number` | string | Không | Số căn cước. Nếu có cả số căn cước và số hộ chiếu, HĐĐT dùng số căn cước |
| `buyer.passport` | string | Không | Số hộ chiếu |
| `buyer.budget_code` | string | Không | Mã số đơn vị có quan hệ với ngân sách |
| `payment_method` | string | Có | Hình thức thanh toán in trên HĐĐT: `"1"` = Tiền mặt, `"2"` = Chuyển khoản, `"3"` = Tiền mặt/Chuyển khoản |
| `note` | string | Không | Ghi chú |

### 2.4. Ví dụ

Đơn `D001` có 10 áo, lần giao `G001` giao 4 áo:

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

Lần giao tiếp theo của đơn này (ví dụ 6 áo còn lại) gửi với `shipment_code` mới, ví dụ `G002`, và `quantity` là 6.

## 3. Response

### 3.1. Cấu trúc

| Trường | Kiểu | Mô tả |
|---|---|---|
| `success` | boolean | `true` khi FBO đã tạo hóa đơn bán lẻ (kể cả trường hợp trả lại kết quả của yêu cầu gửi trùng); `false` khi bị từ chối |
| `error_code` | string | Mã lỗi (mục 5); `null` khi thành công |
| `error_message` | string | Lý do lỗi cụ thể, nêu rõ trường và giá trị gây lỗi |
| `data.shipment_code` | string | Mã lần giao |
| `data.order_code` | string | Mã đơn hàng |
| `data.sales_document_code` | string | Số chứng từ trên FBO, bằng `shipment_code` |
| `data.is_duplicate` | boolean | `true` khi yêu cầu đã được xử lý trước đó và FBO trả lại kết quả cũ |
| `data.inventory[]` | array | Tồn mới của các mặt hàng trong lần giao |
| `data.inventory[].warehouse_code` | string | Mã kho |
| `data.inventory[].item_code` | string | Mã sản phẩm |
| `data.inventory[].quantity` | decimal | Số tồn mới sau khi trừ. Đây là số thay thế số đang lưu, không phải lượng cộng/trừ |
| `data.inventory[].version` | integer | Phiên bản tồn, dạng số mili giây Unix (epoch ms). Bản có `version` lớn hơn luôn mới hơn |
| `data.invoice_status` | string | Trạng thái HĐĐT, là `PENDING` ngay sau khi tạo hóa đơn bán lẻ |
| `data.errors[]` | array | Chỉ có khi `INVALID_REQUEST`: danh sách lỗi, mỗi phần tử gồm `field`, `value`, `message` |

### 3.2. Thành công

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

### 3.3. Không đủ tồn

FBO cộng số lượng các dòng cùng mã sản phẩm rồi so với tồn. Có ít nhất một mã không đủ tồn thì từ chối cả yêu cầu; không có dòng nào được ghi nhận.

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

Mỗi phần tử là một mã sản phẩm thiếu tồn: `quantity` là tổng số lượng yêu cầu của mã đó, `stock_quantity` là tồn hiện có tại kho xuất, `version` là phiên bản của số tồn này. Website nên cập nhật tồn theo `stock_quantity` với cùng quy tắc `version` (mục 6).

### 3.4. Sai dữ liệu

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

### 3.5. Trùng mã, khác nội dung

```json
{
  "success": false,
  "error_code": "REQUEST_CONFLICT",
  "error_message": "shipment_code G001 da ton tai voi noi dung khac",
  "data": { "shipment_code": "G001", "sales_document_code": "G001" }
}
```

## 4. Gửi lại và chống trùng

FBO nhận diện yêu cầu theo `shipment_code`, trước mọi kiểm tra danh mục:

| Tình huống | Kết quả |
|---|---|
| Mã chưa từng được tạo hóa đơn | Xử lý như yêu cầu mới |
| Mã đã được tạo hóa đơn, nội dung giống lần trước | Không tạo thêm hóa đơn, không trừ tồn lại. Trả lại kết quả cũ với `success: true`, `is_duplicate: true` |
| Mã đã được tạo hóa đơn, nội dung khác | Từ chối với `REQUEST_CONFLICT` |
| Mã trùng số của một hóa đơn bán lẻ tạo tay trên FBO | Từ chối với `DOCUMENT_NUMBER_EXISTS` |
| Lần gửi trước bị từ chối (ví dụ không đủ tồn) | Chưa có hóa đơn, nên gửi lại cùng mã được xử lý như yêu cầu mới |

Khi bị timeout, mất kết nối hoặc nhận `INTERNAL_ERROR` (HTTP 500), Website gửi lại **đúng `shipment_code` và đúng nội dung cũ**, không tạo mã lần giao mới. Nhờ cơ chế trên, gửi lại không làm phát sinh hóa đơn trùng, kể cả khi hai lần gửi đến FBO cùng lúc.

## 5. Mã lỗi

| Mã lỗi | HTTP | Ý nghĩa | Website xử lý |
|---|---|---|---|
| `UNAUTHORIZED` | 401 | Token không hợp lệ | Kiểm tra lại token |
| `INVALID_REQUEST` | 400 | Thiếu trường bắt buộc, sai kiểu/định dạng, vượt độ dài hoặc số lẻ, `shipment_code` quá 12 ký tự, quá 200 dòng, `quantity` ≤ 0, trùng `shipment_line_id`, `shipment_date` lớn hơn thời điểm gửi. Chi tiết trong `data.errors[]` | Sửa dữ liệu rồi gửi lại |
| `REQUEST_CONFLICT` | 409 | `shipment_code` đã được tạo hóa đơn với nội dung khác | Kiểm tra lại dữ liệu lần giao; không đổi nội dung của lần giao đã ghi nhận |
| `DOCUMENT_NUMBER_EXISTS` | 409 | `shipment_code` trùng số của hóa đơn bán lẻ tạo tay trên FBO | Liên hệ FBO kiểm tra |
| `DEPARTMENT_NOT_FOUND` | 422 | `department_code` không tồn tại, ngừng sử dụng hoặc chưa được bật đồng bộ web trên FBO | Kiểm tra mã bộ phận với FBO |
| `DEPARTMENT_CONFIG_MISSING` | 422 | Bộ phận trên FBO thiếu kho bán, hoặc thiếu khách/nhân viên mặc định khi `customer_code`/`sale_code` để trống | Liên hệ FBO khai báo, sau đó gửi lại cùng `shipment_code` |
| `CUSTOMER_NOT_FOUND` | 422 | `customer_code` không tồn tại trên FBO | Kiểm tra mã khách hàng |
| `EMPLOYEE_NOT_FOUND` | 422 | `sale_code` không tồn tại trên FBO | Kiểm tra mã nhân viên |
| `PRODUCT_NOT_FOUND` | 422 | `item_code` không tồn tại, ngừng sử dụng hoặc không theo dõi tồn trên FBO | Kiểm tra mã sản phẩm |
| `INVOICE_CONFIG_NOT_FOUND` | 422 | Bộ phận chưa được khai báo thông tin xuất hóa đơn điện tử trên FBO | Liên hệ FBO khai báo, sau đó gửi lại cùng `shipment_code` |
| `PERIOD_LOCKED` | 422 | Ngày giao thuộc kỳ kế toán đã khóa sổ trên FBO | Liên hệ FBO |
| `INSUFFICIENT_STOCK` | 422 | Kho xuất không đủ tồn cho ít nhất một mã sản phẩm | Có thể gửi lại cùng `shipment_code` sau khi tồn đã được bổ sung |
| `INTERNAL_ERROR` | 500 | Lỗi hệ thống FBO | Gửi lại cùng `shipment_code`, cùng nội dung |

Chỉ gửi lại tự động khi timeout, mất kết nối hoặc HTTP 500. Các lỗi 4xx cần sửa dữ liệu hoặc khai báo trước khi gửi lại.

## 6. Lưu ý cho Website

- **Cập nhật tồn từ response:** với mỗi phần tử trong `data.inventory` (hoặc `data.items` của lỗi `INSUFFICIENT_STOCK`), chỉ cập nhật khi `version` lớn hơn phiên bản đang lưu cho cùng kho và mã sản phẩm. Bản có `version` nhỏ hơn hoặc bằng thì bỏ qua (ví dụ khi nhận lại kết quả cũ của yêu cầu gửi trùng). FBO cũng đẩy tồn định kỳ 5 phút qua API cập nhật tồn của Website, dùng cùng quy tắc `version`.
- **Lượng đang giữ cho lần giao:** chỉ thôi giữ số lượng của lần giao khi nhận response `success: true`, và cập nhật tồn mới trong cùng bước đó để tồn khả dụng không bị tăng tạm thời.
- **Lưu lại mã:** lưu `shipment_code`, `shipment_line_id` và `sales_document_code` để đối chiếu hóa đơn và gửi hoàn hàng sau này.
- **Hóa đơn điện tử:** `invoice_status: PENDING` là bình thường. Thông tin hóa đơn (số, ký hiệu, mã tra cứu...) được FBO gửi về sau. Nếu Website gửi bù muộn, HĐĐT có thể phát hành lỗi do ngày hóa đơn; FBO sẽ xử lý trên hệ thống của mình.
