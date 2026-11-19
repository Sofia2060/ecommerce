# NutriGreen – Website TMĐT thực phẩm dinh dưỡng

Đồ án môn Thương mại điện tử – Nhóm 4. Thư mục này chứa **giao diện khách hàng (mục 4.4)** và **giao diện quản trị (mục 4.5)**.

- `frontend/` – website (HTML, CSS, JavaScript thuần, mở bằng Live Server). Hướng dẫn chi tiết, bảng đối chiếu sitemap ↔ FR và hợp đồng dữ liệu cho trang quản trị: [frontend/README.md](frontend/README.md)
- `scripts/build_pages.py` – đồng bộ đầu/chân trang từ `frontend/src/partials/` vào mọi trang
- `scripts/check_data.py` – kiểm tra số liệu dinh dưỡng (kcal ↔ macro, khớp Bảng 3.3), khung giá và combo
- `scripts/gen_products.py` – sinh lại `mock-data/products.json` (chạy ở gốc repo)
- `scripts/sync_from_sql.py` – đối chiếu `products.json` với `database/nutrigreen_data.sql` và bổ sung lưu ý dị ứng, số tự công bố ATTP, ảnh phụ, ngày lên kệ. Chạy sau `gen_products.py`:
  `python scripts/gen_products.py && python scripts/sync_from_sql.py database/nutrigreen_data.sql && python scripts/check_data.py`
- `database/nutrigreen_data.sql` – dữ liệu CSDL của nhóm (20 sản phẩm, 3 combo, khách, đơn, đánh giá…)
