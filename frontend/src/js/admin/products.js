/* Sản phẩm (sitemap 4.2): danh sách sản phẩm – thêm / sửa / ẩn; cấu hình combo theo kcal; danh mục – thêm / sửa / ẩn.
   Khi nhập bảng dinh dưỡng, trang tự kiểm tra kcal có khớp protein – carb – béo không (cam kết "minh bạch dinh dưỡng"). */
(async function () {
  'use strict';
  const NG = window.NG, NGA = window.NGA; const { $, $$, esc, so, tien, anh } = NG;
  let { d, el, congCu } = await NGA.san('Sản phẩm & combo', 'Giá bán, bảng dinh dưỡng, combo theo calo và danh mục');
  let tab = NG.qs('tab') || 'san-pham'; let tu = '';
  const sua = () => NG.kho.doc('qtSanPham', {});
  const ghiSua = (ma, x) => { const q = sua(); q[ma] = Object.assign({}, q[ma] || {}, x); NG.kho.ghi('qtSanPham', q); };
  const lamMoi = async () => { d = await NGA.taiLai(); NGA.veMenu(d); ve(); };
  const kcalTinh = (n) => 4 * n.protein + 9 * n.beo + 4 * (n.carb - n.xo) + 2 * n.xo;

  function ve() {
    congCu.innerHTML = tab === 'san-pham' ? '<button class="btn btn--primary btn--sm" type="button" data-them-sp>+ Thêm sản phẩm</button>' : tab === 'danh-muc' ? '<button class="btn btn--primary btn--sm" type="button" data-them-dm>+ Thêm danh mục</button>' : '';
    const tabs = '<div class="qt-tabs" role="tablist">' + [['san-pham', 'Sản phẩm (' + d.keCaAn.sanPham.length + ')'], ['combo', 'Combo theo calo (' + d.keCaAn.combo.length + ')'], ['danh-muc', 'Danh mục']].map((t) => '<button class="chip' + (t[0] === tab ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>';
    el.innerHTML = tabs + (tab === 'san-pham' ? veSp() : tab === 'combo' ? veCombo() : veDm());
  }

  function veSp() {
    const k = NG.khongDau(tu.trim()); const ds = d.keCaAn.sanPham.filter((s) => !k || NG.khongDau(s.ten + ' ' + s.ma).includes(k));
    return '<section class="qt-card"><div class="qt-tools"><input class="input grow" type="search" placeholder="Tìm theo tên hoặc mã sản phẩm" value="' + esc(tu) + '" data-tim aria-label="Tìm sản phẩm"><span class="small muted">' + ds.length + ' sản phẩm</span></div>' +
      '<div class="table-wrap"><table class="qt-table"><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th class="r">Giá bán</th><th class="r">kcal / khẩu phần</th><th class="r">Protein</th><th class="r">Đường /100g</th><th class="r">Tồn kho</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      ds.map((s) => '<tr class="' + (s.an ? 'row-off' : '') + '"><td><div class="cell-sp"><img src="' + anh(s.anh, true) + '" alt=""><span><strong>' + esc(s.ten) + '</strong><br><span class="xs muted">' + esc(s.ma) + ' · ' + esc(s.quyCach) + '</span></span></div></td><td>' + esc(NG.duLieu.tenDanhMuc(d, s.danhMuc)) + '</td><td class="r num"><strong>' + tien(s.gia) + '</strong></td><td class="r num">' + so(s.kp.kcal) + '</td><td class="r num">' + so(s.kp.protein, 1) + 'g</td><td class="r num">' + so(s.dinhDuong.tren100g.duong, 1) + 'g</td>' +
        '<td class="r num">' + (s.ton ? (s.ton <= 5 ? '<span class="badge badge--orange">' + s.ton + '</span>' : s.ton) : '<span class="badge badge--red">Hết</span>') + '</td><td>' + (s.an ? '<span class="badge">' + (s.anDoDanhMuc ? 'Ẩn theo danh mục' : 'Đang ẩn') + '</span>' : '<span class="badge badge--green">Đang bán</span>') + '</td>' +
        '<td class="r" style="white-space:nowrap"><button class="btn btn--sm" type="button" data-sua="' + s.ma + '">Sửa</button> <button class="btn btn--sm btn--ghost" type="button" data-an="' + s.ma + '"' + (s.anDoDanhMuc ? ' disabled' : '') + '>' + (s.an ? 'Hiện lại' : 'Ẩn') + '</button></td></tr>').join('') + '</tbody></table></div>' +
      '<p class="xs muted mt-1">Tồn kho thay đổi ở mục <a href="inventory.html">Kho hàng</a> (nhập lô) và tự trừ khi xác nhận đơn. Sản phẩm ẩn không hiện ở cửa hàng nhưng vẫn giữ trong các đơn cũ.</p></section>';
  }

  function veCombo() {
    const don = NG.donHang.tatCa().filter((o) => o.trangThai !== 'DaHuy' && Date.now() - new Date(o.taoLuc) < 30 * 864e5); const nguong = d.cauHinh.giaoHang.mienPhiTu;
    return '<p class="alert mb-2"><span>Mỗi combo là một gói 7 ngày. Giá nên <strong>rẻ hơn mua lẻ 8–12%</strong> và <strong>từ ' + tien(nguong) + '</strong> để khách được miễn phí giao hàng. Trang tự kiểm tra hai điều kiện này khi bạn đổi giá.</span></p><div class="combo-cfg">' +
      d.keCaAn.combo.map((c) => { const ban = don.reduce((t, o) => t + o.dong.filter((x) => x.ma === c.ma).reduce((a, x) => a + x.soLuong, 0), 0); const mt = d.cauHinh.tdee.mucTieu.find((m) => m.combo === c.ma);
        return '<section class="qt-card' + (c.an ? ' row-off' : '') + '"><div class="flex between center"><h2>' + esc(c.ten) + '</h2>' + (c.an ? '<span class="badge">Đang ẩn</span>' : '<span class="badge badge--green">Đang bán</span>') + '</div><p class="sub">Gợi ý cho khách chọn mục tiêu “' + esc(mt ? mt.ten : '—') + '” trong công cụ TDEE · bán ' + ban + ' gói / 30 ngày</p>' +
          '<div class="table-wrap"><table class="qt-table"><tbody>' + c.thanhPhanDayDu.map((t) => '<tr><td>' + (t.soLuong > 1 ? t.soLuong + ' × ' : '') + esc(t.laLuaChon ? 'Bún / phở / nui gạo lứt (khách chọn 1)' : t.sp.ten) + '</td><td class="r num">' + tien(t.sp.gia * t.soLuong) + '</td></tr>').join('') + '<tr><td><strong>Tổng nếu mua lẻ</strong></td><td class="r num"><strong>' + tien(c.giaLe) + '</strong></td></tr></tbody></table></div>' +
          '<dl class="dl mt-2"><dt>Năng lượng</dt><dd>≈ ' + so(c.kcalNgay) + ' kcal/ngày (' + c.phanTramMucTieu + '% mức ' + so(c.mucTieuKcal) + ')</dd><dt>Protein</dt><dd>' + c.proteinNgay + ' g/ngày</dd></dl>' +
          '<form class="mt-2" data-gia-combo="' + c.ma + '"><div class="field"><label for="g-' + c.ma + '">Giá bán combo (đ)</label><input class="input" id="g-' + c.ma + '" name="gia" type="number" step="1000" min="50000" value="' + c.gia + '"></div><div data-kiem class="small"></div><div class="flex gap-1 mt-1"><button class="btn btn--primary btn--sm" type="submit">Lưu giá</button><button class="btn btn--sm btn--ghost" type="button" data-an="' + c.ma + '">' + (c.an ? 'Hiện lại' : 'Ẩn combo') + '</button></div></form></section>'; }).join('') + '</div>';
  }
  function kiemCombo(f) {
    const c = d.theoMa[f.dataset.giaCombo]; const g = +f.gia.value || 0; const tk = c.giaLe ? (c.giaLe - g) / c.giaLe * 100 : 0; const nguong = d.cauHinh.giaoHang.mienPhiTu;
    f.querySelector('[data-kiem]').innerHTML = '<div class="' + (tk >= 8 && tk <= 12 ? 'check-ok">✓' : 'check-bad">⚠') + ' Rẻ hơn mua lẻ ' + so(tk, 1) + '% (' + tien(c.giaLe - g) + ')' + (tk < 8 ? ' – ưu đãi hơi ít, khách khó thấy lợi' : tk > 12 ? ' – giảm sâu, kiểm tra lại lợi nhuận' : '') + '</div><div class="' + (g >= nguong ? 'check-ok">✓ Đủ' : 'check-bad">⚠ Chưa đủ') + ' ngưỡng miễn phí giao hàng ' + tien(nguong) + '</div>';
  }

  function veDm() {
    return '<section class="qt-card"><div class="table-wrap"><table class="qt-table"><thead><tr><th>Danh mục</th><th>Mô tả ngắn</th><th class="r">Số sản phẩm</th><th>Trạng thái</th><th></th></tr></thead><tbody>' +
      d.danhMuc.danhMucTatCa.map((m) => { const n = m.id === 'combo' ? d.keCaAn.combo.length : d.keCaAn.sanPham.filter((s) => s.danhMuc === m.id).length;
        return '<tr class="' + (m.an ? 'row-off' : '') + '"><td><strong>' + esc(m.ten) + '</strong></td><td class="small">' + esc(m.moTa || '') + '</td><td class="r num">' + n + '</td><td>' + (m.an ? '<span class="badge">Đang ẩn</span>' : '<span class="badge badge--green">Đang hiện</span>') + '</td><td class="r" style="white-space:nowrap"><button class="btn btn--sm" type="button" data-sua-dm="' + m.id + '">Sửa</button> <button class="btn btn--sm btn--ghost" type="button" data-an-dm="' + m.id + '">' + (m.an ? 'Hiện lại' : 'Ẩn') + '</button></td></tr>'; }).join('') +
      '</tbody></table></div><p class="xs muted mt-1">Ẩn một danh mục sẽ ẩn luôn các sản phẩm trong danh mục đó khỏi cửa hàng và menu.</p></section>';
  }

  /* ---------- biểu mẫu sản phẩm ---------- */
  function moSp(ma) {
    const s = ma ? d.theoMa[ma] : null; const n = s ? s.dinhDuong.tren100g : { kcal: '', protein: '', beo: '', carb: '', xo: '', duong: '' }; const moi = !s;
    const o = (k, nhan, v, them = '') => '<div class="field"><label for="sp-' + k + '">' + nhan + '</label><input class="input" id="sp-' + k + '" name="' + k + '" value="' + esc(v == null ? '' : v) + '" ' + them + '><span class="err"></span></div>';
    const so_ = 'type="number" step="0.1" min="0" inputmode="decimal"';
    const dsAnh = [...new Set(d.keCaAn.sanPham.map((x) => x.anh))];
    const m = NG.ui.modal('<h2>' + (moi ? 'Thêm sản phẩm' : 'Sửa ' + esc(s.ten)) + '</h2><form data-f-sp novalidate>' +
      '<div class="form-row form-row--2">' + o('ten', 'Tên sản phẩm', s && s.ten) + '<div class="field"><label for="sp-dm">Danh mục</label><select class="select" id="sp-dm" name="danhMuc">' + d.danhMuc.danhMucTatCa.filter((x) => x.id !== 'combo').map((x) => '<option value="' + x.id + '"' + (s && s.danhMuc === x.id ? ' selected' : '') + '>' + esc(x.ten) + '</option>').join('') + '</select></div></div>' +
      '<div class="form-row form-row--3">' + o('gia', 'Giá bán (đ)', s && s.gia, 'type="number" step="1000" min="10000"') + o('quyCach', 'Quy cách', s && s.quyCach, 'placeholder="Túi 300g"') + o('khoiLuong', 'Khối lượng (g)', s && s.khoiLuong, 'type="number" min="1"') + '</div>' +
      o('moTaNgan', 'Mô tả ngắn (hiện dưới tên sản phẩm)', s && s.moTaNgan) + o('thanhPhan', 'Thành phần', s && s.thanhPhan) +
      '<div class="field"><span class="label">Phù hợp mục tiêu</span><div class="flex gap-2 wrap">' + d.danhMuc.mucTieu.map((x) => '<label class="check"><input type="checkbox" name="mucTieu" value="' + x.id + '"' + (s && (s.mucTieu || []).includes(x.id) ? ' checked' : '') + '> ' + esc(x.ten) + '</label>').join('') + '<label class="check"><input type="checkbox" name="noiBat"' + (s && s.noiBat ? ' checked' : '') + '> Hiện ở “Sản phẩm bán chạy” trang chủ</label></div></div>' +
      '<h3 style="font-size:var(--ng-fs-md)">Bảng dinh dưỡng trên 100g</h3><div class="form-row form-row--3">' + o('kcal', 'Năng lượng (kcal)', n.kcal, so_) + o('protein', 'Protein (g)', n.protein, so_) + o('beo', 'Chất béo (g)', n.beo, so_) + o('carb', 'Carbohydrate (g)', n.carb, so_) + o('xo', '… trong đó chất xơ (g)', n.xo, so_) + o('duong', '… trong đó đường (g)', n.duong, so_) + '</div>' +
      '<div class="alert" data-kiem-dd></div>' +
      '<div class="form-row form-row--2 mt-2">' + o('kpG', 'Một khẩu phần (g)', s ? s.dinhDuong.khauPhan.g : '', 'type="number" min="1"') + o('kpMoTa', 'Mô tả khẩu phần', s ? s.dinhDuong.khauPhan.moTa : '', 'placeholder="4 muỗng canh (40g)"') + '</div>' +
      (moi ? '<h3 style="font-size:var(--ng-fs-md)">Ảnh và lô hàng đầu tiên</h3><div class="form-row form-row--3"><div class="field"><label for="sp-anh">Ảnh (chọn từ thư viện)</label><select class="select" id="sp-anh" name="anh">' + dsAnh.map((a) => '<option>' + a + '</option>').join('') + '</select></div>' + o('ton', 'Số lượng nhập', '', 'type="number" min="0"') + o('hsd', 'Hạn sử dụng', '', 'type="date"') + '</div>' : '') +
      '<p class="err small" data-loi style="color:var(--ng-red)"></p><div class="modal__actions"><button class="btn" type="button" data-dong>Hủy</button><button class="btn btn--primary" type="submit">' + (moi ? 'Thêm sản phẩm' : 'Lưu thay đổi') + '</button></div></form>', { rong: true, nhan: 'Sản phẩm' });
    const f = m.querySelector('form'); const lay = () => ({ kcal: +f.kcal.value, protein: +f.protein.value, beo: +f.beo.value, carb: +f.carb.value, xo: +f.xo.value, duong: +f.duong.value });
    const kiem = () => { const x = lay(); const box = m.querySelector('[data-kiem-dd]'); if (!x.kcal) { box.innerHTML = '<span>Nhập đủ 6 số, trang sẽ kiểm tra năng lượng có khớp không (4 kcal/g protein và carb, 9 kcal/g béo, 2 kcal/g chất xơ).</span>'; return null; }
      const t = kcalTinh(x); const lech = (t - x.kcal) / x.kcal * 100; const ok = Math.abs(lech) <= 5 && x.duong <= x.carb && x.xo <= x.carb;
      box.className = 'alert' + (ok ? '' : ' alert--warn'); box.innerHTML = '<span>' + (ok ? '✓ Khớp: ' : '⚠ Cần xem lại: ') + 'năng lượng tính từ protein – carb – béo là <strong>' + so(t) + ' kcal</strong>, lệch ' + so(Math.abs(lech), 1) + '% so với số bạn nhập.' + (x.duong > x.carb || x.xo > x.carb ? ' Đường và chất xơ không thể lớn hơn carbohydrate.' : '') + (ok ? '' : ' Website chỉ đăng số liệu lệch không quá 5%.') + '</span>'; return ok; };
    f.addEventListener('input', kiem); kiem();
    f.addEventListener('submit', async (e) => {
      e.preventDefault(); const l = f.querySelector('[data-loi]'); const x = lay();
      if (f.ten.value.trim().length < 3) { l.textContent = 'Vui lòng nhập tên sản phẩm.'; return; }
      if (!(+f.gia.value >= 10000) || !(+f.khoiLuong.value > 0) || !(+f.kpG.value > 0) || !f.quyCach.value.trim()) { l.textContent = 'Vui lòng nhập giá, quy cách, khối lượng và khẩu phần.'; return; }
      if (!kiem()) { l.textContent = 'Bảng dinh dưỡng chưa khớp – vui lòng kiểm tra lại các con số.'; return; }
      const duLieu = { ten: f.ten.value.trim(), danhMuc: f.danhMuc.value, gia: Math.round(+f.gia.value / 1000) * 1000, quyCach: f.quyCach.value.trim(), khoiLuong: +f.khoiLuong.value, moTaNgan: f.moTaNgan.value.trim(), thanhPhan: f.thanhPhan.value.trim(), mucTieu: $$('input[name="mucTieu"]:checked', f).map((i) => i.value), noiBat: f.noiBat.checked,
        dinhDuong: { tren100g: x, khauPhan: { g: +f.kpG.value, moTa: f.kpMoTa.value.trim() || (f.kpG.value + 'g') } } };
      if (moi) {
        if (!f.hsd.value || new Date(f.hsd.value) < new Date()) { l.textContent = 'Vui lòng chọn hạn sử dụng trong tương lai.'; return; }
        const ds = NG.kho.doc('qtSanPhamMoi', []); const hom = new Date().toISOString().slice(0, 10); const maMoi = 'NG-M-' + String(ds.length + 1).padStart(2, '0');
        ds.push(Object.assign({ ma: maMoi, slug: NG.khongDau(duLieu.ten).replace(/[^a-z0-9]+/g, '-'), loai: 'san-pham', anh: f.anh.value, anhMinhHoa: true, xuatXu: 'Đóng gói tại TP.HCM.', hanSuDung: 'Xem trên bao bì', baoQuan: 'Nơi khô ráo, thoáng mát, tránh nắng.', huongDan: 'Dùng trực tiếp.', nguonSoLieu: 'Nhãn nhà cung cấp, NutriGreen đối chiếu lại theo hệ số 4 – 4 – 9.', ton: +f.ton.value || 0, lo: { ma: 'L' + hom.slice(2).replace(/-/g, '') + '-M', nsx: hom, hsd: f.hsd.value } }, duLieu));
        NG.kho.ghi('qtSanPhamMoi', ds);
      } else ghiSua(ma, duLieu);
      m.dong(); NG.ui.toast(moi ? 'Đã thêm sản phẩm, đang hiện ở cửa hàng' : 'Đã lưu, cửa hàng cập nhật ngay'); lamMoi();
    });
  }
  function moDm(id) {
    const x = id ? d.danhMuc.danhMucTatCa.find((y) => y.id === id) : null;
    const m = NG.ui.modal('<h2>' + (x ? 'Sửa danh mục' : 'Thêm danh mục') + '</h2><form novalidate><div class="field"><label for="dm-ten">Tên danh mục</label><input class="input" id="dm-ten" name="ten" value="' + esc(x ? x.ten : '') + '"></div><div class="field"><label for="dm-mt">Mô tả ngắn</label><input class="input" id="dm-mt" name="moTa" value="' + esc(x ? x.moTa || '' : '') + '"></div><p class="err small" data-loi style="color:var(--ng-red)"></p><div class="modal__actions"><button class="btn" type="button" data-dong>Hủy</button><button class="btn btn--primary" type="submit">Lưu</button></div></form>', { nhan: 'Danh mục' });
    m.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target; if (f.ten.value.trim().length < 2) { f.querySelector('[data-loi]').textContent = 'Vui lòng nhập tên danh mục.'; return; }
      const q = NG.kho.doc('qtDanhMuc', {}); const k = id || NG.khongDau(f.ten.value.trim()).replace(/[^a-z0-9]+/g, '-');
      q[k] = Object.assign({}, q[k] || {}, { ten: f.ten.value.trim(), moTa: f.moTa.value.trim() }, id ? {} : { moi: true }); NG.kho.ghi('qtDanhMuc', q); m.dong(); NG.ui.toast('Đã lưu danh mục'); lamMoi();
    });
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; history.replaceState(null, '', '?tab=' + tab); return ve(); }
    if (e.target.closest('[data-them-sp]')) return moSp(null);
    if (e.target.closest('[data-them-dm]')) return moDm(null);
    const s = e.target.closest('[data-sua]'); if (s) return moSp(s.dataset.sua);
    const a = e.target.closest('[data-an]'); if (a) { const x = d.theoMa[a.dataset.an]; ghiSua(x.ma, { an: !x.an }); NG.ui.toast(x.an ? 'Đã hiện lại ' + x.ten : 'Đã ẩn ' + x.ten + ' khỏi cửa hàng'); return lamMoi(); }
    const sd = e.target.closest('[data-sua-dm]'); if (sd) return moDm(sd.dataset.suaDm);
    const ad = e.target.closest('[data-an-dm]'); if (ad) { const q = NG.kho.doc('qtDanhMuc', {}); const x = d.danhMuc.danhMucTatCa.find((y) => y.id === ad.dataset.anDm); q[x.id] = Object.assign({}, q[x.id] || {}, { an: !x.an }); NG.kho.ghi('qtDanhMuc', q); NG.ui.toast(x.an ? 'Đã hiện lại danh mục' : 'Đã ẩn danh mục và sản phẩm bên trong'); return lamMoi(); }
  });
  el.addEventListener('input', (e) => {
    if (e.target.matches('[data-tim]')) { tu = e.target.value; ve(); const i = $('[data-tim]'); i.focus(); i.setSelectionRange(tu.length, tu.length); }
    const f = e.target.closest('[data-gia-combo]'); if (f) kiemCombo(f);
  });
  el.addEventListener('submit', (e) => { const f = e.target.closest('[data-gia-combo]'); if (!f) return; e.preventDefault(); const g = Math.round(+f.gia.value / 1000) * 1000; if (!(g >= 50000)) return NG.ui.toast('Giá combo chưa hợp lệ', 'error'); ghiSua(f.dataset.giaCombo, { gia: g }); NG.ui.toast('Đã lưu giá combo'); lamMoi(); });
  ve(); $$('[data-gia-combo]').forEach(kiemCombo);
  const veGoc = ve; ve = function () { veGoc(); $$('[data-gia-combo]').forEach(kiemCombo); };
})();
