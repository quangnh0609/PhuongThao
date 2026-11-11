# Quy tắc làm việc với tài liệu

## Thông tin dự án

- Source code của dự án được lưu tại `D:\Project\PhuongThao\FastBusinessOnline`.
- Bản đồ source code và hướng dẫn tra cứu: `docs/code-map/README.md`; chỉ mục sinh lại bằng `python tools/build_code_map.py`. Khi cần tra cứu source, ưu tiên chỉ mục này rồi kiểm tra tệp nguồn thực tế; chỉ mục không tự đồng bộ.

## Quy tắc tài liệu

- Chỉ đọc tài liệu trong các thư mục `input/`; không sửa tài liệu nguồn.
- Mặc định soạn và cập nhật Markdown trong `docs/`. Sơ đồ workflow và Business Function Diagram dùng khối Mermaid trong Markdown.
- Không tự động tạo hoặc cập nhật HTML. Chỉ xuất HTML vào `output/` khi người dùng yêu cầu xuất để gửi đi hoặc yêu cầu HTML rõ ràng.
- Khi người dùng yêu cầu “xuất” tài liệu mà không chỉ định định dạng, mặc định xuất HTML vào `output/` theo quy ước đã xác nhận; không hỏi lại định dạng.
- Không tạo PDF trừ khi người dùng yêu cầu rõ ràng.
- Với danh sách tính năng KHSX, dùng trạng thái `Nghiệm thu` cho tính năng đã phát triển và `Báo giá` cho hạng mục bổ sung theo quy ước người dùng. Phân biệt phạm vi nền tảng và phần mở rộng của cùng chức năng.
