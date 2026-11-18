/* =========================================================================
   NutriGreen – lõi giao diện khách hàng (dùng chung cho mọi trang)
   -------------------------------------------------------------------------
   NG.duLieu   đọc mock-data/*.json, tính sẵn kcal/protein theo khẩu phần, combo
   NG.kho      localStorage (tiền tố "ng.") – xem "Hợp đồng dữ liệu" trong README
   NG.gio      giỏ hàng + tính tiền, mã giảm giá, phí giao (FR04, FR05, FR06)
   NG.taiKhoan đăng ký (OTP), đăng nhập, hồ sơ (FR08)
   NG.donHang  tạo đơn, hủy, tra cứu, đặt lại combo (FR09, FR16)
   NG.doiTra   yêu cầu đổi trả 7 ngày (FR10) · NG.danhGia đánh giá nhận xu (FR11)
   NG.xu       NutriCoins: số dư, đổi voucher (FR11)
   NG.tdee     công thức Mifflin-St Jeor + gợi ý combo (FR02), lưu lịch sử
   NG.track    đo lường: dataLayer (GA4/Meta Pixel), UTM, sự kiện cho dashboard
   NG.ui       toast, modal, thẻ sản phẩm, đầu trang, chat, popup nhận mã
   ========================================================================= */
(function () {
  'use strict';
  const NG = (window.NG = window.NG || {});
  const DUONG = { duLieu: '../../../mock-data/', anh: '../../../public/images/' };

  /* ------------------------------------------------------------------ tiện ích */
  const $ = (s, g = document) => g.querySelector(s);
  const $$ = (s, g = document) => Array.from(g.querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const so = (n, le = 0) => Number(n || 0).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: le });
  const tien = (n) => so(Math.round(n)) + 'đ';
  const hai = (n) => String(n).padStart(2, '0');
  const ngay = (d) => { const x = new Date(d); return hai(x.getDate()) + '/' + hai(x.getMonth() + 1) + '/' + x.getFullYear(); };
  const gio = (d) => { const x = new Date(d); return hai(x.getHours()) + ':' + hai(x.getMinutes()) + ' ' + ngay(x); };
  const khongDau = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const ngauNhien = (n) => { let s = ''; for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; };
  const yymmdd = (d = new Date()) => String(d.getFullYear()).slice(2) + hai(d.getMonth() + 1) + hai(d.getDate());
  const qs = (k) => new URLSearchParams(location.search).get(k);
  const sdtHopLe = (s) => /^0(3|5|7|8|9)\d{8}$/.test(String(s || '').replace(/\s/g, ''));
  const emailHopLe = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
  const chuanSdt = (s) => String(s || '').replace(/\D/g, '');
  const anh = (key, nho) => DUONG.anh + 'products/' + key + (nho ? '-sm' : '') + '.webp';
  const lamTron1 = (n) => Math.round(n * 10) / 10;
  NG.bam = (c) => bam(c);
  Object.assign(NG, { $, $$, esc, so, tien, ngay, gioNgay: gio, khongDau, qs, sdtHopLe, emailHopLe, chuanSdt, anh, DUONG, lamTron1 });

  /* đường dẫn trang (cùng thư mục src/pages/client/) */
  NG.url = function (ten, thamSo) {
    const map = { chiTiet: 'product-detail.html', products: 'products.html', tdee: 'tdee.html', gioHang: 'cart.html', thanhToan: 'checkout.html', ketQua: 'order-success.html', taiKhoan: 'account.html', donHang: 'orders.html', viUuDai: 'rewards.html', blog: 'blog.html', baiViet: 'blog-post.html', trangChu: 'index.html', lienHe: 'contact.html', chinhSach: 'policy.html' };
    let u = map[ten] || ten;
    if (!/\.html/.test(u)) u += '.html';
    if (thamSo) { const q = new URLSearchParams(thamSo).toString(); if (q) u += '?' + q; }
    return u;
  };

  /* ------------------------------------------------------------------ kho localStorage */
  const TIEN_TO = 'ng.';
  const boNhoTam = {};
  NG.kho = {
    doc(k, macDinh) {
      try { const v = localStorage.getItem(TIEN_TO + k); return v == null ? macDinh : JSON.parse(v); }
      catch (e) { return k in boNhoTam ? boNhoTam[k] : macDinh; }
    },
    ghi(k, v) {
      try { localStorage.setItem(TIEN_TO + k, JSON.stringify(v)); }
      catch (e) { boNhoTam[k] = v; if (e && e.name === 'QuotaExceededError') NG.ui && NG.ui.toast('Bộ nhớ trình duyệt đã đầy, ảnh đính kèm có thể không được lưu.', 'error'); }
      window.dispatchEvent(new CustomEvent('ng:doi', { detail: { khoa: k } }));
    },
    xoa(k) { try { localStorage.removeItem(TIEN_TO + k); } catch (e) { delete boNhoTam[k]; } window.dispatchEvent(new CustomEvent('ng:doi', { detail: { khoa: k } })); }
  };
  // đồng bộ giữa các thẻ trình duyệt (vd. thẻ quản trị đổi trạng thái đơn)
  window.addEventListener('storage', (e) => { if (e.key && e.key.indexOf(TIEN_TO) === 0) window.dispatchEvent(new CustomEvent('ng:doi', { detail: { khoa: e.key.slice(3), tuTheKhac: true } })); });

  /* ------------------------------------------------------------------ dữ liệu */
  const cache = {};
  const taiJson = (ten) => cache[ten] || (cache[ten] = fetch(DUONG.duLieu + ten, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error('Không tải được ' + ten); return r.json(); }));

  function tinhDinhDuong(sp) {
    const n = sp.dinhDuong.tren100g, kp = sp.dinhDuong.khauPhan.g, f = kp / 100;
    sp.kp = { g: kp, kcal: Math.round(n.kcal * f), protein: lamTron1(n.protein * f), beo: lamTron1(n.beo * f), carb: lamTron1(n.carb * f), xo: lamTron1(n.xo * f), duong: lamTron1(n.duong * f) };
    sp.kcalGoi = Math.round(n.kcal * sp.khoiLuong / 100);
    const eP = n.protein * 4, eC = (n.carb - n.xo) * 4 + n.xo * 2, eF = n.beo * 9, tong = eP + eC + eF;
    sp.tyLe = { p: Math.round(eP / tong * 100), c: Math.round(eC / tong * 100), f: 100 - Math.round(eP / tong * 100) - Math.round(eC / tong * 100) };
  }

  NG.duLieu = {
    async coBan() {
      if (this._p) return this._p;
      this._p = Promise.all([taiJson('products.json'), taiJson('config.json'), taiJson('categories.json')]).then(([sp, ch, dm]) => {
        const sua = NG.kho.doc('qtSanPham', {}); // trang quản trị (Đoàn) có thể ghi đè giá / tồn / ẩn
        // dữ liệu do trang quản trị ghi: sản phẩm mới, danh mục đổi tên/ẩn, tồn kho theo lô (xuất theo hạn dùng gần nhất trước)
        const qtLo = NG.kho.doc('qtLo', {}); const qtDm = NG.kho.doc('qtDanhMuc', {});
        dm = Object.assign({}, dm); dm.danhMucTatCa = dm.danhMuc.map((m) => Object.assign({}, m, qtDm[m.id] || {})); Object.keys(qtDm).forEach((id) => { if (qtDm[id].moi && !dm.danhMucTatCa.some((m) => m.id === id)) dm.danhMucTatCa.splice(dm.danhMucTatCa.length - 1, 0, Object.assign({ id }, qtDm[id])); }); dm.danhMuc = dm.danhMucTatCa.filter((m) => !m.an);
        const dmAn = new Set(dm.danhMucTatCa.filter((m) => m.an).map((m) => m.id));
        const ds = sp.sanPham.concat(NG.kho.doc('qtSanPhamMoi', [])).map((s0) => {
          const x = Object.assign({}, s0, sua[s0.ma] || {});
          if (qtLo[x.ma]) { x.cacLo = qtLo[x.ma].slice().sort((a, b) => a.hsd.localeCompare(b.hsd)); x.ton = x.cacLo.reduce((t, l) => t + l.sl, 0); const f = x.cacLo.find((l) => l.sl > 0); if (f) x.lo = f; }
          else x.cacLo = [Object.assign({}, x.lo, { sl: x.ton })];
          x.anDoDanhMuc = dmAn.has(x.danhMuc); if (x.anDoDanhMuc) x.an = true;
          return x;
        });
        const theoMa = {}; ds.forEach((s) => { tinhDinhDuong(s); s.conHang = s.ton > 0; theoMa[s.ma] = s; });
        const combo = sp.combo.map((c0) => {
          const c = Object.assign({}, c0, sua[c0.ma] || {}); if (dmAn.has('combo')) c.an = true;
          let giaLe = 0, kcal = 0, pro = 0, beo = 0, carb = 0, duong = 0, conHang = true;
          c.thanhPhanDayDu = c.thanhPhan.map((t) => {
            const cacLua = t.chon ? t.chon.map((m) => theoMa[m]) : [theoMa[t.ma]];
            const s = cacLua[0];
            giaLe += s.gia * t.soLuong;
            const f = s.khoiLuong / 100 * t.soLuong, n = s.dinhDuong.tren100g;
            kcal += n.kcal * f; pro += n.protein * f; beo += n.beo * f; carb += n.carb * f; duong += n.duong * f;
            if (!t.chon && !s.conHang) conHang = false;
            if (t.chon && !cacLua.some((x) => x.conHang)) conHang = false;
            return { soLuong: t.soLuong, sp: s, cacLua, laLuaChon: !!t.chon };
          });
          Object.assign(c, {
            giaLe, tietKiem: giaLe - c.gia, phanTramTietKiem: Math.round((giaLe - c.gia) / giaLe * 100),
            kcal7: Math.round(kcal), kcalNgay: Math.round(kcal / c.soNgay), proteinNgay: Math.round(pro / c.soNgay),
            beoNgay: Math.round(beo / c.soNgay), carbNgay: Math.round(carb / c.soNgay), duongNgay: lamTron1(duong / c.soNgay),
            phanTramMucTieu: Math.round(kcal / c.soNgay / c.mucTieuKcal * 100), conHang, ton: conHang ? 99 : 0, quyCach: 'Gói 7 ngày'
          });
          const eP = pro * 4, eF = beo * 9, eC = Math.max(kcal - eP - eF, 0);
          c.tyLe = { p: Math.round(eP / kcal * 100), f: Math.round(eF / kcal * 100), c: 100 - Math.round(eP / kcal * 100) - Math.round(eF / kcal * 100) };
          c.kp = { kcal: c.kcalNgay, protein: c.proteinNgay };
          theoMa[c.ma] = c;
          return c;
        });
        const an = (x) => !x.an;
        return { sanPham: ds.filter(an), combo: combo.filter(an), tatCa: combo.filter(an).concat(ds.filter(an)), theoMa, cauHinh: ch, danhMuc: dm, keCaAn: { sanPham: ds, combo } };
      });
      return this._p;
    },
    tinh: () => taiJson('provinces.json'),
    blog: () => taiJson('blog.json'),
    tenDanhMuc(d, id) { const x = (d.danhMuc.danhMucTatCa || d.danhMuc.danhMuc).find((m) => m.id === id); return x ? x.ten : ''; },
    tenMucTieu(d, id) { const x = d.danhMuc.mucTieu.find((m) => m.id === id); return x ? x.ten : ''; }
  };

  /* ------------------------------------------------------------------ đo lường */
  // Ghi sự kiện: đẩy vào window.dataLayer (GA4 / GTM / Meta Pixel đọc được khi gắn mã thật)
  // và lưu ng.suKien để dashboard quản trị thống kê (lượt tính TDEE, lượt xem combo gợi ý…).
  window.dataLayer = window.dataLayer || [];
  NG.track = function (ten, data) {
    const ev = Object.assign({ event: ten }, data || {});
    window.dataLayer.push(ev);
    const ds = NG.kho.doc('suKien', []);
    ds.push({ ten, luc: new Date().toISOString(), trang: location.pathname.split('/').pop(), data: data || {}, nguon: NG.nguon() });
    NG.kho.ghi('suKien', ds.slice(-800));
  };
  // Nguồn truy cập theo UTM (mục 3.4.3: mọi link về website gắn UTM)
  (function luuUtm() {
    const p = new URLSearchParams(location.search), utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach((k) => { if (p.get(k)) utm[k] = p.get(k); });
    if (Object.keys(utm).length) {
      utm.luc = new Date().toISOString();
      try { sessionStorage.setItem('ng.utm', JSON.stringify(utm)); } catch (e) { /* bỏ qua */ }
      if (!NG.kho.doc('utmDauTien')) NG.kho.ghi('utmDauTien', utm);
    }
  })();
  NG.nguon = function () {
    try { const s = sessionStorage.getItem('ng.utm'); if (s) return JSON.parse(s); } catch (e) { /* bỏ qua */ }
    return document.referrer && document.referrer.indexOf(location.host) === -1 ? { utm_source: 'referral', ref: document.referrer.slice(0, 120) } : { utm_source: '(direct)' };
  };

  /* ------------------------------------------------------------------ đã xem, yêu thích */
  NG.daXem = {
    ds: () => NG.kho.doc('daXem', []),
    them(ma) { const ds = this.ds().filter((x) => x !== ma); ds.unshift(ma); NG.kho.ghi('daXem', ds.slice(0, 24)); },
    xoa(ma) { NG.kho.ghi('daXem', ma ? this.ds().filter((x) => x !== ma) : []); }
  };
  NG.yeuThich = {
    ds: () => NG.kho.doc('yeuThich', []),
    co(ma) { return this.ds().includes(ma); },
    bat(ma) {
      const ds = this.ds(); const co = ds.includes(ma);
      NG.kho.ghi('yeuThich', co ? ds.filter((x) => x !== ma) : [ma].concat(ds));
      if (!co) NG.track('them_yeu_thich', { ma });
      return !co;
    }
  };

  /* ------------------------------------------------------------------ mã giảm giá & giao hàng */
  NG.giaoHang = {
    async luaChon(tenTinh) {
      const { cauHinh } = await NG.duLieu.coBan(); const g = cauHinh.giaoHang;
      if (!tenTinh) return [];
      if (/Hồ Chí Minh/.test(tenTinh)) return g.hcm.map((x) => Object.assign({}, x));
      const ds = (await NG.duLieu.tinh()).tinh; const t = ds.find((x) => x.ten === tenTinh); const v = t ? t.vung : 'bac';
      return [{ ma: g.tinhKhac.ma, donVi: g.tinhKhac.donVi, ten: 'Giao tiêu chuẩn GHTK', phi: g.tinhKhac.phi[v], thoiGian: g.tinhKhac.thoiGian[v] }];
    }
  };

  NG.uuDai = {
    async tim(ma) {
      const { cauHinh } = await NG.duLieu.coBan();
      ma = String(ma || '').trim().toUpperCase(); if (!ma) return null;
      const chung = cauHinh.maUuDai.find((x) => x.ma === ma);
      if (chung) return Object.assign({ nguon: 'chung' }, chung);
      const u = NG.taiKhoan.hienTai();
      const rieng = NG.kho.doc('voucher', []).find((v) => v.ma === ma);
      if (rieng) {
        if (!u || rieng.khachHang !== u.id) return { loi: 'Mã này thuộc ví ưu đãi của tài khoản khác. Vui lòng đăng nhập đúng tài khoản.' };
        if (rieng.daDung) return { loi: 'Mã này đã được sử dụng.' };
        return Object.assign({ nguon: 'vi', loai: 'tien' }, rieng);
      }
      return null;
    },
    // kiểm tra mã với giỏ hàng; trả { giam, loi, uuDai }
    async apDung(ma, ctx) {
      if (!ma) return { giam: 0 };
      const u = await this.tim(ma);
      if (!u) return { giam: 0, loi: 'Mã giảm giá không tồn tại.' };
      if (u.loi) return { giam: 0, loi: u.loi };
      const hom = new Date().toISOString().slice(0, 10);
      if ((u.tu && hom < u.tu) || (u.den && hom > u.den)) return { giam: 0, loi: 'Mã đã hết hạn hoặc chưa đến thời gian áp dụng.' };
      if (u.hetHan && hom > u.hetHan) return { giam: 0, loi: 'Voucher đã hết hạn.' };
      if (u.donToiThieu && ctx.tamTinh < u.donToiThieu) return { giam: 0, loi: 'Đơn tối thiểu ' + tien(u.donToiThieu) + ' để dùng mã này.' };
      if (u.chiCombo && !ctx.tienCombo) return { giam: 0, loi: 'Mã chỉ áp dụng cho đơn có combo theo calo.' };
      if (u.chiDonDau) {
        const tk = NG.taiKhoan.hienTai(); const sdt = ctx.sdt || (tk && tk.sdt);
        const daMua = NG.donHang.tatCa().some((d) => d.trangThai !== 'DaHuy' && ((tk && d.khachHang === tk.id) || (sdt && d.sdt === chuanSdt(sdt))));
        if (daMua) return { giam: 0, loi: 'Mã CHAOBAN10 chỉ dành cho đơn đầu tiên.' };
      }
      let giam = 0;
      if (u.loai === 'phanTram') giam = Math.round((u.chiCombo ? ctx.tienCombo : ctx.tamTinh) * u.giaTri / 100);
      else giam = u.giam || u.giaTri || 0;
      if (u.toiDa) giam = Math.min(giam, u.toiDa);
      giam = Math.min(giam, ctx.tamTinh);
      return { giam: Math.round(giam / 1000) * 1000 || giam, uuDai: u };
    }
  };

  /* ------------------------------------------------------------------ giỏ hàng */
  const khoaDong = (d) => d.ma + '|' + (d.chon || '');
  NG.gio = {
    ds: () => NG.kho.doc('gioHang', []),
    ghi(ds) { NG.kho.ghi('gioHang', ds); },
    soLuong() { return this.ds().reduce((t, d) => t + d.soLuong, 0); },
    async them(ma, soLuong = 1, tuyChon = {}) {
      const d = await NG.duLieu.coBan(); const sp = d.theoMa[ma];
      if (!sp) return false;
      if (!sp.conHang) { NG.ui.toast('Sản phẩm tạm hết hàng.', 'error'); return false; }
      let chon = tuyChon.chon || null;
      if (sp.loai === 'combo' && !chon) { const lc = sp.thanhPhanDayDu.find((t) => t.laLuaChon); chon = lc ? (lc.cacLua.find((x) => x.conHang) || lc.cacLua[0]).ma : null; }
      const ds = this.ds(); const k = khoaDong({ ma, chon }); const co = ds.find((x) => khoaDong(x) === k);
      const toiDa = sp.loai === 'combo' ? 10 : Math.min(sp.ton, 20);
      if (co) { co.soLuong = Math.min(co.soLuong + soLuong, toiDa); if (tuyChon.nguon) co.nguon = tuyChon.nguon; }
      else ds.push({ ma, chon, soLuong: Math.min(soLuong, toiDa), nguon: tuyChon.nguon || null, them: new Date().toISOString() });
      this.ghi(ds);
      NG.track('them_gio', { ma, ten: sp.ten, gia: sp.gia, soLuong, nguon: tuyChon.nguon || null });
      if (!tuyChon.imLang) NG.ui.toast('Đã thêm “' + sp.ten + '” vào giỏ', 'ok', { text: 'Xem giỏ', href: 'cart.html' });
      return true;
    },
    capNhat(khoa, soLuong) { const ds = this.ds(); const d = ds.find((x) => khoaDong(x) === khoa); if (!d) return; if (soLuong <= 0) return this.xoa(khoa); d.soLuong = soLuong; this.ghi(ds); },
    doiLuaChon(khoa, chonMoi) {
      const ds = this.ds(); const d = ds.find((x) => khoaDong(x) === khoa); if (!d) return;
      const trung = ds.find((x) => x !== d && x.ma === d.ma && x.chon === chonMoi);
      if (trung) { trung.soLuong += d.soLuong; ds.splice(ds.indexOf(d), 1); } else d.chon = chonMoi;
      this.ghi(ds);
    },
    xoa(khoa) { this.ghi(this.ds().filter((x) => khoaDong(x) !== khoa)); },
    xoaHet() { this.ghi([]); },
    khoa: khoaDong,
    // tính toàn bộ giỏ: dòng, tạm tính, giảm, phí giao, tổng kcal
    async tinh(opt = {}) {
      const d = await NG.duLieu.coBan(); const ch = d.cauHinh;
      const dong = this.ds().map((x) => {
        const sp = d.theoMa[x.ma]; if (!sp) return null;
        const chonSp = x.chon ? d.theoMa[x.chon] : null;
        let kcal = sp.loai === 'combo' ? sp.kcal7 : sp.kcalGoi, pro = sp.loai === 'combo' ? sp.proteinNgay * sp.soNgay : sp.dinhDuong.tren100g.protein * sp.khoiLuong / 100;
        const toiDa = sp.loai === 'combo' ? 10 : Math.min(sp.ton, 20);
        return { khoa: khoaDong(x), ma: x.ma, chon: x.chon, chonSp, sp, soLuong: x.soLuong, donGia: sp.gia, thanhTien: sp.gia * x.soLuong, kcal: kcal * x.soLuong, protein: pro * x.soLuong, conHang: sp.conHang, toiDa, nguon: x.nguon };
      }).filter(Boolean);
      const tamTinh = dong.reduce((t, x) => t + x.thanhTien, 0);
      const tienCombo = dong.filter((x) => x.sp.loai === 'combo').reduce((t, x) => t + x.thanhTien, 0);
      const ad = await NG.uuDai.apDung(opt.maUuDai, { tamTinh, tienCombo, sdt: opt.sdt });
      const mienPhiTu = ch.giaoHang.mienPhiTu;
      const duMienPhi = tamTinh >= mienPhiTu; // tính trên tiền hàng trước giảm giá
      let phiGiao = null, dichVu = null;
      if (opt.tinh) {
        const lc = await NG.giaoHang.luaChon(opt.tinh);
        dichVu = lc.find((x) => x.ma === opt.dichVu) || lc[0] || null;
        if (dichVu) phiGiao = duMienPhi ? 0 : dichVu.phi;
      }
      const tongTien = Math.max(tamTinh - (ad.giam || 0), 0) + (phiGiao || 0);
      return {
        dong, tamTinh, tienCombo, giam: ad.giam || 0, uuDai: ad.uuDai || null, loiUuDai: ad.loi || '', phiGiao, dichVu, duMienPhi, mienPhiTu,
        conThieu: Math.max(mienPhiTu - tamTinh, 0), tongTien, tongKcal: Math.round(dong.reduce((t, x) => t + x.kcal, 0)),
        tongProtein: Math.round(dong.reduce((t, x) => t + x.protein, 0)), coCombo: tienCombo > 0, soLuong: dong.reduce((t, x) => t + x.soLuong, 0),
        hetHang: dong.filter((x) => !x.conHang)
      };
    }
  };

  /* ------------------------------------------------------------------ tài khoản */
  async function bam(chuoi) {
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('nutrigreen|' + chuoi));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { let h = 5381; for (let i = 0; i < chuoi.length; i++) h = ((h << 5) + h + chuoi.charCodeAt(i)) >>> 0; return 'djb2-' + h.toString(16); }
  }
  NG.taiKhoan = {
    ds: () => NG.kho.doc('khachHang', []),
    hienTai() { const p = NG.kho.doc('phien', null); if (!p) return null; return this.ds().find((u) => u.id === p.id) || null; },
    // OTP mô phỏng (NFR03). Bản thật gửi qua SMS; khi trình bày dùng mã 123456 (xem README).
    guiOtp(sdt) { NG.kho.ghi('otp', { sdt: chuanSdt(sdt), ma: '123456', het: Date.now() + 5 * 60 * 1000 }); return true; },
    kiemOtp(sdt, ma) { const o = NG.kho.doc('otp', null); return !!o && o.sdt === chuanSdt(sdt) && o.ma === String(ma).trim() && Date.now() < o.het; },
    matKhauHopLe: (mk) => typeof mk === 'string' && mk.length >= 8 && /[A-Za-z]/.test(mk) && /\d/.test(mk),
    async dangKy({ hoTen, email, sdt, matKhau, nhanEmail }) {
      const ds = this.ds(); email = String(email).trim().toLowerCase(); sdt = chuanSdt(sdt);
      if (ds.some((u) => u.email === email)) throw new Error('Email đã được đăng ký.');
      if (ds.some((u) => u.sdt === sdt)) throw new Error('Số điện thoại đã được đăng ký.');
      const u = { id: 'KH' + Date.now().toString(36).toUpperCase(), hoTen: String(hoTen).trim(), email, sdt, matKhau: await bam(email + '|' + matKhau), diaChi: [], nhanEmail: !!nhanEmail, taoLuc: new Date().toISOString(), mucTieuKcal: null };
      ds.push(u); NG.kho.ghi('khachHang', ds); NG.kho.ghi('phien', { id: u.id, luc: Date.now() });
      this.lienKetDon(u);
      NG.track('dang_ky', { id: u.id });
      return u;
    },
    async dangNhap(dinhDanh, matKhau) {
      dinhDanh = String(dinhDanh).trim().toLowerCase();
      const u = this.ds().find((x) => x.email === dinhDanh || x.sdt === chuanSdt(dinhDanh));
      if (!u || u.matKhau !== await bam(u.email + '|' + matKhau)) throw new Error('Email/số điện thoại hoặc mật khẩu không đúng.');
      NG.kho.ghi('phien', { id: u.id, luc: Date.now() }); this.lienKetDon(u);
      return u;
    },
    dangXuat() { NG.kho.xoa('phien'); },
    capNhat(thayDoi) {
      const u = this.hienTai(); if (!u) return null; const ds = this.ds(); const i = ds.findIndex((x) => x.id === u.id);
      ds[i] = Object.assign({}, ds[i], thayDoi); NG.kho.ghi('khachHang', ds); return ds[i];
    },
    async doiMatKhau(cu, moi) {
      const u = this.hienTai(); if (!u) throw new Error('Chưa đăng nhập.');
      if (u.matKhau !== await bam(u.email + '|' + cu)) throw new Error('Mật khẩu hiện tại không đúng.');
      if (!this.matKhauHopLe(moi)) throw new Error('Mật khẩu mới tối thiểu 8 ký tự, có chữ và số.');
      this.capNhat({ matKhau: await bam(u.email + '|' + moi) });
    },
    // đơn đặt không cần tài khoản bằng SĐT này sẽ tự gắn vào tài khoản
    lienKetDon(u) {
      const ds = NG.donHang.tatCa(); let doi = false;
      ds.forEach((d) => { if (!d.khachHang && d.sdt === u.sdt) { d.khachHang = u.id; doi = true; } });
      if (doi) NG.kho.ghi('donHang', ds);
    }
  };

  /* ------------------------------------------------------------------ đơn hàng */
  const TT = { ChoXacNhan: 'Chờ xác nhận', DaXacNhan: 'Đang đóng gói', DangGiao: 'Đang giao', DaGiao: 'Đã giao', DaHuy: 'Đã hủy' };
  const TT_MAU = { ChoXacNhan: 'orange', DaXacNhan: 'blue', DangGiao: 'blue', DaGiao: 'green', DaHuy: 'red' };
  const TT_TT = { ChuaThanhToan: 'Chưa thanh toán', ChoDoiSoat: 'Đã báo chuyển khoản – chờ đối soát', DaThanhToan: 'Đã thanh toán', ChoHoanTien: 'Chờ hoàn tiền', DaHoanTien: 'Đã hoàn tiền', ThuKhiNhan: 'Thu tiền khi nhận hàng' };
  NG.donHang = {
    TT, TT_MAU, TT_TT,
    tatCa: () => NG.kho.doc('donHang', []),
    cuaToi() { const u = NG.taiKhoan.hienTai(); return u ? this.tatCa().filter((d) => d.khachHang === u.id).sort((a, b) => b.taoLuc.localeCompare(a.taoLuc)) : []; },
    tim(ma, sdt) { const d = this.tatCa().find((x) => x.ma === String(ma).trim().toUpperCase()); return d && (!sdt || d.sdt === chuanSdt(sdt)) ? d : null; },
    xem(ma) { // chỉ chủ đơn (đã đăng nhập) hoặc người vừa đặt / vừa tra cứu trong phiên này
      const d = this.tatCa().find((x) => x.ma === ma); if (!d) return null;
      const u = NG.taiKhoan.hienTai(); let mo = []; try { mo = JSON.parse(sessionStorage.getItem('ng.donMo') || '[]'); } catch (e) { /* bỏ qua */ }
      return (u && d.khachHang === u.id) || mo.includes(ma) ? d : null;
    },
    moTrongPhien(ma) { try { const mo = JSON.parse(sessionStorage.getItem('ng.donMo') || '[]'); if (!mo.includes(ma)) mo.push(ma); sessionStorage.setItem('ng.donMo', JSON.stringify(mo)); } catch (e) { /* bỏ qua */ } },
    capNhat(ma, fn) { const ds = this.tatCa(); const d = ds.find((x) => x.ma === ma); if (!d) return null; fn(d); NG.kho.ghi('donHang', ds); return d; },
    ghiLichSu(d, trangThai, ghiChu, boi = 'Khách hàng') { d.lichSu = d.lichSu || []; d.lichSu.unshift({ luc: new Date().toISOString(), trangThai, ghiChu, boi }); },
    async tao(p) {
      const kq = await NG.gio.tinh({ maUuDai: p.maUuDai, tinh: p.diaChi.tinh, dichVu: p.dichVu, sdt: p.sdt });
      if (!kq.dong.length) throw new Error('Giỏ hàng trống.');
      if (kq.hetHang.length) throw new Error('Có sản phẩm đã hết hàng trong giỏ, vui lòng xóa trước khi đặt.');
      if (p.maUuDai && kq.loiUuDai) throw new Error(kq.loiUuDai);
      const ds = this.tatCa(); let ma; do { ma = 'NG' + yymmdd() + ngauNhien(4); } while (ds.some((x) => x.ma === ma));
      const u = NG.taiKhoan.hienTai(); const bayGio = new Date();
      const tt = p.thanhToan === 'COD' ? 'ThuKhiNhan' : 'ChuaThanhToan';
      const don = {
        ma, taoLuc: bayGio.toISOString(), khachHang: u ? u.id : null, hoTen: p.hoTen.trim(), sdt: chuanSdt(p.sdt), email: (p.email || '').trim().toLowerCase(),
        diaChi: p.diaChi, ghiChu: p.ghiChu || '',
        dong: kq.dong.map((x) => ({ ma: x.ma, ten: x.sp.ten, loai: x.sp.loai, anh: x.sp.anh, quyCach: x.sp.quyCach, chon: x.chon, tenChon: x.chonSp ? x.chonSp.ten : '', donGia: x.donGia, soLuong: x.soLuong, kcal: Math.round(x.kcal), nguon: x.nguon || null })),
        tamTinh: kq.tamTinh, giam: kq.giam, maUuDai: kq.uuDai ? kq.uuDai.ma : '', phiGiao: kq.phiGiao || 0, tongTien: kq.tongTien,
        tongKcal: kq.tongKcal, coCombo: kq.coCombo, tuTdee: kq.dong.some((x) => x.nguon === 'tdee'),
        vanChuyen: { donVi: kq.dichVu.donVi, dichVu: kq.dichVu.ma, tenDichVu: kq.dichVu.ten, thoiGian: kq.dichVu.thoiGian, maVanDon: '', hanhTrinh: [] },
        thanhToan: { phuongThuc: p.thanhToan, trangThai: tt, hanThanhToan: p.thanhToan === 'COD' ? null : new Date(bayGio.getTime() + 24 * 3600e3).toISOString() },
        trangThai: 'ChoXacNhan', lichSu: [], nhacTaiMua: !!(kq.coCombo && p.nhacTaiMua), nguon: NG.nguon(), checkoutToken: p.token
      };
      // chống đặt trùng khi bấm đúp
      const trung = ds.find((x) => x.checkoutToken && x.checkoutToken === p.token);
      if (trung) return trung;
      this.ghiLichSu(don, 'ChoXacNhan', 'Đặt hàng thành công trên website');
      ds.push(don); NG.kho.ghi('donHang', ds);
      if (kq.uuDai && kq.uuDai.nguon === 'vi') { const v = NG.kho.doc('voucher', []); const x = v.find((y) => y.ma === kq.uuDai.ma); if (x) { x.daDung = ma; NG.kho.ghi('voucher', v); } }
      if (u && p.luuDiaChi) {
        const dc = u.diaChi || []; const chuoi = JSON.stringify(p.diaChi);
        if (!dc.some((x) => JSON.stringify(x.diaChi) === chuoi)) { dc.unshift({ hoTen: don.hoTen, sdt: don.sdt, diaChi: p.diaChi, macDinh: !dc.length }); NG.taiKhoan.capNhat({ diaChi: dc.slice(0, 5) }); }
      }
      NG.gio.xoaHet(); this.moTrongPhien(ma); NG.kho.ghi('daDatHang', true);
      NG.track('dat_hang', { ma, tongTien: don.tongTien, coCombo: don.coCombo, tuTdee: don.tuTdee, thanhToan: p.thanhToan, maUuDai: don.maUuDai });
      return don;
    },
    coTheHuy: (d) => d.trangThai === 'ChoXacNhan',
    huy(ma, lyDo) {
      return this.capNhat(ma, (d) => {
        if (d.trangThai !== 'ChoXacNhan') throw new Error('Đơn đã được xác nhận, vui lòng gọi hotline để được hỗ trợ.');
        d.trangThai = 'DaHuy'; d.huyLuc = new Date().toISOString(); d.lyDoHuy = lyDo;
        if (d.thanhToan.trangThai === 'DaThanhToan' || d.thanhToan.trangThai === 'ChoDoiSoat') d.thanhToan.trangThai = 'ChoHoanTien';
        this.ghiLichSu(d, 'DaHuy', 'Khách hủy đơn: ' + lyDo);
      });
    },
    baoDaChuyenKhoan(ma) {
      return this.capNhat(ma, (d) => { if (d.thanhToan.trangThai === 'ChuaThanhToan') { d.thanhToan.trangThai = 'ChoDoiSoat'; d.thanhToan.baoLuc = new Date().toISOString(); this.ghiLichSu(d, d.trangThai, 'Khách báo đã chuyển khoản, chờ đối soát'); } });
    },
    giaoLuc(d) { const h = (d.lichSu || []).find((x) => x.trangThai === 'DaGiao'); return h ? h.luc : d.giaoLuc || null; },
    hanDoiTra(d) { const g = this.giaoLuc(d); return g ? new Date(new Date(g).getTime() + 7 * 864e5) : null; },
    coTheDoiTra(d) { if (d.trangThai !== 'DaGiao') return false; const h = this.hanDoiTra(d); return !!h && Date.now() <= h.getTime() && !NG.doiTra.cuaDon(d.ma).some((r) => r.trangThai !== 'TuChoi'); },
    async datLai(ma) {
      const d = this.tatCa().find((x) => x.ma === ma); if (!d) return 0; let n = 0;
      for (const x of d.dong) { if (await NG.gio.them(x.ma, x.soLuong, { chon: x.chon, imLang: true, nguon: 'dat-lai' })) n++; }
      NG.track('dat_lai', { ma, coCombo: d.coCombo });
      return n;
    },
    // FR16: combo 7 ngày đã giao từ 5 ngày trước và chưa có đơn combo mới → nhắc đặt lại
    canNhac() {
      const ds = this.cuaToi(); const coMoi = (sau) => ds.some((x) => x.coCombo && x.trangThai !== 'DaHuy' && x.taoLuc > sau);
      return ds.filter((d) => d.coCombo && d.trangThai === 'DaGiao').filter((d) => {
        const g = this.giaoLuc(d); if (!g) return false; const songay = (Date.now() - new Date(g)) / 864e5;
        return songay >= 5 && songay <= 14 && !coMoi(d.taoLuc);
      });
    }
  };

  /* ------------------------------------------------------------------ đổi trả & đánh giá */
  const TT_DT = { DaTiepNhan: 'Đã tiếp nhận', DangXuLy: 'Đang xử lý', DaGiaiQuyet: 'Đã giải quyết', TuChoi: 'Từ chối' };
  NG.doiTra = {
    TT: TT_DT,
    tatCa: () => NG.kho.doc('doiTra', []),
    cuaDon(maDon) { return this.tatCa().filter((r) => r.maDon === maDon); },
    tao(p) {
      const d = NG.donHang.tatCa().find((x) => x.ma === p.maDon);
      if (!d || !NG.donHang.coTheDoiTra(d)) throw new Error('Đơn không còn trong thời hạn đổi trả 7 ngày.');
      const ds = this.tatCa(); const r = Object.assign({ ma: 'DT' + yymmdd() + ngauNhien(3), taoLuc: new Date().toISOString(), trangThai: 'DaTiepNhan', phanHoi: '', lichSu: [{ luc: new Date().toISOString(), trangThai: 'DaTiepNhan', ghiChu: 'Khách gửi yêu cầu' }] }, p);
      ds.push(r); NG.kho.ghi('doiTra', ds); NG.track('gui_doi_tra', { maDon: p.maDon, lyDo: p.lyDo }); return r;
    }
  };
  NG.danhGia = {
    tatCa: () => NG.kho.doc('danhGia', []),
    theoSp(ma) { return this.tatCa().filter((r) => r.maSp === ma && !r.an).sort((a, b) => b.luc.localeCompare(a.luc)); },
    tongHop(ma) { const ds = this.theoSp(ma); const tb = ds.length ? ds.reduce((t, r) => t + r.sao, 0) / ds.length : 0; return { soLuong: ds.length, trungBinh: Math.round(tb * 10) / 10, coAnh: ds.filter((r) => r.anh && r.anh.length).length }; },
    daDanhGia(maDon, maSp) { return this.tatCa().some((r) => r.maDon === maDon && r.maSp === maSp); },
    async tao(p) {
      const u = NG.taiKhoan.hienTai(); if (!u) throw new Error('Vui lòng đăng nhập để đánh giá.');
      if (this.daDanhGia(p.maDon, p.maSp)) throw new Error('Bạn đã đánh giá sản phẩm này trong đơn.');
      const { cauHinh } = await NG.duLieu.coBan(); const xu = p.anh && p.anh.length ? cauHinh.nutriCoins.danhGiaAnh : cauHinh.nutriCoins.danhGiaChu;
      const r = { id: 'DG' + Date.now().toString(36), maSp: p.maSp, maDon: p.maDon, khachHang: u.id, ten: u.hoTen.split(' ').slice(-1)[0] + ' ' + u.hoTen.trim()[0] + '.', sao: p.sao, noiDung: p.noiDung, anh: p.anh || [], luc: new Date().toISOString(), xu, daMua: true, phanHoi: '' };
      const ds = this.tatCa(); ds.push(r); NG.kho.ghi('danhGia', ds);
      NG.xu.ghiGiaoDich(u.id, xu, 'Đánh giá ' + (p.anh && p.anh.length ? 'kèm ảnh' : '') + ' – đơn ' + p.maDon, 'danhGia');
      NG.track('danh_gia', { maSp: p.maSp, sao: p.sao, coAnh: !!(p.anh && p.anh.length) });
      return r;
    }
  };

  /* ------------------------------------------------------------------ NutriCoins */
  NG.xu = {
    lichSu(id) {
      const tuDon = NG.donHang.tatCa().filter((d) => d.khachHang === id && d.trangThai === 'DaGiao')
        .map((d) => ({ luc: NG.donHang.giaoLuc(d) || d.taoLuc, xu: Math.floor((d.tamTinh - d.giam) / 1000), ghiChu: 'Tích lũy đơn ' + d.ma, loai: 'don' }));
      const gd = NG.kho.doc('giaoDichXu', []).filter((x) => x.khachHang === id);
      return tuDon.concat(gd).sort((a, b) => String(b.luc).localeCompare(String(a.luc)));
    },
    soDu(id) { return this.lichSu(id).reduce((t, x) => t + x.xu, 0); },
    choTichLuy(id) { return NG.donHang.tatCa().filter((d) => d.khachHang === id && ['ChoXacNhan', 'DaXacNhan', 'DangGiao'].includes(d.trangThai)).reduce((t, d) => t + Math.floor((d.tamTinh - d.giam) / 1000), 0); },
    ghiGiaoDich(id, xu, ghiChu, loai) { const ds = NG.kho.doc('giaoDichXu', []); ds.push({ khachHang: id, xu, ghiChu, loai, luc: new Date().toISOString() }); NG.kho.ghi('giaoDichXu', ds); },
    async doi(maQua) {
      const u = NG.taiKhoan.hienTai(); if (!u) throw new Error('Vui lòng đăng nhập.');
      const { cauHinh } = await NG.duLieu.coBan(); const q = cauHinh.nutriCoins.doiThuong.find((x) => x.ma === maQua);
      if (!q) throw new Error('Quà không tồn tại.');
      if (this.soDu(u.id) < q.xu) throw new Error('Bạn chưa đủ xu để đổi quà này.');
      const v = { ma: 'NC' + Math.random().toString(36).slice(2, 7).toUpperCase(), khachHang: u.id, ten: q.ten, giam: q.giam, donToiThieu: q.donToiThieu, chiCombo: !!q.chiCombo, hetHan: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10), daDung: null, taoLuc: new Date().toISOString() };
      const ds = NG.kho.doc('voucher', []); ds.push(v); NG.kho.ghi('voucher', ds);
      this.ghiGiaoDich(u.id, -q.xu, 'Đổi ' + q.ten + ' (' + v.ma + ')', 'doiQua');
      NG.track('doi_xu', { qua: q.ma, xu: q.xu });
      return v;
    },
    vi(id) { return NG.kho.doc('voucher', []).filter((v) => v.khachHang === id); }
  };

  /* ------------------------------------------------------------------ TDEE (FR02, FR08) */
  NG.tdee = {
    // Mifflin-St Jeor: BMR = 10×kg + 6,25×cm − 5×tuổi + 5 (nam) / −161 (nữ)
    async tinh({ gioiTinh, tuoi, cao, nang, vanDong, mucTieu }) {
      const { cauHinh } = await NG.duLieu.coBan(); const cf = cauHinh.tdee;
      const bmr = 10 * nang + 6.25 * cao - 5 * tuoi + (gioiTinh === 'nam' ? 5 : -161);
      const tdee = bmr * Number(vanDong);
      const mt = cf.mucTieu.find((m) => m.ma === mucTieu) || cf.mucTieu[1];
      const san = cf.kcalToiThieu[gioiTinh];
      let muc = tdee + mt.dieuChinh; let biChan = false;
      if (mt.dieuChinh < 0 && muc < san) { muc = Math.min(san, tdee); biChan = true; }
      muc = Math.round(muc / 10) * 10;
      const bmi = Math.round(nang / Math.pow(cao / 100, 2) * 10) / 10;
      // ngưỡng BMI của WHO cho người trưởng thành châu Á – Thái Bình Dương
      const phanLoai = bmi < 18.5 ? 'Thiếu cân' : bmi < 23 ? 'Bình thường' : bmi < 25 ? 'Thừa cân' : 'Béo phì';
      const protein = Math.round(nang * mt.proteinGkg);
      const beo = Math.round(muc * 0.28 / 9);
      const carb = Math.max(Math.round((muc - protein * 4 - beo * 9) / 4), 0);
      return { gioiTinh, tuoi, cao, nang, vanDong: Number(vanDong), mucTieu: mt.ma, tenMucTieu: mt.ten, bmr: Math.round(bmr), tdee: Math.round(tdee), mucTieuKcal: muc, biChan, bmi, phanLoaiBmi: phanLoai, macro: { protein, beo, carb }, comboGoiY: mt.combo };
    },
    luu(kq) {
      const u = NG.taiKhoan.hienTai();
      const log = NG.kho.doc('tdeeLog', []); // mọi lượt tính (kể cả khách vãng lai) – dashboard "Thống kê lượt tính TDEE"
      log.push(Object.assign({ luc: new Date().toISOString(), khachHang: u ? u.id : null, nguon: NG.nguon().utm_source }, kq));
      NG.kho.ghi('tdeeLog', log.slice(-1000));
      NG.kho.ghi('tdeeGanNhat', Object.assign({ luc: new Date().toISOString() }, kq));
      if (u) NG.taiKhoan.capNhat({ mucTieuKcal: kq.mucTieuKcal, tdeeGanNhat: kq.tdee });
      NG.track('tdee_tinh', { tdee: kq.tdee, mucTieuKcal: kq.mucTieuKcal, mucTieu: kq.mucTieu, combo: kq.comboGoiY });
    },
    lichSu() { const u = NG.taiKhoan.hienTai(); return u ? NG.kho.doc('tdeeLog', []).filter((x) => x.khachHang === u.id).sort((a, b) => b.luc.localeCompare(a.luc)) : []; },
    ganNhat() { const ls = this.lichSu(); return ls[0] || NG.kho.doc('tdeeGanNhat', null); }
  };

  /* ------------------------------------------------------------------ dữ liệu mẫu để trình bày */
  NG.demo = {
    TAI_KHOAN: { email: 'demo@nutrigreen.vn', matKhau: 'NutriGreen@2026', hoTen: 'Trần Minh Anh', sdt: '0901234567' },
    async taoNeuChua() {
      if (NG.kho.doc('daTaoMau')) return;
      const T = this.TAI_KHOAN; const ds = NG.taiKhoan.ds();
      if (ds.some((u) => u.email === T.email)) { NG.kho.ghi('daTaoMau', true); return; }
      const id = 'KHDEMO01'; const truoc = (ngayTruoc, gioTruoc = 0) => new Date(Date.now() - ngayTruoc * 864e5 - gioTruoc * 3600e3).toISOString();
      ds.push({ id, hoTen: T.hoTen, email: T.email, sdt: T.sdt, matKhau: await bam(T.email + '|' + T.matKhau), nhanEmail: true, taoLuc: truoc(30), mucTieuKcal: 1500, tdeeGanNhat: 1784,
        diaChi: [{ hoTen: T.hoTen, sdt: T.sdt, diaChi: { tinh: 'Thành phố Hồ Chí Minh', phuong: 'Phường Bến Thành', chiTiet: '12 Lê Lợi' }, macDinh: true }] });
      NG.kho.ghi('khachHang', ds);
      const dc = { tinh: 'Thành phố Hồ Chí Minh', phuong: 'Phường Bến Thành', chiTiet: '12 Lê Lợi' };
      const don = (ma, ngayDat, dong, trangThai, extra) => Object.assign({
        ma, taoLuc: truoc(ngayDat), khachHang: id, hoTen: T.hoTen, sdt: T.sdt, email: T.email, diaChi: dc, ghiChu: '', dong,
        tamTinh: dong.reduce((t, x) => t + x.donGia * x.soLuong, 0), giam: 0, maUuDai: '', phiGiao: 0, tongKcal: dong.reduce((t, x) => t + x.kcal, 0),
        coCombo: dong.some((x) => x.loai === 'combo'), tuTdee: false, trangThai, nguon: { utm_source: 'facebook', utm_campaign: 'ra-mat-fanpage' }, nhacTaiMua: true,
        vanChuyen: { donVi: 'AhaMove', dichVu: 'ahamove', tenDichVu: 'Giao trong ngày (nội thành TP.HCM)', thoiGian: 'Trong ngày', maVanDon: '', hanhTrinh: [] },
        thanhToan: { phuongThuc: 'COD', trangThai: 'ThuKhiNhan' }, lichSu: []
      }, extra || {});
      const L = (ma, ten, loai, anh, quyCach, donGia, soLuong, kcal, chon, tenChon) => ({ ma, ten, loai, anh, quyCach, donGia, soLuong, kcal, chon: chon || null, tenChon: tenChon || '' });
      const d1 = don('NG' + yymmdd(new Date(Date.now() - 6 * 864e5)) + '1024', 6, [L('NG-CB-1500', 'Combo Cân bằng 1.500', 'combo', 'combo-1500', 'Gói 7 ngày', 353000, 1, 6540, 'NG-GL-01', 'Bún gạo lứt'), L('NG-HAT-02', 'Hạnh nhân rang mộc', 'san-pham', 'hanh-nhan-rang-moc', 'Hũ 250g', 155000, 1, 1500)], 'DaGiao',
        { lichSu: [{ luc: truoc(5, 3), trangThai: 'DaGiao', ghiChu: 'Giao thành công – AhaMove', boi: 'Hệ thống' }, { luc: truoc(5, 6), trangThai: 'DangGiao', ghiChu: 'Tài xế đã lấy hàng', boi: 'Hệ thống' }, { luc: truoc(6, 1), trangThai: 'DaXacNhan', ghiChu: 'Đã xác nhận, đóng gói', boi: 'NutriGreen' }, { luc: truoc(6), trangThai: 'ChoXacNhan', ghiChu: 'Đặt hàng thành công trên website', boi: 'Khách hàng' }],
          vanChuyen: { donVi: 'AhaMove', dichVu: 'ahamove', tenDichVu: 'Giao trong ngày (nội thành TP.HCM)', thoiGian: 'Trong ngày', maVanDon: 'AHA' + yymmdd() + '88', hanhTrinh: [{ luc: truoc(5, 3), noiDung: 'Giao hàng thành công' }, { luc: truoc(5, 4), noiDung: 'Tài xế đang giao tới địa chỉ nhận' }, { luc: truoc(5, 6), noiDung: 'Tài xế đã lấy hàng tại kho NutriGreen' }] },
          thanhToan: { phuongThuc: 'COD', trangThai: 'DaThanhToan' } });
      d1.tongTien = d1.tamTinh;
      const d2 = don('NG' + yymmdd(new Date(Date.now() - 864e5)) + '3307', 1, [L('NG-GRA-02', 'Granola vị cacao', 'san-pham', 'granola-cacao', 'Túi 300g', 129000, 1, 1410), L('NG-BAN-01', 'Bánh hạt ăn kiêng', 'san-pham', 'banh-hat-an-kieng', 'Hộp 200g', 119000, 1, 1000)], 'DangGiao',
        { phiGiao: 20000, lichSu: [{ luc: truoc(0, 5), trangThai: 'DangGiao', ghiChu: 'Đã bàn giao cho GHTK', boi: 'NutriGreen' }, { luc: truoc(1, -2), trangThai: 'DaXacNhan', ghiChu: 'Đã nhận tiền chuyển khoản, đóng gói', boi: 'NutriGreen' }, { luc: truoc(1), trangThai: 'ChoXacNhan', ghiChu: 'Đặt hàng thành công trên website', boi: 'Khách hàng' }],
          vanChuyen: { donVi: 'GHTK', dichVu: 'ghtk-hcm', tenDichVu: 'Giao tiết kiệm', thoiGian: '1 – 2 ngày', maVanDon: 'S' + ngauNhien(8), hanhTrinh: [{ luc: truoc(0, 1), noiDung: 'Đang trung chuyển tới bưu cục Quận 1' }, { luc: truoc(0, 4), noiDung: 'Đã nhập kho phân loại GHTK Tân Bình' }, { luc: truoc(0, 5), noiDung: 'GHTK đã lấy hàng tại kho NutriGreen' }] },
          thanhToan: { phuongThuc: 'VIETQR', trangThai: 'DaThanhToan' } });
      d2.tongTien = d2.tamTinh + d2.phiGiao;
      const d3 = don('NG' + yymmdd(new Date(Date.now() - 22 * 864e5)) + '5512', 22, [L('NG-HAT-01', 'Hạt mix 5 loại', 'san-pham', 'hat-mix-5-loai', 'Hũ 250g', 169000, 2, 3060)], 'DaGiao',
        { lichSu: [{ luc: truoc(21), trangThai: 'DaGiao', ghiChu: 'Giao thành công', boi: 'Hệ thống' }, { luc: truoc(22), trangThai: 'ChoXacNhan', ghiChu: 'Đặt hàng thành công trên website', boi: 'Khách hàng' }], thanhToan: { phuongThuc: 'COD', trangThai: 'DaThanhToan' } });
      d3.tongTien = d3.tamTinh;
      NG.kho.ghi('donHang', NG.donHang.tatCa().concat([d1, d2, d3]));
      const log = NG.kho.doc('tdeeLog', []);
      log.push({ luc: truoc(12), khachHang: id, gioiTinh: 'nu', tuoi: 28, cao: 160, nang: 58, vanDong: 1.375, mucTieu: 'giam-can', tenMucTieu: 'Giảm cân', bmr: 1269, tdee: 1745, mucTieuKcal: 1250, bmi: 22.7, phanLoaiBmi: 'Bình thường', comboGoiY: 'NG-CB-1200', nguon: 'facebook' });
      log.push({ luc: truoc(2), khachHang: id, gioiTinh: 'nu', tuoi: 28, cao: 160, nang: 57, vanDong: 1.55, mucTieu: 'duy-tri', tenMucTieu: 'Duy trì', bmr: 1259, tdee: 1951, mucTieuKcal: 1950, bmi: 22.3, phanLoaiBmi: 'Bình thường', comboGoiY: 'NG-CB-1500', nguon: '(direct)' });
      NG.kho.ghi('tdeeLog', log);
      NG.kho.ghi('daTaoMau', true);
    }
  };


  /* dữ liệu mẫu 60 ngày (khách, đơn, lượt TDEE, đánh giá, đổi trả) để trang quản trị có số liệu khi trình bày */
  NG.demo.taoMauLon = async function () {
    if (NG.kho.doc('daTaoMau2')) return;
    const d = await NG.duLieu.coBan(); let h = 20261021;
    const rnd = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h / 4294967296; };
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const theoTy = (cap) => { let r = rnd() * cap.reduce((t, x) => t + x[1], 0); for (const x of cap) { r -= x[1]; if (r <= 0) return x[0]; } return cap[0][0]; };
    const HO = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Đặng', 'Bùi', 'Đỗ'], DEM = ['Thị', 'Văn', 'Ngọc', 'Minh', 'Thu', 'Gia', 'Hoài'], TEN = ['Hà', 'Linh', 'Trang', 'Nam', 'Phúc', 'Vy', 'Khoa', 'My', 'Tú', 'Hân', 'Long', 'Nhi', 'Quân', 'Thảo', 'Duy', 'Yến', 'Bảo', 'Châu'];
    const tenNguoi = () => pick(HO) + ' ' + pick(DEM) + ' ' + pick(TEN);
    const TINH = [['Thành phố Hồ Chí Minh', 68], ['Thành phố Hà Nội', 10], ['Tỉnh Đồng Nai', 8], ['Thành phố Đà Nẵng', 6], ['Thành phố Cần Thơ', 5], ['Tỉnh Lâm Đồng', 3]];
    const NGUON = [['facebook', 34], ['tiktok', 22], ['google', 16], ['(direct)', 14], ['zalo', 8], ['koc-minhfit', 6]];
    const truoc = (ng, gio) => new Date(Date.now() - ng * 864e5 - gio * 3600e3);
    const khach = NG.taiKhoan.ds(); const moi = [];
    for (let i = 1; i <= 46; i++) { const ten = tenNguoi(); const u = { id: 'KHM' + hai(i), hoTen: ten, email: khongDau(ten).replace(/\s+/g, '.') + i + '@example.com', sdt: '09' + String(10000000 + Math.floor(rnd() * 89999999)), matKhau: 'x', nhanEmail: rnd() < 0.7, taoLuc: truoc(8 + Math.floor(rnd() * 50), 3).toISOString(), mucTieuKcal: rnd() < 0.6 ? pick([1250, 1400, 1500, 1650, 1800, 2100]) : null, diaChi: [], tinhMau: theoTy(TINH) }; moi.push(u); khach.push(u); }
    NG.kho.ghi('khachHang', khach);
    const sp = d.sanPham.filter((x) => x.conHang); const don = []; const danhGia = NG.danhGia.tatCa(); const gdXu = NG.kho.doc('giaoDichXu', []); let stt = 1000;
    const NX = { 5: ['Giòn, thơm, không bị ngọt gắt. Bảng dinh dưỡng rõ nên mình dễ tính khẩu phần.', 'Đóng gói kỹ, giao nhanh trong ngày. Sẽ mua lại.', 'Đúng như mô tả, hạt mới, không hôi dầu.'], 4: ['Ngon, giá hợp lý. Mong có thêm gói nhỏ để thử vị.', 'Hàng ổn, giao hơi trễ nửa ngày so với dự kiến.'], 3: ['Ăn được nhưng vị hơi nhạt so với mình mong đợi.'], 2: ['Hộp bị móp góc khi nhận, bánh vỡ vài miếng.'] };
    for (let ng = 59; ng >= 0; ng--) {
      const thu = truoc(ng, 0).getDay(); let n = 1 + Math.floor((59 - ng) / 20) + (thu === 0 || thu === 6 ? 1 : 0) + (rnd() < 0.45 ? 1 : 0); if (ng > 45 && rnd() < 0.5) n = Math.max(0, n - 1);
      for (let k = 0; k < n; k++) {
        const u = rnd() < 0.56 ? moi[Math.floor(Math.pow(rnd(), 1.7) * moi.length)] : null; const ten = u ? u.hoTen : tenNguoi(); const tinh = u ? u.tinhMau : theoTy(TINH);
        const luc = truoc(ng, ng === 0 ? rnd() * Math.min(8, new Date().getHours()) : rnd() * 13 - 2); const dong = []; const L = (x, sl, chon) => dong.push({ ma: x.ma, ten: x.ten, loai: x.loai, anh: x.anh, quyCach: x.quyCach, chon: chon ? chon.ma : null, tenChon: chon ? chon.ten : '', donGia: x.gia, soLuong: sl, kcal: Math.round((x.loai === 'combo' ? x.kcal7 : x.kcalGoi) * sl), nguon: null });
        const coCombo = rnd() < 0.36 + (59 - ng) / 600;
        if (coCombo) { const c = d.theoMa[theoTy([['NG-CB-1500', 45], ['NG-CB-1200', 35], ['NG-CB-1800', 20]])]; L(c, 1, pick(c.thanhPhanDayDu.find((t) => t.laLuaChon).cacLua)); if (rnd() < 0.35) L(pick(sp), 1); }
        else { const m = 1 + Math.floor(rnd() * 2.4); const da = new Set(); for (let i = 0; i < m; i++) { const x = rnd() < 0.5 ? pick(sp.filter((y) => y.noiBat)) : pick(sp); if (!da.has(x.ma)) { da.add(x.ma); L(x, rnd() < 0.2 ? 2 : 1); } } }
        const tuTdee = coCombo && rnd() < 0.55; if (tuTdee) dong[0].nguon = 'tdee';
        const tam = dong.reduce((t, x) => t + x.donGia * x.soLuong, 0); const dungMa = rnd() < 0.16; const giam = dungMa ? Math.min(Math.round(tam * 0.1 / 1000) * 1000, 50000) : 0;
        const hcm = /Hồ Chí Minh/.test(tinh); const aha = hcm && rnd() < 0.6; const phi = tam >= 299000 ? 0 : hcm ? (aha ? 25000 : 20000) : 30000;
        const pt = theoTy([['COD', 55], ['VIETQR', 30], ['VIDIENTU', 15]]);
        let tt = ng >= 3 ? (rnd() < 0.06 ? 'DaHuy' : 'DaGiao') : ng >= 1 ? (rnd() < 0.65 ? 'DangGiao' : 'DaGiao') : (rnd() < 0.65 ? 'ChoXacNhan' : 'DaXacNhan');
        let ttTt = pt === 'COD' ? (tt === 'DaGiao' ? 'DaThanhToan' : 'ThuKhiNhan') : (tt === 'ChoXacNhan' ? (rnd() < 0.5 ? 'ChoDoiSoat' : 'ChuaThanhToan') : tt === 'DaHuy' ? 'DaHoanTien' : 'DaThanhToan');
        const ma = 'NG' + yymmdd(luc) + (stt++); const sau = (gio) => new Date(Math.min(luc.getTime() + gio * 3600e3, Date.now() - 6e4)).toISOString(); const ls = [{ luc: luc.toISOString(), trangThai: 'ChoXacNhan', ghiChu: 'Đặt hàng thành công trên website', boi: 'Khách hàng' }]; const ht = [];
        const dv = aha ? 'AhaMove' : 'GHTK';
        if (tt === 'DaHuy') ls.unshift({ luc: sau(2), trangThai: 'DaHuy', ghiChu: 'Khách hủy đơn: ' + pick(['Đặt trùng đơn', 'Muốn đổi sản phẩm / combo khác', 'Không còn nhu cầu']), boi: 'Khách hàng' });
        if (['DaXacNhan', 'DangGiao', 'DaGiao'].includes(tt)) ls.unshift({ luc: sau(1), trangThai: 'DaXacNhan', ghiChu: 'Đã xác nhận, đóng gói', boi: 'NutriGreen' });
        if (['DangGiao', 'DaGiao'].includes(tt)) { ls.unshift({ luc: sau(4), trangThai: 'DangGiao', ghiChu: 'Đã bàn giao cho ' + dv, boi: 'NutriGreen' }); ht.unshift({ luc: sau(4), noiDung: dv + ' đã lấy hàng tại kho NutriGreen' }); }
        if (tt === 'DaGiao') { ls.unshift({ luc: sau(aha ? 7 : 40), trangThai: 'DaGiao', ghiChu: 'Giao thành công – ' + dv, boi: 'Hệ thống' }); ht.unshift({ luc: sau(aha ? 7 : 40), noiDung: 'Giao hàng thành công' }); }
        const o = { ma, taoLuc: luc.toISOString(), khachHang: u ? u.id : null, hoTen: ten, sdt: u ? u.sdt : '09' + String(10000000 + Math.floor(rnd() * 89999999)), email: u ? u.email : '', diaChi: { tinh, phuong: 'Phường ' + pick(['Tân Định', 'Bến Thành', 'An Khánh', 'Bình Thạnh', 'Phú Nhuận', 'Hòa Hưng']), chiTiet: (1 + Math.floor(rnd() * 200)) + ' ' + pick(['Nguyễn Trãi', 'Lê Văn Sỹ', 'Điện Biên Phủ', 'Hai Bà Trưng', 'Cách Mạng Tháng 8']) }, ghiChu: '', dong,
          tamTinh: tam, giam, maUuDai: dungMa ? 'CHAOBAN10' : '', phiGiao: phi, tongTien: tam - giam + phi, tongKcal: dong.reduce((t, x) => t + x.kcal, 0), coCombo, tuTdee,
          vanChuyen: { donVi: dv, dichVu: aha ? 'ahamove' : hcm ? 'ghtk-hcm' : 'ghtk', tenDichVu: aha ? 'Giao trong ngày (nội thành TP.HCM)' : 'Giao tiêu chuẩn GHTK', thoiGian: aha ? 'Trong ngày' : '2 – 4 ngày', maVanDon: ht.length ? (aha ? 'AHA' : 'S') + (10000000 + Math.floor(rnd() * 89999999)) : '', hanhTrinh: ht },
          thanhToan: { phuongThuc: pt, trangThai: ttTt, hanThanhToan: pt === 'COD' ? null : new Date(luc.getTime() + 864e5).toISOString() }, trangThai: tt, lichSu: ls, nhacTaiMua: coCombo, nguon: { utm_source: theoTy(NGUON) }, duLieuMau: true };
        don.push(o);
        if (tt === 'DaGiao' && u && rnd() < 0.4) { const x = dong[0]; const sao = +theoTy([[5, 50], [4, 30], [3, 12], [2, 8]]); const lucDg = sau(60);
          danhGia.push({ id: 'DGM' + stt, maSp: x.ma, maDon: ma, khachHang: u.id, ten: ten.split(' ').slice(-1)[0] + ' ' + ten[0] + '.', sao, noiDung: pick(NX[sao]), anh: [], luc: lucDg, xu: 50, daMua: true, phanHoi: sao >= 4 && rnd() < 0.5 ? 'Cảm ơn bạn đã tin chọn NutriGreen!' : '' });
          gdXu.push({ khachHang: u.id, xu: 50, ghiChu: 'Đánh giá – đơn ' + ma, loai: 'danhGia', luc: lucDg }); }
      }
    }
    NG.kho.ghi('donHang', NG.donHang.tatCa().concat(don)); NG.kho.ghi('danhGia', danhGia); NG.kho.ghi('giaoDichXu', gdXu);
    // yêu cầu đổi trả mẫu: 1 mới, 1 đang xử lý, 1 đã giải quyết
    const ganDay = don.filter((o) => o.trangThai === 'DaGiao' && o.khachHang && (Date.now() - new Date(o.taoLuc)) / 864e5 < 9).slice(-3); const dt = NG.doiTra.tatCa();
    [['DaTiepNhan', 'Bánh bị vỡ, dập nát', 'Hộp bánh bị móp, khoảng một nửa số bánh bị vỡ vụn.', 'Đổi sản phẩm mới', ''], ['DangXuLy', 'Hạt/granola bị ôi dầu, mất giòn', 'Mở túi ra thấy granola mềm, có mùi dầu.', 'Hoàn tiền', 'NutriGreen đã tạo lệnh lấy lại hàng, shipper sẽ liên hệ bạn trong hôm nay.'], ['DaGiaiQuyet', 'Giao sai hoặc thiếu sản phẩm', 'Đơn thiếu 1 sản phẩm so với hóa đơn.', 'Đổi sản phẩm mới', 'Đã gửi bù sản phẩm còn thiếu kèm voucher 20.000đ. Xin lỗi bạn vì sự bất tiện.']].forEach((r, i) => {
      const o = ganDay[i]; if (!o) return; const g = NG.donHang.giaoLuc(o);
      dt.push({ ma: 'DT' + yymmdd(new Date(g)) + (301 + i), maDon: o.ma, sanPham: [o.dong[0].ma], lyDo: r[1], moTa: r[2], anh: [], video: [], phuongAn: r[3], taiKhoanHoan: r[3] === 'Hoàn tiền' ? 'Vietcombank – 0071000xxxxxx – ' + khongDau(o.hoTen).toUpperCase() : '', trangThai: r[0], phanHoi: r[4], taoLuc: new Date(new Date(g).getTime() + 5 * 3600e3).toISOString(), lichSu: [] });
    });
    NG.kho.ghi('doiTra', dt);
    // lượt tính TDEE
    const log = NG.kho.doc('tdeeLog', []);
    for (let ng = 59; ng >= 0; ng--) { const n = 2 + Math.floor((59 - ng) / 9) + Math.floor(rnd() * 3); for (let k = 0; k < n; k++) {
      const nu = rnd() < 0.66; const kq = await NG.tdee.tinh({ gioiTinh: nu ? 'nu' : 'nam', tuoi: 20 + Math.floor(rnd() * 20), cao: (nu ? 150 : 162) + Math.floor(rnd() * 16), nang: (nu ? 45 : 58) + Math.floor(rnd() * 22), vanDong: pick(['1.2', '1.375', '1.375', '1.55', '1.725']), mucTieu: theoTy([['giam-can', 52], ['duy-tri', 22], ['tang-co', 26]]) });
      log.push(Object.assign({ luc: truoc(ng, rnd() * 12).toISOString(), khachHang: null, nguon: theoTy(NGUON), duLieuMau: true }, kq)); } }
    log.sort((a, b) => a.luc.localeCompare(b.luc)); NG.kho.ghi('tdeeLog', log);
    NG.kho.ghi('lienHe', NG.kho.doc('lienHe', []).concat([{ ma: 'LHMAU1', hoTen: tenNguoi(), sdt: '0938112233', email: '', chuDe: 'Tư vấn chọn sản phẩm / combo', noiDung: 'Mình đang cho con bú thì có dùng combo 1.500 được không ạ?', luc: truoc(0, 3).toISOString(), trangThai: 'Moi', khachHang: null }, { ma: 'LHMAU2', hoTen: tenNguoi(), sdt: '0977445566', email: '', chuDe: 'Hợp tác (KOC, đại lý)', noiDung: 'Mình có kênh TikTok 20k follow về eat clean, muốn nhận mã KOC.', luc: truoc(2, 1).toISOString(), trangThai: 'DaXuLy', khachHang: null }]));
    NG.kho.ghi('daTaoMau2', true);
  };

  /* ------------------------------------------------------------------ biểu tượng */
  const IC = {
    them: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    tim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    dong: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    sao: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5" stroke-linecap="round"/></svg>',
    gio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    zalo: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.8 2 11.5c0 2.6 1.4 4.9 3.6 6.5L5 21l3.4-1.7c1.1.3 2.3.5 3.6.5 5.5 0 10-3.8 10-8.5S17.5 3 12 3z"/></svg>',
    mess: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5C6.6 2.5 2.5 6.4 2.5 11.4c0 2.7 1.2 5 3.2 6.7v3.4l3.1-1.7c1 .3 2.1.4 3.2.4 5.4 0 9.5-3.9 9.5-8.8S17.4 2.5 12 2.5zm1 11.8-2.5-2.6-4.7 2.6 5.2-5.5 2.5 2.6 4.6-2.6z"/></svg>',
    dt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    trong: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3"><path d="M14 22h36l-3 30a4 4 0 0 1-4 3.6H21a4 4 0 0 1-4-3.6z"/><path d="M24 22v-5a8 8 0 0 1 16 0v5"/></svg>'
  };
  NG.IC = IC;

  /* ------------------------------------------------------------------ UI */
  NG.ui = {
    toast(noiDung, loai = 'ok', link) {
      let w = $('.toast-wrap'); if (!w) { w = document.createElement('div'); w.className = 'toast-wrap'; w.setAttribute('role', 'status'); w.setAttribute('aria-live', 'polite'); document.body.appendChild(w); }
      const t = document.createElement('div'); t.className = 'toast' + (loai === 'error' ? ' toast--error' : '');
      t.innerHTML = '<span class="ico">' + (loai === 'error' ? '!' : '✓') + '</span><span>' + esc(noiDung) + '</span>' + (link ? '<a href="' + esc(link.href) + '">' + esc(link.text) + '</a>' : '');
      w.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3600);
    },
    modal(html, opt = {}) {
      const m = document.createElement('div'); m.className = 'modal ' + (opt.lop || '');
      m.innerHTML = '<div class="modal__box ' + (opt.rong ? 'modal__box--wide' : '') + '" role="dialog" aria-modal="true"' + (opt.nhan ? ' aria-label="' + esc(opt.nhan) + '"' : '') + '><button class="icon-btn modal__close" type="button" aria-label="Đóng">' + IC.dong + '</button>' + html + '</div>';
      const truoc = document.activeElement;
      const dong = () => { m.remove(); document.body.classList.remove('no-scroll'); document.removeEventListener('keydown', esc_); if (truoc && truoc.focus) truoc.focus(); opt.khiDong && opt.khiDong(); };
      const esc_ = (e) => { if (e.key === 'Escape') dong(); };
      m.addEventListener('click', (e) => { if (e.target === m || e.target.closest('.modal__close') || e.target.closest('[data-dong]')) dong(); });
      document.addEventListener('keydown', esc_);
      document.body.appendChild(m); document.body.classList.add('no-scroll');
      const f = m.querySelector('input, select, textarea, button:not(.modal__close)'); (f || m.querySelector('.modal__close')).focus();
      m.dong = dong; return m;
    },
    xacNhan(tieuDe, noiDung, nutDongY = 'Đồng ý') {
      return new Promise((ok) => {
        const m = this.modal('<h2>' + esc(tieuDe) + '</h2><p>' + noiDung + '</p><div class="modal__actions"><button class="btn" type="button" data-dong>Quay lại</button><button class="btn btn--primary" type="button" data-ok>' + esc(nutDongY) + '</button></div>', { khiDong: () => ok(false) });
        m.querySelector('[data-ok]').addEventListener('click', () => { ok(true); m.remove(); document.body.classList.remove('no-scroll'); });
      });
    },
    sao(n, kt = '') { let s = '<span class="stars ' + kt + '" aria-label="' + n + ' trên 5 sao">'; for (let i = 1; i <= 5; i++) s += '<span class="' + (i <= Math.round(n) ? '' : 'off') + '">' + IC.sao + '</span>'; return s + '</span>'; },
    macroBar(tl) { return '<div class="macro-bar" aria-label="Tỷ lệ năng lượng: protein ' + tl.p + '%, carb ' + tl.c + '%, béo ' + tl.f + '%"><span class="p" style="width:' + tl.p + '%"></span><span class="c" style="width:' + tl.c + '%"></span><span class="f" style="width:' + tl.f + '%"></span></div>'; },
    // thẻ sản phẩm: kcal + protein trên khẩu phần ngay trên thẻ
    the(sp, d, opt = {}) {
      const combo = sp.loai === 'combo'; const n = sp.dinhDuong ? sp.dinhDuong.tren100g : null;
      const theo100 = opt.theo === '100g' && !combo;
      const link = NG.url('chiTiet', { ma: sp.ma });
      const fav = NG.yeuThich.co(sp.ma);
      const tags = [];
      if (combo) tags.push('<span class="badge badge--forest">Combo 7 ngày</span>');
      if (!sp.conHang) tags.push('<span class="badge badge--red">Tạm hết</span>');
      else if (!combo && sp.ton <= 5) tags.push('<span class="badge badge--orange">Còn ' + sp.ton + '</span>');
      if (!combo && n.duong <= d.cauHinh.nguongLoc.itDuong) tags.push('<span class="badge badge--lime">Đường ' + so(n.duong, 1) + 'g/100g</span>');
      let nums;
      if (combo) nums = '<span class="num-pill num-pill--kcal"><b>≈' + so(sp.kcalNgay) + '</b> kcal/ngày</span><span class="num-pill num-pill--pro"><b>' + sp.proteinNgay + 'g</b> protein/ngày</span>';
      else if (theo100) nums = '<span class="num-pill num-pill--kcal"><b>' + so(n.kcal) + '</b> kcal</span><span class="num-pill num-pill--pro"><b>' + so(n.protein, 1) + 'g</b> protein</span><span class="num-pill num-pill--sug">đường <b>' + so(n.duong, 1) + 'g</b></span>';
      else nums = '<span class="num-pill num-pill--kcal"><b>' + so(sp.kp.kcal) + '</b> kcal</span><span class="num-pill num-pill--pro"><b>' + so(sp.kp.protein, 1) + 'g</b> protein</span><span class="num-pill num-pill--sug">đường <b>' + so(sp.kp.duong, 1) + 'g</b></span>';
      const per = combo ? 'Dành cho mục tiêu ' + so(sp.mucTieuKcal) + ' kcal/ngày' : theo100 ? 'Trên 100g' : 'Mỗi khẩu phần ' + sp.dinhDuong.khauPhan.g + 'g';
      return '<article class="pcard' + (combo ? ' pcard--combo' : '') + (sp.conHang ? '' : ' pcard--out') + '" data-ma="' + esc(sp.ma) + '">' +
        '<a class="pcard__media" href="' + link + '" tabindex="-1" aria-hidden="true"><img src="' + anh(sp.anh, true) + '" alt="" loading="lazy" width="320" height="320"></a>' +
        '<div class="pcard__tags">' + tags.join('') + '</div>' +
        '<button class="pcard__fav" type="button" aria-label="Yêu thích ' + esc(sp.ten) + '" aria-pressed="' + fav + '" data-yeu-thich="' + esc(sp.ma) + '">' + IC.tim + '</button>' +
        '<div class="pcard__body">' +
        '<span class="pcard__cat">' + esc(combo ? sp.nhan : NG.duLieu.tenDanhMuc(d, sp.danhMuc)) + '</span>' +
        '<h3 class="pcard__name"><a href="' + link + '">' + esc(sp.ten) + '</a></h3>' +
        '<span class="pcard__spec">' + esc(sp.quyCach) + (combo ? ' · ' + sp.thanhPhanDayDu.length + ' món' : '') + '</span>' +
        '<div class="pcard__nums">' + nums + '</div>' +
        '<span class="pcard__per">' + per + '</span>' + this.macroBar(sp.tyLe) +
        '<div class="pcard__foot"><div class="pcard__price"><span class="price">' + tien(sp.gia) + '</span>' +
        (combo ? '<span class="pcard__save">Tiết kiệm ' + tien(sp.tietKiem) + ' so với mua lẻ</span>' : '') + '</div>' +
        '<button class="pcard__add" type="button" data-them-gio="' + esc(sp.ma) + '" aria-label="Thêm ' + esc(sp.ten) + ' vào giỏ"' + (sp.conHang ? '' : ' disabled') + '>' + IC.them + '</button></div>' +
        '</div></article>';
    },
    // mã QR minh họa: sinh mẫu ô vuông giả lập từ nội dung (không phải QR thanh toán thật)
    qr(noiDung) {
      let h = 2166136261; for (let i = 0; i < noiDung.length; i++) { h ^= noiDung.charCodeAt(i); h = Math.imul(h, 16777619); }
      const N = 29, o = []; const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
      const finder = (x, y) => { o.push('<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#113b00"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" fill="#113b00"/>'); };
      const trongFinder = (x, y) => (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!trongFinder(x, y) && rnd() > 0.52) o.push('<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#113b00"/>');
      finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
      return '<svg viewBox="-2 -2 ' + (N + 4) + ' ' + (N + 4) + '" shape-rendering="crispEdges" role="img" aria-label="Mã QR thanh toán (minh họa)"><rect x="-2" y="-2" width="' + (N + 4) + '" height="' + (N + 4) + '" fill="#fff"/>' + o.join('') + '<rect x="11.5" y="11.5" width="6" height="6" rx="1.5" fill="#cadf47" stroke="#113b00" stroke-width=".6"/></svg>';
    },
    // ảnh tải lên: nén về JPEG ≤ 900px để lưu localStorage
    nenAnh(file, toiDa = 900) {
      return new Promise((ok, loi) => {
        if (!/^image\//.test(file.type)) return loi(new Error('Không phải ảnh'));
        const r = new FileReader(); r.onerror = loi;
        r.onload = () => { const img = new Image(); img.onload = () => { const k = Math.min(1, toiDa / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); ok(c.toDataURL('image/jpeg', 0.72)); }; img.onerror = loi; img.src = r.result; };
        r.readAsDataURL(file);
      });
    },
    trangThaiDon(d) { return '<span class="badge badge--' + TT_MAU[d.trangThai] + '">' + esc(TT[d.trangThai]) + '</span>'; }
  };

  /* ------------------------------------------------------------------ đầu trang */
  async function napDauTrang() {
    const header = $('.site-header'); if (!header) return;
    const d = await NG.duLieu.coBan();
    // menu đang chọn
    const trang = document.body.dataset.page; const hl = { products: 'san-pham', 'product-detail': 'san-pham', tdee: 'tdee', blog: 'blog', 'blog-post': 'blog', contact: 'ho-tro', policy: 'ho-tro' }[trang];
    const p = new URLSearchParams(location.search);
    const key = trang === 'products' && p.get('danhmuc') === 'combo' ? 'combo' : hl;
    if (key) { const li = $('[data-nav="' + key + '"]'); li && li.classList.add('is-active'); }
    window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 10), { passive: true });
    // menu di động
    const drawer = $('#menu-di-dong'); const nutMo = $('[data-mo-menu]');
    const dongMenu = () => { drawer.hidden = true; nutMo.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll'); };
    nutMo && nutMo.addEventListener('click', () => { drawer.hidden = false; nutMo.setAttribute('aria-expanded', 'true'); document.body.classList.add('no-scroll'); const i = drawer.querySelector('input'); i && setTimeout(() => i.focus(), 50); });
    drawer && drawer.addEventListener('click', (e) => { if (e.target === drawer || e.target.closest('[data-dong-menu]')) dongMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && drawer && !drawer.hidden) dongMenu(); });
    // kênh mạng xã hội & thông tin liên hệ lấy từ config.json
    d.danhMuc.danhMucTatCa.filter((m) => m.an).forEach((m) => $$('a[href*="danhmuc=' + m.id + '"]').forEach((a) => { a.hidden = true; }));
    $$('[data-kenh]').forEach((a) => { const u = d.cauHinh.kenh[a.dataset.kenh]; if (u) a.href = u; });
    $$('[data-cau-hinh]').forEach((el) => { const v = d.cauHinh.thuongHieu[el.dataset.cauHinh]; if (v) { el.textContent = v; if (el.dataset.cauHinh === 'hotline') el.href = 'tel:' + v.replace(/\s/g, ''); if (el.dataset.cauHinh === 'email') el.href = 'mailto:' + v; } });
    // tìm kiếm có gợi ý
    $$('[data-tim-kiem]').forEach((f) => ganTimKiem(f, d));
    capNhatDauTrang();
    window.addEventListener('ng:doi', (e) => { if (['gioHang', 'yeuThich', 'daXem', 'phien', 'khachHang', 'donHang'].includes(e.detail.khoa)) capNhatDauTrang(); });
  }
  function ganTimKiem(form, d) {
    const input = form.querySelector('input'); const box = form.querySelector('.search__suggest'); let chon = -1;
    const q0 = qs('q'); if (q0 && document.body.dataset.page === 'products') input.value = q0;
    const ve = () => {
      const q = input.value.trim(); if (q.length < 1) { box.hidden = true; return; }
      const kq = NG.timKiem(d, q).slice(0, 6); chon = -1;
      box.innerHTML = kq.length ? kq.map((s) => '<a role="option" href="' + NG.url('chiTiet', { ma: s.ma }) + '"><img src="' + anh(s.anh, true) + '" alt=""><span><span class="t">' + esc(s.ten) + '</span><span class="m">' + (s.loai === 'combo' ? '≈' + so(s.kcalNgay) + ' kcal/ngày' : so(s.kp.kcal) + ' kcal · ' + so(s.kp.protein, 1) + 'g protein / khẩu phần') + '</span></span><span class="p">' + tien(s.gia) + '</span></a>').join('') + '<a class="all" href="products.html?q=' + encodeURIComponent(q) + '">Xem tất cả kết quả cho “' + esc(q) + '”</a>'
        : '<p class="none">Không tìm thấy “' + esc(q) + '”. Thử “granola”, “hạt”, “protein”, “ít đường”.</p>';
      box.hidden = false;
    };
    input.addEventListener('input', ve); input.addEventListener('focus', ve);
    input.addEventListener('keydown', (e) => {
      const items = $$('a', box); if (!items.length || box.hidden) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); chon = (chon + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; items.forEach((a, i) => a.classList.toggle('is-focus', i === chon)); }
      else if (e.key === 'Enter' && chon >= 0) { e.preventDefault(); location.href = items[chon].href; }
      else if (e.key === 'Escape') box.hidden = true;
    });
    document.addEventListener('click', (e) => { if (!form.contains(e.target)) box.hidden = true; });
    form.addEventListener('submit', (e) => { if (!input.value.trim()) e.preventDefault(); else NG.track('tim_kiem', { q: input.value.trim() }); });
  }
  // tìm kiếm không dấu, có từ đồng nghĩa (protein, ít đường, keto…)
  NG.timKiem = function (d, q) {
    const k = khongDau(q).trim(); if (!k) return d.tatCa;
    const dongNghia = { 'it duong': ['it-duong'], 'protein': ['protein-cao'], 'giam can': ['giam-can'], 'tang co': ['tang-co'], 'an sang': ['an-sang-nhanh'], 'eat clean': ['giam-can'], 'combo': ['combo'] };
    const tu = k.split(/\s+/);
    return d.tatCa.map((s) => {
      const chu = khongDau([s.ten, s.moTaNgan, s.thanhPhan, s.quyCach, NG.duLieu.tenDanhMuc(d, s.danhMuc), (s.mucTieu || []).map((m) => NG.duLieu.tenMucTieu(d, m)).join(' '), s.nhan || ''].join(' '));
      let diem = 0;
      if (khongDau(s.ten).includes(k)) diem += 10;
      tu.forEach((t) => { if (chu.includes(t)) diem += 2; });
      Object.keys(dongNghia).forEach((dn) => { if (k.includes(dn)) { const n = s.dinhDuong && s.dinhDuong.tren100g; if (dn === 'it duong' && n && n.duong <= d.cauHinh.nguongLoc.itDuong) diem += 6; if (dn === 'protein' && n && n.protein >= d.cauHinh.nguongLoc.proteinCao) diem += 6; if ((s.mucTieu || []).some((m) => dongNghia[dn].includes(m)) || dongNghia[dn].includes(s.danhMuc)) diem += 5; } });
      return { s, diem: diem >= tu.length * 2 || diem >= 5 ? diem : 0 };
    }).filter((x) => x.diem > 0).sort((a, b) => b.diem - a.diem).map((x) => x.s);
  };
  async function capNhatDauTrang() {
    const d = await NG.duLieu.coBan();
    const dem = (k, n) => $$('[data-dem="' + k + '"]').forEach((el) => { el.textContent = n > 99 ? '99+' : n; el.hidden = !n; });
    dem('gio-hang', NG.gio.soLuong()); dem('yeu-thich', NG.yeuThich.ds().length);
    const u = NG.taiKhoan.hienTai(); $$('[data-dot-tai-khoan]').forEach((x) => { x.hidden = !u; });
    const item = (s, phu) => '<a class="pop-item" href="' + NG.url('chiTiet', { ma: s.ma }) + '"><img src="' + anh(s.anh, true) + '" alt=""><span><span class="t">' + esc(s.ten) + '</span><br><span class="m">' + (phu || '') + '</span></span><span class="p">' + tien(s.gia) + '</span></a>';
    const box = (k) => $('[data-pop-box="' + k + '"]');
    const dx = NG.daXem.ds().map((m) => d.theoMa[m]).filter(Boolean).slice(0, 4);
    if (box('da-xem')) box('da-xem').innerHTML = '<p class="pop-title">Đã xem gần đây <a href="recently-viewed.html">Tất cả</a></p>' + (dx.length ? dx.map((s) => item(s, s.quyCach)).join('') : '<p class="pop-empty">Chưa có sản phẩm nào.</p>');
    const yt = NG.yeuThich.ds().map((m) => d.theoMa[m]).filter(Boolean).slice(0, 4);
    if (box('yeu-thich')) box('yeu-thich').innerHTML = '<p class="pop-title">Yêu thích <a href="wishlist.html">Tất cả</a></p>' + (yt.length ? yt.map((s) => item(s, s.quyCach)).join('') : '<p class="pop-empty">Bấm ♡ trên sản phẩm để lưu lại.</p>');
    if (box('tai-khoan')) box('tai-khoan').innerHTML = u
      ? '<p class="pop-title">Xin chào, ' + esc(u.hoTen.split(' ').slice(-1)[0]) + '</p><div class="pop-menu"><a href="account.html">Hồ sơ &amp; mục tiêu calo</a><a href="orders.html">Đơn hàng của tôi</a><a href="rewards.html">Ví ưu đãi · <strong>' + so(NG.xu.soDu(u.id)) + ' xu</strong></a><a href="wishlist.html">Yêu thích</a><button type="button" data-dang-xuat>Đăng xuất</button></div>'
      : '<p class="pop-title">Tài khoản</p><p class="pop-empty">Đăng nhập để lưu lịch sử TDEE, tích NutriCoins và theo dõi đơn.</p><div class="pop-foot"><a class="btn btn--primary btn--sm" href="account.html">Đăng nhập</a><a class="btn btn--sm" href="account.html#dang-ky">Đăng ký</a></div>';
    const g = await NG.gio.tinh();
    if (box('gio-hang')) box('gio-hang').innerHTML = '<p class="pop-title">Giỏ hàng (' + g.soLuong + ')</p>' + (g.dong.length
      ? g.dong.slice(0, 4).map((x) => '<div class="pop-line"><a href="' + NG.url('chiTiet', { ma: x.ma }) + '"><img src="' + anh(x.sp.anh, true) + '" alt=""></a><div class="pop-line__mid"><a class="t" href="' + NG.url('chiTiet', { ma: x.ma }) + '">' + esc(x.sp.ten) + '</a>' + (x.chonSp ? '<span class="m">' + esc(x.chonSp.ten) + '</span>' : '') +
          '<div class="qty qty--sm"><button type="button" data-mc-sl="' + (x.soLuong - 1) + '" data-khoa="' + esc(x.khoa) + '" aria-label="' + (x.soLuong > 1 ? 'Giảm' : 'Xóa khỏi giỏ') + '">−</button><span aria-label="Số lượng">' + x.soLuong + '</span><button type="button" data-mc-sl="' + (x.soLuong + 1) + '" data-khoa="' + esc(x.khoa) + '" aria-label="Tăng"' + (x.soLuong >= x.toiDa ? ' disabled' : '') + '>+</button></div></div>' +
          '<div class="pop-line__end"><span class="p">' + tien(x.thanhTien) + '</span><button type="button" class="x" data-mc-sl="0" data-khoa="' + esc(x.khoa) + '">Xóa</button></div></div>').join('') + (g.dong.length > 4 ? '<p class="xs muted">… và ' + (g.dong.length - 4) + ' sản phẩm khác</p>' : '') +
        '<div class="pop-sum"><span>Tổng năng lượng</span><strong>' + so(g.tongKcal) + ' kcal</strong></div><div class="pop-sum"><span>Tạm tính</span><strong>' + tien(g.tamTinh) + '</strong></div>' +
        '<div class="pop-foot"><a class="btn btn--sm" href="cart.html">Xem giỏ</a><a class="btn btn--primary btn--sm" href="checkout.html">Thanh toán</a></div>'
      : '<p class="pop-empty">Giỏ hàng đang trống.</p>');
  }
  NG.capNhatDauTrang = capNhatDauTrang;

  /* ------------------------------------------------------------------ nút chat Zalo / Messenger (FR07) */
  async function napChat() {
    if (document.body.dataset.khongChat !== undefined) return;
    const { cauHinh } = await NG.duLieu.coBan(); const th = cauHinh.thuongHieu;
    const bayGio = new Date(); const h = bayGio.getHours() + bayGio.getMinutes() / 60; const dangLam = bayGio.getDay() !== 0 && h >= 8 && h < 17.5;
    const w = document.createElement('div'); w.className = 'chat-fab';
    w.innerHTML = '<div class="chat-panel" id="khung-chat" hidden><div class="chat-panel__head"><strong>Tư vấn dinh dưỡng</strong><span>' + (dangLam ? '● Đang trực tuyến · ' + esc(th.camKetPhanHoi) : '○ Ngoài giờ · trả lời từ 08:00 sáng mai') + '</span></div><div class="chat-panel__body">' +
      '<a class="chat-channel" href="' + esc(cauHinh.kenh.zalo) + '" target="_blank" rel="noopener" data-chat="zalo"><span class="ic" style="background:#0068ff">' + IC.zalo + '</span><span>Chat qua Zalo OA<small>Gửi ảnh nhãn, hỏi combo phù hợp</small></span></a>' +
      '<a class="chat-channel" href="' + esc(cauHinh.kenh.messenger) + '" target="_blank" rel="noopener" data-chat="messenger"><span class="ic" style="background:#7b4dff">' + IC.mess + '</span><span>Chat qua Messenger<small>Fanpage NutriGreen</small></span></a>' +
      '<a class="chat-channel" href="tel:' + esc(th.hotline.replace(/\s/g, '')) + '" data-chat="hotline"><span class="ic" style="background:#215725">' + IC.dt + '</span><span>Hotline ' + esc(th.hotline) + '<small>' + esc(th.gioLamViec) + '</small></span></a>' +
      '<p class="xs muted mb-0">Câu hỏi nhanh:</p><div class="chat-quick"><a href="tdee.html">Tôi nên ăn bao nhiêu calo?</a><a href="policy.html#doi-tra">Đổi trả thế nào?</a><a href="orders.html">Đơn của tôi đâu?</a><a href="policy.html#giao-hang">Phí giao hàng</a></div></div></div>' +
      '<button class="chat-fab__btn" type="button" aria-expanded="false" aria-controls="khung-chat"><span class="live' + (dangLam ? '' : ' off') + '"></span>' + IC.chat + '<span class="lbl">Tư vấn</span></button>';
    document.body.appendChild(w);
    const btn = w.querySelector('.chat-fab__btn'); const panel = w.querySelector('.chat-panel');
    btn.addEventListener('click', () => { panel.hidden = !panel.hidden; btn.setAttribute('aria-expanded', String(!panel.hidden)); if (!panel.hidden) NG.track('mo_chat', {}); });
    w.addEventListener('click', (e) => { const a = e.target.closest('[data-chat]'); if (a) NG.track('chat_kenh', { kenh: a.dataset.chat }); });
    document.addEventListener('click', (e) => { if (!w.contains(e.target)) { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); } });
  }

  /* ------------------------------------------------------------------ popup nhận mã 10% đơn đầu (mục 3.4.5) */
  // Chỉ hiện 1 lần, sau 25 giây hoặc khi cuộn 60% trang; không hiện ở giỏ/thanh toán/tài khoản (tránh "pop-up dồn dập", mục 1.1.4)
  function napPopupEmail() {
    const trang = document.body.dataset.page;
    if (!['home', 'products', 'product-detail', 'blog', 'blog-post'].includes(trang)) return; // không chen vào công cụ TDEE hay các bước mua
    const tt = NG.kho.doc('popupEmail', null);
    if (tt && (tt.daDangKy || Date.now() - tt.luc < 7 * 864e5)) return;
    if (NG.taiKhoan.hienTai() || NG.kho.doc('daDatHang')) return;
    let daHien = false; const batDau = Date.now();
    const hien = () => {
      // không hiện khi khách đang gõ trong ô nhập hoặc đang mở hộp thoại khác
      const dangGo = document.activeElement && /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName);
      if (daHien || document.querySelector('.modal') || dangGo) return; daHien = true;
      NG.kho.ghi('popupEmail', { luc: Date.now() }); NG.track('popup_email_hien', {});
      const m = NG.ui.modal('<div class="promo-pop__top"><p class="eyebrow" style="justify-content:center">Thành viên mới</p><div class="big">−10%</div><p class="mb-0 strong">cho đơn đầu tiên, tối đa 50.000đ</p></div><div class="promo-pop__body"><form data-form-email novalidate><p class="small">Nhận mã giảm giá và các bài “đọc nhãn trong 30 giây” qua email. Không spam, hủy bất cứ lúc nào.</p><div class="field"><label for="email-popup">Email của bạn</label><input class="input" id="email-popup" type="email" required placeholder="ban@email.com"><span class="err"></span></div><button class="btn btn--primary btn--block" type="submit">Nhận mã giảm 10%</button><button class="link-btn mt-1" type="button" data-dong style="display:block;margin:10px auto 0">Để sau</button></form></div>', { lop: 'promo-pop', nhan: 'Nhận mã giảm 10%' });
      m.querySelector('form').addEventListener('submit', (e) => {
        e.preventDefault(); const i = m.querySelector('input'); const err = m.querySelector('.err');
        if (!emailHopLe(i.value)) { err.textContent = 'Email chưa đúng định dạng.'; i.closest('.field').classList.add('is-invalid'); return; }
        const ds = NG.kho.doc('dangKyEmail', []); if (!ds.some((x) => x.email === i.value.trim().toLowerCase())) ds.push({ email: i.value.trim().toLowerCase(), luc: new Date().toISOString(), nguon: 'popup', ma: 'CHAOBAN10' }); NG.kho.ghi('dangKyEmail', ds);
        NG.kho.ghi('popupEmail', { luc: Date.now(), daDangKy: true }); NG.track('dang_ky_email', { nguon: 'popup' });
        m.querySelector('.promo-pop__body').innerHTML = '<p class="strong">Mã của bạn đây!</p><div class="code-box"><span>CHAOBAN10</span><button class="btn btn--sm" type="button" data-copy="CHAOBAN10">Sao chép</button></div><p class="small muted mt-1">Nhập mã ở bước giỏ hàng. Mã cũng đã được gửi tới ' + esc(i.value.trim()) + '.</p><button class="btn btn--primary btn--block" type="button" data-dong>Tiếp tục mua sắm</button>';
      });
    };
    setTimeout(hien, 25000);
    const cuon = () => { if (Date.now() - batDau > 10000 && window.scrollY + innerHeight > document.body.scrollHeight * 0.6) { hien(); if (daHien) window.removeEventListener('scroll', cuon); } };
    window.addEventListener('scroll', cuon, { passive: true });
  }

  /* ------------------------------------------------------------------ sự kiện chung */
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-them-gio]');
    if (t) { e.preventDefault(); t.disabled = true; await NG.gio.them(t.dataset.themGio, 1, { chon: t.dataset.chon || null, nguon: t.dataset.nguon || null }); t.disabled = false; return; }
    const f = e.target.closest('[data-yeu-thich]');
    if (f) { e.preventDefault(); const on = NG.yeuThich.bat(f.dataset.yeuThich); $$('[data-yeu-thich="' + f.dataset.yeuThich + '"]').forEach((x) => x.setAttribute('aria-pressed', on)); NG.ui.toast(on ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích', 'ok', on ? { text: 'Xem', href: 'wishlist.html' } : null); return; }
    const mc = e.target.closest('[data-mc-sl]');
    if (mc) { e.preventDefault(); NG.gio.capNhat(mc.dataset.khoa, +mc.dataset.mcSl); return; }
    const c = e.target.closest('[data-copy]');
    if (c) { try { await navigator.clipboard.writeText(c.dataset.copy); } catch (er) { /* bỏ qua */ } c.textContent = 'Đã chép'; return; }
    const o = e.target.closest('[data-dang-xuat]');
    if (o) { NG.taiKhoan.dangXuat(); NG.ui.toast('Đã đăng xuất'); setTimeout(() => { location.href = 'index.html'; }, 500); }
  });

  NG.sanSang = (async function khoiDong() {
    try { await NG.demo.taoNeuChua(); await NG.demo.taoMauLon(); } catch (e) { console.warn(e); }
    if (document.readyState === 'loading') await new Promise((r) => document.addEventListener('DOMContentLoaded', r));
    try { await napDauTrang(); } catch (e) { console.error(e); const m = document.querySelector('main'); if (m && location.protocol === 'file:') m.insertAdjacentHTML('afterbegin', '<div class="container"><div class="alert alert--error mt-2">Hãy mở website bằng Live Server (http://), không mở trực tiếp file .html – trình duyệt chặn đọc dữ liệu JSON.</div></div>'); }
    napChat(); napPopupEmail();
  })();
})();
