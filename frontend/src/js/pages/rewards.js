/* Ví ưu đãi / tích điểm thành viên (FR11): số dư NutriCoins, xu chờ tích lũy, đổi voucher, voucher của tôi, lịch sử xu */
(async function () {
  'use strict';
  const NG = window.NG; const { $, esc, so, tien } = NG;
  const d = await NG.duLieu.coBan(); await NG.sanSang;
  const vung = $('[data-vi]'); const nc = d.cauHinh.nutriCoins;

  function ve() {
    const u = NG.taiKhoan.hienTai();
    if (!u) {
      vung.innerHTML = '<div class="coin-hero"><div><p class="eyebrow" style="color:var(--ng-lime)">NutriCoins</p><h2 style="color:#fff">Mua sắm và đánh giá để tích xu</h2><p>' + esc(nc.tichLuy) + '. Đánh giá sản phẩm +' + nc.danhGiaChu + ' xu, kèm ảnh +' + nc.danhGiaAnh + ' xu.</p></div><a class="btn btn--lime btn--lg" href="account.html?tiep=rewards.html">Đăng nhập để xem ví</a></div>' + quaHtml(0, false);
      return;
    }
    const soDu = NG.xu.soDu(u.id); const cho = NG.xu.choTichLuy(u.id); const ls = NG.xu.lichSu(u.id); const vi = NG.xu.vi(u.id);
    const hom = new Date().toISOString().slice(0, 10);
    vung.innerHTML = '<div class="coin-hero"><div><p class="eyebrow" style="color:var(--ng-lime)">Số dư của ' + esc(u.hoTen) + '</p><b>' + so(soDu) + '</b> <span style="color:#fff;font-weight:700">NutriCoins</span><p class="mt-1">' + (cho ? 'Thêm <strong style="color:var(--ng-lime)">' + so(cho) + ' xu</strong> chờ tích lũy khi các đơn đang xử lý giao thành công. ' : '') + esc(nc.tichLuy) + '.</p></div><a class="btn btn--lime" href="orders.html">Đánh giá đơn đã giao</a></div>' +
      quaHtml(soDu, true) +
      '<section class="panel mt-3"><h2>Voucher của tôi</h2>' + (vi.length ? '<div class="grid">' + vi.slice().reverse().map((v) => {
        const het = v.hetHan < hom; const off = v.daDung || het;
        return '<div class="vcard' + (off ? ' vcard--off' : '') + '"><span class="vcard__l">−' + so(v.giam / 1000) + 'K</span><div><strong>' + esc(v.ten) + '</strong><div class="xs muted">Mã <b>' + esc(v.ma) + '</b> · đơn từ ' + tien(v.donToiThieu) + (v.chiCombo ? ' · chỉ đơn có combo' : '') + ' · HSD ' + NG.ngay(v.hetHan) + '</div></div>' +
          (v.daDung ? '<span class="badge">Đã dùng · ' + esc(v.daDung) + '</span>' : het ? '<span class="badge badge--red">Hết hạn</span>' : '<button class="btn btn--sm" type="button" data-dung="' + esc(v.ma) + '">Dùng ngay</button>') + '</div>';
      }).join('') + '</div>' : '<p class="small muted">Bạn chưa có voucher. Đổi xu ở trên để nhận voucher.</p>') + '</section>' +
      '<section class="panel"><h2>Lịch sử NutriCoins</h2>' + (ls.length ? '<div class="table-wrap"><table class="table"><thead><tr><th>Ngày</th><th>Nội dung</th><th class="r">Xu</th></tr></thead><tbody>' + ls.map((x) => '<tr><td>' + NG.ngay(x.luc) + '</td><td>' + esc(x.ghiChu) + '</td><td class="r strong" style="color:' + (x.xu < 0 ? 'var(--ng-red)' : 'var(--ng-green)') + '">' + (x.xu > 0 ? '+' : '') + so(x.xu) + '</td></tr>').join('') + '</tbody></table></div>' : '<p class="small muted">Chưa có giao dịch.</p>') + '</section>' +
      '<section class="panel"><h2>Cách tích và dùng xu</h2><ul class="small"><li>' + esc(nc.tichLuy) + ' (tính trên tiền hàng sau giảm giá, không gồm phí giao).</li><li>Viết đánh giá cho sản phẩm đã mua: +' + nc.danhGiaChu + ' xu; kèm ảnh thật: +' + nc.danhGiaAnh + ' xu.</li><li>Voucher đổi từ xu có hạn 30 ngày, mỗi voucher dùng một lần, nhập mã ở giỏ hàng.</li><li>Đơn bị hủy hoặc hoàn tiền không được tích xu.</li></ul></section>';
  }
  function quaHtml(soDu, coTk) {
    return '<section class="mt-3"><h2>Đổi xu lấy voucher</h2><div class="gifts">' + nc.doiThuong.map((q) => '<div class="gift"><span class="xu">' + so(q.xu) + ' xu</span><strong>' + esc(q.ten) + '</strong><span class="small muted">Đơn từ ' + tien(q.donToiThieu) + (q.chiCombo ? ' · chỉ đơn có combo' : '') + '</span>' +
      (coTk ? '<button class="btn btn--sm' + (soDu >= q.xu ? ' btn--primary' : '') + '" type="button" data-doi="' + q.ma + '"' + (soDu >= q.xu ? '' : ' disabled') + '>' + (soDu >= q.xu ? 'Đổi ngay' : 'Còn thiếu ' + so(q.xu - soDu) + ' xu') + '</button>' : '') + '</div>').join('') + '</div></section>';
  }
  vung.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-doi]');
    if (b) {
      const q = nc.doiThuong.find((x) => x.ma === b.dataset.doi);
      if (!(await NG.ui.xacNhan('Đổi ' + so(q.xu) + ' xu?', 'Bạn sẽ nhận <strong>' + esc(q.ten) + '</strong>, hạn dùng 30 ngày.', 'Đổi xu'))) return;
      try { const v = await NG.xu.doi(q.ma); NG.ui.toast('Đã nhận voucher ' + v.ma); ve(); } catch (er) { NG.ui.toast(er.message, 'error'); }
    }
    const dg = e.target.closest('[data-dung]');
    if (dg) { try { sessionStorage.setItem('ng.thanhToan', JSON.stringify(Object.assign(JSON.parse(sessionStorage.getItem('ng.thanhToan') || '{}'), { maUuDai: dg.dataset.dung }))); } catch (er) { /* bỏ qua */ } location.href = 'cart.html'; }
  });
  window.addEventListener('ng:doi', (e) => { if (['donHang', 'giaoDichXu', 'voucher'].includes(e.detail.khoa) && e.detail.tuTheKhac) ve(); });
  ve();
})();
