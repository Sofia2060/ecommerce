# NutriGreen – Giao diện khách hàng (mục 4.4) và quản trị (mục 4.5)

Website TMĐT B2C bán thực phẩm dinh dưỡng **NutriGreen** – “Mua theo con số”.
HTML + CSS + JavaScript thuần, dữ liệu mẫu JSON + `localStorage`, mở bằng Live Server (cấu trúc theo repo Vinora).

## Cách mở
1. Mở thư mục `frontend` bằng VS Code, cài tiện ích **Live Server**.
2. Chuột phải `index.html` (gốc `frontend/`) → **Open with Live Server**. Trang tự chuyển tới `src/pages/client/index.html`.

> Phải mở thư mục `frontend` làm gốc server (trang dùng đường dẫn `../../../mock-data/`, `../../../public/`).
> Không bấm đúp mở file `.html` (`file://`): trình duyệt chặn đọc JSON, trang sẽ báo lỗi.
> Không cần Internet: font, ảnh, dữ liệu đều nằm trong thư mục.

## Thông tin dùng khi trình bày (không hiện trên website)
| Mục đích | Thông tin |
|---|---|
| Tài khoản khách có sẵn dữ liệu | `demo@nutrigreen.vn` / `NutriGreen@2026` – 3 đơn (đã giao còn hạn đổi trả, đang giao, đã giao quá hạn), 2 lần tính TDEE, 846 NutriCoins, nhắc đặt lại combo |
| Mã OTP khi đăng ký | `123456` (bản thật gửi SMS) |
| Mã giảm giá | `CHAOBAN10` (−10% đơn đầu, tối đa 50k) · `COMBO1111` (−15% combo, 01–20/11/2026) · `MINHFIT` (mã KOC −8%, đơn từ 150k) |
| Đưa dữ liệu về ban đầu | DevTools → Application → Local Storage → xóa các khóa `ng.*` rồi tải lại trang |

Kịch bản demo gợi ý (≈5 phút): Trang chủ → TDEE nhanh → “Thêm trọn gói” → Giỏ (mã `COMBO1111`, chọn TP.HCM thấy phí giao ngay) → Đặt hàng VietQR → trang QR + đếm ngược → đăng nhập demo → Đơn hàng: theo dõi vận chuyển, đánh giá kèm ảnh (+100 xu), gửi đổi trả → Ví ưu đãi đổi xu lấy voucher.

## Trang quản trị (sitemap 4.2)
Mở `admin.html` ở gốc `frontend/` (hoặc `src/pages/admin/login.html`). Đăng nhập: `admin@nutrigreen.vn` / `Admin@2026`.
Quản trị và cửa hàng dùng chung dữ liệu trong trình duyệt, nên mở 2 thẻ cạnh nhau để trình bày: khách đặt đơn → quản trị thấy ngay; quản trị đổi giá, nhập kho, trả lời → cửa hàng đổi theo.

| Trang | Nội dung | Sitemap 4.2 |
|---|---|---|
| `dashboard.html` Tổng quan | Việc cần làm hôm nay; doanh thu, số đơn, giá trị đơn, tỷ lệ đơn có combo (so với kỳ trước); doanh thu theo ngày; **nhận định nhanh viết bằng lời kèm việc nên làm**; TDEE → đơn combo; combo bán chạy; kênh mang đơn về; cảnh báo tồn kho | Bảng điều khiển: doanh thu và xu hướng, thống kê lượt tính TDEE, tỷ lệ bán combo, cảnh báo tồn kho |
| `orders.html` Đơn hàng | Lọc theo trạng thái, tìm kiếm; mỗi đơn một nút “việc tiếp theo” (đã nhận tiền → xác nhận & đóng gói → giao vận chuyển → đã giao); chi tiết đơn, phiếu soạn hàng theo lô, hủy đơn, hoàn tiền | Danh sách đơn, chi tiết đơn, trạng thái vận chuyển |
| `products.html` Sản phẩm & combo | Thêm / sửa / ẩn sản phẩm (tự kiểm tra kcal khớp protein–carb–béo, lệch ≤ 5%); cấu hình giá combo (kiểm tra rẻ hơn lẻ 8–12% và đủ ngưỡng freeship); thêm / sửa / ẩn danh mục | Danh mục, sản phẩm, cấu hình combo theo kcal |
| `inventory.html` Kho hàng | Theo sản phẩm (tồn, tốc độ bán 14 ngày, đủ bán bao lâu, gợi ý) và theo lô & hạn dùng (thứ tự xuất FEFO); nhập lô mới; điều chỉnh số lượng | Quản lý kho theo lô, theo hạn sử dụng |
| `customers.html` Khách hàng | Nhóm khách (thân thiết, đã mua lại, mua 1 lần, chưa mua), hồ sơ + gợi ý chăm sóc, tặng xu; hiệu quả từng mã giảm giá; NutriCoins và voucher | Danh sách, hồ sơ khách hàng, voucher và tích điểm |
| `care.html` Chăm sóc khách hàng | Đổi trả & khiếu nại (xem ảnh, xử lý, nhắn khách), thống kê lý do; đánh giá và phản hồi; câu hỏi liên hệ | Yêu cầu đổi trả / khiếu nại, đánh giá và phản hồi |

Lần đầu mở, website tự tạo dữ liệu mẫu 60 ngày (khoảng 160 đơn, 46 khách, 350 lượt tính TDEE, đánh giá, 3 yêu cầu đổi trả) để bảng điều khiển có số liệu. Các bản ghi mẫu có `duLieuMau: true`.
Khóa do quản trị ghi: `ng.qtSanPham` (sửa/ẩn), `ng.qtSanPhamMoi` (sản phẩm thêm mới), `ng.qtDanhMuc`, `ng.qtLo` (tồn kho theo lô), `ng.qtNhatKyKho`. Xác nhận đơn tự trừ kho ở lô có hạn dùng gần nhất; hủy đơn đã xác nhận thì cộng lại.

## Cấu trúc
```
frontend/
├── index.html                 chuyển hướng tới trang chủ
├── robots.txt, sitemap.xml    SEO (mục 3.4.4) – thay tên miền giữ chỗ nutrigreen.vn
├── public/
│   ├── fonts/                 Be Vietnam Pro tự lưu trữ (OFL)
│   └── images/{logo,products}/ ảnh WebP nền trong, bản 640px và -sm 320px; og-cover.jpg
├── mock-data/
│   ├── products.json          13 sản phẩm + 3 combo (giá, macro/100g, khẩu phần, lô, tồn)
│   ├── config.json            phí giao, freeship 299k, thanh toán, mã giảm giá, NutriCoins, đổi trả, TDEE
│   ├── categories.json        danh mục, mục tiêu, khoảng kcal
│   ├── provinces.json         34 tỉnh/thành sau sắp xếp 2025 + vùng tính phí GHTK
│   └── blog.json              6 bài “Góc dinh dưỡng”
└── src/
    ├── partials/              header.html, footer.html (nguồn chung)
    ├── pages/client/          17 trang khách (xem bảng dưới)
    ├── pages/admin/           7 trang quản trị
    ├── css/  base/ · components/ · pages/
    └── js/   core/common.js · components/blocks.js · pages/*.js
```
Đầu/chân trang được chép sẵn trong mọi trang. Sửa ở `src/partials/` rồi chạy `python scripts/build_pages.py` (ở gốc repo) để đồng bộ.
Kiểm tra số liệu dinh dưỡng và giá: `python scripts/check_data.py`.

## Trang ↔ sitemap 4.1 ↔ yêu cầu chức năng
| Sitemap 4.1 | Trang | FR / BRD | Điểm chính |
|---|---|---|---|
| Trang chủ | `index.html` | BRD01–03 | Rút gọn còn 5 khối: hero “mua theo con số”, chọn theo mục tiêu, 3 combo, 4 sản phẩm bán chạy, **TDEE nhanh → combo** (dải chiến dịch 11.11 tự ẩn khi hết hạn) |
| Danh sách SP – theo danh mục / mục tiêu / kcal | `products.html` | FR01 | Lọc loại, mục tiêu, **kcal/khẩu phần**, **protein ≥ 15g/100g**, **đường ≤ 5g/100g**, giá, còn hàng; đếm kết quả từng lựa chọn; xem số liệu theo khẩu phần/100g; **bảng so sánh**; sắp xếp theo kcal/protein/đường; URL chia sẻ được (giữ UTM) |
| Chi tiết sản phẩm | `product-detail.html?ma=` | FR03, BRD01, BRD07 | Bảng dinh dưỡng 100g / khẩu phần / cả gói + tỷ lệ năng lượng + **nguồn số liệu**; **% mục tiêu calo cá nhân**; mã lô, NSX, HSD; lưu ý dị ứng; combo: chọn bún/phở/nui, bảng thành phần, kcal/ngày, “vì sao combo không đủ X kcal”; đánh giá; JSON-LD Product |
| Công cụ tính TDEE | `tdee.html` | FR02, FR08, BRD02 | Mifflin-St Jeor, 5 mức vận động, 3 mục tiêu, sàn an toàn 1.200/1.500 kcal, BMI ngưỡng châu Á, macro gợi ý, **combo gợi ý + “Thêm trọn gói”**, gợi ý sản phẩm bổ sung, lưu lịch sử |
| Sản phẩm đã xem / yêu thích | `recently-viewed.html`, `wishlist.html` | – | So sánh nhanh, thêm tất cả vào giỏ |
| Giỏ hàng | `cart.html` | FR04, FR06 | **Tổng kcal, protein**, thanh freeship, mã giảm giá + gợi ý mã, **phí giao theo tỉnh ngay ở bước 1**, gợi ý nâng lên combo |
| Thanh toán | `checkout.html` | FR05, FR06, BRD03 | Đặt hàng **3 bước, không bắt buộc tài khoản**; AhaMove/GHTK theo khu vực; COD / VietQR / ví; tổng chi phí trước khi bấm; chống đặt trùng (token); nhắc đặt lại combo |
| Kết quả đặt hàng | `order-success.html` | FR05 | Mã QR (minh họa) có số tiền + nội dung = mã đơn, đếm ngược 24h, “Tôi đã chuyển khoản”, mời tạo tài khoản bằng SĐT vừa đặt |
| Đăng nhập (`account.html`) · Đăng ký (`account.html#dang-ky`, màn hình riêng), Hồ sơ | `account.html` | FR08, NFR03 | OTP khi đăng ký, mật khẩu băm SHA-256; hồ sơ, **biểu đồ lịch sử TDEE**, sổ địa chỉ, đổi mật khẩu, **nhắc đặt lại combo ngày 5–6** (FR16) |
| Ví ưu đãi / tích điểm | `rewards.html` | FR11 | Số dư, xu chờ tích lũy, đổi voucher, voucher của tôi, lịch sử |
| Đơn hàng của tôi → Chi tiết → Theo dõi vận chuyển / Đổi trả / Đánh giá | `orders.html` (`?ma=`) | FR09, FR10, FR11 | Tra cứu bằng mã + SĐT; trạng thái 4 bước; hành trình AhaMove/GHTK; hủy đơn có lý do; **đổi trả 7 ngày kèm ảnh/video**, tài khoản hoàn tiền; **đánh giá kèm ảnh nhận xu**; mua lại |
| Blog kiến thức dinh dưỡng | `blog.html`, `blog-post.html?bai=` | FR07, mục 3.4.4 | 3 cụm từ khóa, mỗi bài dẫn về SP/combo/TDEE, chia sẻ có UTM, JSON-LD Article |
| Trang liên hệ (FAQ) | `contact.html` | FR07, BRD05 | 4 kênh, 10 câu hỏi, form lưu `ng.lienHe` |
| Chính sách và hướng dẫn | `policy.html` | BRD06 | Mua hàng, giao hàng, thanh toán, đổi trả, NutriCoins, bảo mật, nguồn số liệu – số liệu đọc từ `config.json` |
| Chat trực tiếp (thành phần trong trang) | mọi trang | FR07 | Nút nổi Zalo OA / Messenger / hotline, trạng thái theo giờ hành chính |

Phi chức năng: mobile-first, ảnh WebP + `loading="lazy"`, font tự lưu trữ, mỗi trang có `title`/`description`/Open Graph, `sitemap.xml`, `robots.txt`; điều hướng bàn phím, `aria-*`, tôn trọng `prefers-reduced-motion`.

## Hợp đồng dữ liệu với giao diện quản trị (mục 4.5 – Đoàn)
Mọi dữ liệu nằm trong `localStorage` với tiền tố `ng.`. Trang quản trị cùng trình duyệt đọc/ghi các khóa này; giao diện khách tự cập nhật khi thẻ khác thay đổi (sự kiện `storage`).

| Khóa | Nội dung | Quản trị dùng cho (sitemap 4.2) |
|---|---|---|
| `ng.donHang` | Đơn: `ma, taoLuc, khachHang, hoTen, sdt, email, diaChi{tinh,phuong,chiTiet}, dong[], tamTinh, giam, maUuDai, phiGiao, tongTien, tongKcal, coCombo, tuTdee, vanChuyen{donVi,dichVu,maVanDon,hanhTrinh[{luc,noiDung}]}, thanhToan{phuongThuc,trangThai,hanThanhToan}, trangThai, lichSu[], nhacTaiMua, nguon{utm_*}` | Danh sách / chi tiết đơn, trạng thái vận chuyển, doanh thu, **tỷ lệ bán combo**, nguồn UTM |
| `ng.doiTra` | `ma, maDon, sanPham[], lyDo, moTa, anh[] (dataURL), video[], phuongAn, taiKhoanHoan, trangThai, phanHoi, lichSu[]` | Danh sách & xử lý khiếu nại |
| `ng.danhGia` | `id, maSp, maDon, khachHang, ten, sao, noiDung, anh[], luc, xu, phanHoi, an` | Đánh giá và phản hồi |
| `ng.tdeeLog` | Mọi lượt tính TDEE (cả khách vãng lai) | **Thống kê lượt tính TDEE** |
| `ng.suKien` | Sự kiện đo lường (`tdee_tinh`, `xem_combo_goi_y`, `them_gio`, `dat_hang`, `loc_san_pham`…) – cũng đẩy vào `window.dataLayer` cho GA4/Meta Pixel | Phễu chuyển đổi |
| `ng.khachHang`, `ng.phien` | Tài khoản (mật khẩu đã băm), phiên đăng nhập | Danh sách / hồ sơ khách |
| `ng.giaoDichXu`, `ng.voucher` | Giao dịch xu, voucher đổi từ xu | Voucher và tích điểm |
| `ng.lienHe`, `ng.dangKyEmail`, `ng.baoCoHang` | Câu hỏi liên hệ, email nhận mã, đăng ký báo có hàng | CRM, email marketing |
| `ng.qtSanPham` (quản trị **ghi**) | `{ "NG-HAT-01": { "gia": 159000, "ton": 0, "an": true } }` – ghi đè giá / tồn / ẩn | Thêm/sửa/ẩn sản phẩm, quản lý kho – áp dụng ngay ở cửa hàng |

Trạng thái đơn: `ChoXacNhan → DaXacNhan → DangGiao → DaGiao` (hoặc `DaHuy`); khi chuyển `DaGiao`, ghi một dòng `lichSu` với `trangThai: 'DaGiao'` – mốc này dùng để tính hạn đổi trả 7 ngày, tích xu và nhắc đặt lại combo.
Thanh toán: `ThuKhiNhan`, `ChuaThanhToan`, `ChoDoiSoat`, `DaThanhToan`, `ChoHoanTien`, `DaHoanTien`. Đổi trả: `DaTiepNhan`, `DangXuLy`, `DaGiaiQuyet`, `TuChoi`.

## Số liệu & quyết định đã chốt với nhóm
- **Giá** (Bảng 3.3 chưa có cột giá): khung 80.000–180.000đ; combo rẻ hơn mua lẻ ~10% và đều trên ngưỡng freeship 299.000đ.
- **Macro**: tham chiếu USDA FoodData Central, khớp kcal Bảng 3.3 (kcal cả gói = kcal/100g × khối lượng), sai lệch năng lượng tính lại ≤ 1%. Nhóm thay bằng số liệu nhà cung cấp khi có.
- **Combo theo mục tiêu**: Giảm cân → 1.200, Duy trì → 1.500, Tăng cơ → 1.800. Theo Bảng 3.3–3.4, combo cung cấp ≈ 859 / 934 / 1.136 kcal/ngày – website ghi rõ con số này thay vì để khách hiểu combo “đủ” 1.200 kcal.
- **Freeship** tính trên tiền hàng trước giảm giá (để combo vẫn được miễn phí giao khi dùng mã 11.11).
- **Ảnh**: 5 sản phẩm dùng ảnh trong slide concept; 8 sản phẩm còn lại (hạnh nhân, hạt điều, granola cacao, yến mạch, bánh hạt, biscotti, thanh hạt, phở) là ảnh dựng lại từ bao bì mẫu (`anhMinhHoa: true` trong `products.json`) – cần thay ảnh chụp thật.
- **Mã QR** ở trang kết quả là hình minh họa, không phải QR thanh toán thật. Hotline, email, số tài khoản, link mạng xã hội trong `config.json` là giá trị giữ chỗ.
