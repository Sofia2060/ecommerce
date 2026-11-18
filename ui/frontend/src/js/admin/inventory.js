/* Quản lý kho (sitemap 4.2): theo lô và theo hạn sử dụng. Kho xuất theo nguyên tắc "hết hạn trước – xuất trước" (FEFO):
   khi xác nhận đơn, hệ thống tự trừ ở lô có hạn dùng gần nhất. */
(async function () {
  'use strict';
  const NG = window.NG, NGA = window.NGA; const { $, esc, so, anh } = NG;
  let { d, el, congCu } = await NGA.san('Kho hàng', 'Tồn kho theo lô, hạn sử dụng và gợi ý nhập hàng');
  let che = NG.qs('xem') === 'hsd' ? 'hsd' : 'sp';
  congCu.innerHTML = '<button class="btn btn--primary btn--sm" type="button" data-nhap>+ Nhập lô hàng mới</button>';
  const lamMoi = async () => { d = await NGA.taiLai(); NGA.veMenu(d); ve(); };
  const nhanHsd = (n) => (n <= 0 ? '<span class="badge badge--red">Đã hết hạn</span>' : n <= 30 ? '<span class="badge badge--red">Còn ' + n + ' ngày</span>' : n <= 60 ? '<span class="badge badge--orange">Còn ' + n + ' ngày</span>' : '<span class="badge badge--green">Còn ' + n + ' ngày</span>');

  function ve() {
    const sp = d.keCaAn.sanPham; const duBan = NGA.kho.ngayDuBan(d, NG.donHang.tatCa());
    const het = sp.filter((s) => !s.an && s.ton === 0).length, sap = sp.filter((s) => !s.an && s.ton > 0 && s.ton <= 5).length;
    const lots = []; sp.forEach((s) => s.cacLo.forEach((l) => { if (l.sl > 0) lots.push({ s, l, n: NGA.conNgay(l.hsd) }); })); lots.sort((a, b) => a.n - b.n);
    const sapHan = lots.filter((x) => x.n <= 60).length; const tongSp = sp.reduce((t, s) => t + s.ton, 0);
    el.innerHTML = '<div class="kpis"><div class="kpi"><div class="kpi__l">Tổng sản phẩm trong kho</div><div class="kpi__v">' + so(tongSp) + '</div><div class="kpi__n">' + sp.length + ' mặt hàng · ' + lots.length + ' lô</div></div>' +
      '<div class="kpi"><div class="kpi__l">Hết hàng</div><div class="kpi__v">' + het + '</div><div class="kpi__n">khách không đặt được</div></div><div class="kpi"><div class="kpi__l">Sắp hết (còn ≤ 5)</div><div class="kpi__v">' + sap + '</div><div class="kpi__n">nên nhập thêm</div></div>' +
      '<div class="kpi"><div class="kpi__l">Lô sắp hết hạn (≤ 60 ngày)</div><div class="kpi__v">' + sapHan + '</div><div class="kpi__n">nên ưu tiên bán / khuyến mãi</div></div></div>' +
      '<div class="qt-tabs" style="margin-top:14px" role="tablist"><button class="chip' + (che === 'sp' ? ' is-active' : '') + '" type="button" data-che="sp">Theo sản phẩm</button><button class="chip' + (che === 'hsd' ? ' is-active' : '') + '" type="button" data-che="hsd">Theo lô & hạn sử dụng</button></div>' +
      '<section class="qt-card">' + (che === 'sp'
        ? '<div class="table-wrap"><table class="qt-table"><thead><tr><th>Sản phẩm</th><th class="r">Tồn kho</th><th class="r">Bán 14 ngày qua</th><th>Đủ bán trong</th><th>Lô xuất kế tiếp</th><th>Gợi ý</th><th></th></tr></thead><tbody>' +
          sp.slice().sort((a, b) => a.ton - b.ton).map((s) => { const x = duBan[s.ma]; const lo = s.cacLo.find((l) => l.sl > 0) || s.cacLo[0]; const n = NGA.conNgay(lo.hsd);
            const goiY = s.ton === 0 ? '<span class="check-bad">Nhập hàng ngay</span>' : x.ngay != null && x.ngay <= 7 ? '<span class="check-bad">Nhập thêm trong tuần</span>' : s.ton <= 5 ? '<span class="check-bad">Sắp hết</span>' : n <= 60 && s.ton ? 'Ưu tiên bán lô ' + esc(lo.ma) : x.ngay != null && x.ngay > 90 ? 'Bán chậm – cân nhắc khuyến mãi' : '<span class="check-ok">Ổn</span>';
            return '<tr class="' + (s.an ? 'row-off' : '') + '"><td><div class="cell-sp"><img src="' + anh(s.anh, true) + '" alt=""><span><strong>' + esc(s.ten) + '</strong><br><span class="xs muted">' + esc(s.quyCach) + (s.an ? ' · đang ẩn' : '') + '</span></span></div></td><td class="r num"><strong>' + s.ton + '</strong></td><td class="r num">' + x.ban14 + '</td><td>' + (s.ton === 0 ? '—' : x.ngay == null ? 'Chưa bán gần đây' : '≈ ' + x.ngay + ' ngày') + '</td><td class="small">' + esc(lo.ma) + ' · HSD ' + NG.ngay(lo.hsd) + '</td><td class="small">' + goiY + '</td><td class="r"><button class="btn btn--sm" type="button" data-nhap="' + s.ma + '">Nhập lô</button></td></tr>'; }).join('') + '</tbody></table></div><p class="xs muted mt-1">“Đủ bán trong” ước tính theo tốc độ bán 14 ngày gần nhất (đã quy combo ra từng món).</p>'
        : '<p class="sub">Lô xếp theo hạn dùng gần nhất – đây cũng là thứ tự xuất kho khi xác nhận đơn.</p>' + (lots.length ? '<div class="table-wrap"><table class="qt-table"><thead><tr><th>Thứ tự xuất</th><th>Sản phẩm</th><th>Mã lô</th><th>Ngày sản xuất</th><th>Hạn sử dụng</th><th>Còn hạn</th><th class="r">Số lượng</th><th></th></tr></thead><tbody>' +
          lots.map((x, i) => '<tr><td class="num">' + (i + 1) + '</td><td><strong>' + esc(x.s.ten) + '</strong></td><td>' + esc(x.l.ma) + '</td><td>' + NG.ngay(x.l.nsx) + '</td><td>' + NG.ngay(x.l.hsd) + '</td><td>' + nhanHsd(x.n) + '</td><td class="r num"><strong>' + x.l.sl + '</strong></td><td class="r"><button class="btn btn--sm btn--ghost" type="button" data-chinh="' + x.s.ma + '" data-lo="' + esc(x.l.ma) + '">Điều chỉnh</button></td></tr>').join('') + '</tbody></table></div>' : NGA.trong0('Kho đang trống.'))) + '</section>';
  }
  function moNhap(ma) {
    const hom = new Date().toISOString().slice(0, 10);
    const m = NG.ui.modal('<h2>Nhập lô hàng mới</h2><form novalidate><div class="field"><label for="n-sp">Sản phẩm</label><select class="select" id="n-sp" name="ma">' + d.keCaAn.sanPham.map((s) => '<option value="' + s.ma + '"' + (s.ma === ma ? ' selected' : '') + '>' + esc(s.ten) + ' (' + esc(s.quyCach) + ') – còn ' + s.ton + '</option>').join('') + '</select></div>' +
      '<div class="form-row form-row--2"><div class="field"><label for="n-lo">Mã lô (in trên bao bì)</label><input class="input" id="n-lo" name="lo" value="L' + hom.slice(2).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 90) + 10) + '"></div><div class="field"><label for="n-sl">Số lượng nhập</label><input class="input" id="n-sl" name="sl" type="number" min="1" value="20"></div><div class="field"><label for="n-nsx">Ngày sản xuất</label><input class="input" id="n-nsx" name="nsx" type="date" value="' + hom + '" max="' + hom + '"></div><div class="field"><label for="n-hsd">Hạn sử dụng</label><input class="input" id="n-hsd" name="hsd" type="date"></div></div>' +
      '<p class="err small" data-loi style="color:var(--ng-red)"></p><div class="modal__actions"><button class="btn" type="button" data-dong>Hủy</button><button class="btn btn--primary" type="submit">Nhập kho</button></div></form>', { nhan: 'Nhập lô' });
    m.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target; const l = f.querySelector('[data-loi]');
      if (!f.lo.value.trim() || !(+f.sl.value > 0) || !f.nsx.value || !f.hsd.value) { l.textContent = 'Vui lòng điền đủ mã lô, số lượng, ngày sản xuất và hạn sử dụng.'; return; }
      if (f.hsd.value <= hom) { l.textContent = 'Hạn sử dụng phải sau hôm nay.'; return; }
      const lots = NGA.kho.lo(d, f.ma.value); const co = lots.find((x) => x.ma === f.lo.value.trim());
      if (co) co.sl += +f.sl.value; else lots.push({ ma: f.lo.value.trim(), nsx: f.nsx.value, hsd: f.hsd.value, sl: +f.sl.value });
      NGA.kho.luu(f.ma.value, lots); m.dong(); NG.ui.toast('Đã nhập ' + f.sl.value + ' sản phẩm vào kho'); lamMoi();
    });
  }
  function moChinh(ma, maLo) {
    const lots = NGA.kho.lo(d, ma); const lo = lots.find((x) => x.ma === maLo); if (!lo) return;
    const m = NG.ui.modal('<h2>Điều chỉnh số lượng</h2><p class="small">' + esc(d.theoMa[ma].ten) + ' · lô ' + esc(maLo) + ' · HSD ' + NG.ngay(lo.hsd) + '. Dùng khi kiểm kho thấy lệch, hàng hỏng hoặc hủy hàng hết hạn.</p><form novalidate><div class="field"><label for="c-sl">Số lượng thực tế</label><input class="input" id="c-sl" name="sl" type="number" min="0" value="' + lo.sl + '"></div><div class="field"><label for="c-ly">Lý do</label><select class="select" id="c-ly" name="ly"><option>Kiểm kho lệch số</option><option>Hàng hỏng, vỡ</option><option>Hủy hàng hết hạn</option><option>Tặng, dùng thử</option></select></div><div class="modal__actions"><button class="btn" type="button" data-dong>Hủy</button><button class="btn btn--primary" type="submit">Lưu</button></div></form>', { nhan: 'Điều chỉnh kho' });
    m.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); const sl = Math.max(0, Math.round(+e.target.sl.value || 0)); const nk = NG.kho.doc('qtNhatKyKho', []); nk.push({ luc: new Date().toISOString(), ma, lo: maLo, tu: lo.sl, den: sl, lyDo: e.target.ly.value }); NG.kho.ghi('qtNhatKyKho', nk.slice(-200)); lo.sl = sl; NGA.kho.luu(ma, lots); m.dong(); NG.ui.toast('Đã cập nhật tồn kho'); lamMoi(); });
  }
  document.addEventListener('click', (e) => {
    const c = e.target.closest('[data-che]'); if (c) { che = c.dataset.che; history.replaceState(null, '', '?xem=' + che); return ve(); }
    const n = e.target.closest('[data-nhap]'); if (n) return moNhap(n.dataset.nhap || '');
    const ch = e.target.closest('[data-chinh]'); if (ch) return moChinh(ch.dataset.chinh, ch.dataset.lo);
  });
  window.addEventListener('ng:doi', (e) => { if (e.detail.tuTheKhac) lamMoi(); });
  ve();
})();
