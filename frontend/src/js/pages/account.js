/* Tài khoản (sitemap 4.1 – Tài khoản): đăng nhập / đăng ký có OTP (NFR03), hồ sơ, mục tiêu & lịch sử TDEE (FR08),
   sổ địa chỉ, đổi mật khẩu, nhắc đặt lại combo (FR16). */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, so, tien, anh } = NG;
  const d = await NG.duLieu.coBan(); await NG.sanSang;
  const vung = $('[data-tai-khoan]');
  const tiep = (() => { const t = NG.qs('tiep'); return t && /^[a-z0-9-]+\.html(\?[^#]*)?$/i.test(t) ? t : null; })();
  const p = new URLSearchParams(location.search);

  /* ---------------- chưa đăng nhập ---------------- */
  function veDangNhap() {
    document.title = 'Đăng nhập / Đăng ký | NutriGreen';
    vung.innerHTML = '<div class="auth auth--one">' +
      '<section class="card" data-view="dang-nhap" aria-labelledby="h-dn"><h2 id="h-dn">Đăng nhập</h2><form data-dn novalidate>' +
      '<div class="field"><label for="dn-id">Email hoặc số điện thoại</label><input class="input" id="dn-id" name="id" autocomplete="username" required><span class="err"></span></div>' +
      '<div class="field"><div class="label-row"><label for="dn-mk">Mật khẩu</label><a class="label-link" href="#quen-mat-khau" data-sang-quen>Quên mật khẩu?</a></div><div class="pw"><input class="input" id="dn-mk" name="mk" type="password" autocomplete="current-password" required><button type="button" data-hien-mk>Hiện</button></div><span class="err"></span></div>' +
      '<p class="err small" data-loi></p><button class="btn btn--primary btn--block" type="submit">Đăng nhập</button>' +
      '</form><p class="auth__switch">Chưa có tài khoản? <a href="#dang-ky">Tạo tài khoản mới</a></p></section>' +
      // ---- Quên mật khẩu: 3 bước trên cùng một màn hình, không rời trang
      '<section class="card" data-view="quen-mk" hidden aria-labelledby="h-qm"><a class="auth__back" href="#dang-nhap">← Quay lại đăng nhập</a><h2 id="h-qm">Đặt lại mật khẩu</h2>' +
      '<ol class="steps steps--auth" data-qm-buoc><li class="is-current"><span>Tài khoản</span></li><li><span>Mã OTP</span></li><li><span>Mật khẩu mới</span></li></ol>' +
      '<form data-qm1 novalidate><p class="small muted">Nhập email hoặc số điện thoại bạn đã dùng để đăng ký. Chúng tôi sẽ gửi mã xác minh tới số điện thoại của tài khoản.</p>' +
      '<div class="field"><label for="qm-id">Email hoặc số điện thoại</label><input class="input" id="qm-id" name="id" autocomplete="username" required><span class="err"></span></div>' +
      '<button class="btn btn--primary btn--block" type="submit">Gửi mã xác minh</button></form>' +
      '<form data-qm2 novalidate hidden><p class="small">Mã OTP gồm 6 số đã được gửi tới <strong data-qm-sdt></strong>. Mã có hiệu lực 5 phút.</p>' +
      '<div class="field"><label for="qm-otp">Mã OTP</label><input class="input input--otp" id="qm-otp" name="otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code"><span class="err"></span></div>' +
      '<button class="btn btn--primary btn--block" type="submit">Xác minh</button><div class="flex between center mt-1 wrap gap-1"><button class="link-btn small" type="button" data-qm-gui-lai disabled>Gửi lại mã (60s)</button><button class="link-btn small" type="button" data-qm-doi>Dùng tài khoản khác</button></div></form>' +
      '<form data-qm3 novalidate hidden><p class="small muted">Tạo mật khẩu mới cho <strong data-qm-ten></strong>.</p>' +
      '<div class="field"><label for="qm-mk">Mật khẩu mới</label><div class="pw"><input class="input" id="qm-mk" name="mk" type="password" autocomplete="new-password" data-do-manh><button type="button" data-hien-mk>Hiện</button></div><div class="pw-meter" aria-hidden="true"><span></span></div><span class="hint" data-pw-hint>Tối thiểu 8 ký tự, có chữ và số</span><span class="err"></span></div>' +
      '<div class="field"><label for="qm-lai">Nhập lại mật khẩu mới</label><div class="pw"><input class="input" id="qm-lai" name="lai" type="password" autocomplete="new-password"><button type="button" data-hien-mk>Hiện</button></div><span class="err"></span></div>' +
      '<button class="btn btn--primary btn--block" type="submit">Đặt lại &amp; đăng nhập</button></form></section>' +
      '<section class="card" data-view="dang-ky" hidden aria-labelledby="h-dk"><h2 id="h-dk">Tạo tài khoản</h2><ul class="auth__perks"><li>Lưu lịch sử TDEE, xem % mục tiêu trên mọi sản phẩm</li><li>Tích NutriCoins mỗi đơn, đổi voucher</li><li>Nhắc đặt lại combo khi sắp hết</li><li>Đơn đã đặt bằng SĐT này tự gắn vào tài khoản</li></ul><form data-dk novalidate>' +
      '<div class="field"><label for="dk-ten">Họ và tên</label><input class="input" id="dk-ten" name="hoTen" autocomplete="name" value="' + esc(p.get('ten') || '') + '"><span class="err"></span></div>' +
      '<div class="form-row form-row--2"><div class="field"><label for="dk-sdt">Số điện thoại</label><input class="input" id="dk-sdt" name="sdt" type="tel" inputmode="tel" autocomplete="tel" value="' + esc(p.get('sdt') || '') + '"><span class="err"></span></div>' +
      '<div class="field"><label for="dk-email">Email</label><input class="input" id="dk-email" name="email" type="email" autocomplete="email" value="' + esc(p.get('email') || '') + '"><span class="err"></span></div></div>' +
      '<div class="field"><label for="dk-mk">Mật khẩu</label><div class="pw"><input class="input" id="dk-mk" name="mk" type="password" autocomplete="new-password" data-do-manh><button type="button" data-hien-mk>Hiện</button></div><div class="pw-meter" aria-hidden="true"><span></span></div><span class="hint" data-pw-hint>Tối thiểu 8 ký tự, có chữ và số</span><span class="err"></span></div>' +
      '<label class="check mb-2"><input type="checkbox" name="nhanEmail" checked> Nhận email ưu đãi và bài viết dinh dưỡng</label>' +
      '<button class="btn btn--primary btn--block" type="submit">Gửi mã OTP &amp; tạo tài khoản</button><p class="xs muted mt-1 mb-0">Mật khẩu được mã hóa trước khi lưu. Xem <a href="policy.html#bao-mat">chính sách bảo mật</a>.</p></form><p class="auth__switch">Đã có tài khoản? <a href="#dang-nhap">Đăng nhập</a></p></section></div>';
    // mỗi lúc chỉ hiện một màn hình: đăng nhập (mặc định) hoặc tạo tài khoản (#dang-ky)
    const chuyen = () => {
      const view = location.hash === '#dang-ky' ? 'dang-ky' : location.hash === '#quen-mat-khau' ? 'quen-mk' : 'dang-nhap';
      $$('[data-view]', vung).forEach((s) => { s.hidden = s.dataset.view !== view; });
      document.title = ({ 'dang-ky': 'Tạo tài khoản', 'quen-mk': 'Quên mật khẩu', 'dang-nhap': 'Đăng nhập' })[view] + ' | NutriGreen';
      const o = $(({ 'dang-ky': '#dk-ten', 'quen-mk': '#qm-id', 'dang-nhap': '#dn-id' })[view]); if (o && innerWidth >= 1024) o.focus();
    };
    // mang email/SĐT khách đã gõ ở form đăng nhập sang form quên mật khẩu
    $('[data-sang-quen]', vung).addEventListener('click', () => { const v = $('#dn-id').value.trim(); if (v) $('#qm-id').value = v; });
    window.addEventListener('hashchange', chuyen); chuyen();
    const loi = (form, k, m) => { const fl = form[k].closest('.field'); fl.classList.toggle('is-invalid', !!m); fl.querySelector('.err').textContent = m || ''; return !m; };
    vung.addEventListener('click', (e) => { const b = e.target.closest('[data-hien-mk]'); if (b) { const i = b.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; b.textContent = i.type === 'password' ? 'Hiện' : 'Ẩn'; } });
    $('[data-dn]').addEventListener('submit', async (e) => {
      e.preventDefault(); const f = e.target; let ok = loi(f, 'id', f.id.value.trim() ? '' : 'Vui lòng nhập email hoặc SĐT.'); ok = loi(f, 'mk', f.mk.value ? '' : 'Vui lòng nhập mật khẩu.') && ok; if (!ok) return;
      try { await NG.taiKhoan.dangNhap(f.id.value, f.mk.value); NG.track('dang_nhap', {}); NG.ui.toast('Đăng nhập thành công'); setTimeout(() => { if (tiep) location.href = tiep; else location.replace('account.html'); }, 400); }
      catch (er) { f.querySelector('[data-loi]').textContent = er.message; }
    });
    // ---- độ mạnh mật khẩu (đăng ký + đặt lại)
    vung.addEventListener('input', (e) => {
      const i = e.target.closest('[data-do-manh]'); if (!i) return;
      const v = i.value; let d = 0; if (v.length >= 8) d++; if (/[A-Za-z]/.test(v) && /\d/.test(v)) d++; if (v.length >= 12) d++; if (/[^A-Za-z0-9]/.test(v) || (/[a-z]/.test(v) && /[A-Z]/.test(v))) d++;
      const fl = i.closest('.field'); fl.querySelector('.pw-meter').dataset.muc = v ? d : '';
      fl.querySelector('[data-pw-hint]').textContent = !v ? 'Tối thiểu 8 ký tự, có chữ và số' : ['Quá ngắn – cần ít nhất 8 ký tự', 'Yếu – thêm cả chữ và số', 'Tạm được', 'Khá mạnh', 'Rất mạnh'][d];
    });

    // ---- quên mật khẩu: bước 1 tìm tài khoản → bước 2 OTP → bước 3 mật khẩu mới
    const qm = { u: null, otpOk: '', hen: null };
    const qmBuoc = (n) => {
      ['[data-qm1]', '[data-qm2]', '[data-qm3]'].forEach((sel, i) => { $(sel, vung).hidden = i !== n - 1; });
      $$('[data-qm-buoc] li', vung).forEach((li, i) => { li.classList.toggle('is-done', i < n - 1); li.classList.toggle('is-current', i === n - 1); });
      const o = $(['#qm-id', '#qm-otp', '#qm-mk'][n - 1]); if (o) setTimeout(() => o.focus(), 30);
    };
    const demNguoc = () => {
      const b = $('[data-qm-gui-lai]', vung); let s = 60; clearInterval(qm.hen); b.disabled = true; b.textContent = 'Gửi lại mã (60s)';
      qm.hen = setInterval(() => { s--; b.textContent = s > 0 ? 'Gửi lại mã (' + s + 's)' : 'Gửi lại mã'; b.disabled = s > 0; if (s <= 0) clearInterval(qm.hen); }, 1000);
    };
    $('[data-qm1]', vung).addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target; const v = f.id.value.trim();
      if (!v) return loi(f, 'id', 'Vui lòng nhập email hoặc số điện thoại.');
      if (!NG.emailHopLe(v) && !NG.sdtHopLe(v)) return loi(f, 'id', 'Email hoặc số điện thoại chưa đúng định dạng.');
      const u = NG.taiKhoan.timTaiKhoan(v);
      if (!u) return loi(f, 'id', 'Không tìm thấy tài khoản với thông tin này. Kiểm tra lại hoặc tạo tài khoản mới.');
      loi(f, 'id', ''); qm.u = u; NG.taiKhoan.guiOtp(u.sdt); NG.track('quen_mat_khau_gui_otp', {});
      $('[data-qm-sdt]', vung).textContent = u.sdt.replace(/^(\d{3})\d{4}(\d{3})$/, '$1****$2');
      $('[data-qm-ten]', vung).textContent = u.email;
      $('#qm-otp').value = ''; qmBuoc(2); demNguoc(); NG.ui.toast('Đã gửi mã OTP tới số điện thoại của bạn');
    });
    $('[data-qm-gui-lai]', vung).addEventListener('click', () => { if (!qm.u) return; NG.taiKhoan.guiOtp(qm.u.sdt); demNguoc(); NG.ui.toast('Đã gửi lại mã OTP'); });
    $('[data-qm-doi]', vung).addEventListener('click', () => { clearInterval(qm.hen); qm.u = null; qmBuoc(1); });
    $('#qm-otp').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6); if (e.target.value.length === 6) $('[data-qm2]', vung).requestSubmit(); });
    $('[data-qm2]', vung).addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target;
      if (!qm.u) return qmBuoc(1);
      if (!NG.taiKhoan.kiemOtp(qm.u.sdt, f.otp.value)) return loi(f, 'otp', 'Mã OTP không đúng hoặc đã hết hạn.');
      loi(f, 'otp', ''); qm.otpOk = f.otp.value; clearInterval(qm.hen); qmBuoc(3);
    });
    $('[data-qm3]', vung).addEventListener('submit', async (e) => {
      e.preventDefault(); const f = e.target; let ok = true;
      ok = loi(f, 'mk', NG.taiKhoan.matKhauHopLe(f.mk.value) ? '' : 'Mật khẩu tối thiểu 8 ký tự, có chữ và số.') && ok;
      ok = loi(f, 'lai', f.lai.value && f.lai.value === f.mk.value ? '' : 'Mật khẩu nhập lại không khớp.') && ok;
      if (!ok) return;
      try {
        await NG.taiKhoan.datLaiMatKhau(qm.u.email, qm.otpOk, f.mk.value);
        NG.ui.toast('Đã đặt lại mật khẩu. Bạn đã được đăng nhập.');
        setTimeout(() => { if (tiep) location.href = tiep; else location.replace('account.html'); }, 600);
      } catch (er) { if (/OTP/.test(er.message)) { qmBuoc(2); loi($('[data-qm2]', vung), 'otp', er.message); } else loi(f, 'mk', er.message); }
    });

    $('[data-dk]').addEventListener('submit', async (e) => {
      e.preventDefault(); const f = e.target; let ok = true;
      ok = loi(f, 'hoTen', f.hoTen.value.trim().length < 2 ? 'Vui lòng nhập họ tên.' : '') && ok;
      ok = loi(f, 'sdt', NG.sdtHopLe(f.sdt.value) ? '' : 'Số điện thoại chưa đúng.') && ok;
      ok = loi(f, 'email', NG.emailHopLe(f.email.value) ? '' : 'Email chưa đúng định dạng.') && ok;
      ok = loi(f, 'mk', NG.taiKhoan.matKhauHopLe(f.mk.value) ? '' : 'Mật khẩu tối thiểu 8 ký tự, có chữ và số.') && ok;
      if (!ok) return;
      const ds = NG.taiKhoan.ds();
      if (ds.some((x) => x.email === f.email.value.trim().toLowerCase())) return loi(f, 'email', 'Email đã được đăng ký. Hãy đăng nhập.');
      if (ds.some((x) => x.sdt === NG.chuanSdt(f.sdt.value))) return loi(f, 'sdt', 'Số điện thoại đã được đăng ký.');
      NG.taiKhoan.guiOtp(f.sdt.value);
      const sdtAn = NG.chuanSdt(f.sdt.value).replace(/^(\d{3})\d{4}(\d{3})$/, '$1****$2');
      const m = NG.ui.modal('<h2>Xác minh số điện thoại</h2><p class="small">Mã OTP gồm 6 số đã được gửi tới <strong>' + sdtAn + '</strong>. Mã có hiệu lực 5 phút.</p><form data-otp novalidate><div class="field"><label for="otp">Mã OTP</label><input class="input" id="otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" style="letter-spacing:.4em;font-size:1.3rem;text-align:center"><span class="err"></span></div><button class="btn btn--primary btn--block" type="submit">Xác minh &amp; tạo tài khoản</button><button class="link-btn small mt-1" type="button" data-gui-lai disabled>Gửi lại mã (60s)</button></form>', { nhan: 'Nhập OTP' });
      let s = 60; const gl = m.querySelector('[data-gui-lai]'); const t = setInterval(() => { s--; gl.textContent = s > 0 ? 'Gửi lại mã (' + s + 's)' : 'Gửi lại mã'; gl.disabled = s > 0; if (s <= 0) clearInterval(t); }, 1000);
      gl.addEventListener('click', () => { NG.taiKhoan.guiOtp(f.sdt.value); NG.ui.toast('Đã gửi lại mã OTP'); s = 60; gl.disabled = true; });
      m.querySelector('[data-otp]').addEventListener('submit', async (ev) => {
        ev.preventDefault(); const ip = m.querySelector('#otp');
        if (!NG.taiKhoan.kiemOtp(f.sdt.value, ip.value)) { ip.closest('.field').classList.add('is-invalid'); ip.closest('.field').querySelector('.err').textContent = 'Mã OTP không đúng hoặc đã hết hạn.'; return; }
        try { await NG.taiKhoan.dangKy({ hoTen: f.hoTen.value, email: f.email.value, sdt: f.sdt.value, matKhau: f.mk.value, nhanEmail: f.nhanEmail.checked }); clearInterval(t); m.dong(); NG.ui.toast('Chào mừng bạn đến với NutriGreen!'); setTimeout(() => { if (tiep) location.href = tiep; else location.replace('account.html'); }, 400); }
        catch (er) { NG.ui.toast(er.message, 'error'); }
      });
    });
  }

  /* ---------------- đã đăng nhập ---------------- */
  function bieuDo(ls) {
    const ds = ls.slice().reverse(); if (ds.length < 2) return '<p class="small muted">Tính TDEE thêm ít nhất 1 lần nữa để xem biểu đồ thay đổi.</p>';
    const W = 640, H = 220, L = 46, R = 46, T = 16, B = 30;
    const k = ds.map((x) => x.mucTieuKcal), n = ds.map((x) => x.nang);
    const kmin = Math.min(...k) - 100, kmax = Math.max(...k) + 100, nmin = Math.min(...n) - 2, nmax = Math.max(...n) + 2;
    const X = (i) => L + i * (W - L - R) / (ds.length - 1);
    const Yk = (v) => T + (1 - (v - kmin) / (kmax - kmin)) * (H - T - B); const Yn = (v) => T + (1 - (v - nmin) / (nmax - nmin)) * (H - T - B);
    const path = (arr, Y) => arr.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
    return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Biểu đồ mục tiêu kcal và cân nặng theo thời gian">' +
      [0, .5, 1].map((t) => '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + (T + t * (H - T - B)) + '" y2="' + (T + t * (H - T - B)) + '" stroke="#e3e9d3"/>').join('') +
      '<path d="' + path(k, Yk) + '" fill="none" stroke="#215725" stroke-width="2.5"/><path d="' + path(n, Yn) + '" fill="none" stroke="#d9a520" stroke-width="2.5" stroke-dasharray="5 4"/>' +
      ds.map((x, i) => '<circle cx="' + X(i) + '" cy="' + Yk(x.mucTieuKcal) + '" r="4" fill="#215725"/><circle cx="' + X(i) + '" cy="' + Yn(x.nang) + '" r="3.5" fill="#d9a520"/><text x="' + X(i) + '" y="' + (H - 8) + '" text-anchor="middle">' + NG.ngay(x.luc).slice(0, 5) + '</text>').join('') +
      '<text x="4" y="' + (T + 4) + '">' + so(kmax) + '</text><text x="4" y="' + (H - B) + '">' + so(kmin) + '</text><text x="' + (W - 40) + '" y="' + (T + 4) + '">' + so(nmax, 1) + 'kg</text><text x="' + (W - 40) + '" y="' + (H - B) + '">' + so(nmin, 1) + 'kg</text></svg>' +
      '<div class="macro-legend"><span><i style="background:#215725"></i>Mục tiêu kcal/ngày</span><span><i style="background:#d9a520"></i>Cân nặng (kg)</span></div>';
  }

  function veTaiKhoan(u) {
    document.title = 'Tài khoản của tôi | NutriGreen';
    const don = NG.donHang.cuaToi(); const dangGiao = don.filter((x) => ['ChoXacNhan', 'DaXacNhan', 'DangGiao'].includes(x.trangThai)).length;
    const xu = NG.xu.soDu(u.id); const ls = NG.tdee.lichSu(); const nhac = NG.donHang.canNhac();
    const tenNgan = u.hoTen.trim().split(/\s+/).slice(-1)[0];
    vung.innerHTML = '<div class="acc"><nav class="acc__nav" aria-label="Mục tài khoản"><div class="acc__user"><span class="avatar">' + esc(tenNgan[0]) + '</span><div><strong>' + esc(u.hoTen) + '</strong><div class="xs" style="color:var(--ng-lime-soft)">' + esc(u.email) + '</div></div></div>' +
      '<a href="#ho-so" class="is-active">Hồ sơ cá nhân</a><a href="#tdee">Mục tiêu &amp; lịch sử TDEE</a><a href="#dia-chi">Sổ địa chỉ</a><a href="orders.html">Đơn hàng của tôi</a><a href="rewards.html">Ví ưu đãi &amp; NutriCoins</a><a href="wishlist.html">Yêu thích</a><a href="#mat-khau">Đổi mật khẩu</a><button type="button" data-dang-xuat>Đăng xuất</button></nav>' +
      '<div><h1 style="font-size:var(--ng-fs-2xl)">Xin chào, ' + esc(tenNgan) + '!</h1>' +
      (nhac.length ? nhac.map((o) => { const c = o.dong.find((x) => x.loai === 'combo'); return '<div class="remind mb-2"><img src="' + anh(c.anh, true) + '" alt=""><div><strong>' + esc(c.ten) + ' của bạn sắp hết</strong><div class="small">Combo 7 ngày giao ngày ' + NG.ngay(NG.donHang.giaoLuc(o)) + '. Đặt lại hôm nay để không bị gián đoạn.</div></div><button class="btn btn--primary" type="button" data-dat-lai="' + o.ma + '">Đặt lại combo</button></div>'; }).join('') : '') +
      '<div class="stats mb-2"><a class="stat" href="#tdee"><b>' + (u.mucTieuKcal ? so(u.mucTieuKcal) : '—') + '</b><span>Mục tiêu kcal/ngày</span></a><a class="stat" href="orders.html"><b>' + dangGiao + '</b><span>Đơn đang xử lý</span></a><a class="stat" href="orders.html"><b>' + don.length + '</b><span>Tổng đơn hàng</span></a><a class="stat" href="rewards.html"><b>' + so(xu) + '</b><span>NutriCoins</span></a></div>' +

      '<section class="panel" id="ho-so"><h2>Hồ sơ cá nhân</h2><form data-ho-so novalidate><div class="form-row form-row--2">' +
      '<div class="field"><label for="hs-ten">Họ và tên</label><input class="input" id="hs-ten" name="hoTen" value="' + esc(u.hoTen) + '"><span class="err"></span></div>' +
      '<div class="field"><label for="hs-ns">Ngày sinh</label><input class="input" id="hs-ns" name="ngaySinh" type="date" value="' + esc(u.ngaySinh || '') + '"></div>' +
      '<div class="field"><label for="hs-email">Email</label><input class="input" id="hs-email" value="' + esc(u.email) + '" disabled><span class="hint">Liên hệ CSKH để đổi email</span></div>' +
      '<div class="field"><label for="hs-sdt">Số điện thoại</label><input class="input" id="hs-sdt" value="' + esc(u.sdt) + '" disabled><span class="hint">Dùng làm mã khách hàng, tra cứu đơn</span></div></div>' +
      '<label class="check mb-2"><input type="checkbox" name="nhanEmail"' + (u.nhanEmail ? ' checked' : '') + '> Nhận email ưu đãi, nhắc đặt lại combo và bài viết dinh dưỡng</label><button class="btn btn--primary" type="submit">Lưu thay đổi</button></form></section>' +

      '<section class="panel" id="tdee"><div class="flex between center wrap gap-1"><h2 class="mb-0">Mục tiêu &amp; lịch sử TDEE</h2><a class="btn btn--sm btn--primary" href="tdee.html">Tính lại TDEE</a></div>' +
      (ls.length ? '<p class="small mt-1">Mục tiêu hiện tại: <strong>' + so(ls[0].mucTieuKcal) + ' kcal/ngày</strong> (' + esc(ls[0].tenMucTieu) + '). Combo gợi ý: <a href="' + NG.url('chiTiet', { ma: ls[0].comboGoiY, nguon: 'tdee' }) + '">' + esc((d.theoMa[ls[0].comboGoiY] || {}).ten || '') + '</a></p>' + bieuDo(ls) +
        '<div class="table-wrap mt-2"><table class="table"><thead><tr><th>Ngày</th><th class="r">Cân nặng</th><th class="r">BMI</th><th class="r">TDEE</th><th class="r">Mục tiêu</th><th>Mục tiêu</th></tr></thead><tbody>' +
        ls.map((x) => '<tr><td>' + NG.ngay(x.luc) + '</td><td class="r">' + so(x.nang, 1) + ' kg</td><td class="r">' + so(x.bmi, 1) + '</td><td class="r">' + so(x.tdee) + '</td><td class="r"><strong>' + so(x.mucTieuKcal) + '</strong></td><td>' + esc(x.tenMucTieu) + '</td></tr>').join('') + '</tbody></table></div>'
        : '<div class="empty"><p>Bạn chưa tính TDEE. Tính ngay để mọi trang sản phẩm hiện % mục tiêu calo của bạn.</p><a class="btn btn--primary" href="tdee.html">Tính TDEE</a></div>') + '</section>' +

      '<section class="panel" id="dia-chi"><div class="flex between center"><h2 class="mb-0">Sổ địa chỉ</h2><button class="btn btn--sm" type="button" data-them-dc>+ Thêm địa chỉ</button></div><div data-ds-dc class="mt-1"></div></section>' +
      '<section class="panel" id="mat-khau"><h2>Đổi mật khẩu</h2><form data-doi-mk novalidate><div class="form-row form-row--3"><div class="field"><label for="mk-cu">Mật khẩu hiện tại</label><input class="input" id="mk-cu" name="cu" type="password" autocomplete="current-password"></div><div class="field"><label for="mk-moi">Mật khẩu mới</label><input class="input" id="mk-moi" name="moi" type="password" autocomplete="new-password"></div><div class="field"><label for="mk-lai">Nhập lại</label><input class="input" id="mk-lai" name="lai" type="password" autocomplete="new-password"></div></div><p class="err small" data-loi></p><button class="btn" type="submit">Đổi mật khẩu</button></form></section>' +
      '</div></div>';
    veDiaChi();
    // đánh dấu mục đang xem
    const links = $$('.acc__nav a[href^="#"]');
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
    $$('section[id]', vung).forEach((s) => io.observe(s));
    if (location.hash && $(location.hash)) setTimeout(() => $(location.hash).scrollIntoView(), 60);
  }

  function veDiaChi() {
    const u = NG.taiKhoan.hienTai(); const ds = u.diaChi || []; const box = $('[data-ds-dc]');
    box.innerHTML = ds.length ? ds.map((x, i) => '<div class="addr"><div><strong>' + esc(x.hoTen) + '</strong> · ' + esc(x.sdt) + (x.macDinh ? ' <span class="badge badge--green">Mặc định</span>' : '') + '<br>' + esc(x.diaChi.chiTiet + ', ' + x.diaChi.phuong + ', ' + x.diaChi.tinh) + '</div><div class="flex gap-1" style="flex:none">' + (x.macDinh ? '' : '<button class="link-btn small" type="button" data-mac-dinh="' + i + '">Đặt mặc định</button>') + '<button class="link-btn small" type="button" data-xoa-dc="' + i + '">Xóa</button></div></div>').join('') : '<p class="small muted">Chưa có địa chỉ. Địa chỉ sẽ được lưu khi bạn đặt hàng.</p>';
  }
  async function moThemDiaChi() {
    const u = NG.taiKhoan.hienTai(); const tinh = (await NG.duLieu.tinh()).tinh;
    const m = NG.ui.modal('<h2>Thêm địa chỉ</h2><form data-f-dc novalidate><div class="form-row form-row--2"><div class="field"><label for="a-ten">Người nhận</label><input class="input" id="a-ten" name="hoTen" value="' + esc(u.hoTen) + '"></div><div class="field"><label for="a-sdt">SĐT</label><input class="input" id="a-sdt" name="sdt" type="tel" value="' + esc(u.sdt) + '"></div></div>' +
      '<div class="field"><label for="a-tinh">Tỉnh/Thành</label><select class="select" id="a-tinh" name="tinh"><option value="">Chọn</option>' + tinh.map((t) => '<option>' + esc(t.ten) + '</option>').join('') + '</select></div><div class="field"><label for="a-ph">Phường/Xã</label><input class="input" id="a-ph" name="phuong"></div><div class="field"><label for="a-ct">Số nhà, đường</label><input class="input" id="a-ct" name="chiTiet"></div><p class="err small" data-loi></p>' +
      '<div class="modal__actions"><button class="btn" type="button" data-dong>Hủy</button><button class="btn btn--primary" type="submit">Lưu</button></div></form>', { nhan: 'Thêm địa chỉ' });
    m.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target;
      if (f.hoTen.value.trim().length < 2 || !NG.sdtHopLe(f.sdt.value) || !f.tinh.value || f.phuong.value.trim().length < 2 || f.chiTiet.value.trim().length < 3) { f.querySelector('[data-loi]').textContent = 'Vui lòng điền đủ và đúng thông tin.'; return; }
      const ds = (u.diaChi || []).slice(); ds.push({ hoTen: f.hoTen.value.trim(), sdt: NG.chuanSdt(f.sdt.value), diaChi: { tinh: f.tinh.value, phuong: f.phuong.value.trim(), chiTiet: f.chiTiet.value.trim() }, macDinh: !ds.length });
      NG.taiKhoan.capNhat({ diaChi: ds.slice(0, 5) }); m.dong(); veDiaChi(); NG.ui.toast('Đã lưu địa chỉ');
    });
  }

  vung.addEventListener('click', async (e) => {
    const u = NG.taiKhoan.hienTai(); if (!u) return;
    if (e.target.closest('[data-them-dc]')) return moThemDiaChi();
    const md = e.target.closest('[data-mac-dinh]'); if (md) { const ds = u.diaChi.map((x, i) => Object.assign({}, x, { macDinh: i === +md.dataset.macDinh })); NG.taiKhoan.capNhat({ diaChi: ds }); return veDiaChi(); }
    const xd = e.target.closest('[data-xoa-dc]'); if (xd) { const ds = u.diaChi.filter((x, i) => i !== +xd.dataset.xoaDc); if (ds.length && !ds.some((x) => x.macDinh)) ds[0].macDinh = true; NG.taiKhoan.capNhat({ diaChi: ds }); return veDiaChi(); }
    const dl = e.target.closest('[data-dat-lai]'); if (dl) { const n = await NG.donHang.datLai(dl.dataset.datLai); if (n) location.href = 'cart.html'; }
  });
  vung.addEventListener('submit', async (e) => {
    if (e.target.matches('[data-ho-so]')) {
      e.preventDefault(); const f = e.target; if (f.hoTen.value.trim().length < 2) { f.hoTen.closest('.field').classList.add('is-invalid'); f.hoTen.closest('.field').querySelector('.err').textContent = 'Vui lòng nhập họ tên.'; return; }
      NG.taiKhoan.capNhat({ hoTen: f.hoTen.value.trim(), ngaySinh: f.ngaySinh.value, nhanEmail: f.nhanEmail.checked }); NG.ui.toast('Đã lưu hồ sơ');
    }
    if (e.target.matches('[data-doi-mk]')) {
      e.preventDefault(); const f = e.target; const l = f.querySelector('[data-loi]');
      if (f.moi.value !== f.lai.value) { l.textContent = 'Mật khẩu nhập lại không khớp.'; return; }
      try { await NG.taiKhoan.doiMatKhau(f.cu.value, f.moi.value); f.reset(); l.textContent = ''; NG.ui.toast('Đã đổi mật khẩu'); } catch (er) { l.textContent = er.message; }
    }
  });

  const u = NG.taiKhoan.hienTai();
  if (u) veTaiKhoan(u); else veDangNhap();
})();
