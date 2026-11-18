/* Bảng điều khiển (sitemap 4.2): việc cần làm hôm nay, doanh thu và xu hướng, thống kê lượt tính TDEE,
   tỷ lệ bán combo kcal, cảnh báo tồn kho – kèm "nhận định nhanh" viết bằng lời để người quản lý ra quyết định. */
(async function () {
  'use strict';
  const NG = window.NG, NGA = window.NGA; const { $, esc, so, tien } = NG;
  const { d, el, congCu } = await NGA.san('Tổng quan', 'Tình hình cửa hàng và những việc nên làm tiếp theo');
  let soNgay = 7;
  congCu.innerHTML = '<div class="seg" role="group" aria-label="Khoảng thời gian"><button type="button" data-ky="7" aria-pressed="true">7 ngày</button><button type="button" data-ky="30" aria-pressed="false">30 ngày</button></div>';
  congCu.addEventListener('click', (e) => { const b = e.target.closest('[data-ky]'); if (!b) return; soNgay = +b.dataset.ky; congCu.querySelectorAll('[data-ky]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); ve(); });
  const trieu = (v) => (v >= 1e6 ? so(v / 1e6, 1) + ' tr' : so(v / 1e3) + 'k');
  const pct = (a, b) => (b ? Math.round(a / b * 100) : 0);
  const ngayNgan = (t) => { const x = new Date(t); return x.getDate() + '/' + (x.getMonth() + 1); };

  function ve() {
    const ky = NGA.ky(soNgay); const tatCa = NG.donHang.tatCa(); const don = tatCa.filter((o) => o.trangThai !== 'DaHuy');
    const cur = don.filter((o) => NGA.trong(o.taoLuc, ky.tu, ky.den + 1)); const prev = don.filter((o) => NGA.trong(o.taoLuc, ky.tuTruoc, ky.denTruoc));
    const tong = (ds) => ds.reduce((t, o) => t + NGA.tienHang(o), 0);
    const dt = tong(cur), dt0 = tong(prev); const tb = cur.length ? dt / cur.length : 0, tb0 = prev.length ? tong(prev) / prev.length : 0;
    const tlCombo = pct(cur.filter((o) => o.coCombo).length, cur.length), tlCombo0 = pct(prev.filter((o) => o.coCombo).length, prev.length);
    const delta = (a, b, donVi) => { if (!b) return '<span class="kpi__d flat">Chưa có kỳ trước để so sánh</span>'; const x = donVi === 'điểm' ? a - b : Math.round((a - b) / b * 100); return '<span class="kpi__d ' + (x > 0 ? 'up' : x < 0 ? 'down' : 'flat') + '">' + (x > 0 ? '▲ tăng ' : x < 0 ? '▼ giảm ' : 'không đổi ') + (x ? Math.abs(x) + (donVi === 'điểm' ? ' điểm %' : '%') : '') + ' so với ' + soNgay + ' ngày trước đó</span>'; };
    const v = NGA.viec(d); const mienPhi = d.cauHinh.giaoHang.mienPhiTu;

    /* --- doanh thu theo ngày --- */
    const cot = []; for (let i = 0; i < soNgay; i++) { const a = ky.tu + i * 864e5; const ds = cur.filter((o) => NGA.trong(o.taoLuc, a, a + 864e5)); const s = tong(ds); cot.push({ nhan: ngayNgan(a), nhanDay: NG.ngay(a), v: s, tip: '<b>' + NG.ngay(a) + '</b><br>' + tien(s) + ' · ' + ds.length + ' đơn' }); }

    /* --- combo --- */
    const dongCombo = {}; let tienCombo = 0; cur.forEach((o) => o.dong.filter((x) => x.loai === 'combo').forEach((x) => { dongCombo[x.ma] = (dongCombo[x.ma] || 0) + x.soLuong; tienCombo += x.donGia * x.soLuong; }));
    const comboTop = d.keCaAn.combo.map((c) => ({ c, sl: dongCombo[c.ma] || 0 })).sort((a, b) => b.sl - a.sl);
    const tamTinhKy = cur.reduce((t, o) => t + o.tamTinh, 0);

    /* --- sản phẩm bán chạy --- */
    const ban = {}; cur.forEach((o) => o.dong.forEach((x) => { ban[x.ma] = ban[x.ma] || { ten: x.ten, sl: 0, tien: 0 }; ban[x.ma].sl += x.soLuong; ban[x.ma].tien += x.donGia * x.soLuong; }));
    const top = Object.values(ban).sort((a, b) => b.sl - a.sl).slice(0, 5);

    /* --- kênh --- */
    const kenh = {}; cur.forEach((o) => { const k = NGA.tenKenh(o); kenh[k] = kenh[k] || { ten: k, don: 0, tien: 0 }; kenh[k].don++; kenh[k].tien += NGA.tienHang(o); });
    const dsKenh = Object.values(kenh).sort((a, b) => b.don - a.don);

    /* --- TDEE --- */
    const log = NG.kho.doc('tdeeLog', []).filter((x) => NGA.trong(x.luc, ky.tu, ky.den + 1)); const log0 = NG.kho.doc('tdeeLog', []).filter((x) => NGA.trong(x.luc, ky.tuTruoc, ky.denTruoc));
    const mt = {}; log.forEach((x) => { mt[x.tenMucTieu] = (mt[x.tenMucTieu] || 0) + 1; });
    const dsMt = Object.keys(mt).map((k) => ({ ten: k, v: mt[k], so: so(mt[k]) + ' lượt', phu: pct(mt[k], log.length) + '%' })).sort((a, b) => b.v - a.v);
    const donTdee = cur.filter((o) => o.tuTdee).length; const donCombo = cur.filter((o) => o.coCombo).length;

    /* --- tồn kho --- */
    const duBan = NGA.kho.ngayDuBan(d, tatCa); const sp = d.keCaAn.sanPham.filter((s) => !s.an);
    const canhBao = sp.filter((s) => s.ton <= 5 || (duBan[s.ma].ngay != null && duBan[s.ma].ngay <= 7)).sort((a, b) => a.ton - b.ton);
    const hetHan = []; sp.forEach((s) => s.cacLo.forEach((l) => { const n = NGA.conNgay(l.hsd); if (l.sl > 0 && n <= 60) hetHan.push({ s, l, n }); })); hetHan.sort((a, b) => a.n - b.n);

    /* --- nhận định nhanh (viết bằng lời, kèm việc nên làm) --- */
    const nd = [];
    if (cur.length) {
      const c1 = comboTop[0];
      nd.push(['%', 'Combo mang về <strong>' + pct(tienCombo, tamTinhKy) + '% doanh thu</strong> và có trong ' + tlCombo + '% số đơn' + (c1 && c1.sl ? '; bán chạy nhất là <strong>' + esc(c1.c.ten) + '</strong> (' + c1.sl + ' gói).' : '.'), tlCombo < 35 ? 'Nên đưa combo lên đầu trang chủ và nhắc trong bài đăng fanpage tuần này.' : 'Giữ combo ở vị trí nổi bật; cân nhắc thêm quà nhỏ để tăng tỷ lệ mua lại.']);
      nd.push(['đ', 'Mỗi đơn trung bình <strong>' + tien(tb) + '</strong>, ' + (tb >= mienPhi ? 'cao hơn' : 'thấp hơn') + ' ngưỡng miễn phí giao hàng ' + tien(mienPhi) + '.', tb >= mienPhi ? 'Ngưỡng freeship đang kéo khách mua nhiều hơn – nên giữ nguyên.' : 'Gợi ý “mua thêm … để được freeship” ở giỏ hàng đang là đòn bẩy chính – hãy đẩy các món 80–130k làm món mua kèm.']);
      const d30 = don.filter((o) => Date.now() - new Date(o.taoLuc) < 28 * 864e5); const theoThu = [0, 0, 0, 0, 0, 0, 0]; d30.forEach((o) => { theoThu[new Date(o.taoLuc).getDay()] += NGA.tienHang(o); });
      const cuoiTuan = (theoThu[0] + theoThu[6]) / 2, trongTuan = (theoThu[1] + theoThu[2] + theoThu[3] + theoThu[4] + theoThu[5]) / 5;
      if (trongTuan) nd.push(['T7', 'Trong 4 tuần gần đây, một ngày cuối tuần bán <strong>' + (cuoiTuan >= trongTuan ? 'nhiều hơn ' + pct(cuoiTuan - trongTuan, trongTuan) + '%' : 'ít hơn ' + pct(trongTuan - cuoiTuan, trongTuan) + '%') + '</strong> so với ngày thường.', cuoiTuan >= trongTuan ? 'Lên lịch đăng bài và chạy mã giảm giá vào tối thứ Sáu; chuẩn bị đủ hàng trước thứ Bảy.' : 'Khách mua nhiều trong tuần – ưu tiên đăng bài và chạy mã từ thứ Hai đến thứ Năm.']);
      if (dsKenh.length > 1) { const giaTri = dsKenh.filter((k) => k.don >= 2).sort((a, b) => b.tien / b.don - a.tien / a.don)[0] || dsKenh[0]; nd.push(['↗', '<strong>' + esc(dsKenh[0].ten) + '</strong> mang về nhiều đơn nhất (' + dsKenh[0].don + ' đơn). Khách từ <strong>' + esc(giaTri.ten) + '</strong> chi nhiều nhất mỗi đơn (' + tien(giaTri.tien / giaTri.don) + ').', 'Dồn ngân sách quảng cáo cho kênh có giá trị đơn cao; kênh nhiều đơn nhưng đơn nhỏ thì gắn link thẳng tới trang combo.']); }
    }
    if (log.length) nd.push(['kcal', 'Có <strong>' + so(log.length) + ' lượt tính TDEE</strong>; cứ 100 lượt thì có khoảng <strong>' + Math.round(donTdee / log.length * 100) + ' đơn combo</strong> đặt ngay từ gợi ý. Mục tiêu được chọn nhiều nhất: <strong>' + esc(dsMt[0].ten) + '</strong> (' + dsMt[0].phu + ').', 'Viết thêm bài blog và video cho nhóm “' + esc(dsMt[0].ten.toLowerCase()) + '”, cuối bài dẫn về công cụ TDEE.']);
    const coDon = {}; don.forEach((o) => { const k = o.khachHang || o.sdt; coDon[k] = (coDon[k] || 0) + 1; }); const nKhach = Object.keys(coDon).length, quayLai = Object.values(coDon).filter((n) => n >= 2).length;
    if (nKhach) nd.push(['♻', '<strong>' + pct(quayLai, nKhach) + '% khách đã mua lại</strong> (' + quayLai + '/' + nKhach + ' khách có từ 2 đơn).', 'Combo dùng 7 ngày – nhắn Zalo/email nhắc đặt lại vào ngày thứ 6 cho khách vừa nhận combo.']);
    if (canhBao.length) { const s = canhBao[0]; nd.push(['!', '<strong>' + esc(s.ten) + '</strong> ' + (s.ton ? 'chỉ còn ' + s.ton + ' sản phẩm' + (duBan[s.ma].ngay != null ? ', đủ bán khoảng ' + duBan[s.ma].ngay + ' ngày nữa' : '') : 'đã hết hàng') + '.', 'Nhập thêm hàng ở mục Kho hàng trước khi chạy quảng cáo cho sản phẩm này.']); }

    el.innerHTML =
      '<section class="qt-card"><h2>Việc cần làm hôm nay</h2><p class="sub">Bấm vào từng ô để xử lý. Ô màu cam là việc đang chờ bạn.</p><div class="todo">' +
      [['orders.html?tab=cho-xac-nhan', v.choXacNhan, 'đơn chờ xác nhận', 'Xác nhận đơn →'], ['orders.html?tab=cho-tien', v.choDoiSoat + v.choHoan, 'đơn cần đối soát / hoàn tiền', 'Kiểm tra tiền →'], ['orders.html?tab=dong-goi', v.canGiao, 'đơn đã đóng gói, chờ giao', 'Giao hàng →'], ['care.html', v.chamSoc, 'khiếu nại, đánh giá, câu hỏi chờ trả lời', 'Trả lời khách →'], ['inventory.html', v.kho, 'cảnh báo tồn kho, hạn dùng', 'Xem kho →']]
        .map((x) => '<a href="' + x[0] + '" class="' + (x[1] ? 'can' : '') + '"><b>' + x[1] + '</b><span>' + x[2] + '</span><span>' + (x[1] ? x[3] : 'Đã xong ✓') + '</span></a>').join('') + '</div></section>' +
      '<div class="kpis" style="margin-top:14px">' +
      '<div class="kpi"><div class="kpi__l">Doanh thu ' + soNgay + ' ngày</div><div class="kpi__v">' + tien(dt) + '</div>' + delta(dt, dt0) + '</div>' +
      '<div class="kpi"><div class="kpi__l">Số đơn hàng</div><div class="kpi__v">' + cur.length + '</div>' + delta(cur.length, prev.length) + '</div>' +
      '<div class="kpi"><div class="kpi__l">Giá trị trung bình mỗi đơn</div><div class="kpi__v">' + tien(tb) + '</div>' + delta(tb, tb0) + '</div>' +
      '<div class="kpi"><div class="kpi__l">Đơn có combo theo calo</div><div class="kpi__v">' + tlCombo + '%</div>' + delta(tlCombo, tlCombo0, 'điểm') + '</div></div>' +
      '<div class="qt-grid qt-grid--3-2" style="margin-top:14px;align-items:start"><div class="qt-grid"><section class="qt-card"><h2>Doanh thu theo ngày</h2><p class="sub">Tiền hàng sau giảm giá, không gồm phí giao và đơn đã hủy. Rê chuột lên cột để xem chi tiết.</p><div data-cot></div></section>' + '<section class="qt-card"><h2>Bán chạy nhất</h2><p class="sub">Theo số lượng bán trong ' + soNgay + ' ngày.</p>' + NGA.thanh(top.map((x) => ({ ten: x.ten, v: x.sl, so: x.sl + ' sp', phu: trieu(x.tien) }))) + '</section></div>' +
      '<section class="qt-card"><h2>Nhận định nhanh</h2><p class="sub">Tự rút ra từ số liệu ' + soNgay + ' ngày gần nhất.</p><ul class="insights">' + (nd.length ? nd.map((x) => '<li><i>' + x[0] + '</i><span>' + x[1] + '<span class="act">→ ' + x[2] + '</span></span></li>').join('') : '<li><i>…</i><span>Chưa đủ dữ liệu để nhận định.</span></li>') + '</ul></section></div>' +
      '<div class="qt-grid qt-grid--2"><section class="qt-card"><h2>Công cụ TDEE có giúp bán hàng không?</h2><p class="sub">Từ lượt tính đến đơn combo trong ' + soNgay + ' ngày' + (log0.length ? ' (kỳ trước: ' + so(log0.length) + ' lượt tính)' : '') + '.</p>' +
      '<div class="funnel"><div><span>Lượt tính TDEE</span><b>' + so(log.length) + '</b></div><div><span>Đơn có combo</span><b>' + donCombo + '</b></div><div><span>Đơn combo đặt từ gợi ý TDEE</span><b>' + donTdee + (donCombo ? ' · ' + pct(donTdee, donCombo) + '% đơn combo' : '') + '</b></div></div>' +
      '<h3 class="mt-2" style="font-size:var(--ng-fs-md)">Khách tính TDEE với mục tiêu gì?</h3>' + NGA.thanh(dsMt) + '</section>' +
      '<section class="qt-card"><h2>Combo theo calo</h2><p class="sub">Số gói bán ra trong ' + soNgay + ' ngày.</p>' + NGA.thanh(comboTop.map((x) => ({ ten: x.c.ten, v: x.sl, so: x.sl + ' gói', phu: tien(x.sl * x.c.gia) }))) +
      '<h3 class="mt-2" style="font-size:var(--ng-fs-md)">Khách đến từ đâu?</h3>' + NGA.thanh(dsKenh.map((k) => ({ ten: k.ten, v: k.don, so: k.don + ' đơn', phu: 'TB ' + trieu(k.tien / k.don) }))) + '</section></div>' +
      '<div class="qt-grid"><section class="qt-card"><div class="flex between center"><h2>Cảnh báo tồn kho</h2><a class="small" href="inventory.html">Mở kho hàng →</a></div><p class="sub">Sắp hết hàng (còn ≤ 5 hoặc đủ bán dưới 7 ngày) và lô sắp hết hạn (≤ 60 ngày).</p>' +
      (canhBao.length || hetHan.length ? '<div class="table-wrap"><table class="qt-table"><tbody>' +
        canhBao.map((s) => '<tr><td>' + esc(s.ten) + '</td><td>' + (s.ton ? '<span class="badge badge--orange">Còn ' + s.ton + '</span>' : '<span class="badge badge--red">Hết hàng</span>') + '</td><td class="small muted">' + (duBan[s.ma].ngay != null && s.ton ? 'đủ bán ≈ ' + duBan[s.ma].ngay + ' ngày' : 'bán ' + duBan[s.ma].ban14 + ' sp/14 ngày') + '</td></tr>').join('') +
        hetHan.map((x) => '<tr><td>' + esc(x.s.ten) + ' · lô ' + esc(x.l.ma) + '</td><td><span class="badge badge--' + (x.n <= 30 ? 'red' : 'orange') + '">' + (x.n > 0 ? 'Còn ' + x.n + ' ngày' : 'Đã hết hạn') + '</span></td><td class="small muted">' + x.l.sl + ' sp · nên xả hàng trước</td></tr>').join('') + '</tbody></table></div>'
        : '<p class="alert">Kho đang ổn: không có sản phẩm sắp hết hay lô sắp hết hạn.</p>') + '</section></div>';
    NGA.cot($('[data-cot]'), cot, { rut: trieu, nhan: 'Doanh thu theo ngày', donVi: 'Doanh thu (đ)' });
  }
  ve();
  window.addEventListener('ng:doi', (e) => { if (e.detail.tuTheKhac) ve(); });
})();
