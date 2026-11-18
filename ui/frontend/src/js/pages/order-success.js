/* Kết quả đặt hàng: mã đơn, mã QR chuyển khoản/ví có sẵn số tiền + nội dung = mã đơn, hạn 24 giờ,
   "Tôi đã chuyển khoản" (chờ đối soát), bước tiếp theo, mời tạo tài khoản bằng SĐT vừa đặt. */
(async function () {
  'use strict';
  const NG = window.NG; const { $, esc, so, tien, anh } = NG;
  const d = await NG.duLieu.coBan();
  const vung = $('[data-ket-qua]');
  const ma = NG.qs('ma'); const don0 = ma && NG.donHang.xem(ma);
  if (!don0) { vung.innerHTML = '<div class="empty"><h3>Không tìm thấy đơn hàng</h3><p>Bạn có thể tra cứu đơn bằng mã đơn và số điện thoại.</p><a class="btn btn--primary" href="orders.html">Tra cứu đơn hàng</a></div>'; return; }
  const u = NG.taiKhoan.hienTai();
  const nh = d.cauHinh.nganHangNhan;

  function ve() {
    const don = NG.donHang.xem(ma);
    const tt = don.thanhToan; const truocTuyen = tt.phuongThuc !== 'COD';
    const ptTen = d.cauHinh.thanhToan.find((p) => p.ma === tt.phuongThuc).ten;
    let pay = '';
    if (truocTuyen && tt.trangThai === 'ChuaThanhToan' && don.trangThai !== 'DaHuy') {
      pay = '<section class="panel"><h2>' + (tt.phuongThuc === 'VIETQR' ? 'Quét mã VietQR để chuyển khoản' : 'Quét mã bằng ứng dụng MoMo / ZaloPay') + '</h2><div class="pay-box"><div class="qr">' + NG.ui.qr(don.ma + '|' + don.tongTien) + '<p class="qr__note">Mã QR minh họa trong bản demo</p></div>' +
        '<div><dl>' + (tt.phuongThuc === 'VIETQR' ? '<dt>Ngân hàng</dt><dd>' + esc(nh.nganHang) + '</dd><dt>Số tài khoản</dt><dd>' + esc(nh.soTaiKhoan) + '</dd><dt>Chủ tài khoản</dt><dd>' + esc(nh.chuTaiKhoan) + '</dd>' : '') +
        '<dt>Số tiền</dt><dd>' + tien(don.tongTien) + '</dd><dt>Nội dung</dt><dd>' + esc(don.ma) + ' <button class="btn btn--sm btn--ghost" type="button" data-copy="' + esc(don.ma) + '">Sao chép</button></dd><dt>Hạn thanh toán</dt><dd><span class="countdown" data-dem-nguoc></span></dd></dl>' +
        '<p class="small muted mt-2">Mã QR đã có sẵn số tiền và nội dung là mã đơn để NutriGreen đối soát. Quá 24 giờ chưa nhận được tiền, đơn sẽ tự hủy.</p>' +
        '<button class="btn btn--primary" type="button" data-da-ck>Tôi đã chuyển khoản</button></div></div></section>';
    } else if (tt.trangThai === 'ChoDoiSoat') {
      pay = '<div class="alert alert--info"><span><strong>Đã ghi nhận báo chuyển khoản.</strong> NutriGreen sẽ đối soát theo mã đơn ' + esc(don.ma) + ' và xác nhận trong giờ hành chính.</span></div>';
    } else if (tt.phuongThuc === 'COD') {
      pay = '<div class="alert"><span>Bạn thanh toán <strong>' + tien(don.tongTien) + '</strong> bằng tiền mặt khi nhận hàng. Hãy kiểm tra hàng trước khi trả tiền.</span></div>';
    }
    const coXu = Math.floor((don.tamTinh - don.giam) / 1000);
    vung.innerHTML = '<div class="ok-hero"><div class="ok-hero__ico">✓</div><h1 style="font-size:var(--ng-fs-2xl)">Cảm ơn ' + esc(don.hoTen.split(' ').slice(-1)[0]) + ', đơn hàng đã được đặt!</h1>' +
      '<p class="ok-code">Mã đơn: ' + esc(don.ma) + ' <button class="btn btn--sm btn--ghost" type="button" data-copy="' + esc(don.ma) + '">Sao chép</button></p>' +
      '<p class="muted">Xác nhận đơn sẽ được gửi qua ' + (don.email ? 'email ' + esc(don.email) + ' và ' : '') + 'SĐT ' + esc(don.sdt) + '.</p></div>' +
      '<div class="co"><div>' + pay +
      '<section class="panel"><h2>Tiếp theo là gì?</h2><ol class="timeline"><li><span class="t">Đặt hàng thành công</span><br><span class="d">' + NG.gioNgay(don.taoLuc) + '</span></li>' +
      '<li><span class="t">NutriGreen xác nhận và đóng gói</span><br><span class="d">Trong giờ hành chính; hạt, granola đóng túi zip kèm gói hút ẩm, bánh trong hộp cứng chống vỡ</span></li>' +
      '<li><span class="t">Giao hàng qua ' + esc(don.vanChuyen.donVi) + '</span><br><span class="d">' + esc(don.vanChuyen.tenDichVu) + ' · ' + esc(don.vanChuyen.thoiGian) + '</span></li>' +
      '<li><span class="t">Nhận hàng, đánh giá nhận NutriCoins</span><br><span class="d">Có vấn đề? Gửi yêu cầu đổi trả trong 7 ngày ngay trong đơn</span></li></ol>' +
      '<div class="flex gap-1 wrap"><a class="btn btn--primary" href="orders.html?ma=' + encodeURIComponent(don.ma) + '">Theo dõi đơn hàng</a><a class="btn" href="products.html">Tiếp tục mua sắm</a></div></section>' +
      (u ? '' : '<section class="panel card--cream"><h2>Lưu đơn và nhận ' + so(coXu) + ' NutriCoins</h2><p class="small">Tạo tài khoản bằng số <strong>' + esc(don.sdt) + '</strong>: đơn này tự gắn vào tài khoản, bạn được tích xu khi giao thành công, lưu lịch sử TDEE và nhắc đặt lại combo.</p><a class="btn btn--primary" href="account.html?sdt=' + encodeURIComponent(don.sdt) + (don.email ? '&email=' + encodeURIComponent(don.email) : '') + '&ten=' + encodeURIComponent(don.hoTen) + '#dang-ky">Tạo tài khoản trong 1 phút</a></section>') +
      '</div><aside class="co__side"><div class="panel"><h2>Tóm tắt</h2>' +
      don.dong.map((x) => '<div class="mini-line"><span class="q"><img src="' + anh(x.anh, true) + '" alt=""><i>' + x.soLuong + '</i></span><span>' + esc(x.ten) + (x.tenChon ? '<br><span class="xs muted">' + esc(x.tenChon) + '</span>' : '') + '</span><span class="p">' + tien(x.donGia * x.soLuong) + '</span></div>').join('') +
      '<hr style="margin:12px 0"><div class="sum"><div class="sum__row"><span>Tạm tính</span><span>' + tien(don.tamTinh) + '</span></div>' + (don.giam ? '<div class="sum__row sum__row--disc"><span>Giảm (' + esc(don.maUuDai) + ')</span><span>−' + tien(don.giam) + '</span></div>' : '') +
      '<div class="sum__row"><span>Phí giao</span><span>' + (don.phiGiao ? tien(don.phiGiao) : 'Miễn phí') + '</span></div><div class="sum__row sum__row--total"><span>Tổng</span><span>' + tien(don.tongTien) + '</span></div>' +
      '<div class="sum__row xs muted"><span>Thanh toán</span><span>' + esc(ptTen) + '</span></div><div class="sum__row xs muted"><span>Giao đến</span><span style="text-align:right">' + esc(don.diaChi.chiTiet + ', ' + don.diaChi.phuong + ', ' + don.diaChi.tinh) + '</span></div></div></div></aside></div>';
    demNguoc(don);
  }
  let hen;
  function demNguoc(don) {
    clearInterval(hen); const el = $('[data-dem-nguoc]'); if (!el || !don.thanhToan.hanThanhToan) return;
    const chay = () => { const con = new Date(don.thanhToan.hanThanhToan) - Date.now(); if (con <= 0) { el.textContent = 'Đã hết hạn'; clearInterval(hen); return; } const h = Math.floor(con / 3600e3), m = Math.floor(con % 3600e3 / 60e3), s = Math.floor(con % 60e3 / 1e3); el.textContent = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'); };
    chay(); hen = setInterval(chay, 1000);
  }
  vung.addEventListener('click', (e) => { if (e.target.closest('[data-da-ck]')) { NG.donHang.baoDaChuyenKhoan(ma); NG.track('bao_chuyen_khoan', { ma }); ve(); } });
  window.addEventListener('ng:doi', (e) => { if (e.detail.khoa === 'donHang' && e.detail.tuTheKhac) ve(); });
  ve();
})();
