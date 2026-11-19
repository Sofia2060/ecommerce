/* Trang chủ: banner trượt, mã ưu đãi, sản phẩm mới, danh mục, combo, sản phẩm theo tab, TDEE nhanh, bài viết */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, so, tien } = NG;
  const d = await NG.duLieu.coBan();
  const hom = new Date().toISOString().slice(0, 10);
  const ban = d.sanPham.filter((s) => !s.an);

  /* ---------- banner trượt: tự chuyển 5 giây, dừng khi rê chuột / chạm giữ / đang thao tác ---------- */
  const bn = $('[data-banner]');
  if (bn) {
    // Mỗi slide hiện 5 giây; chấm đang chọn có thanh chạy cho khách thấy còn bao lâu sẽ đổi.
    // Rê chuột / chạm giữ / chọn bằng bàn phím thì tạm dừng; thả ra chạy tiếp đúng phần thời gian còn lại
    // (thanh chạy CSS cũng dừng/chạy cùng lúc nên luôn khớp với hẹn giờ).
    const MS = 5000;
    const slides = $$('.banner__slide', bn); const dots = $('[data-banner-dots]', bn); let i = 0;
    const tuDong = !document.documentElement.classList.contains('motion-off'); // khách chọn "Tắt hiệu ứng": chỉ chuyển bằng tay
    let hen = null, batDau = 0, conLai = MS, dungLai = false;
    dots.innerHTML = slides.map((s, k) => '<button type="button" aria-label="Xem banner ' + (k + 1) + '"><span class="tien"></span></button>').join('');
    const henGio = () => { clearTimeout(hen); if (!tuDong || dungLai) return; batDau = Date.now(); hen = setTimeout(() => den(i + 1), conLai); };
    const den = (k) => {
      i = (k + slides.length) % slides.length;
      slides.forEach((s, n) => { s.classList.toggle('is-active', n === i); s.setAttribute('aria-hidden', String(n !== i)); s.inert = n !== i; });
      $$('button', dots).forEach((b, n) => { b.toggleAttribute('aria-current', n === i); const t = b.firstChild; t.style.animation = 'none'; void t.offsetWidth; t.style.animation = ''; });
      conLai = MS; henGio();
    };
    den(0);
    $('[data-banner-lui]', bn).addEventListener('click', () => den(i - 1));
    $('[data-banner-toi]', bn).addEventListener('click', () => den(i + 1));
    dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) den($$('button', dots).indexOf(b)); });
    const dung = (v) => {
      if (v === dungLai) return; dungLai = v; bn.classList.toggle('is-paused', v);
      if (v) { clearTimeout(hen); conLai = Math.max(300, conLai - (Date.now() - batDau)); } else henGio();
    };
    bn.addEventListener('mouseenter', () => dung(true)); bn.addEventListener('mouseleave', () => dung(false));
    bn.addEventListener('focusin', (e) => { if (e.target.matches(':focus-visible')) dung(true); }); // chỉ khi dùng bàn phím
    bn.addEventListener('focusout', () => { if (!bn.matches(':hover')) dung(false); });
    // điện thoại: chạm giữ để dừng đọc, vuốt để đổi slide
    let x0 = null;
    bn.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; dung(true); }, { passive: true });
    bn.addEventListener('touchend', (e) => { dung(false); if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) den(i + (dx < 0 ? 1 : -1)); x0 = null; });
  }

  /* ---------- dải mã ưu đãi (lấy từ config.json, chỉ mã còn hạn) ---------- */
  const ic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>';
  const mienPhi = d.cauHinh.giaoHang.mienPhiTu;
  const k = (n) => so(n / 1000) + 'K';
  const ngan = (m) => { // mô tả ngắn gọn từ các trường của mã
    const giam = m.loai === 'phanTram' ? 'Giảm ' + m.giaTri + '%' : 'Giảm ' + k(m.giaTri);
    const pham = m.chiCombo ? ' combo' : m.chiDonDau ? ' đơn đầu' : '';
    const han = (new Date(m.den) - new Date(hom)) / 864e5 <= 14 ? ' · đến ' + NG.ngay(m.den).slice(0, 5) : '';
    const dk = m.donToiThieu ? ', đơn từ ' + k(m.donToiThieu) : (m.toiDa && !han) ? ', tối đa ' + k(m.toiDa) : '';
    return giam + pham + dk + han;
  };
  const the = [{ tieuDe: 'Freeship', moTa: 'Đơn từ ' + k(mienPhi), link: 'policy.html#giao-hang' }]
    .concat(d.cauHinh.maUuDai.filter((m) => m.tu <= hom && hom <= m.den).map((m) => ({ tieuDe: m.ma, moTa: ngan(m), ma: m.ma })));
  $('[data-uu-dai]').innerHTML = the.slice(0, 4).map((t) => '<div class="deal"><span class="deal__ic">' + ic + '</span><div class="deal__txt"><strong>' + esc(t.tieuDe) + '</strong><span>' + esc(t.moTa) + '</span></div>' +
    (t.ma ? '<button class="deal__btn" type="button" data-copy="' + esc(t.ma) + '">Sao chép</button>' : '<a class="deal__btn" href="' + t.link + '">Chi tiết</a>') + '</div>').join('');
  $$('[data-mien-phi]').forEach((x) => { x.textContent = tien(mienPhi); });

  /* ---------- sản phẩm mới ---------- */
  const moi = ban.filter((s) => s.moi).sort((a, b) => String(b.ngayLenKe || '').localeCompare(String(a.ngayLenKe || '')));
  if (moi.length) { $('[data-moi]').innerHTML = moi.slice(0, 8).map((s) => NG.ui.the(s, d)).join(''); $('[data-khoi-moi]').hidden = false; }

  /* ---------- số sản phẩm mỗi danh mục ---------- */
  $$('[data-dem-dm]').forEach((x) => { const id = x.dataset.demDm; const n = id === 'combo' ? d.combo.filter((c) => !c.an).length : ban.filter((s) => s.danhMuc === id).length; x.textContent = n + ' sản phẩm'; });

  /* ---------- combo ---------- */
  const goiY = NG.tdee.ganNhat();
  $('[data-combo-list]').innerHTML = d.combo.filter((c) => !c.an).map((c) => NG.ui.theCombo(c, { gon: true, noiBat: goiY ? goiY.comboGoiY === c.ma : c.mucTieuKcal === 1500, nhanNoiBat: goiY ? 'Hợp với bạn' : 'Bán chạy' })).join('');

  /* ---------- sản phẩm theo tab ---------- */
  const luoi = $('[data-luoi-sp]'); const xemHet = $('[data-xem-het]');
  const veTab = (tab) => {
    let ds;
    if (tab === 'ban-chay') ds = ban.filter((s) => s.noiBat).concat(ban.filter((s) => !s.noiBat && s.conHang));
    else ds = ban.filter((s) => (s.mucTieu || []).includes(tab)).sort((a, b) => (b.conHang - a.conHang) || (b.noiBat - a.noiBat));
    luoi.innerHTML = ds.slice(0, 8).map((s) => NG.ui.the(s, d)).join('');
    xemHet.href = tab === 'ban-chay' ? 'products.html' : 'products.html?muctieu=' + tab;
  };
  $('[data-tab-sp]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    $$('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b))); veTab(b.dataset.tab);
  });
  veTab('ban-chay');

  /* ---------- bài viết ---------- */
  try { const b = await NG.duLieu.blog(); $('[data-blog]').innerHTML = b.baiViet.slice().sort((x, y) => y.ngay.localeCompare(x.ngay)).slice(0, 3).map(NG.ui.theBaiViet).join(''); } catch (e) { /* bỏ qua */ }

  /* ---------- TDEE nhanh ---------- */
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
    box.innerHTML = '<div class="kq-big"><div><b>' + so(kq.tdee) + '</b><span>kcal/ngày (vận động nhẹ)</span></div><div><b>' + so(kq.mucTieuKcal) + '</b><span>Mục tiêu ' + esc(kq.tenMucTieu.toLowerCase()) + '</span></div></div>' +
      '<div class="kq-combo"><img src="' + NG.anh(c.anh, true) + '" alt=""><div><span class="xs muted">Gợi ý cho bạn</span><div class="t">' + esc(c.ten) + '</div><span class="small">' + tien(c.gia) + '</span></div></div>' +
      '<div class="flex gap-1 mt-1"><a class="btn btn--sm" href="tdee.html?tuoi=' + tuoi + '&cao=' + cao + '&nang=' + nang + '&gt=' + gt + '&mt=' + kq.mucTieu + '">Xem chi tiết</a><button class="btn btn--primary btn--sm" type="button" data-them-gio="' + c.ma + '" data-nguon="tdee">Thêm trọn gói</button></div>';
    box.hidden = false;
  });
})();
