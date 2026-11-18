/* Liên hệ & FAQ (sitemap 4.1 – Trang liên hệ (FAQ)); kênh tư vấn Zalo OA / Messenger / hotline (FR07, BRD05).
   Câu hỏi gửi qua form lưu vào ng.lienHe để bộ phận CSKH (trang quản trị) xử lý. */
(async function () {
  'use strict';
  const NG = window.NG; const { $, esc, tien } = NG;
  const d = await NG.duLieu.coBan(); const th = d.cauHinh.thuongHieu; const k = d.cauHinh.kenh; const g = d.cauHinh.giaoHang;
  $('[data-kenh-lien-he]').innerHTML =
    '<a class="channel" href="' + esc(k.zalo) + '" target="_blank" rel="noopener"><span class="ic" style="background:#0068ff">' + NG.IC.zalo + '</span><strong>Zalo OA</strong><span>Gửi ảnh nhãn, hỏi combo</span></a>' +
    '<a class="channel" href="' + esc(k.messenger) + '" target="_blank" rel="noopener"><span class="ic" style="background:#7b4dff">' + NG.IC.mess + '</span><strong>Messenger</strong><span>Fanpage NutriGreen</span></a>' +
    '<a class="channel" href="tel:' + esc(th.hotline.replace(/\s/g, '')) + '"><span class="ic" style="background:#215725">' + NG.IC.dt + '</span><strong>Hotline ' + esc(th.hotline) + '</strong><span>' + esc(th.gioLamViec) + '</span></a>' +
    '<a class="channel" href="mailto:' + esc(th.email) + '"><span class="ic" style="background:#c76b12">@</span><strong>' + esc(th.email) + '</strong><span>Phản hồi trong ngày làm việc</span></a>';
  const FAQ = [
    ['Mua hàng & giao hàng', [
      ['Tôi có phải tạo tài khoản để đặt hàng không?', 'Không. Bạn đặt hàng trong 3 bước chỉ với tên, số điện thoại và địa chỉ. Tạo tài khoản sau bằng chính số điện thoại đó thì đơn tự gắn vào tài khoản và được tích NutriCoins.'],
      ['Phí giao hàng và thời gian giao?', 'Nội thành TP.HCM: AhaMove giao trong ngày với đơn xác nhận trước 16:00 (' + tien(g.hcm[0].phi) + ') hoặc GHTK 1–2 ngày (' + tien(g.hcm[1].phi) + '). Tỉnh khác: GHTK 2–5 ngày, ' + tien(g.tinhKhac.phi.nam) + ' – ' + tien(g.tinhKhac.phi.bac) + '. <strong>Miễn phí giao cho đơn từ ' + tien(g.mienPhiTu) + '</strong> (tính trên tiền hàng trước giảm giá).'],
      ['Có những cách thanh toán nào?', 'COD (trả tiền mặt khi nhận), chuyển khoản qua mã VietQR có sẵn số tiền và mã đơn, hoặc ví MoMo/ZaloPay. NutriGreen không thu thập số thẻ hay mã OTP.']]],
    ['Combo & số liệu dinh dưỡng', [
      ['Combo 1.200 / 1.500 / 1.800 kcal nghĩa là gì?', 'Đó là mức năng lượng mỗi ngày mà combo được thiết kế cho. Combo lo bữa sáng, bữa phụ và phần tinh bột của bữa chính trong 7 ngày, cung cấp khoảng 860 – 1.140 kcal/ngày; phần còn lại nên đến từ rau và đạm tươi. Trang mỗi combo ghi rõ con số này.'],
      ['Số liệu dinh dưỡng lấy từ đâu?', 'Từ nhãn và hồ sơ của nhà cung cấp, đối chiếu cơ sở dữ liệu USDA FoodData Central; năng lượng được kiểm tra lại theo hệ số 4 – 4 – 9. Nguồn ghi ở cuối bảng dinh dưỡng của từng sản phẩm. <a href="policy.html#nguon-so-lieu">Xem chi tiết</a>.'],
      ['Công cụ TDEE có chính xác không?', 'TDEE là ước tính theo công thức Mifflin-St Jeor và mức vận động bạn chọn. Theo dõi cân nặng 2–3 tuần rồi tính lại là cách điều chỉnh tốt nhất. Công cụ không dành cho người dưới 18 tuổi, phụ nữ mang thai/cho con bú hay người có bệnh nền.'],
      ['Sản phẩm có chứa chất gây dị ứng không?', 'Có. Phần lớn sản phẩm chứa các loại hạt cây (hạnh nhân, điều, óc chó); thanh hạt có đậu phộng; biscotti, bánh quy có bột mì (gluten), trứng, bơ (sữa). Trang sản phẩm có dòng “Lưu ý dị ứng” – vui lòng đọc kỹ thành phần.']]],
    ['Đổi trả & tài khoản', [
      ['Tôi được đổi trả trong trường hợp nào?', 'Trong 7 ngày từ khi nhận hàng nếu bánh vỡ, hạt/granola ôi dầu hoặc mất giòn, bao bì rách hở, giao sai/thiếu, hàng gần hết hạn. Gửi yêu cầu kèm ảnh ngay trong <a href="orders.html">chi tiết đơn hàng</a>; NutriGreen đổi mới hoặc hoàn tiền.'],
      ['Làm sao theo dõi đơn hàng?', 'Vào <a href="orders.html">Tra cứu đơn hàng</a>, nhập mã đơn và số điện thoại. Đơn có mã vận đơn sẽ hiện hành trình từ AhaMove/GHTK.'],
      ['NutriCoins dùng thế nào?', 'Mỗi 1.000đ tiền hàng = 1 xu khi đơn giao thành công; đánh giá +50 xu, kèm ảnh +100 xu. Đổi xu lấy voucher trong <a href="rewards.html">Ví ưu đãi</a>.']]]
  ];
  $('[data-faq]').innerHTML = FAQ.map(([nhom, ds]) => '<p class="faq-group">' + esc(nhom) + '</p>' + ds.map(([q, a]) => '<details><summary>' + esc(q) + '</summary><div class="a">' + a + '</div></details>').join('')).join('');
  const f = $('[data-lien-he]');
  const loi = (key, m) => { const fl = f[key].closest('.field'); fl.classList.toggle('is-invalid', !!m); fl.querySelector('.err').textContent = m || ''; return !m; };
  const u = NG.taiKhoan.hienTai(); if (u) { f.hoTen.value = u.hoTen; f.sdt.value = u.sdt; f.email.value = u.email; }
  f.addEventListener('submit', (e) => {
    e.preventDefault(); let ok = loi('hoTen', f.hoTen.value.trim().length < 2 ? 'Vui lòng nhập họ tên.' : '');
    ok = loi('sdt', NG.sdtHopLe(f.sdt.value) ? '' : 'Số điện thoại chưa đúng.') && ok;
    ok = loi('email', f.email.value && !NG.emailHopLe(f.email.value) ? 'Email chưa đúng.' : '') && ok;
    ok = loi('noiDung', f.noiDung.value.trim().length < 10 ? 'Nội dung tối thiểu 10 ký tự.' : '') && ok;
    if (!ok) return;
    const ds = NG.kho.doc('lienHe', []); const ma = 'LH' + Date.now().toString(36).toUpperCase();
    ds.push({ ma, hoTen: f.hoTen.value.trim(), sdt: NG.chuanSdt(f.sdt.value), email: f.email.value.trim(), chuDe: f.chuDe.value, noiDung: f.noiDung.value.trim(), luc: new Date().toISOString(), trangThai: 'Moi', khachHang: u ? u.id : null });
    NG.kho.ghi('lienHe', ds); NG.track('gui_lien_he', { chuDe: f.chuDe.value });
    f.innerHTML = '<div class="alert"><span><strong>Đã nhận câu hỏi ' + esc(ma) + '.</strong> NutriGreen sẽ gọi hoặc nhắn Zalo cho bạn ' + esc(th.camKetPhanHoi.toLowerCase()) + '.</span></div>';
  });
})();
