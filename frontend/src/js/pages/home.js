/* Trang chủ: chiến dịch 11.11, TDEE nhanh, combo, sản phẩm nổi bật, nhãn mẫu, blog, đăng ký email */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, so, tien } = NG;
  const d = await NG.duLieu.coBan();

  // số liệu thẻ nổi trên hero lấy thẳng từ dữ liệu
  const g = d.theoMa['NG-GRA-01'];
  const chip = $('[data-hero-chip]');
  if (chip && g) { chip.querySelector('[data-v="kcal"]').textContent = so(g.kp.kcal); chip.querySelector('[data-v="pro"]').textContent = so(g.kp.protein, 1); chip.querySelector('[data-v="duong"]').textContent = so(g.kp.duong, 1); }

  // banner chiến dịch đang chạy (đọc mã ưu đãi chỉ áp dụng combo trong config)
  const hom = new Date().toISOString().slice(0, 10);
  const cd = d.cauHinh.maUuDai.find((m) => m.chiCombo && m.tu <= hom && hom <= m.den);
  if (cd) {
    const box = $('[data-campaign]');
    box.innerHTML = '<div class="campaign"><span><strong>' + esc(cd.moTa) + '</strong> · đến ' + NG.ngay(cd.den) + '</span><span class="campaign__code">Mã <b>' + esc(cd.ma) + '</b> <button class="btn btn--sm btn--lime" type="button" data-copy="' + esc(cd.ma) + '">Sao chép</button></span></div>';
    box.hidden = false;
  }

  // combo theo calo
  const goiY = NG.tdee.ganNhat();
  $('[data-combo-list]').innerHTML = d.combo.map((c) => NG.ui.theCombo(c, { gon: true, noiBat: goiY ? goiY.comboGoiY === c.ma : c.mucTieuKcal === 1500, nhanNoiBat: goiY ? 'Hợp mục tiêu của bạn' : 'Được chọn nhiều' })).join('');

  // sản phẩm nổi bật
  $('[data-noi-bat]').innerHTML = d.sanPham.filter((s) => s.noiBat).concat(d.sanPham.filter((s) => !s.noiBat && s.conHang)).slice(0, 4).map((s) => NG.ui.the(s, d)).join('');



  // TDEE nhanh
  const f = $('[data-tdee-nhanh]'); let gt = 'nu';
  f.querySelectorAll('[data-gt]').forEach((b) => b.addEventListener('click', () => { gt = b.dataset.gt; f.querySelectorAll('[data-gt]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
  f.addEventListener('submit', async (e) => {
    e.preventDefault(); const err = f.querySelector('[data-err]'); err.textContent = '';
    const tuoi = +f.tuoi.value, cao = +f.cao.value, nang = +f.nang.value;
    if (!(tuoi >= 18 && tuoi <= 80) || !(cao >= 130 && cao <= 220) || !(nang >= 35 && nang <= 200)) { err.textContent = 'Vui lòng nhập tuổi 18–80, chiều cao 130–220 cm, cân nặng 35–200 kg.'; return; }
    const kq = await NG.tdee.tinh({ gioiTinh: gt, tuoi, cao, nang, vanDong: 1.375, mucTieu: f.mucTieu.value });
    NG.tdee.luu(kq);
    const c = d.theoMa[kq.comboGoiY];
    NG.track('xem_combo_goi_y', { combo: c.ma, vitri: 'trang-chu' });
    const box = f.querySelector('[data-kq]');
    box.innerHTML = '<div class="kq-big"><div><b>' + so(kq.tdee) + '</b><span>TDEE (kcal/ngày, vận động nhẹ)</span></div><div><b>' + so(kq.mucTieuKcal) + '</b><span>Mục tiêu ' + esc(kq.tenMucTieu.toLowerCase()) + '</span></div></div>' +
      '<div class="kq-combo"><img src="' + NG.anh(c.anh, true) + '" alt=""><div><span class="xs muted">Gợi ý cho bạn</span><div class="t">' + esc(c.ten) + '</div><span class="small">≈' + so(c.kcalNgay) + ' kcal/ngày · ' + tien(c.gia) + '</span></div></div>' +
      '<div class="flex gap-1 mt-1"><a class="btn btn--sm" href="tdee.html?tuoi=' + tuoi + '&cao=' + cao + '&nang=' + nang + '&gt=' + gt + '&mt=' + kq.mucTieu + '">Xem chi tiết</a><button class="btn btn--primary btn--sm" type="button" data-them-gio="' + c.ma + '" data-nguon="tdee">Thêm trọn gói</button></div>';
    box.hidden = false;
  });

  $$('[data-track]').forEach((a) => a.addEventListener('click', () => NG.track('click_' + a.dataset.track, {})));
})();
