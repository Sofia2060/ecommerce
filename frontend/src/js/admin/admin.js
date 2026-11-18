/* =========================================================================
   NutriGreen – lõi trang quản trị (sitemap 4.2). Dùng lại NG (common.js) và cùng kho localStorage "ng.*"
   với cửa hàng, nên mọi thay đổi ở đây (xác nhận đơn, sửa giá, nhập kho, phản hồi…) hiện ngay bên khách.
   NGA.san()   kiểm tra đăng nhập + dựng khung (menu trái, tiêu đề)
   NGA.viec()  đếm "việc cần làm" cho menu và trang tổng quan
   NGA.kho     tồn kho theo lô, xuất kho theo hạn dùng gần nhất trước (FEFO)
   NGA.don     chuyển trạng thái đơn, xác nhận thanh toán, hoàn tiền
   NGA.cot / NGA.thanh  biểu đồ cột theo ngày, thanh ngang so sánh
   ========================================================================= */
(function () {
  'use strict';
  const NG = window.NG; const NGA = (window.NGA = {});
  const { $, $$, esc, so, tien } = NG;
  const MA_BAM = 'aae43c7bb3e2b365a86afc4699374c50228350f082008e0763f6ab294cb9e7ee'; // tài khoản quản trị mẫu, xem README
  const NGAY = 864e5;

  NGA.phien = () => { try { return JSON.parse(sessionStorage.getItem('ng.qt') || 'null'); } catch (e) { return null; } };
  NGA.dangNhap = async (email, mk) => {
    if (await NG.bam(String(email).trim().toLowerCase() + '|' + mk) !== MA_BAM) throw new Error('Email hoặc mật khẩu quản trị không đúng.');
    sessionStorage.setItem('ng.qt', JSON.stringify({ ten: 'Quản lý cửa hàng', luc: Date.now() }));
  };
  NGA.dangXuat = () => { sessionStorage.removeItem('ng.qt'); location.href = 'login.html'; };
  NGA.taiLai = () => { NG.duLieu._p = null; return NG.duLieu.coBan(); };

  /* ---------- tiện ích ngày ---------- */
  NGA.dauNgay = (t) => { const x = new Date(t); x.setHours(0, 0, 0, 0); return x.getTime(); };
  NGA.ky = (soNgay) => { const den = Date.now(); const tu = NGA.dauNgay(den) - (soNgay - 1) * NGAY; return { tu, den, tuTruoc: tu - soNgay * NGAY, denTruoc: tu, soNgay }; };
  NGA.trong = (iso, a, b) => { const t = new Date(iso).getTime(); return t >= a && t < b; };
  NGA.tienHang = (o) => o.tamTinh - o.giam; // doanh thu = tiền hàng sau giảm giá, không gồm phí giao
  NGA.KENH = { facebook: 'Facebook', tiktok: 'TikTok', google: 'Google (tìm kiếm)', zalo: 'Zalo', '(direct)': 'Vào thẳng website', 'koc-minhfit': 'KOC Minh Fit', referral: 'Trang khác giới thiệu', copy: 'Link chia sẻ' };
  NGA.tenKenh = (o) => { const k = (o.nguon && o.nguon.utm_source) || '(direct)'; return NGA.KENH[k] || k; };
  NGA.conNgay = (hsd) => Math.ceil((new Date(hsd + 'T23:59:59').getTime() - Date.now()) / NGAY);

  /* ---------- việc cần làm ---------- */
  NGA.viec = (d) => {
    const don = NG.donHang.tatCa();
    const sp = d.keCaAn.sanPham.filter((s) => !s.an);
    const v = {
      choXacNhan: don.filter((o) => o.trangThai === 'ChoXacNhan' && o.thanhToan.trangThai !== 'ChuaThanhToan' && o.thanhToan.trangThai !== 'ChoDoiSoat').length,
      choDoiSoat: don.filter((o) => o.trangThai !== 'DaHuy' && o.thanhToan.trangThai === 'ChoDoiSoat').length,
      choHoan: don.filter((o) => o.thanhToan.trangThai === 'ChoHoanTien').length,
      canGiao: don.filter((o) => o.trangThai === 'DaXacNhan').length,
      khieuNai: NG.doiTra.tatCa().filter((r) => r.trangThai === 'DaTiepNhan').length,
      danhGia: NG.danhGia.tatCa().filter((r) => !r.phanHoi && !r.an && r.sao <= 3).length,
      lienHe: NG.kho.doc('lienHe', []).filter((x) => x.trangThai === 'Moi').length,
      sapHet: sp.filter((s) => s.ton <= 5).length,
      sapHetHan: sp.reduce((t, s) => t + s.cacLo.filter((l) => l.sl > 0 && NGA.conNgay(l.hsd) <= 60).length, 0)
    };
    v.donHang = v.choXacNhan + v.choDoiSoat + v.choHoan; v.kho = v.sapHet + v.sapHetHan; v.chamSoc = v.khieuNai + v.danhGia + v.lienHe;
    return v;
  };

  /* ---------- khung trang ---------- */
  const IC = {
    dashboard: '<path d="M4 13h7V4H4zM13 20h7v-9h-7zM4 20h7v-5H4zM13 4v5h7V4z"/>',
    orders: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    products: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
    inventory: '<path d="M3 21V9l9-5 9 5v12"/><path d="M8 21v-7h8v7M8 17h8"/>',
    customers: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5 6.5-5s5.500 1.500 6.500 5"/><circle cx="17.500" cy="9" r="2.500"/><path d="M17 14.500c2.500 0 4 1.500 4.500 4"/>',
    care: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.500h8M8 12.500h5"/>'
  };
  const MENU = [['dashboard', 'Tổng quan', null], ['orders', 'Đơn hàng', 'donHang'], ['products', 'Sản phẩm & combo', null], ['inventory', 'Kho hàng', 'kho'], ['customers', 'Khách hàng', null], ['care', 'Chăm sóc khách hàng', 'chamSoc']];
  NGA.veMenu = (d) => {
    const v = NGA.viec(d); const trang = document.body.dataset.qt;
    $('.qt-nav').innerHTML = MENU.map(([k, ten, dem]) => '<a href="' + k + '.html"' + (k === trang ? ' class="is-active" aria-current="page"' : '') + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">' + IC[k] + '</svg>' + ten + (dem && v[dem] ? '<span class="n" title="Việc cần xử lý">' + v[dem] + '</span>' : '') + '</a>').join('');
    return v;
  };
  NGA.san = async (tieuDe, moTa) => {
    if (!NGA.phien()) { location.replace('login.html'); return new Promise(() => {}); }
    await NG.sanSang; const d = await NG.duLieu.coBan();
    document.body.classList.add('qt');
    document.body.innerHTML = '<div class="qt-shell"><aside class="qt-side"><a class="qt-brand" href="dashboard.html"><img src="../../../public/images/logo/nutrigreen-logo.webp" alt="NutriGreen"><span>Quản trị<small>Trang dành cho quản lý</small></span></a><nav class="qt-nav" aria-label="Menu quản trị"></nav>' +
      '<div class="qt-side__foot"><a href="../client/index.html" target="_blank" rel="noopener">Xem cửa hàng ↗</a><button type="button" data-qt-thoat>Đăng xuất</button></div></aside>' +
      '<main class="qt-main"><header class="qt-head"><div><h1>' + esc(tieuDe) + '</h1><p>' + esc(moTa || '') + '</p></div><div data-qt-cong-cu class="flex gap-1 wrap center"></div></header><div data-qt-noi-dung></div></main></div>';
    NGA.veMenu(d);
    document.addEventListener('click', (e) => { if (e.target.closest('[data-qt-thoat]')) NGA.dangXuat(); });
    // thẻ khác (cửa hàng) có đơn mới, đánh giá mới… → cập nhật số việc cần làm
    window.addEventListener('ng:doi', async () => { NGA.veMenu(await NG.duLieu.coBan()); });
    return { d, el: $('[data-qt-noi-dung]'), congCu: $('[data-qt-cong-cu]') };
  };

  /* ---------- kho theo lô ---------- */
  NGA.kho = {
    lo: (d, ma) => d.theoMa[ma].cacLo.map((l) => Object.assign({}, l)),
    luu(ma, lots) { const q = NG.kho.doc('qtLo', {}); q[ma] = lots.filter((l) => l.sl > 0 || lots.length === 1); if (!q[ma].length) q[ma] = [Object.assign({}, lots[lots.length - 1], { sl: 0 })]; NG.kho.ghi('qtLo', q); },
    // xuất kho: lấy từ lô có hạn dùng gần nhất trước
    tru(d, ma, sl) { const lots = this.lo(d, ma).sort((a, b) => a.hsd.localeCompare(b.hsd)); for (const l of lots) { const lay = Math.min(l.sl, sl); l.sl -= lay; sl -= lay; if (!sl) break; } this.luu(ma, lots); },
    cong(d, ma, sl) { const lots = this.lo(d, ma); lots[0].sl += sl; this.luu(ma, lots); },
    // quy đơn hàng ra các sản phẩm lẻ cần xuất (combo → từng món)
    thanhPhan(d, o) {
      const kq = {}; const them = (ma, sl) => { kq[ma] = (kq[ma] || 0) + sl; };
      o.dong.forEach((x) => { const s = d.theoMa[x.ma]; if (!s) return; if (s.loai !== 'combo') return them(x.ma, x.soLuong); s.thanhPhanDayDu.forEach((t) => them(t.laLuaChon ? (x.chon || t.cacLua[0].ma) : t.sp.ma, t.soLuong * x.soLuong)); });
      return kq;
    },
    // số ngày còn đủ bán, theo tốc độ bán 14 ngày gần nhất
    ngayDuBan(d, don) {
      const ban = {}; don.filter((o) => o.trangThai !== 'DaHuy' && Date.now() - new Date(o.taoLuc) < 14 * NGAY).forEach((o) => { const tp = this.thanhPhan(d, o); Object.keys(tp).forEach((m) => { ban[m] = (ban[m] || 0) + tp[m]; }); });
      const kq = {}; d.keCaAn.sanPham.forEach((s) => { const moiNgay = (ban[s.ma] || 0) / 14; kq[s.ma] = { ban14: ban[s.ma] || 0, ngay: moiNgay ? Math.floor(s.ton / moiNgay) : null }; });
      return kq;
    }
  };

  /* ---------- đơn hàng ---------- */
  const ngau = (n) => { let s = ''; for (let i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; };
  NGA.don = {
    // bước tiếp theo của một đơn, nói bằng lời cho người quản lý
    buocTiep(o) {
      const tt = o.thanhToan.trangThai;
      if (o.trangThai === 'ChoXacNhan') {
        if (tt === 'ChoDoiSoat') return { viec: 'DaNhanTien', nhan: 'Đã nhận tiền', goiY: 'Khách báo đã chuyển khoản – kiểm tra tài khoản rồi bấm xác nhận.' };
        if (tt === 'ChuaThanhToan') return { viec: null, nhan: '', goiY: 'Đang chờ khách chuyển khoản (giữ đơn 24 giờ).' };
        return { viec: 'DaXacNhan', nhan: 'Xác nhận & đóng gói', goiY: 'Xác nhận sẽ tự trừ tồn kho theo lô có hạn dùng gần nhất.' };
      }
      if (o.trangThai === 'DaXacNhan') return { viec: 'DangGiao', nhan: 'Giao cho ' + o.vanChuyen.donVi, goiY: 'Bàn giao kiện hàng cho đơn vị vận chuyển, hệ thống tạo mã vận đơn.' };
      if (o.trangThai === 'DangGiao') return { viec: 'DaGiao', nhan: 'Đã giao xong', goiY: 'Đánh dấu khi đơn vị vận chuyển báo giao thành công.' };
      if (tt === 'ChoHoanTien') return { viec: 'DaHoanTien', nhan: 'Đã hoàn tiền', goiY: 'Chuyển trả tiền cho khách rồi bấm xác nhận.' };
      return { viec: null, nhan: '', goiY: '' };
    },
    async thucHien(ma, viec, lyDo) {
      const d = await NGA.taiLai(); const o = NG.donHang.tatCa().find((x) => x.ma === ma); if (!o) throw new Error('Không tìm thấy đơn.');
      const tp = NGA.kho.thanhPhan(d, o); const bay = () => new Date().toISOString();
      if (viec === 'DaXacNhan') {
        const thieu = Object.keys(tp).filter((m) => d.theoMa[m].ton < tp[m]).map((m) => d.theoMa[m].ten);
        if (thieu.length) throw new Error('Không đủ tồn kho: ' + thieu.join(', ') + '. Hãy nhập thêm hàng ở mục Kho hàng.');
        Object.keys(tp).forEach((m) => NGA.kho.tru(d, m, tp[m]));
      }
      if (viec === 'DaHuy' && o.daXuatKho) Object.keys(tp).forEach((m) => NGA.kho.cong(d, m, tp[m]));
      NG.donHang.capNhat(ma, (x) => {
        const ls = (tt, gc) => NG.donHang.ghiLichSu(x, tt, gc, 'NutriGreen');
        if (viec === 'DaNhanTien') { x.thanhToan.trangThai = 'DaThanhToan'; ls(x.trangThai, 'Đã nhận tiền chuyển khoản'); }
        else if (viec === 'DaHoanTien') { x.thanhToan.trangThai = 'DaHoanTien'; ls(x.trangThai, 'Đã hoàn tiền cho khách'); }
        else if (viec === 'DaXacNhan') { x.trangThai = 'DaXacNhan'; x.daXuatKho = true; ls('DaXacNhan', 'Đã xác nhận, đóng gói'); }
        else if (viec === 'DangGiao') { x.trangThai = 'DangGiao'; x.vanChuyen.maVanDon = x.vanChuyen.maVanDon || (x.vanChuyen.donVi === 'AhaMove' ? 'AHA' : 'S') + ngau(8); x.vanChuyen.hanhTrinh.unshift({ luc: bay(), noiDung: x.vanChuyen.donVi + ' đã lấy hàng tại kho NutriGreen' }); ls('DangGiao', 'Đã bàn giao cho ' + x.vanChuyen.donVi); }
        else if (viec === 'DaGiao') { x.trangThai = 'DaGiao'; x.vanChuyen.hanhTrinh.unshift({ luc: bay(), noiDung: 'Giao hàng thành công' }); if (x.thanhToan.phuongThuc === 'COD') x.thanhToan.trangThai = 'DaThanhToan'; ls('DaGiao', 'Giao thành công – ' + x.vanChuyen.donVi); }
        else if (viec === 'DaHuy') { x.trangThai = 'DaHuy'; x.lyDoHuy = lyDo; x.huyLuc = bay(); x.daXuatKho = false; if (x.thanhToan.trangThai === 'DaThanhToan' || x.thanhToan.trangThai === 'ChoDoiSoat') x.thanhToan.trangThai = 'ChoHoanTien'; ls('DaHuy', 'Cửa hàng hủy đơn: ' + lyDo); }
      });
      return NGA.taiLai();
    }
  };

  /* ---------- biểu đồ ---------- */
  // cột theo ngày: một dãy số, một màu; rê chuột xem số chính xác; có bảng số liệu thay thế cho người dùng trình đọc màn hình
  NGA.cot = (el, ds, opt = {}) => {
    const W = 720, H = 240, L = 44, R = 8, T = 14, B = 26; const max = Math.max(1, ...ds.map((x) => x.v));
    const buoc = Math.pow(10, Math.floor(Math.log10(max))); const dinh = Math.ceil(max / buoc) * buoc; const cw = (W - L - R) / ds.length; const bw = Math.min(26, cw - 2);
    const y = (v) => T + (1 - v / dinh) * (H - T - B); const rut = opt.rut || ((v) => so(v));
    const moiNhan = Math.ceil(ds.length / 8);
    el.innerHTML = '<div class="chart-wrap"><svg class="bars" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opt.nhan || '') + '">' +
      [0, 0.5, 1].map((t) => '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(dinh * t) + '" y2="' + y(dinh * t) + '" stroke="#e7ecd9"/><text x="' + (L - 6) + '" y="' + (y(dinh * t) + 4) + '" text-anchor="end">' + rut(dinh * t) + '</text>').join('') +
      ds.map((x, i) => { const cx = L + i * cw + cw / 2; const top = y(x.v); const h = H - B - top; const r = Math.min(4, h);
        return '<rect class="hit" x="' + (L + i * cw) + '" y="' + T + '" width="' + cw + '" height="' + (H - T - B) + '" fill="transparent" data-i="' + i + '"/>' +
          (x.v ? '<path class="bar" d="M' + (cx - bw / 2) + ' ' + (H - B) + 'V' + (top + r) + 'q0 -' + r + ' ' + r + ' -' + r + 'h' + (bw - 2 * r) + 'q' + r + ' 0 ' + r + ' ' + r + 'V' + (H - B) + 'z" pointer-events="none"/>' : '<path class="bar" d="" />') +
          (i % moiNhan === 0 || i === ds.length - 1 ? '<text x="' + cx + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(x.nhan) + '</text>' : ''); }).join('') +
      '</svg><div class="tip" hidden></div></div>' +
      '<details class="small mt-1"><summary>Xem dạng bảng</summary><div class="table-wrap mt-1"><table class="qt-table"><thead><tr><th>Ngày</th><th class="r">' + esc(opt.donVi || 'Giá trị') + '</th></tr></thead><tbody>' + ds.map((x) => '<tr><td>' + esc(x.nhanDay || x.nhan) + '</td><td class="r num">' + so(x.v) + '</td></tr>').join('') + '</tbody></table></div></details>';
    const tip = el.querySelector('.tip'); const svg = el.querySelector('svg');
    svg.addEventListener('mousemove', (e) => { const h = e.target.closest('.hit'); if (!h) { tip.hidden = true; return; } const x = ds[+h.dataset.i]; const r = svg.getBoundingClientRect(); const cx = (L + (+h.dataset.i + 0.5) * cw) / W * r.width; tip.innerHTML = x.tip; tip.style.left = Math.max(70, Math.min(r.width - 70, cx)) + 'px'; tip.style.top = (y(x.v) / H * r.height) + 'px'; tip.hidden = false; });
    svg.addEventListener('mouseleave', () => { tip.hidden = true; });
  };
  // thanh ngang so sánh: nhãn – thanh – số
  NGA.thanh = (ds) => { const max = Math.max(1, ...ds.map((x) => x.v)); return ds.map((x) => '<div class="hbar"><span>' + esc(x.ten) + '</span><div class="track" title="' + esc(x.ten + ': ' + x.so) + '"><span style="width:' + Math.max(2, x.v / max * 100) + '%"></span></div><b>' + esc(x.so) + (x.phu ? ' <small>' + esc(x.phu) + '</small>' : '') + '</b></div>').join('') || '<p class="small muted">Chưa có dữ liệu trong khoảng thời gian này.</p>'; };
  NGA.trong0 = (ten) => '<div class="empty"><p>' + esc(ten) + '</p></div>';
  NGA.so = so; NGA.tien = tien;
})();
