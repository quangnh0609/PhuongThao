# Tài liệu dự án Phương Thảo (FAST Business Online)

## Cấu trúc

Mỗi nghiệp vụ phát sinh là một thư mục ở gốc repo, đặt tên `NN.Ten_nghiep_vu_K` (NN = số thứ tự nghiệp vụ, K = lần phát sinh), ví dụ `01.Ket_noi_website_1`, `02.Cai_tien_KHSX_1`.

```
NN.Ten_nghiep_vu_K/
  input/    Tài liệu nguồn người dùng copy vào (báo giá, HDSD, HSKS, ảnh luồng...). Chỉ đọc, không sửa.
  docs/     Bản Markdown do Claude soạn (BRD, SRS, tóm tắt giải pháp...). Nguồn để xuất HTML.
  output/   HTML xuất từ docs/ (docs/X.md -> output/X.html). Không sửa tay.
_mau/       Khung thư mục rỗng để copy khi tạo nghiệp vụ mới.
tools/      Script xuất HTML (node_modules bị gitignore; khôi phục bằng `npm install` trong tools/).
```

## Cách vận hành

1. Người dùng copy tài liệu vào `<nghiệp vụ>/input/` rồi ra yêu cầu.
2. Claude đọc `input/`, soạn/cập nhật Markdown trong `<nghiệp vụ>/docs/`. Sơ đồ dùng khối ```` ```mermaid ````.
3. Xuất HTML: `node tools/export-html.cjs <thư mục nghiệp vụ>` (hoặc đường dẫn 1 file .md; không tham số = xuất tất cả).
4. Chỉ xuất HTML, không tạo PDF.

Tạo nghiệp vụ mới: copy `_mau/` thành `NN.Ten_nghiep_vu_K/` (số tiếp theo). Mỗi nghiệp vụ độc lập; chỉ tham chiếu chéo khi người dùng yêu cầu.
