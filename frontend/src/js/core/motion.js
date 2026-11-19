/* =========================================================================
   NutriGreen UI 2.0 – chuyển động & vi tương tác (đi cùng css/base/theme.css)
   -------------------------------------------------------------------------
   - Xuất hiện khi cuộn (theo nhóm, so le), kể cả nội dung vẽ lại bằng JS (lọc sản phẩm…)
   - Đếm số (kcal combo, cam kết, NutriCoins…) khi khối hiện ra
   - Thẻ sản phẩm nghiêng 3D theo chuột, thẻ combo có "đèn rọi"
   - Gợn sóng khi bấm nút, ảnh sản phẩm bay vào giỏ + giỏ nảy khi số lượng đổi
   - Thanh tiến độ cuộn, nút về đầu trang, dải thông điệp chạy trên điện thoại
   - Nút tìm kiếm trên điện thoại (mở menu, con trỏ đặt sẵn ở ô tìm)
   Không đổi dữ liệu hay luồng nghiệp vụ; tắt hiệu ứng khi người dùng chọn giảm chuyển động.
   ========================================================================= */
(function () {
  'use strict';
  // Mức chuyển động: 'full' | 'soft' | 'off'. Khách chọn ở chân trang (lưu ng.hieuUng);
  // chưa chọn thì theo hệ điều hành: bật "giảm chuyển động" → 'soft' (vẫn có phản hồi hover, bỏ chuyển động lớn).
  const MUC = ['full', 'soft', 'off'];
  let chon = null; try { chon = JSON.parse(localStorage.getItem('ng.hieuUng')); } catch (e) { /* bỏ qua */ }
  const muc = MUC.includes(chon) ? chon : (window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'soft' : 'full');
  const giam = muc === 'off'; const nhe = muc === 'soft';
  const coChuot = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, g = document) => g.querySelector(s);
  const $$ = (s, g = document) => Array.from(g.querySelectorAll(s));
  document.documentElement.classList.add('motion-' + muc); if (!giam) document.documentElement.classList.add('motion');

  /* ---------------- xuất hiện khi cuộn ---------------- */
  // nhóm: các con hiện lần lượt khi nhóm vào khung nhìn (hoạt động cả với hàng trượt ngang)
  const NHOM = '.rail, .grid, .combos, .goals, .trust-strip__in, .site-footer__grid, .gifts, .stats, .cats, .pd__info, .day-plan';
  // khối đơn lẻ
  const DON = '.section-head, .quick-tdee__text, .quick-tdee__form, .tdee-nudge, .remind, .reviews__sum, .pd-sec h2, .coin-hero, .ticker-band, .lookup';
  const LOAI_TRU = '.modal, .hover-pop__box, .site-header, .drawer, .search__suggest, .chat-fab, .filters';
  const nhomHien = new WeakSet();

  const hien = (el, i) => {
    el.style.setProperty('--i', Math.min(i, 8));
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('is-in')));
    // dọn class sau khi xong để hiệu ứng hover của thẻ hoạt động bình thường
    setTimeout(() => { el.classList.remove('rv', 'is-in'); el.style.removeProperty('--i'); }, 900 + Math.min(i, 8) * 70);
  };
  const io = giam ? null : new IntersectionObserver((ds) => ds.forEach((d) => {
    const el = d.target;
    if (el.matches(NHOM)) {
      if (d.isIntersecting) { nhomHien.add(el); $$(':scope > .rv:not(.is-in)', el).forEach((c, i) => hien(c, i)); }
      return;
    }
    if (d.isIntersecting) { io.unobserve(el); hien(el, 0); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  function chuanBi(goc) {
    if (giam) return;
    $$(NHOM, goc).concat(goc.matches && goc.matches(NHOM) ? [goc] : []).forEach((n) => {
      if (n.closest(LOAI_TRU)) return;
      const moi = Array.from(n.children).filter((c) => !c.dataset.rv && !c.classList.contains('skeleton'));
      if (!moi.length) return;
      moi.forEach((c) => { c.dataset.rv = '1'; c.classList.add('rv'); });
      if (nhomHien.has(n)) moi.forEach((c, i) => hien(c, i)); // nhóm đang trong màn hình (ví dụ lọc lại sản phẩm)
      else io.observe(n);
    });
    $$(DON, goc).forEach((el) => {
      if (el.dataset.rv || el.closest(LOAI_TRU)) return;
      el.dataset.rv = '1'; el.classList.add('rv'); io.observe(el);
    });
  }

  /* ---------------- đếm số ---------------- */
  const DEM = '.combo-card__kcal, .trust-item__ico, .coin-hero b, .stat b, .reviews__avg, .kq-big b, .promise__n';
  const dem = (el) => {
    const t = Array.from(el.childNodes).find((n) => n.nodeType === 3 && /\d/.test(n.nodeValue)); if (!t) return;
    const m = t.nodeValue.match(/^(\D*?)(\d[\d.]*)(?![\d,])(.*)$/s); if (!m) return;
    const dich = parseInt(m[2].replace(/\./g, ''), 10); if (!dich || dich < 5) return;
    const coCham = m[2].includes('.') || dich >= 1000; const bd = performance.now(); const tg = 1100;
    const ve = (n) => m[1] + (coCham ? n.toLocaleString('vi-VN') : String(n)) + m[3];
    let xong = false;
    const buoc = (bay) => { if (xong) return; const p = Math.max(0, Math.min((bay - bd) / tg, 1)); /* khung hình đầu có thể sớm hơn mốc bắt đầu */ const e = 1 - Math.pow(1 - p, 3); t.nodeValue = ve(Math.round(dich * e)); if (p < 1) requestAnimationFrame(buoc); else xong = true; };
    requestAnimationFrame(buoc);
    // luôn chốt đúng con số cuối, kể cả khi thẻ trình duyệt bị ẩn giữa chừng (rAF tạm dừng)
    setTimeout(() => { xong = true; t.nodeValue = ve(dich); }, tg + 250);
  };
  const ioDem = giam ? null : new IntersectionObserver((ds) => ds.forEach((d) => { if (d.isIntersecting) { ioDem.unobserve(d.target); dem(d.target); } }), { threshold: 0.6 });
  const quetDem = (goc) => { if (giam) return; $$(DEM, goc).forEach((el) => { if (el.dataset.dem) return; el.dataset.dem = '1'; ioDem.observe(el); }); };

  /* ---------------- theo dõi nội dung vẽ bằng JS ---------------- */
  let hen = null;
  const quet = () => { hen = null; chuanBi(document.body); quetDem(document.body); };
  new MutationObserver(() => { if (!hen) hen = requestAnimationFrame(quet); }).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', quet); else quet();

  /* ---------------- nghiêng 3D thẻ sản phẩm & đèn rọi thẻ combo ---------------- */
  if (coChuot && muc === 'full') {
    let the = null;
    document.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest('.pcard, .combo-card');
      if (the && the !== c) { the.style.removeProperty('--rx'); the.style.removeProperty('--ry'); }
      the = c; if (!c) return;
      const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
      if (c.classList.contains('pcard')) { c.style.setProperty('--rx', ((0.5 - y) * 6).toFixed(2) + 'deg'); c.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg'); }
      else { c.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); c.style.setProperty('--my', (y * 100).toFixed(1) + '%'); }
    }, { passive: true });
  }

  /* ---------------- rê chuột lên thẻ sản phẩm: xem lần lượt ảnh phụ ----------------
     Dừng chuột ~0,4 giây mới bắt đầu (lướt ngang qua không bị nháy ảnh); mỗi ảnh ~1,2 giây;
     chỉ đổi khi ảnh đã tải xong; rời chuột thì trả về ảnh chính. Đây là xem trước, không phải trang trí,
     nên vẫn chạy ở mức "Nhẹ" – chỉ tắt khi khách chọn "Tắt". */
  if (coChuot) {
    let dang = null; // { the, img, goc, ds, i, hen, cho, cham }
    const dung = () => {
      if (!dang) return; clearTimeout(dang.cho); clearInterval(dang.hen);
      dang.img.src = dang.goc; dang.img.classList.remove('is-preview'); if (dang.cham) dang.cham.remove(); dang = null;
    };
    const tai = (url) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(true); im.onerror = () => ok(false); im.src = url; });
    const doi = async (s) => {
      for (let lan = 0; lan < s.ds.length; lan++) {
        s.i = (s.i + 1) % s.ds.length; const url = s.ds[s.i];
        if (await tai(url)) { if (dang !== s) return; s.img.src = url; s.img.classList.add('is-preview'); $$('i', s.cham).forEach((c, k) => c.classList.toggle('on', k === s.i)); return; }
        s.ds.splice(s.i, 1); s.i--; if (s.cham) s.cham.lastChild && s.cham.lastChild.remove(); // ảnh phụ chưa có file: bỏ qua
        if (s.ds.length < 2) return;
      }
    };
    document.addEventListener('mouseover', (e) => {
      const the = e.target.closest && e.target.closest('.pcard'); if (dang && dang.the === the) return;
      dung(); if (!the || giam) return;
      const media = the.querySelector('.pcard__media[data-anh-phu]'); const img = media && media.querySelector('img'); if (!img) return;
      const goc = img.getAttribute('src');
      const s = dang = { the, img, goc, ds: [goc].concat(media.dataset.anhPhu.split('|')), i: 0, hen: null, cham: null };
      s.cho = setTimeout(() => {
        if (dang !== s) return;
        s.cham = document.createElement('span'); s.cham.className = 'pcard__dots'; s.cham.setAttribute('aria-hidden', 'true');
        s.cham.innerHTML = s.ds.map((x, k) => '<i' + (k ? '' : ' class="on"') + '></i>').join(''); media.appendChild(s.cham);
        doi(s); s.hen = setInterval(() => doi(s), 1200);
      }, 400);
    });
    document.addEventListener('mouseleave', dung);
  }

  /* ---------------- gợn sóng khi bấm ---------------- */
  if (!giam) {
    document.addEventListener('pointerdown', (e) => {
      const b = e.target.closest && e.target.closest('.btn, .pcard__add, .chat-fab__btn'); if (!b || b.disabled) return;
      const r = b.getBoundingClientRect(); const d = Math.max(r.width, r.height);
      const s = document.createElement('span'); s.className = 'ripple';
      s.style.cssText = 'width:' + d + 'px;height:' + d + 'px;left:' + (e.clientX - r.left - d / 2) + 'px;top:' + (e.clientY - r.top - d / 2) + 'px';
      if (getComputedStyle(b).position === 'static') b.style.position = 'relative';
      b.appendChild(s); setTimeout(() => s.remove(), 650);
    });
  }

  /* ---------------- ảnh bay vào giỏ + giỏ nảy ---------------- */
  const nutGio = () => $$('.hover-pop[data-pop="gio-hang"] .icon-btn').find((x) => x.offsetParent !== null);
  const nay = (el) => { if (!el) return; el.classList.remove('is-bump'); void el.offsetWidth; el.classList.add('is-bump'); };
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-them-gio]'); if (!t || t.disabled) return;
    if (t.classList.contains('pcard__add')) { t.classList.remove('is-added'); void t.offsetWidth; t.classList.add('is-added'); }
    const dich = nutGio(); if (muc !== 'full' || !dich) return;
    const khung = t.closest('.pcard, .combo-card, .kq-combo, .pd, .upsell, .remind, .ocard, tr, .line, section, article');
    const img = khung && (khung.querySelector('.pcard__media img, .pd__media img, img')); if (!img) return;
    const a = img.getBoundingClientRect(); if (!a.width) return;
    const b = dich.getBoundingClientRect(); const kt = Math.min(a.width, 90);
    const bay = img.cloneNode(); bay.removeAttribute('loading'); bay.className = 'fly-img';
    bay.style.cssText = 'left:' + (a.left + a.width / 2 - kt / 2) + 'px;top:' + (a.top + a.height / 2 - kt / 2) + 'px;width:' + kt + 'px;height:' + kt + 'px';
    document.body.appendChild(bay);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2); const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const an = bay.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * 0.5 + 'px,' + (dy * 0.5 - 90) + 'px) scale(.7) rotate(-20deg)', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.15) rotate(-40deg)', opacity: 0.4 }
    ], { duration: 750, easing: 'cubic-bezier(.5,0,.2,1)' });
    an.onfinish = () => { bay.remove(); nay(dich); };
  }, true); // pha capture: chạy trước common.js (vốn khóa nút ngay khi bấm)
  // số lượng giỏ / yêu thích thay đổi (kể cả từ thẻ khác) → nút nảy
  const theoDoiDem = () => $$('[data-dem]').forEach((c) => {
    if (c.dataset.theoDoi) return; c.dataset.theoDoi = '1'; let cu = c.textContent;
    new MutationObserver(() => { if (c.textContent !== cu && +c.textContent > +cu) nay(c.closest('.icon-btn')); cu = c.textContent; }).observe(c, { childList: true, characterData: true, subtree: true });
  });

  /* ---------------- thanh tiến độ cuộn + nút về đầu trang ---------------- */
  const thanh = document.createElement('div'); thanh.className = 'scroll-progress'; thanh.setAttribute('aria-hidden', 'true');
  const veDau = document.createElement('button'); veDau.type = 'button'; veDau.className = 'to-top'; veDau.setAttribute('aria-label', 'Về đầu trang');
  veDau.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  veDau.addEventListener('click', () => window.scrollTo({ top: 0, behavior: giam ? 'auto' : 'smooth' }));
  let cho = false;
  const capNhatCuon = () => {
    cho = false; const h = document.documentElement.scrollHeight - innerHeight; const p = h > 0 ? Math.min(scrollY / h, 1) : 0;
    thanh.style.setProperty('--p', p.toFixed(4)); veDau.style.setProperty('--p', (p * 100).toFixed(1)); veDau.classList.toggle('is-on', scrollY > 700);
  };
  window.addEventListener('scroll', () => { if (!cho) { cho = true; requestAnimationFrame(capNhatCuon); } }, { passive: true });

  /* ---------------- dải thông điệp chạy (điện thoại) ---------------- */
  function taoTicker() {
    const in_ = $('.topbar__in'); if (!in_ || in_.querySelector('.ticker')) return;
    const msgs = $$('.topbar__msg', in_); if (msgs.length < 2) return;
    const t = document.createElement('div'); t.className = 'ticker'; t.setAttribute('aria-hidden', 'true');
    const html = msgs.map((m) => '<p>' + m.innerHTML + '</p>').join('<p aria-hidden="true">•</p>');
    t.innerHTML = '<div class="ticker__track">' + html + '<p>•</p>' + html + '<p>•</p></div>';
    in_.appendChild(t); in_.closest('.topbar').classList.add('has-ticker');
  }

  /* ---------------- nút tìm kiếm trên điện thoại ---------------- */
  function taoNutTim() {
    const hop = $('.header-actions'); const mo = $('[data-mo-menu]'); if (!hop || !mo || $('.site-header__search')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'icon-btn site-header__search'; b.setAttribute('aria-label', 'Tìm sản phẩm');
    b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
    b.addEventListener('click', () => mo.click());
    hop.insertBefore(b, hop.firstChild);
  }

  /* ---------------- công tắc mức chuyển động (chân trang) ---------------- */
  function taoCongTac() {
    const d = $('.site-footer__bottom'); if (!d || $('.motion-pref', d)) return;
    const w = document.createElement('div'); w.className = 'motion-pref';
    w.innerHTML = '<span id="nhan-hieu-ung">Hiệu ứng</span><div class="seg" role="group" aria-labelledby="nhan-hieu-ung">' +
      [['full', 'Đầy đủ'], ['soft', 'Nhẹ'], ['off', 'Tắt']].map(([k, t]) => '<button type="button" data-hieu-ung="' + k + '" aria-pressed="' + (k === muc) + '">' + t + '</button>').join('') + '</div>';
    w.addEventListener('click', (e) => { const b = e.target.closest('[data-hieu-ung]'); if (!b || b.dataset.hieuUng === muc) return; try { localStorage.setItem('ng.hieuUng', JSON.stringify(b.dataset.hieuUng)); } catch (er) { /* bỏ qua */ } location.reload(); });
    d.appendChild(w);
  }

  function khoiDong() {
    document.body.appendChild(thanh); capNhatCuon(); taoTicker(); taoNutTim(); theoDoiDem(); taoCongTac();
    // nút chat được common.js tạo sau khi nạp dữ liệu → gắn nút về đầu trang vào cùng cụm
    const gan = () => { const f = $('.chat-fab'); if (f) { if (!f.contains(veDau)) f.insertBefore(veDau, f.firstChild); return true; } return false; };
    if (!gan()) { const mo = new MutationObserver(() => { if (gan()) mo.disconnect(); }); mo.observe(document.body, { childList: true }); }
    if (window.NG && NG.sanSang) NG.sanSang.then(theoDoiDem);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', khoiDong); else khoiDong();
})();
