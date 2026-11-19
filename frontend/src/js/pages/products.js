/* Danh sách sản phẩm: tìm kiếm + lọc theo loại, mục tiêu, kcal/khẩu phần, protein cao, ít đường, giá (FR01)
   Bộ lọc đồng bộ với địa chỉ (?danhmuc=&muctieu=&kcal=&loc=&gia=&q=&sapxep=) để chia sẻ link và gắn UTM. */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, so, tien } = NG;
  const d = await NG.duLieu.coBan(); const nguong = d.cauHinh.nguongLoc;
  const GIA = [{ id: 'duoi-100', ten: 'Dưới 100.000đ', min: 0, max: 99999 }, { id: '100-150', ten: '100.000 – 150.000đ', min: 100000, max: 150000 }, { id: 'tren-150', ten: 'Trên 150.000đ', min: 150001, max: 1e9 }];
  const form = $('[data-form-loc]'); const filters = $('#bo-loc');
  const p = new URLSearchParams(location.search);
  const st = {
    danhmuc: p.get('danhmuc') || '', muctieu: (p.get('muctieu') || '').split(',').filter(Boolean), kcal: p.get('kcal') || '',
    loc: (p.get('loc') || '').split(',').filter(Boolean), gia: p.get('gia') || '', conhang: p.get('conhang') === '1', q: p.get('q') || '',
    sapxep: p.get('sapxep') || 'noi-bat', theo: NG.kho.doc('theoDonVi', 'kp'), kieu: p.get('kieu') || 'luoi'
  };

  // dựng nhóm lựa chọn
  const nhom = (ten, kieu, ds, giaTri) => ds.map((x) => '<label class="check"><input type="' + kieu + '" name="' + ten + '" value="' + x.id + '"' + ((Array.isArray(giaTri) ? giaTri.includes(x.id) : giaTri === x.id) ? ' checked' : '') + '><span>' + esc(x.ten) + '</span><span class="n" data-n="' + ten + ':' + x.id + '"></span></label>').join('');
  $('[data-nhom="danhmuc"]').innerHTML = nhom('danhmuc', 'radio', [{ id: '', ten: 'Tất cả' }].concat(d.danhMuc.danhMuc), st.danhmuc);
  $('[data-nhom="muctieu"]').innerHTML = nhom('muctieu', 'checkbox', d.danhMuc.mucTieu, st.muctieu);
  $('[data-nhom="kcal"]').innerHTML = nhom('kcal', 'radio', [{ id: '', ten: 'Tất cả' }].concat(d.danhMuc.khoangKcal), st.kcal);
  $('[data-nhom="gia"]').innerHTML = nhom('gia', 'radio', [{ id: '', ten: 'Tất cả' }].concat(GIA), st.gia);
  $$('input[name="loc"]', form).forEach((i) => { i.checked = st.loc.includes(i.value); });
  form.conhang.checked = st.conhang;
  $('[data-sap-xep]').value = st.sapxep;

  const khopSo = (s, st) => {
    if (s.loai === 'combo') return !st.kcal && !st.loc.length; // combo không lọc theo kcal/khẩu phần
    const n = s.dinhDuong.tren100g;
    if (st.kcal) { const k = d.danhMuc.khoangKcal.find((x) => x.id === st.kcal); if (s.kp.kcal < k.min || s.kp.kcal > k.max) return false; }
    if (st.loc.includes('protein-cao') && n.protein < nguong.proteinCao) return false;
    if (st.loc.includes('it-duong') && n.duong > nguong.itDuong) return false;
    return true;
  };
  const loc = (bo = {}) => {
    const s0 = Object.assign({}, st, bo);
    let ds = s0.q ? NG.timKiem(d, s0.q) : d.tatCa.slice();
    return ds.filter((s) => {
      if (s0.danhmuc && s.danhMuc !== s0.danhmuc) return false;
      if (s0.muctieu.length && !s0.muctieu.some((m) => (s.mucTieu || []).includes(m))) return false;
      if (s0.gia) { const g = GIA.find((x) => x.id === s0.gia); if (s.gia < g.min || s.gia > g.max) return false; }
      if (s0.conhang && !s.conHang) return false;
      return khopSo(s, s0);
    });
  };
  const sapXep = (ds) => {
    const k = st.sapxep; const n = (s, f) => (s.loai === 'combo' ? (f === 'kcal' ? s.kcalNgay : f === 'protein' ? s.proteinNgay : s.duongNgay) : st.theo === '100g' ? s.dinhDuong.tren100g[f] : s.kp[f]);
    const f = { 'gia-tang': (a, b) => a.gia - b.gia, 'gia-giam': (a, b) => b.gia - a.gia, 'kcal-tang': (a, b) => n(a, 'kcal') - n(b, 'kcal'), 'protein-giam': (a, b) => n(b, 'protein') - n(a, 'protein'), 'duong-tang': (a, b) => n(a, 'duong') - n(b, 'duong'), moi: (a, b) => (!!b.moi - !!a.moi) || (b.conHang - a.conHang) }[k];
    if (f) return ds.slice().sort(f);
    if (st.q) return ds; // giữ thứ tự liên quan
    return ds.slice().sort((a, b) => (b.conHang - a.conHang) || ((b.loai === 'combo') - (a.loai === 'combo')) || (b.noiBat - a.noiBat));
  };

  function tieuDe() {
    let t = 'Tất cả sản phẩm', m = 'Mỗi thẻ hiện kcal, protein và đường của một khẩu phần – lượng bạn thật sự ăn.';
    if (st.danhmuc) { const x = d.danhMuc.danhMuc.find((y) => y.id === st.danhmuc); t = x.ten; m = x.moTa + '.'; }
    if (st.muctieu.length === 1 && !st.danhmuc) { const x = d.danhMuc.mucTieu.find((y) => y.id === st.muctieu[0]); t = 'Sản phẩm cho mục tiêu ' + x.ten.toLowerCase(); m = x.moTa + '.'; }
    if (st.danhmuc === 'combo') m = 'Gói 7 ngày theo mức 1.200 / 1.500 / 1.800 kcal, rẻ hơn mua lẻ khoảng 10%, chỉ bán trên website.';
    if (st.q) { t = 'Kết quả cho “' + st.q + '”'; }
    $('[data-tieu-de]').textContent = t; $('[data-mo-ta]').textContent = m; $('[data-bc]').textContent = t;
    document.title = t + ' | NutriGreen';
  }

  function chips() {
    const c = [];
    if (st.q) c.push(['q', '', 'Từ khóa: ' + st.q]);
    if (st.danhmuc) c.push(['danhmuc', '', NG.duLieu.tenDanhMuc(d, st.danhmuc)]);
    st.muctieu.forEach((m) => c.push(['muctieu', m, NG.duLieu.tenMucTieu(d, m)]));
    if (st.kcal) c.push(['kcal', '', d.danhMuc.khoangKcal.find((x) => x.id === st.kcal).ten + '/khẩu phần']);
    st.loc.forEach((l) => c.push(['loc', l, l === 'protein-cao' ? 'Protein ≥ 15g/100g' : 'Đường ≤ 5g/100g']));
    if (st.gia) c.push(['gia', '', GIA.find((x) => x.id === st.gia).ten]);
    if (st.conhang) c.push(['conhang', '', 'Còn hàng']);
    $('[data-chips]').innerHTML = c.map((x) => '<button class="chip is-active" type="button" data-bo="' + x[0] + '" data-gt="' + esc(x[1]) + '">' + esc(x[2]) + ' <span class="x" aria-hidden="true">×</span><span class="sr-only">Bỏ lọc</span></button>').join('') + (c.length > 1 ? '<button class="link-btn small" type="button" data-xoa-loc>Xóa tất cả</button>' : '');
    const n = c.filter((x) => x[0] !== 'q').length; $('[data-so-loc]').textContent = n; $('[data-so-loc]').hidden = !n;
  }

  function dongBoUrl() {
    const q = new URLSearchParams();
    if (st.q) q.set('q', st.q); if (st.danhmuc) q.set('danhmuc', st.danhmuc); if (st.muctieu.length) q.set('muctieu', st.muctieu.join(','));
    if (st.kcal) q.set('kcal', st.kcal); if (st.loc.length) q.set('loc', st.loc.join(',')); if (st.gia) q.set('gia', st.gia);
    if (st.conhang) q.set('conhang', '1'); if (st.sapxep !== 'noi-bat') q.set('sapxep', st.sapxep); if (st.kieu !== 'luoi') q.set('kieu', st.kieu);
    p.forEach((v, k) => { if (/^utm_/.test(k)) q.set(k, v); });
    history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : ''));
  }

  function bang(ds) {
    const sp = ds.filter((s) => s.loai !== 'combo'); if (!sp.length) return '<p class="muted">Bảng so sánh áp dụng cho sản phẩm lẻ.</p>';
    const v = (s, f) => (st.theo === '100g' ? s.dinhDuong.tren100g[f] : s.kp[f]);
    const cot = [['kcal', 'kcal', 0, 'min'], ['protein', 'Protein (g)', 1, 'max'], ['beo', 'Béo (g)', 1, ''], ['carb', 'Carb (g)', 1, ''], ['duong', 'Đường (g)', 1, 'min']];
    const tot = {}; cot.forEach(([f, , , k]) => { if (k) tot[f] = (k === 'max' ? Math.max : Math.min).apply(null, sp.map((s) => v(s, f))); });
    return '<div class="table-wrap"><table class="cmp"><caption class="sr-only">So sánh dinh dưỡng</caption><thead><tr><th scope="col">Sản phẩm · ' + (st.theo === '100g' ? 'trên 100g' : 'mỗi khẩu phần') + '</th>' + cot.map((c) => '<th scope="col">' + c[1] + '</th>').join('') + '<th scope="col">Giá</th><th scope="col"><span class="sr-only">Thêm</span></th></tr></thead><tbody>' +
      sp.map((s) => '<tr><td><a href="' + NG.url('chiTiet', { ma: s.ma }) + '"><img src="' + NG.anh(s.anh, true) + '" alt="" loading="lazy"><span>' + esc(s.ten) + '<br><span class="xs muted">' + (st.theo === '100g' ? '100g' : s.dinhDuong.khauPhan.g + 'g') + ' · ' + esc(s.quyCach) + '</span></span></a></td>' +
        cot.map(([f, , le]) => '<td class="num"><span class="' + (tot[f] === v(s, f) ? 'best' : '') + '" style="padding:2px 6px">' + so(v(s, f), le) + '</span></td>').join('') +
        '<td class="num strong">' + tien(s.gia) + '</td><td><button class="pcard__add add" type="button" data-them-gio="' + s.ma + '" aria-label="Thêm ' + esc(s.ten) + '"' + (s.conHang ? '' : ' disabled') + '>' + NG.IC.them + '</button></td></tr>').join('') +
      '</tbody></table></div><p class="xs muted mt-1">Ô tô sáng: protein cao nhất, kcal và đường thấp nhất trong danh sách đang xem.</p>';
  }

  let lanDau = true;
  function ve() {
    const ds = sapXep(loc());
    $('[data-so-kq]').textContent = ds.length; $('[data-dem-kq]').textContent = ds.length;
    $('[data-ket-qua]').innerHTML = st.kieu === 'luoi' ? ds.map((s) => NG.ui.the(s, d, { theo: st.theo })).join('') : '';
    $('[data-ket-qua]').hidden = st.kieu !== 'luoi';
    $('[data-bang]').hidden = st.kieu !== 'bang'; if (st.kieu === 'bang') $('[data-bang]').innerHTML = bang(ds);
    $('[data-trong]').hidden = ds.length > 0;
    // đếm số kết quả cho từng lựa chọn
    $$('[data-n]').forEach((el) => {
      const [k, v] = el.dataset.n.split(':'); let bo = {};
      if (k === 'muctieu') bo = { muctieu: [v] }; else bo[k] = v;
      el.textContent = v ? loc(bo).length : '';
    });
    $$('[data-theo]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theo === st.theo)));
    $$('[data-kieu]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kieu === st.kieu)));
    chips(); tieuDe(); dongBoUrl();
    // gợi ý dùng TDEE nếu khách lọc theo mục tiêu/kcal mà chưa tính
    const nudge = $('[data-nudge]'); const da = NG.tdee.ganNhat();
    if (!da && (st.muctieu.length || st.kcal || st.danhmuc === 'combo')) { nudge.innerHTML = '<div><strong>Chưa chắc mình cần bao nhiêu calo?</strong><span class="small">Tính TDEE 30 giây, NutriGreen gợi ý combo đúng mức.</span></div><a class="btn btn--primary" href="tdee.html">Tính TDEE</a>'; nudge.hidden = false; }
    else nudge.hidden = true;
    if (!lanDau) NG.track('loc_san_pham', { danhmuc: st.danhmuc, muctieu: st.muctieu.join(','), kcal: st.kcal, loc: st.loc.join(','), soKetQua: ds.length });
    lanDau = false;
  }

  form.addEventListener('change', () => {
    st.danhmuc = form.danhmuc.value; st.muctieu = $$('input[name="muctieu"]:checked', form).map((i) => i.value);
    st.kcal = form.kcal.value; st.loc = $$('input[name="loc"]:checked', form).map((i) => i.value); st.gia = form.gia.value; st.conhang = form.conhang.checked;
    ve();
  });
  const xoaLoc = () => { Object.assign(st, { danhmuc: '', muctieu: [], kcal: '', loc: [], gia: '', conhang: false, q: '' }); form.reset(); $$('input[value=""]', form).forEach((i) => { i.checked = true; }); const ip = $('#o-tim-kiem'); if (ip) ip.value = ''; ve(); };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-xoa-loc]')) { xoaLoc(); return; }
    const c = e.target.closest('[data-bo]');
    if (c) {
      const k = c.dataset.bo, v = c.dataset.gt;
      if (k === 'muctieu' || k === 'loc') { st[k] = st[k].filter((x) => x !== v); $$('input[name="' + k + '"][value="' + v + '"]', form).forEach((i) => { i.checked = false; }); }
      else if (k === 'conhang') { st.conhang = false; form.conhang.checked = false; }
      else { st[k] = ''; const i = $('input[name="' + k + '"][value=""]', form); if (i) i.checked = true; if (k === 'q') { const ip = $('#o-tim-kiem'); if (ip) ip.value = ''; } }
      ve(); return;
    }
    const t = e.target.closest('[data-theo]'); if (t) { st.theo = t.dataset.theo; NG.kho.ghi('theoDonVi', st.theo); ve(); return; }
    const k = e.target.closest('[data-kieu]'); if (k) { st.kieu = k.dataset.kieu; ve(); return; }
    if (e.target.closest('[data-mo-loc]')) { filters.classList.add('is-open'); document.body.classList.add('no-scroll'); return; }
    if (e.target.closest('[data-dong-loc]')) { filters.classList.remove('is-open'); document.body.classList.remove('no-scroll'); }
  });
  $('[data-sap-xep]').addEventListener('change', (e) => { st.sapxep = e.target.value; ve(); });
  window.addEventListener('ng:doi', (e) => { if (e.detail.khoa === 'qtSanPham') location.reload(); });
  if (st.q) NG.track('tim_kiem', { q: st.q });
  ve();
})();
