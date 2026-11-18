/* Đặt hàng 3 bước (FR05) – bước 2 & 3 trên một trang: thông tin giao hàng → phương thức giao (FR06, tính phí
   theo khu vực) → thanh toán COD / VietQR / ví điện tử. Không bắt buộc tài khoản; tổng chi phí hiện trước khi bấm đặt. */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, so, tien, anh } = NG;
  const d = await NG.duLieu.coBan(); const tinhDs = (await NG.duLieu.tinh()).tinh;
  const vung = $('[data-thanh-toan]');
  const luu = () => { try { return JSON.parse(sessionStorage.getItem('ng.thanhToan') || '{}'); } catch (e) { return {}; } };
  const ghi = (x) => { try { sessionStorage.setItem('ng.thanhToan', JSON.stringify(Object.assign(luu(), x))); } catch (e) { /* bỏ qua */ } };
  const u = NG.taiKhoan.hienTai();
  const dc0 = u && u.diaChi && u.diaChi.length ? (u.diaChi.find((x) => x.macDinh) || u.diaChi[0]) : null;
  const st = Object.assign({ hoTen: u ? u.hoTen : '', sdt: u ? u.sdt : '', email: u ? u.email : '', tinh: dc0 ? dc0.diaChi.tinh : '', phuong: dc0 ? dc0.diaChi.phuong : '', chiTiet: dc0 ? dc0.diaChi.chiTiet : '', ghiChu: '', dichVu: '', thanhToan: 'COD', maUuDai: '', nhacTaiMua: true, luuDiaChi: true }, luu());
  let token = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random();
  const kiemTraGio = await NG.gio.tinh();
  if (!kiemTraGio.dong.length) { vung.innerHTML = '<div class="empty">' + NG.IC.trong + '<h3>Giỏ hàng đang trống</h3><a class="btn btn--primary" href="products.html">Mua sắm ngay</a></div>'; return; }
  NG.track('bat_dau_thanh_toan', { tamTinh: kiemTraGio.tamTinh });

  const f = (k, label, type, opt = {}) => '<div class="field' + (opt.lop ? ' ' + opt.lop : '') + '"><label for="f-' + k + '">' + label + (opt.batBuoc === false ? ' <span class="muted xs">(không bắt buộc)</span>' : '') + '</label>' +
    (type === 'textarea' ? '<textarea class="textarea" id="f-' + k + '" name="' + k + '" rows="2" placeholder="' + (opt.ph || '') + '">' + esc(st[k]) + '</textarea>' : type === 'select' ? '<select class="select" id="f-' + k + '" name="' + k + '"' + (opt.auto ? ' autocomplete="' + opt.auto + '"' : '') + '>' + opt.html + '</select>' : '<input class="input" id="f-' + k + '" name="' + k + '" type="' + type + '" value="' + esc(st[k]) + '"' + (opt.auto ? ' autocomplete="' + opt.auto + '"' : '') + (opt.im ? ' inputmode="' + opt.im + '"' : '') + ' placeholder="' + (opt.ph || '') + '">') +
    (opt.hint ? '<span class="hint">' + opt.hint + '</span>' : '') + '<span class="err"></span></div>';

  vung.innerHTML = '<form class="co" data-form novalidate><div>' +
    (u ? '' : '<div class="alert alert--info mb-2"><span>Đã có tài khoản? <a href="account.html?tiep=checkout.html"><strong>Đăng nhập</strong></a> để điền nhanh và tích NutriCoins. Hoặc cứ đặt hàng – không bắt buộc tạo tài khoản.</span></div>') +
    '<section class="panel co-sec"><h2><span class="n">1</span>Thông tin nhận hàng</h2>' +
    (u && u.diaChi && u.diaChi.length > 1 ? '<div class="field"><label for="so-dc">Địa chỉ đã lưu</label><select class="select" id="so-dc" data-so-dc>' + u.diaChi.map((x, i) => '<option value="' + i + '">' + esc(x.hoTen + ' · ' + x.diaChi.chiTiet + ', ' + x.diaChi.phuong) + '</option>').join('') + '</select></div>' : '') +
    '<div class="form-row form-row--2">' + f('hoTen', 'Họ và tên', 'text', { auto: 'name', ph: 'Nguyễn Văn A' }) + f('sdt', 'Số điện thoại', 'tel', { auto: 'tel', im: 'tel', ph: '09xx xxx xxx', hint: 'Dùng để giao hàng và tra cứu đơn' }) + '</div>' +
    f('email', 'Email', 'email', { auto: 'email', ph: 'ban@email.com', batBuoc: false, hint: 'Nhận xác nhận đơn và nhắc đặt lại combo' }) +
    '<div class="form-row form-row--2">' + f('tinh', 'Tỉnh / Thành phố', 'select', { html: '<option value="">Chọn tỉnh/thành</option>' + tinhDs.map((t) => '<option' + (t.ten === st.tinh ? ' selected' : '') + '>' + esc(t.ten) + '</option>').join('') }) + f('phuong', 'Phường / Xã', 'text', { ph: 'Phường Bến Thành' }) + '</div>' +
    f('chiTiet', 'Số nhà, tên đường', 'text', { auto: 'street-address', ph: '12 Lê Lợi' }) +
    f('ghiChu', 'Ghi chú cho shipper', 'textarea', { batBuoc: false, ph: 'Giao giờ hành chính, gọi trước khi giao…' }) +
    (u ? '<label class="check"><input type="checkbox" name="luuDiaChi"' + (st.luuDiaChi ? ' checked' : '') + '> Lưu địa chỉ này vào tài khoản</label>' : '') +
    '</section>' +
    '<section class="panel co-sec"><h2><span class="n">2</span>Phương thức giao hàng</h2><div class="opt-stack" data-giao><p class="muted small">Chọn tỉnh/thành để xem phương thức và phí giao.</p></div></section>' +
    '<section class="panel co-sec"><h2><span class="n">3</span>Thanh toán</h2><div class="opt-stack">' +
    d.cauHinh.thanhToan.map((p) => '<label class="option-card"><input type="radio" name="thanhToan" value="' + p.ma + '"' + (st.thanhToan === p.ma ? ' checked' : '') + '><span><span class="t">' + esc(p.ten) + '</span><br><span class="d">' + esc(p.moTa) + '</span></span></label>').join('') +
    '</div><p class="secure"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>NutriGreen không thu thập số thẻ hay mã OTP. Đơn chuyển khoản/ví được giữ 24 giờ.</p></section>' +
    '</div><aside class="co__side"><div class="panel" data-tom-tat></div></aside></form>';

  const form = $('[data-form]');
  const lay = () => { ['hoTen', 'sdt', 'email', 'tinh', 'phuong', 'chiTiet', 'ghiChu'].forEach((k) => { st[k] = form[k].value; }); const t = form.querySelector('input[name="thanhToan"]:checked'); st.thanhToan = t ? t.value : 'COD'; const dv = form.querySelector('input[name="dichVu"]:checked'); st.dichVu = dv ? dv.value : ''; if (form.luuDiaChi) st.luuDiaChi = form.luuDiaChi.checked; const n = form.querySelector('[name="nhacTaiMua"]'); if (n) st.nhacTaiMua = n.checked; ghi(st); };

  async function veGiao() {
    const box = $('[data-giao]'); const lc = await NG.giaoHang.luaChon(st.tinh);
    if (!lc.length) { box.innerHTML = '<p class="muted small">Chọn tỉnh/thành để xem phương thức và phí giao.</p>'; return; }
    if (!lc.some((o) => o.ma === st.dichVu)) st.dichVu = lc[0].ma;
    const g = await NG.gio.tinh();
    box.innerHTML = lc.map((o) => '<label class="option-card"><input type="radio" name="dichVu" value="' + o.ma + '"' + (o.ma === st.dichVu ? ' checked' : '') + '><span><span class="t">' + esc(o.donVi) + ' · ' + esc(o.ten) + '</span><br><span class="d">' + esc(o.thoiGian) + '</span></span><span class="r">' + (g.duMienPhi ? '<span class="price-old">' + tien(o.phi) + '</span> Miễn phí' : tien(o.phi)) + '</span></label>').join('');
  }
  async function veTomTat() {
    const g = await NG.gio.tinh({ maUuDai: st.maUuDai, tinh: st.tinh, dichVu: st.dichVu, sdt: st.sdt });
    const box = $('[data-tom-tat]');
    box.innerHTML = '<div class="flex between center"><h2 class="mb-0">Đơn hàng (' + g.soLuong + ')</h2><a class="small" href="cart.html">Sửa giỏ</a></div>' +
      g.dong.map((x) => '<div class="mini-line"><span class="q"><img src="' + anh(x.sp.anh, true) + '" alt=""><i>' + x.soLuong + '</i></span><span>' + esc(x.sp.ten) + (x.chonSp ? '<br><span class="xs muted">' + esc(x.chonSp.ten) + '</span>' : '') + '</span><span class="p">' + tien(x.thanhTien) + '</span></div>').join('') +
      '<hr style="margin:12px 0"><div class="field"><label for="ma-tt">Mã giảm giá</label><div class="voucher"><input class="input" id="ma-tt" value="' + esc(st.maUuDai) + '" placeholder="Nhập mã"><button class="btn btn--sm" type="button" data-ap-ma>Áp dụng</button></div>' +
      (g.loiUuDai ? '<span class="err">' + esc(g.loiUuDai) + '</span>' : g.uuDai ? '<span class="hint" style="color:var(--ng-green)">✓ ' + esc(g.uuDai.moTa || g.uuDai.ten) + '</span>' : '') + '</div>' +
      '<div class="sum"><div class="sum__row"><span>Tạm tính</span><span>' + tien(g.tamTinh) + '</span></div>' +
      (g.giam ? '<div class="sum__row sum__row--disc"><span>Giảm giá (' + esc(g.uuDai.ma) + ')</span><span>−' + tien(g.giam) + '</span></div>' : '') +
      '<div class="sum__row"><span>Phí giao' + (g.dichVu ? ' (' + esc(g.dichVu.donVi) + ')' : '') + '</span><span>' + (g.phiGiao == null ? '<span class="muted">Chọn nơi giao</span>' : g.phiGiao ? tien(g.phiGiao) : 'Miễn phí') + '</span></div>' +
      '<div class="sum__row sum__row--total"><span>Tổng thanh toán</span><span>' + tien(g.tongTien) + '</span></div>' +
      '<div class="sum__row xs muted"><span>Năng lượng trong đơn</span><span>' + so(g.tongKcal) + ' kcal</span></div></div>' +
      (g.coCombo ? '<label class="check mt-2"><input type="checkbox" name="nhacTaiMua"' + (st.nhacTaiMua ? ' checked' : '') + '> Nhắc tôi đặt lại khi combo 7 ngày sắp hết (qua email/Zalo vào ngày thứ 6)</label>' : '') +
      (u ? '<p class="small mt-1 mb-0">Đơn này tích <strong>' + so(Math.floor((g.tamTinh - g.giam) / 1000)) + ' NutriCoins</strong> khi giao thành công.</p>' : '') +
      '<button class="btn btn--primary btn--lg btn--block mt-2" type="submit" data-dat' + (g.hetHang.length ? ' disabled' : '') + '>Đặt hàng · ' + tien(g.tongTien) + '</button>' +
      '<p class="xs muted mt-1 mb-0">Bấm “Đặt hàng” là bạn đồng ý với <a href="policy.html#doi-tra" target="_blank">chính sách đổi trả</a>, <a href="policy.html#giao-hang" target="_blank">giao hàng</a> và <a href="policy.html#bao-mat" target="_blank">bảo mật</a> của NutriGreen.</p>';
  }

  const loi = (k, msg) => { const el = form[k]; const fl = el.closest('.field'); fl.classList.toggle('is-invalid', !!msg); fl.querySelector('.err').textContent = msg || ''; return !msg; };
  const QUY_TAC = {
    hoTen: () => (st.hoTen.trim().length < 2 ? 'Vui lòng nhập họ tên người nhận.' : ''),
    sdt: () => (!NG.sdtHopLe(st.sdt) ? 'Số điện thoại gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09.' : ''),
    email: () => (st.email && !NG.emailHopLe(st.email) ? 'Email chưa đúng định dạng.' : ''),
    tinh: () => (!st.tinh ? 'Vui lòng chọn tỉnh/thành.' : ''),
    phuong: () => (st.phuong.trim().length < 2 ? 'Vui lòng nhập phường/xã.' : ''),
    chiTiet: () => (st.chiTiet.trim().length < 3 ? 'Vui lòng nhập số nhà, tên đường.' : '')
  };
  function kiem() {
    lay(); let ok = true;
    Object.keys(QUY_TAC).forEach((k) => { ok = loi(k, QUY_TAC[k]()) && ok; });
    if (!ok) { const x = form.querySelector('.is-invalid input, .is-invalid select'); x && x.focus(); }
    return ok;
  }

  form.addEventListener('change', async (e) => {
    if (e.target.matches('[data-so-dc]')) { const x = u.diaChi[+e.target.value]; Object.assign(st, { hoTen: x.hoTen, sdt: x.sdt, tinh: x.diaChi.tinh, phuong: x.diaChi.phuong, chiTiet: x.diaChi.chiTiet }); ['hoTen', 'sdt', 'phuong', 'chiTiet'].forEach((k) => { form[k].value = st[k]; }); form.tinh.value = st.tinh; }
    lay();
    if (e.target.name === 'tinh' || e.target.matches('[data-so-dc]')) { st.dichVu = ''; await veGiao(); lay(); }
    if (['tinh', 'dichVu', 'sdt'].includes(e.target.name) || e.target.matches('[data-so-dc]')) veTomTat();
  });
  // kiểm tra lại từng ô khi rời ô (không chuyển con trỏ đi chỗ khác)
  form.addEventListener('blur', (e) => { const k = e.target.name; if (QUY_TAC[k] && e.target.closest('.field.is-invalid')) { lay(); loi(k, QUY_TAC[k]()); } }, true);
  form.addEventListener('click', (e) => { if (e.target.closest('[data-ap-ma]')) { st.maUuDai = $('#ma-tt').value.trim().toUpperCase(); ghi({ maUuDai: st.maUuDai }); veTomTat(); } });
  form.addEventListener('keydown', (e) => { if (e.target.id === 'ma-tt' && e.key === 'Enter') { e.preventDefault(); form.querySelector('[data-ap-ma]').click(); } });
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); if (!kiem()) { NG.ui.toast('Vui lòng kiểm tra lại thông tin nhận hàng.', 'error'); return; }
    if (!st.dichVu) { NG.ui.toast('Vui lòng chọn phương thức giao hàng.', 'error'); return; }
    const nut = form.querySelector('[data-dat]'); nut.disabled = true; nut.textContent = 'Đang đặt hàng…';
    try {
      const don = await NG.donHang.tao({ hoTen: st.hoTen, sdt: st.sdt, email: st.email, diaChi: { tinh: st.tinh, phuong: st.phuong.trim(), chiTiet: st.chiTiet.trim() }, ghiChu: st.ghiChu.trim(), dichVu: st.dichVu, thanhToan: st.thanhToan, maUuDai: st.maUuDai, nhacTaiMua: st.nhacTaiMua, luuDiaChi: st.luuDiaChi, token });
      try { sessionStorage.removeItem('ng.thanhToan'); } catch (er) { /* bỏ qua */ }
      location.href = 'order-success.html?ma=' + encodeURIComponent(don.ma);
    } catch (er) { NG.ui.toast(er.message, 'error'); nut.disabled = false; veTomTat(); token = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()); }
  });

  await veGiao(); lay(); veTomTat();
})();
