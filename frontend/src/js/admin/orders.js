/* Đơn hàng và kho vận (sitemap 4.2): danh sách đơn, chi tiết đơn, trạng thái vận chuyển.
   Mỗi đơn chỉ có MỘT nút cho bước tiếp theo, kèm lời giải thích, để người quản lý không phải nhớ quy trình. */
(async function () {
  'use strict';
  const NG = window.NG, NGA = window.NGA; const { $, esc, so, tien, anh } = NG; const DH = NG.donHang;
  let { d, el } = await NGA.san('Đơn hàng', 'Xác nhận, giao hàng, đối soát thanh toán');
  const TAB = {
    'tat-ca': ['Tất cả', () => true],
    'cho-xac-nhan': ['Chờ xác nhận', (o) => o.trangThai === 'ChoXacNhan'],
    'cho-tien': ['Cần đối soát / hoàn tiền', (o) => (o.trangThai !== 'DaHuy' && o.thanhToan.trangThai === 'ChoDoiSoat') || o.thanhToan.trangThai === 'ChoHoanTien'],
    'dong-goi': ['Đã đóng gói', (o) => o.trangThai === 'DaXacNhan'],
    'dang-giao': ['Đang giao', (o) => o.trangThai === 'DangGiao'],
    'da-giao': ['Đã giao', (o) => o.trangThai === 'DaGiao'],
    'da-huy': ['Đã hủy', (o) => o.trangThai === 'DaHuy']
  };
  let tab = TAB[NG.qs('tab')] ? NG.qs('tab') : 'tat-ca'; let tu = ''; let trang = 1; const MOI_TRANG = 15;
  const PT = {}; d.cauHinh.thanhToan.forEach((p) => { PT[p.ma] = p.ma === 'COD' ? 'COD' : p.ma === 'VIETQR' ? 'Chuyển khoản' : 'Ví điện tử'; });
  const mauTt = { ThuKhiNhan: '', ChuaThanhToan: 'orange', ChoDoiSoat: 'orange', DaThanhToan: 'green', ChoHoanTien: 'red', DaHoanTien: '' };

  function ve() {
    const tatCa = DH.tatCa().slice().sort((a, b) => b.taoLuc.localeCompare(a.taoLuc));
    const k = NG.khongDau(tu.trim());
    const ds = tatCa.filter(TAB[tab][1]).filter((o) => !k || NG.khongDau(o.ma + ' ' + o.hoTen + ' ' + o.sdt).includes(k));
    const soTrang = Math.max(1, Math.ceil(ds.length / MOI_TRANG)); trang = Math.min(trang, soTrang); const hien = ds.slice((trang - 1) * MOI_TRANG, trang * MOI_TRANG);
    el.innerHTML = '<div class="qt-tabs" role="tablist">' + Object.keys(TAB).map((t) => '<button class="chip' + (t === tab ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + (t === tab) + '" data-tab="' + t + '">' + TAB[t][0] + ' (' + tatCa.filter(TAB[t][1]).length + ')</button>').join('') + '</div>' +
      '<section class="qt-card"><div class="qt-tools"><input class="input grow" type="search" placeholder="Tìm theo mã đơn, tên khách, số điện thoại" value="' + esc(tu) + '" data-tim aria-label="Tìm đơn hàng"><span class="small muted">' + ds.length + ' đơn</span></div>' +
      (hien.length ? '<div class="table-wrap"><table class="qt-table"><thead><tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th class="r">Tổng tiền</th><th>Thanh toán</th><th>Trạng thái</th><th>Việc tiếp theo</th></tr></thead><tbody>' +
        hien.map((o) => { const b = NGA.don.buocTiep(o);
          return '<tr data-mo="' + o.ma + '"><td><strong>' + esc(o.ma) + '</strong><br><span class="xs muted">' + NG.gioNgay(o.taoLuc) + '</span></td><td>' + esc(o.hoTen) + '<br><span class="xs muted">' + esc(o.sdt) + ' · ' + esc(o.diaChi.tinh.replace(/^(Thành phố|Tỉnh) /, '')) + '</span></td>' +
            '<td class="small">' + o.dong.map((x) => esc(x.ten) + ' × ' + x.soLuong).join('<br>') + '</td><td class="r num"><strong>' + tien(o.tongTien) + '</strong></td>' +
            '<td class="small">' + PT[o.thanhToan.phuongThuc] + '<br><span class="badge' + (mauTt[o.thanhToan.trangThai] ? ' badge--' + mauTt[o.thanhToan.trangThai] : '') + '">' + esc(DH.TT_TT[o.thanhToan.trangThai].replace(' – chờ đối soát', '')) + '</span></td>' +
            '<td>' + NG.ui.trangThaiDon(o) + '</td><td>' + (b.viec ? '<button class="btn btn--sm btn--primary" type="button" data-viec="' + b.viec + '" data-ma="' + o.ma + '">' + esc(b.nhan) + '</button>' : '<span class="xs muted">' + esc(b.goiY || '—') + '</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        (soTrang > 1 ? '<div class="flex between center mt-2"><button class="btn btn--sm" type="button" data-trang="-1"' + (trang <= 1 ? ' disabled' : '') + '>← Trước</button><span class="small muted">Trang ' + trang + ' / ' + soTrang + '</span><button class="btn btn--sm" type="button" data-trang="1"' + (trang >= soTrang ? ' disabled' : '') + '>Sau →</button></div>' : '')
        : NGA.trong0('Không có đơn nào ở mục này.')) + '</section>';
  }

  function chiTiet(ma) {
    const o = DH.tatCa().find((x) => x.ma === ma); if (!o) return; const b = NGA.don.buocTiep(o); const tp = NGA.kho.thanhPhan(d, o);
    const idx = ['ChoXacNhan', 'DaXacNhan', 'DangGiao', 'DaGiao'].indexOf(o.trangThai);
    const m = NG.ui.modal('<h2>Đơn ' + esc(o.ma) + ' ' + NG.ui.trangThaiDon(o) + '</h2>' +
      (o.trangThai === 'DaHuy' ? '<p class="alert alert--error">Đơn đã hủy' + (o.lyDoHuy ? ': ' + esc(o.lyDoHuy) : '') + '</p>' : '<div class="track">' + ['Chờ xác nhận', 'Đóng gói', 'Đang giao', 'Đã giao'].map((t, i) => '<div class="track__s' + (i <= idx ? ' is-done' : '') + (i === idx ? ' is-now' : '') + '">' + t + '</div>').join('') + '</div>') +
      (b.viec || b.goiY ? '<div class="alert mt-1" style="align-items:center;justify-content:space-between;flex-wrap:wrap"><span><strong>Việc tiếp theo:</strong> ' + esc(b.goiY) + '</span>' + (b.viec ? '<button class="btn btn--sm btn--primary" type="button" data-viec="' + b.viec + '" data-ma="' + o.ma + '">' + esc(b.nhan) + '</button>' : '') + '</div>' : '') +
      '<div class="qt-grid qt-grid--2 mt-2"><div><h3 style="font-size:var(--ng-fs-md)">Khách hàng</h3><dl class="dl"><dt>Người nhận</dt><dd>' + esc(o.hoTen) + '</dd><dt>Điện thoại</dt><dd><a href="tel:' + esc(o.sdt) + '">' + esc(o.sdt) + '</a></dd><dt>Địa chỉ</dt><dd>' + esc(o.diaChi.chiTiet + ', ' + o.diaChi.phuong + ', ' + o.diaChi.tinh) + '</dd>' + (o.ghiChu ? '<dt>Ghi chú</dt><dd>' + esc(o.ghiChu) + '</dd>' : '') + '<dt>Tài khoản</dt><dd>' + (o.khachHang ? 'Thành viên' : 'Khách không đăng ký') + '</dd><dt>Đến từ</dt><dd>' + esc(NGA.tenKenh(o)) + (o.tuTdee ? ' · qua gợi ý TDEE' : '') + '</dd></dl></div>' +
      '<div><h3 style="font-size:var(--ng-fs-md)">Giao hàng & thanh toán</h3><dl class="dl"><dt>Vận chuyển</dt><dd>' + esc(o.vanChuyen.donVi + ' · ' + o.vanChuyen.tenDichVu) + '</dd><dt>Mã vận đơn</dt><dd>' + esc(o.vanChuyen.maVanDon || 'Chưa có (tạo khi giao cho vận chuyển)') + '</dd><dt>Thanh toán</dt><dd>' + PT[o.thanhToan.phuongThuc] + ' · ' + esc(DH.TT_TT[o.thanhToan.trangThai]) + '</dd><dt>Tạm tính</dt><dd>' + tien(o.tamTinh) + '</dd>' + (o.giam ? '<dt>Giảm giá</dt><dd>−' + tien(o.giam) + ' (' + esc(o.maUuDai) + ')</dd>' : '') + '<dt>Phí giao</dt><dd>' + (o.phiGiao ? tien(o.phiGiao) : 'Miễn phí') + '</dd><dt>Khách trả</dt><dd style="font-size:1.1rem">' + tien(o.tongTien) + '</dd></dl></div></div>' +
      '<h3 class="mt-2" style="font-size:var(--ng-fs-md)">Sản phẩm trong đơn</h3><div class="table-wrap"><table class="qt-table"><tbody>' + o.dong.map((x) => '<tr><td><div class="cell-sp"><img src="' + anh(x.anh, true) + '" alt=""><span><strong>' + esc(x.ten) + '</strong><br><span class="xs muted">' + esc(x.quyCach) + (x.tenChon ? ' · ' + esc(x.tenChon) : '') + '</span></span></div></td><td class="r num">' + tien(x.donGia) + ' × ' + x.soLuong + '</td></tr>').join('') + '</tbody></table></div>' +
      '<p class="small mt-1"><strong>Phiếu soạn hàng:</strong> ' + Object.keys(tp).map((mm) => tp[mm] + ' × ' + esc((d.theoMa[mm] || {}).ten || mm) + ' (lô ' + esc(((d.theoMa[mm] || {}).lo || {}).ma || '—') + ')').join(' · ') + '</p>' +
      '<h3 class="mt-2" style="font-size:var(--ng-fs-md)">Lịch sử</h3><ol class="timeline">' + (o.lichSu || []).map((h) => '<li><span class="t">' + esc(DH.TT[h.trangThai] || h.trangThai) + '</span> – ' + esc(h.ghiChu || '') + '<br><span class="d">' + NG.gioNgay(h.luc) + ' · ' + esc(h.boi || '') + '</span></li>').join('') + '</ol>' +
      '<div class="modal__actions">' + (['ChoXacNhan', 'DaXacNhan'].includes(o.trangThai) ? '<button class="btn btn--sm btn--danger" type="button" data-huy="' + o.ma + '">Hủy đơn</button>' : '') + '<button class="btn btn--sm" type="button" data-dong>Đóng</button></div>', { rong: true, nhan: 'Chi tiết đơn ' + o.ma });
    m.addEventListener('click', async (e) => {
      const v = e.target.closest('[data-viec]'); if (v) { e.stopPropagation(); if (await thucHien(v.dataset.ma, v.dataset.viec)) { m.dong(); chiTiet(ma); } return; }
      const h = e.target.closest('[data-huy]');
      if (h) { const ly = await hoiLyDo(); if (ly) { await thucHien(ma, 'DaHuy', ly); m.dong(); chiTiet(ma); } }
    });
  }
  // hộp hỏi lý do hủy – chọn sẵn để không phải gõ
  function hoiLyDo() {
    return new Promise((ok) => {
      const ds = ['Hết hàng', 'Không liên lạc được khách', 'Khách yêu cầu hủy qua điện thoại', 'Quá hạn thanh toán'];
      const m = NG.ui.modal('<h2>Hủy đơn hàng</h2><p class="small">Lý do sẽ hiển thị cho khách trong trang đơn hàng. Nếu đơn đã trừ kho, hàng sẽ được cộng lại.</p><form><div class="opt-stack" style="display:grid;gap:8px">' + ds.map((x, i) => '<label class="option-card"><input type="radio" name="lyDo" value="' + x + '"' + (i ? '' : ' checked') + '><span class="t small">' + x + '</span></label>').join('') + '</div><div class="modal__actions"><button class="btn" type="button" data-dong>Giữ đơn</button><button class="btn btn--danger" type="submit">Xác nhận hủy</button></div></form>', { nhan: 'Hủy đơn', khiDong: () => ok(null) });
      m.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); ok(e.target.lyDo.value); m.dong(); });
    });
  }
  async function thucHien(ma, viec, lyDo) {
    try { d = await NGA.don.thucHien(ma, viec, lyDo); NG.ui.toast({ DaXacNhan: 'Đã xác nhận đơn và trừ tồn kho', DangGiao: 'Đã bàn giao cho vận chuyển', DaGiao: 'Đã đánh dấu giao xong', DaNhanTien: 'Đã ghi nhận thanh toán', DaHoanTien: 'Đã ghi nhận hoàn tiền', DaHuy: 'Đã hủy đơn' }[viec] + ' · ' + ma); NGA.veMenu(d); ve(); return true; }
    catch (er) { NG.ui.toast(er.message, 'error'); return false; }
  }
  el.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; trang = 1; history.replaceState(null, '', '?tab=' + tab); return ve(); }
    const p = e.target.closest('[data-trang]'); if (p) { trang += +p.dataset.trang; return ve(); }
    const v = e.target.closest('[data-viec]'); if (v) { e.stopPropagation(); return thucHien(v.dataset.ma, v.dataset.viec); }
    const r = e.target.closest('[data-mo]'); if (r) chiTiet(r.dataset.mo);
  });
  el.addEventListener('input', (e) => { if (e.target.matches('[data-tim]')) { tu = e.target.value; trang = 1; ve(); const i = $('[data-tim]'); i.focus(); i.setSelectionRange(tu.length, tu.length); } });
  window.addEventListener('ng:doi', (e) => { if (e.detail.tuTheKhac && e.detail.khoa === 'donHang') ve(); });
  ve(); if (NG.qs('ma')) chiTiet(NG.qs('ma'));
})();
