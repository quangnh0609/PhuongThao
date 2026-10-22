# BRD cải tiến hoạch định sản xuất và gọi hàng

**Phiên bản:** 0.1 — Khởi tạo ngày 23/10/2026.  
**Căn cứ nghiệp vụ:** [Sơ đồ Hoạch Định Sản Xuất & Gọi Hàng đã được stakeholder chốt](https://whimsical.com/DxVy1FVq4Gr4VhkNnG9KXZ), đọc lại ngày 23/10/2026, cùng các mô tả và quy tắc stakeholder đã xác nhận trong trao đổi.  
**Mục tiêu:** Liên kết kế hoạch năm, gọi hàng, nguồn sản xuất, hoạch định và giao hàng để theo dõi được nhu cầu đến khi được đáp ứng.  
**Thuật ngữ:** PGH = Phiếu gọi hàng; LSX = Lệnh sản xuất; SL = Số lượng.

## 1. Thực trạng

Phương Thảo có nhu cầu lập kế hoạch gọi hàng và kế hoạch sản xuất đầu năm theo năm, kênh Bán lẻ/Trường, mã hàng và số lượng. Trong năm, cửa hàng hoặc trường phát sinh PGH theo kế hoạch hoặc bổ sung. Bộ phận kế hoạch phát LSX theo kế hoạch năm, đồng thời có thể phát LSX bổ sung khi hoạch định thiếu nguồn.

Theo hồ sơ và HDSD FBO đã đối chiếu, hệ thống có các chức năng nền tảng: kế hoạch năm, phiếu gọi hàng, duyệt, hoạch định thành phẩm, LSX, nhập kho và phân bổ thành phẩm, báo cáo tiến độ. Danh sách tính năng riêng đang ghi **Nghiệm thu** cho phần đã phát triển và **Báo giá** cho các hạng mục thuộc báo giá ngày 10/03/2026, theo quy ước người dùng. Trạng thái này không tự áp dụng cho mọi yêu cầu phát sinh từ sơ đồ mới chốt.

Các điểm cần hoàn thiện hoặc xác minh khi đối chiếu quy trình đã chốt:

| Nội dung | Căn cứ hiện có và vấn đề cần giải quyết |
|---|---|
| Kế hoạch gọi hàng và kế hoạch sản xuất | Cần tách hai mục đích: PGH tiêu dùng kế hoạch gọi hàng; LSX thực hiện kế hoạch sản xuất. HDSD có phần mô tả PGH bán lẻ kế thừa kế hoạch SX năm, cần đối chiếu đúng liên kết thực tế. |
| PGH theo kế hoạch của hai kênh | Stakeholder yêu cầu cả Bán lẻ và Trường tham chiếu, trừ dần kế hoạch gọi hàng năm. Hồ sơ hiện mô tả rõ kế hoạch gọi hàng năm bán lẻ; phần tương ứng cho Trường cần xác minh. |
| Nguồn đáp ứng | Sơ đồ chốt dùng tồn kho và dở dang LSX. Cần thống nhất phần còn khả dụng sau phân bổ, tránh tính trùng nguồn đã dành cho PGH khác. |
| Liên kết nhu cầu với nguồn | Một PGH có thể dùng nhiều nguồn. Cần theo dõi phần lấy tồn kho, phần chờ LSX và phần thiếu; khi nhập kho phải giữ liên kết PGH. |
| Hoạch định và giao hàng | Có nguồn dự kiến chưa đồng nghĩa sẵn sàng giao. Cần theo dõi riêng phần chưa có nguồn và phần đã có nguồn nhưng chưa giao được. |
| Cập nhật sau giao | Sơ đồ yêu cầu một nghiệp vụ xuất giao cập nhật đồng thời số đã giao trên PGH và giảm tồn kho; cần xác minh chứng từ và cách liên kết hiện có. |
| Ngoại lệ và đối soát | Cần cụ thể hóa cảnh báo thiếu/trễ, thay đổi nguồn, giao từng phần, đối soát PGH–phân bổ–xuất kho và xác định phần còn phải hoạch định/còn phải giao. |

Các nội dung trên là điểm đối chiếu và yêu cầu kiểm soát; chưa kết luận hệ thống thực tế đang sai hoặc thiếu toàn bộ các chức năng này.

## 2. Nhu cầu

Stakeholder cần một quy trình thống nhất cho bốn trường hợp: **gọi hàng trong kế hoạch, gọi hàng ngoài kế hoạch, sản xuất theo kế hoạch và sản xuất ngoài kế hoạch**. Loại PGH và loại LSX được quản lý độc lập: PGH bổ sung có thể dùng nguồn từ LSX kế hoạch còn khả dụng; PGH trong kế hoạch vẫn có thể cần LSX bổ sung nếu thiếu nguồn.

Danh sách chức năng phân rã từ các khối và nhánh trên sơ đồ:

| Mã | Chức năng nghiệp vụ | Nhu cầu và kết quả mong muốn |
|---|---|---|
| CN01 | Quản lý kế hoạch gọi hàng năm | Ghi nhận năm, kênh, mã hàng, SL kế hoạch; theo dõi SL đã gọi theo kế hoạch và phần còn lại. |
| CN02 | Quản lý kế hoạch sản xuất năm | Ghi nhận năm, kênh, mã hàng, SL kế hoạch; làm căn cứ phát LSX và theo dõi thực hiện. |
| CN03 | Gọi hàng trong kế hoạch | PGH ghi nhận cửa hàng/trường, mã hàng, SL gọi, tham chiếu kế hoạch gọi hàng năm và tiêu dùng dần hạn mức. |
| CN04 | Gọi hàng ngoài kế hoạch | Ghi nhận nhu cầu bổ sung, theo dõi riêng và đưa vào hoạch định chung; không trừ hạn mức gọi hàng năm. |
| CN05 | Lập LSX theo kế hoạch | Phát LSX tham chiếu kế hoạch SX năm; có thể phát trước khi có PGH cụ thể. |
| CN06 | Theo dõi dở dang LSX | Theo dõi phần còn phải hoàn thành/nhập kho và phần đã phân bổ để xác định nguồn dự kiến còn khả dụng. |
| CN07 | Ghi nhận thành phẩm và nhập kho | Ghi nhận thành phẩm hoàn thành theo LSX, nhập kho, giảm dở dang tương ứng; giữ liên kết với PGH đã được phân bổ. |
| CN08 | Quản lý nguồn tồn kho | Ghi nhận số dư đầu năm, nhập và xuất; xác định tồn thực tế, lượng đã phân bổ và tồn còn khả dụng. |
| CN09 | Hoạch định nguồn đáp ứng | Đối chiếu nhu cầu còn phải đáp ứng với tồn kho và dở dang khả dụng, xác định nguồn đáp ứng và phần thiếu. |
| CN10 | Phân bổ nguồn cho PGH | Ghi nhận theo dòng PGH và mã hàng: nguồn nào, SL bao nhiêu, lấy từ tồn kho hay chờ LSX; cho phép một PGH dùng nhiều nguồn. |
| CN11 | Lập LSX bổ sung | Lập LSX ngoài kế hoạch cho phần thiếu và gắn lại với nhu cầu PGH; cập nhật phân bổ từ nguồn dự kiến mới. |
| CN12 | Kiểm tra sẵn sàng giao hàng | Xác định lượng tồn kho đã phân bổ đủ điều kiện giao so với lượng dự kiến giao của đợt; không coi dở dang là hàng sẵn sàng. |
| CN13 | Xác nhận lịch và số lượng giao | Xác nhận ngày, SL giao; hỗ trợ giao từng phần khi được duyệt và tiếp tục theo dõi phần chưa giao. |
| CN14 | Cảnh báo và xử lý thiếu hoặc trễ | Nhận biết thiếu hàng hoặc nguồn về trễ; cập nhật thực tế LSX, bổ sung/điều chỉnh nguồn, phân bổ lại và kiểm tra lại khả năng giao. |
| CN15 | Xuất kho và giao hàng | Ghi nhận lượng xuất giao thực tế, liên kết được với PGH và nguồn đã phân bổ. |
| CN16 | Cập nhật thực hiện PGH | Tăng SL đã giao theo giao thực tế; tính SL chưa giao, cập nhật tình trạng thực hiện PGH. |
| CN17 | Cập nhật tồn kho sau giao | Trừ tồn theo lượng xuất giao đã ghi nhận; cập nhật phần tồn đã phân bổ được sử dụng tương ứng. |
| CN18 | Đối soát và theo dõi tổng hợp | Đối soát PGH–phân bổ–xuất kho; theo dõi còn phải hoạch định, còn phải giao, gọi hàng và sản xuất so với kế hoạch. |

Phạm vi kế hoạch năm và dữ liệu đơn vị gọi hàng được mô tả cho Bán lẻ/Trường. Yêu cầu hoạch định áp dụng cho PGH trong phạm vi triển khai; nếu mở rộng sang Công sở cần chốt riêng. Các chức năng BOM, hồ sơ gia công và luồng duyệt hiện có tiếp tục là chức năng nền; BRD này không tự mở rộng sang hoạch định NVL hoặc điều độ năng lực sản xuất.

## 3. Giải pháp

### 3.1 Tổ chức thành một quy trình liên thông

**Lập kế hoạch và hình thành nguồn — CN01–CN08:** Đầu năm lập kế hoạch gọi hàng, sau đó kế hoạch SX. Trong năm phát sinh PGH theo kế hoạch/bổ sung và LSX theo kế hoạch. PGH theo kế hoạch tham chiếu kế hoạch gọi hàng tương ứng; LSX kế hoạch tham chiếu kế hoạch SX. Nguồn phục vụ hoạch định được tổng hợp từ tồn kho và dở dang LSX.

**Hoạch định và bảo đảm nguồn — CN09–CN11:** Bộ phận kế hoạch tiếp nhận PGH, đối chiếu nguồn khả dụng và lưu phân bổ theo từng dòng. Kết quả tách thành phần lấy tồn kho, phần chờ dở dang và phần thiếu. Khi cần, người dùng lập LSX bổ sung cho phần thiếu; LSX mới tạo nguồn dự kiến gắn với đúng PGH. Khi nguồn thay đổi, cập nhật lại phân bổ.

**Giao hàng và cập nhật — CN12–CN18:** Kiểm tra hàng đã nhập kho và được phân bổ, xác nhận đợt giao hoặc xử lý thiếu/trễ. Ghi nhận xuất giao cập nhật cả PGH và tồn kho. Đối soát chứng từ để xác định số đã giao, còn phải giao, phần đã có nguồn và phần còn phải hoạch định. Nếu giao một phần, tiếp tục xử lý phần còn lại.

### 3.2 Quản lý các liên kết dữ liệu chính

| Liên kết | Nội dung cần lưu và truy vết |
|---|---|
| KH gọi hàng → PGH theo kế hoạch | Kế hoạch/dòng kế hoạch được tham chiếu, năm, kênh, mã hàng và lượng tiêu dùng hạn mức. |
| KH sản xuất → LSX kế hoạch | Kế hoạch/dòng kế hoạch được tham chiếu và SL phát lệnh; phân biệt với LSX bổ sung. |
| PGH → Phân bổ → Nguồn | Dòng PGH, mã hàng, loại nguồn, kho hoặc LSX nguồn, SL phân bổ; hỗ trợ nhiều nguồn cho một PGH và một nguồn phục vụ nhiều PGH. |
| Phần thiếu → LSX bổ sung | PGH cần đáp ứng, lượng thiếu và lượng đã lập LSX để tránh phát lệnh trùng khi hoạch định lại. |
| LSX → Nhập kho | LSX, mã hàng, SL nhập thực tế; chuyển phần phân bổ từ dở dang sang thành phẩm nhập kho. |
| PGH → Xuất giao | Dòng PGH, chứng từ xuất giao, mã hàng, kho và SL thực giao để cập nhật và đối soát. |

Không mặc định một PGH chỉ có một LSX, hoặc một LSX chỉ phục vụ một PGH. Việc giữ chỗ nguồn cần có số lượng cụ thể; không chỉ ghi chú tên nguồn.

### 3.3 Quy tắc nghiệp vụ và kiểm soát

| Mã | Quy tắc |
|---|---|
| QT01 | KH gọi hàng còn lại = SL kế hoạch − SL gọi theo kế hoạch đã được ghi nhận hợp lệ. PGH bổ sung không tiêu dùng hạn mức này. |
| QT02 | LSX kế hoạch và LSX bổ sung được phân biệt theo căn cứ lập; loại PGH không tự quyết định loại LSX. |
| QT03 | Tồn kho khả dụng = tồn thực tế − tồn đã phân bổ chưa xuất. Dở dang khả dụng là lượng còn phải nhập chưa được phân bổ cho nhu cầu khác. |
| QT04 | Hoạch định xét phần nhu cầu chưa được bảo đảm nguồn. Không cộng phần đã hoạch định như một nguồn độc lập nếu nó đã giữ chỗ trên tồn kho hoặc dở dang. |
| QT05 | LSX bổ sung phải gắn lại phần thiếu; hoạch định lại không tiếp tục phát sinh đề nghị cho lượng đã được bảo đảm bởi LSX này. |
| QT06 | Khi nhập kho, giảm dở dang và tăng tồn thực tế tương ứng; giữ nguyên phân bổ của PGH để không tính cùng một lượng ở cả hai nguồn. |
| QT07 | Dở dang là nguồn dự kiến. Chỉ lượng đã nhập kho, còn được phân bổ và đủ điều kiện mới được xác nhận sẵn sàng giao. |
| QT08 | SL chưa giao = SL gọi hợp lệ − tổng SL đã giao hợp lệ. Có nguồn hoặc đã phân bổ chưa làm tăng SL đã giao. |
| QT09 | Một lần ghi nhận xuất giao chỉ cập nhật một lần vào PGH và tồn kho. Sửa/hủy chứng từ phải điều chỉnh các số liên quan, không chỉ đổi trạng thái hiển thị. |
| QT10 | Thiếu nguồn, thiếu hàng sẵn sàng và trễ lịch là ba tình trạng khác nhau. Có đủ nguồn dự kiến nhưng chưa nhập kho vẫn có thể chưa giao được; đủ số lượng nhưng ngày về muộn vẫn cần cảnh báo trễ. |
| QT11 | Khi PGH hoặc LSX thay đổi, phải xác định lại nhu cầu/phân bổ bị ảnh hưởng. Không tự hủy LSX đã thực hiện hoặc đang phục vụ nhiều PGH. |

Các công thức và kiểm soát trên là nguyên tắc đề xuất cho đặc tả, cần đối chiếu dữ liệu và chứng từ FBO thực tế. Với lượng hợp lệ không vượt giao, mỗi dòng PGH cần được giải thích bằng:

**SL gọi = SL đã giao + tồn kho đã phân bổ chưa giao + dở dang đã phân bổ + SL chưa được bảo đảm nguồn.**

Trong đó **còn phải giao** gồm ba phần cuối; **còn phải hoạch định** là phần chưa được bảo đảm nguồn. Hai chỉ tiêu không dùng thay thế cho nhau.

### 3.4 Theo dõi và báo cáo

CN18 tổng hợp dữ liệu theo năm, kênh, mã hàng, đơn vị gọi hàng và chứng từ liên quan:

- **Gọi hàng:** KH năm, đã gọi theo kế hoạch, hạn mức còn lại, gọi bổ sung, đã giao và chưa giao.
- **Sản xuất:** KH SX năm, lượng phát LSX kế hoạch, LSX bổ sung, thành phẩm đã nhập kho và dở dang còn lại.
- **Hoạch định:** Nhu cầu, phân bổ tồn kho, phân bổ dở dang, phần thiếu và lượng đã lập LSX bổ sung.
- **Giao hàng và ngoại lệ:** Lịch giao, lượng sẵn sàng, lượng đã giao từng đợt, thiếu/trễ và chênh lệch PGH–phân bổ–xuất kho.

Đây là nhóm thông tin cần theo dõi; mẫu báo cáo, chỉ tiêu tính toán cuối cùng và lịch cảnh báo sẽ được xác định ở bước đặc tả.

### 3.5 Phạm vi triển khai và các điểm cần chốt

Tận dụng chức năng FBO đã có, bổ sung hoặc điều chỉnh liên kết và quy tắc theo kết quả đối chiếu từng CN. Không mặc định cả 18 chức năng đều là phát triển mới. Báo giá ngày 10/03/2026 vẫn được theo dõi riêng: PGH công sở, điều chuyển kho khi lưu hoạch định, mở rộng LSX và quyền xem gia công. Không suy ra các yêu cầu cải tiến trong BRD này đều đã nằm trong báo giá đó.

| Điểm cần chốt khi đặc tả | Hướng xử lý ở bản khởi tạo |
|---|---|
| Thời điểm trừ/hoàn trả hạn mức PGH | Chưa mặc định trừ khi lưu, duyệt hay KH xác nhận; cần chọn một thời điểm thống nhất và quy tắc sửa/hủy. |
| PGH gọi vượt hạn mức còn lại | Cần chọn chặn nhập hoặc tách phần vượt sang bổ sung; chưa mặc định tự tách. |
| Công thức kế hoạch SX năm | Chưa mặc định bằng KH gọi hàng hoặc tự trừ tồn; thống nhất theo từng kênh. |
| LSX bổ sung trong báo cáo KH SX | Theo dõi riêng; cần chốt có đồng thời tính vào tổng thực hiện kế hoạch năm không. |
| Thứ tự và phạm vi phân bổ | Chốt kho/kênh được phép, ưu tiên PGH, ngày cần hàng và ngày dự kiến hoàn thành LSX; kế thừa quy tắc FBO phù hợp sau đối chiếu. |
| Xác nhận giao từng phần | Sơ đồ cho phép khi được duyệt; cần chốt người duyệt và điều kiện duyệt. |
| Chứng từ xuất giao cập nhật PGH | Xác định loại chứng từ FBO, cách gắn dòng PGH, thời điểm ghi nhận và xử lý giao trả/sửa/hủy. |
| Cảnh báo thiếu/trễ | Cần chốt ngày chuẩn, ngưỡng trễ, người nhận và cách ghi nhận xử lý. |
| Diễn giải vòng đời LSX trên sơ đồ | Board có đường LSX → Thành phẩm và LSX → Dở dang. Theo mô tả stakeholder, BRD hiểu là LSX theo dõi phần chưa hoàn thành và phần hoàn thành nhập kho; không tính trùng hai phần. Không tự sửa sơ đồ đã chốt. |

**Tài liệu đối chiếu:** `Danh_sach_tinh_nang_KHSX.md`, `Quy_trinh_nghiep_vu_Stakeholder.md`, cùng HSKS 2025, HDSD 2025, HDSD luồng duyệt công sở 2026 và báo giá bổ sung 10/03/2026 trong thư mục `input/`.
