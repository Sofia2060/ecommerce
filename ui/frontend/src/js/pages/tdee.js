/* Công cụ TDEE: tính BMR/TDEE/BMI, mục tiêu kcal, protein; gợi ý combo + "thêm trọn gói vào giỏ" (FR02);
   lưu lịch sử vào hồ sơ nếu đăng nhập (FR08); ghi mọi lượt tính cho dashboard (sitemap 4.2). */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, so, tien } = NG;
  const d = await NG.duLieu.coBan(); const cf = d.cauHinh.tdee;
  const f = $('[data-form-tdee]'); const out = $('[data-ket-qua]');
  let gt = 'nu';

  $('[data-van-dong]').innerHTML = cf.heSoVanDong.map((v, i) => '<label class="option-card"><input type="radio" name="vanDong" value="' + v.ma + '"' + (i === 1 ? ' checked' : '') + '><span><span class="t">' + esc(v.ten) + '</span><br><span class="d">' + esc(v.moTa) + '</span></span><span class="r xs muted">× ' + v.ma.replace('.', ',') + '</span></label>').join('');
  $('[data-muc-tieu]').innerHTML = cf.mucTieu.map((m, i) => '<label class="option-card"><input type="radio" name="mucTieu" value="' + m.ma + '"' + (i === 1 ? ' checked' : '') + '><span class="t">' + esc(m.ten) + '</span><span class="d">' + (m.dieuChinh ? (m.dieuChinh > 0 ? '+' : '−') + so(Math.abs(m.dieuChinh)) + ' kcal' : 'Giữ nguyên TDEE') + '</span></label>').join('');
  const datGt = (v) => { gt = v; $$('[data-gt]', f).forEach((b) => { const on = b.dataset.gt === v; b.setAttribute('aria-pressed', on); b.setAttribute('aria-checked', on); }); };
  $$('[data-gt]', f).forEach((b) => b.addEventListener('click', () => datGt(b.dataset.gt)));

  // điền sẵn: tham số URL (từ trang chủ) > lần tính gần nhất
  const p = new URLSearchParams(location.search); const truoc = NG.tdee.ganNhat();
  const nap = (k, v) => { if (v != null && v !== '') f[k].value = v; };
  if (p.get('tuoi')) { nap('tuoi', p.get('tuoi')); nap('cao', p.get('cao')); nap('nang', p.get('nang')); datGt(p.get('gt') === 'nam' ? 'nam' : 'nu'); const mt = f.querySelector('input[name="mucTieu"][value="' + p.get('mt') + '"]'); if (mt) mt.checked = true; }
  else if (truoc) { nap('tuoi', truoc.tuoi); nap('cao', truoc.cao); nap('nang', truoc.nang); datGt(truoc.gioiTinh); const v = f.querySelector('input[name="vanDong"][value="' + truoc.vanDong + '"]'); if (v) v.checked = true; const mt = f.querySelector('input[name="mucTieu"][value="' + truoc.mucTieu + '"]'); if (mt) mt.checked = true; }

  const kiem = () => {
    let ok = true;
    [['tuoi', 18, 80, 'Tuổi từ 18 đến 80'], ['cao', 130, 220, 'Chiều cao 130–220 cm'], ['nang', 35, 200, 'Cân nặng 35–200 kg']].forEach(([k, a, b, msg]) => {
      const v = +f[k].value; const fl = f[k].closest('.field'); const bad = !(v >= a && v <= b);
      fl.classList.toggle('is-invalid', bad); fl.querySelector('.err').textContent = bad ? msg : ''; if (bad) ok = false;
    });
    if (+f.tuoi.value && +f.tuoi.value < 18) $('[data-loi-chung]').textContent = 'Công thức Mifflin-St Jeor dùng cho người trưởng thành. Với người dưới 18 tuổi, vui lòng tham khảo chuyên gia dinh dưỡng nhi.';
    else $('[data-loi-chung]').textContent = '';
    return ok;
  };

  function goiYBoSung(kq) {
    // sản phẩm lẻ giúp lấp khoảng trống theo mục tiêu
    let ds;
    if (kq.mucTieu === 'tang-co') ds = d.sanPham.filter((s) => s.conHang).sort((a, b) => b.dinhDuong.tren100g.protein - a.dinhDuong.tren100g.protein);
    else if (kq.mucTieu === 'giam-can') ds = d.sanPham.filter((s) => s.conHang && s.dinhDuong.tren100g.duong <= d.cauHinh.nguongLoc.itDuong).sort((a, b) => a.kp.kcal - b.kp.kcal);
    else ds = d.sanPham.filter((s) => s.conHang && (s.mucTieu || []).includes('an-sang-nhanh'));
    return ds.slice(0, 4);
  }

  function ve(kq) {
    let combo = d.theoMa[kq.comboGoiY]; let canhBao = '';
    if (kq.mucTieu === 'giam-can' && kq.bmi < 18.5) {
      canhBao = '<div class="alert alert--warn mt-1"><span>BMI của bạn đang ở mức thiếu cân, không nên giảm cân thêm. NutriGreen gợi ý mục tiêu duy trì; hãy hỏi ý kiến chuyên gia nếu cần.</span></div>';
      combo = d.theoMa[cf.mucTieu.find((m) => m.ma === 'duy-tri').combo];
    }
    if (kq.biChan) canhBao += '<div class="alert alert--info mt-1"><span>Mục tiêu giảm cân được giữ ở mức tối thiểu ' + so(kq.mucTieuKcal) + ' kcal/ngày để an toàn. Muốn giảm sâu hơn, hãy có chuyên gia theo dõi.</span></div>';
    const vt = Math.max(0, Math.min(100, (kq.bmi - 15) / (35 - 15) * 100));
    const tongMacro = kq.macro.protein * 4 + kq.macro.carb * 4 + kq.macro.beo * 9;
    const mr = (ten, g, mau, kcalG) => '<div class="macro-row"><span>' + ten + '</span><div class="bar"><span style="width:' + Math.round(g * kcalG / tongMacro * 100) + '%;background:' + mau + '"></span></div><b>' + so(g) + 'g</b></div>';
    const pct = Math.min(100, Math.round(combo.kcalNgay / kq.mucTieuKcal * 100)); const conLai = Math.max(kq.mucTieuKcal - combo.kcalNgay, 0);
    const u = NG.taiKhoan.hienTai();
    const bs = goiYBoSung(kq);
    out.innerHTML = '<div class="res"><div class="res__top"><h2>Mục tiêu năng lượng mỗi ngày của bạn</h2><div class="res__goal"><b>' + so(kq.mucTieuKcal) + '</b><span>kcal/ngày · ' + esc(kq.tenMucTieu) + '</span></div></div>' +
      '<div class="res__body"><div class="res__nums"><div><b>' + so(kq.bmr) + '</b><span>BMR (kcal)</span></div><div><b>' + so(kq.tdee) + '</b><span>TDEE (kcal)</span></div><div><b>' + so(kq.bmi, 1) + '</b><span>BMI · ' + esc(kq.phanLoaiBmi) + '</span></div></div>' +
      '<div class="bmi"><span class="xs muted">BMI theo ngưỡng WHO cho người châu Á – Thái Bình Dương</span><div class="bmi__wrap"><div class="bmi__scale"><span></span><span></span><span></span><span></span></div><span class="bmi__dot" style="left:' + vt + '%"></span></div><div class="bmi__labels"><span>Thiếu cân &lt;18,5</span><span>Bình thường</span><span>Thừa cân 23</span><span>Béo phì ≥25</span></div></div>' +
      canhBao +
      '<h3 class="h-sm mt-2">Phân bổ macro gợi ý</h3><div class="macros">' + mr('Protein', kq.macro.protein, 'var(--ng-protein)', 4) + mr('Carb', kq.macro.carb, 'var(--ng-carb)', 4) + mr('Chất béo', kq.macro.beo, 'var(--ng-fat)', 9) + '</div>' +
      '<p class="xs muted">Protein ' + so(kq.macro.protein / kq.nang, 1) + ' g/kg, chất béo ~28% năng lượng, phần còn lại là carb.</p>' +
      '<div class="res-combo"><p class="eyebrow">Combo phù hợp với bạn</p>' + NG.ui.theCombo(combo, { noiBat: true, nhanNoiBat: 'Gợi ý từ TDEE', nguon: 'tdee' }) +
      '<div class="fill"><p class="small mb-0"><strong>Combo lo ' + pct + '%</strong> mục tiêu ' + so(kq.mucTieuKcal) + ' kcal; còn khoảng <strong>' + so(conLai) + ' kcal</strong> từ rau, trái cây và đạm tươi (thịt, cá, trứng, đậu).</p>' +
      '<div class="fill__bar mt-1"><span class="c" style="width:' + pct + '%">Combo ≈' + so(combo.kcalNgay) + '</span><span class="r" style="width:' + (100 - pct) + '%">' + (100 - pct > 18 ? 'Bữa tươi ≈' + so(conLai) : '') + '</span></div></div>' +
      '<div class="alt-combos"><span class="xs muted">Combo khác:</span>' + d.combo.filter((c) => c.ma !== combo.ma).map((c) => '<a class="chip" href="' + NG.url('chiTiet', { ma: c.ma, nguon: 'tdee' }) + '">' + esc(c.ten) + '</a>').join('') + '</div></div>' +
      '<h3 class="h-sm mt-3">' + (kq.mucTieu === 'tang-co' ? 'Bổ sung protein' : kq.mucTieu === 'giam-can' ? 'Bữa phụ ít đường, ít kcal' : 'Bữa sáng nhanh') + '</h3><div class="grid grid-4">' + bs.map((s) => NG.ui.the(s, d)).join('') + '</div>' +
      (u ? '<div class="save-box"><span>✓ Đã lưu vào hồ sơ của <strong>' + esc(u.hoTen) + '</strong>. Trang sản phẩm sẽ hiện % mục tiêu của bạn.</span><a class="btn btn--sm" href="account.html#tdee">Xem lịch sử</a></div>'
        : '<div class="save-box"><span>Đăng nhập để lưu lịch sử TDEE và theo dõi thay đổi cân nặng.</span><a class="btn btn--sm btn--primary" href="account.html?tiep=tdee.html">Đăng nhập / Đăng ký</a></div>') +
      '</div></div>';
    NG.track('xem_combo_goi_y', { combo: combo.ma, vitri: 'tdee' });
    if (innerWidth < 1024) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  f.addEventListener('submit', async (e) => {
    e.preventDefault(); if (!kiem()) return;
    const kq = await NG.tdee.tinh({ gioiTinh: gt, tuoi: +f.tuoi.value, cao: +f.cao.value, nang: +f.nang.value, vanDong: f.vanDong.value, mucTieu: f.mucTieu.value });
    NG.tdee.luu(kq); ve(kq);
  });
  // vào từ trang chủ với đủ tham số → hiện kết quả luôn (không ghi thêm lượt)
  if (p.get('tuoi') && kiem()) ve(await NG.tdee.tinh({ gioiTinh: gt, tuoi: +f.tuoi.value, cao: +f.cao.value, nang: +f.nang.value, vanDong: f.vanDong.value, mucTieu: f.mucTieu.value }));
})();
