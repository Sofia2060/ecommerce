/* Đơn hàng của tôi (sitemap 4.1): lịch sử mua hàng, chi tiết đơn, theo dõi vận chuyển (FR09),
   yêu cầu đổi trả / khiếu nại 7 ngày kèm ảnh (FR10), đánh giá sản phẩm đã mua nhận xu (FR11), hủy đơn, đặt lại combo (FR16).
   Khách không đăng nhập tra cứu bằng mã đơn + số điện thoại. */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, so, tien, anh } = NG;
  const d = await NG.duLieu.coBan(); await NG.sanSang;
  const vung = $('[data-don-hang]'); const DH = NG.donHang;
  const BUOC = ['ChoXacNhan', 'DaXacNhan', 'DangGiao', 'DaGiao'];
  const TEN_BUOC = ['Chờ xác nhận', 'Đóng gói', 'Đang giao', 'Đã giao'];
  let tab = 'tat-ca';

  /* ---------- tra cứu khi chưa đăng nhập ---------- */
  function veTraCuu(loi, gt = {}) {
    document.title = 'Tra cứu đơn hàng | NutriGreen';
    vung.innerHTML = '<div class="lookup"><div class="card"><h1 style="font-size:var(--ng-fs-2xl)">Tra cứu đơn hàng</h1><p class="small">Nhập mã đơn (trong tin nhắn/email xác nhận) và số điện thoại đặt hàng.</p><form data-tra-cuu novalidate>' +
      '<div class="field"><label for="tc-ma">Mã đơn hàng</label><input class="input" id="tc-ma" name="ma" placeholder="NG2611021234" value="' + esc(gt.ma || NG.qs('ma') || '') + '" style="text-transform:uppercase"></div>' +
      '<div class="field"><label for="tc-sdt">Số điện thoại</label><input class="input" id="tc-sdt" name="sdt" type="tel" inputmode="tel" placeholder="09xx xxx xxx" value="' + esc(gt.sdt || '') + '"></div>' +
      (loi ? '<p class="alert alert--error">' + esc(loi) + '</p>' : '') + '<button class="btn btn--primary btn--block" type="submit">Tra cứu</button></form>' +
      '<hr><p class="small mb-0">Có tài khoản? <a href="account.html?tiep=orders.html"><strong>Đăng nhập</strong></a> để xem toàn bộ đơn, đánh giá nhận NutriCoins và gửi đổi trả nhanh hơn.</p></div></div>';
    $('[data-tra-cuu]').addEventListener('submit', (e) => {
      e.preventDefault(); const f = e.target; const don = DH.tim(f.ma.value, f.sdt.value);
      if (!don) return veTraCuu('Không tìm thấy đơn khớp mã và số điện thoại. Vui lòng kiểm tra lại.', { ma: f.ma.value, sdt: f.sdt.value });
      DH.moTrongPhien(don.ma); NG.track('tra_cuu_don', {}); history.replaceState(null, '', '?ma=' + don.ma); veChiTiet(don.ma);
    });
  }

  /* ---------- danh sách ---------- */
  function veDanhSach() {
    document.title = 'Đơn hàng của tôi | NutriGreen'; $('[data-bc]').textContent = 'Đơn hàng của tôi'; $$('[data-bc-ma]').forEach((x) => x.remove());
    const ds = DH.cuaToi();
    const loc = { 'tat-ca': () => true, 'xu-ly': (x) => ['ChoXacNhan', 'DaXacNhan'].includes(x.trangThai), 'dang-giao': (x) => x.trangThai === 'DangGiao', 'da-giao': (x) => x.trangThai === 'DaGiao', 'da-huy': (x) => x.trangThai === 'DaHuy' };
    const ten = { 'tat-ca': 'Tất cả', 'xu-ly': 'Đang xử lý', 'dang-giao': 'Đang giao', 'da-giao': 'Đã giao', 'da-huy': 'Đã hủy' };
    const ds2 = ds.filter(loc[tab]);
    vung.innerHTML = '<div class="page-title"><h1>Đơn hàng của tôi</h1><p>' + ds.length + ' đơn · tra cứu đơn đặt không cần tài khoản bằng <a href="#" data-tra-cuu-khac>mã đơn + SĐT</a></p></div>' +
      '<div class="tabs" role="tablist">' + Object.keys(ten).map((k) => '<button class="chip' + (k === tab ? ' is-active' : '') + '" role="tab" aria-selected="' + (k === tab) + '" type="button" data-tab="' + k + '">' + ten[k] + ' (' + ds.filter(loc[k]).length + ')</button>').join('') + '</div>' +
      (ds2.length ? ds2.map((o) => {
        const choDg = o.trangThai === 'DaGiao' ? o.dong.filter((x) => !NG.danhGia.daDanhGia(o.ma, x.ma)).length : 0;
        return '<article class="ocard"><div class="ocard__head"><div><strong>' + esc(o.ma) + '</strong> <span class="xs muted">· ' + NG.gioNgay(o.taoLuc) + '</span></div>' + NG.ui.trangThaiDon(o) + '</div>' +
          '<div class="ocard__imgs">' + o.dong.map((x) => '<img src="' + anh(x.anh, true) + '" alt="' + esc(x.ten) + '" title="' + esc(x.ten) + ' × ' + x.soLuong + '">').join('') + '<span class="small muted" style="align-self:center">' + o.dong.map((x) => esc(x.ten) + ' × ' + x.soLuong).join(', ') + '</span></div>' +
          '<div class="ocard__foot"><span>Tổng: <strong class="price">' + tien(o.tongTien) + '</strong> · <span class="small muted">' + so(o.tongKcal) + ' kcal</span>' + (choDg ? ' · <span class="badge badge--lime">' + choDg + ' sản phẩm chờ đánh giá</span>' : '') + '</span><span class="flex gap-1 wrap">' +
          (DH.coTheHuy(o) ? '<button class="btn btn--sm btn--danger" type="button" data-huy="' + o.ma + '">Hủy đơn</button>' : '') +
          (['DaGiao', 'DaHuy'].includes(o.trangThai) ? '<button class="btn btn--sm" type="button" data-dat-lai="' + o.ma + '">Mua lại</button>' : '') +
          '<a class="btn btn--sm btn--primary" href="orders.html?ma=' + o.ma + '">Xem chi tiết</a></span></div></article>';
      }).join('') : '<div class="empty">' + NG.IC.trong + '<h3>Chưa có đơn nào ở mục này</h3><a class="btn btn--primary" href="products.html">Mua sắm ngay</a></div>');
  }

  /* ---------- chi tiết ---------- */
  function veChiTiet(ma) {
    const o = DH.xem(ma);
    if (!o) { if (NG.taiKhoan.hienTai()) { vung.innerHTML = '<div class="empty"><h3>Không tìm thấy đơn ' + esc(ma) + ' trong tài khoản</h3><a class="btn" href="orders.html">Về danh sách đơn</a></div>'; } else veTraCuu(); return; }
    document.title = 'Đơn ' + o.ma + ' | NutriGreen'; const bc = $('[data-bc]'); bc.removeAttribute('aria-current'); bc.innerHTML = '<a href="orders.html">Đơn hàng</a>'; bc.insertAdjacentHTML('afterend', '<li aria-current="page" data-bc-ma>' + esc(o.ma) + '</li>'); $$('[data-bc-ma]').slice(1).forEach((x) => x.remove());
    const huy = o.trangThai === 'DaHuy'; const idx = BUOC.indexOf(o.trangThai);
    const pt = d.cauHinh.thanhToan.find((x) => x.ma === o.thanhToan.phuongThuc);
    const hanDt = DH.hanDoiTra(o); const yc = NG.doiTra.cuaDon(o.ma); const u = NG.taiKhoan.hienTai();
    const vc = o.vanChuyen; const link = vc.maVanDon ? (vc.donVi === 'GHTK' ? 'https://i.ghtk.vn/' + vc.maVanDon : 'https://ahamove.com/') : '';
    vung.innerHTML = '<div class="page-title flex between wrap gap-1"><div><h1>Đơn ' + esc(o.ma) + '</h1><p>Đặt lúc ' + NG.gioNgay(o.taoLuc) + ' · ' + NG.ui.trangThaiDon(o) + '</p></div>' + (u ? '<a class="btn btn--sm" href="orders.html">← Tất cả đơn</a>' : '') + '</div>' +
      '<div class="od"><div>' +
      (huy ? '<div class="alert alert--error mb-2"><span>Đơn đã hủy' + (o.lyDoHuy ? ': ' + esc(o.lyDoHuy) : '') + '.' + (o.thanhToan.trangThai === 'ChoHoanTien' ? ' Tiền đã thanh toán sẽ được hoàn trong 3–5 ngày làm việc.' : '') + '</span></div>'
        : '<section class="panel"><h2>Trạng thái đơn hàng</h2><div class="track">' + TEN_BUOC.map((t, i) => '<div class="track__s' + (i < idx ? ' is-done' : i === idx ? ' is-done is-now' : '') + '">' + t + '</div>').join('') + '</div>' +
          (o.thanhToan.phuongThuc !== 'COD' && o.thanhToan.trangThai === 'ChuaThanhToan' ? '<div class="alert alert--warn mt-2"><span>Đơn chưa thanh toán. <a href="order-success.html?ma=' + o.ma + '"><strong>Xem mã QR thanh toán</strong></a> (hạn ' + NG.gioNgay(o.thanhToan.hanThanhToan) + ').</span></div>' : '') + '</section>') +
      '<section class="panel"><div class="flex between center wrap gap-1"><h2 class="mb-0">Vận chuyển</h2>' + (link ? '<a class="small" href="' + link + '" target="_blank" rel="noopener">Tra cứu trên ' + esc(vc.donVi) + ' ↗</a>' : '') + '</div>' +
      '<p class="small mt-1">' + esc(vc.donVi) + ' · ' + esc(vc.tenDichVu) + ' · ' + esc(vc.thoiGian) + (vc.maVanDon ? '<br>Mã vận đơn: <strong>' + esc(vc.maVanDon) + '</strong> <button class="btn btn--sm btn--ghost" type="button" data-copy="' + esc(vc.maVanDon) + '">Sao chép</button>' : '') + '</p>' +
      (vc.hanhTrinh && vc.hanhTrinh.length ? '<ol class="timeline">' + vc.hanhTrinh.map((h) => '<li><span class="t">' + esc(h.noiDung) + '</span><br><span class="d">' + NG.gioNgay(h.luc) + '</span></li>').join('') + '</ol>' : '<p class="small muted mb-0">Hành trình sẽ cập nhật khi đơn được bàn giao cho đơn vị vận chuyển.</p>') + '</section>' +
      '<section class="panel"><h2>Sản phẩm</h2>' + o.dong.map((x) => {
        const daDg = NG.danhGia.daDanhGia(o.ma, x.ma);
        return '<div class="od-item"><img src="' + anh(x.anh, true) + '" alt=""><div><a class="strong" href="' + NG.url('chiTiet', { ma: x.ma }) + '">' + esc(x.ten) + '</a><div class="xs muted">' + esc(x.quyCach) + (x.tenChon ? ' · ' + esc(x.tenChon) : '') + ' · ' + so(x.kcal) + ' kcal</div></div><div class="r small">' + tien(x.donGia) + ' × ' + x.soLuong + '</div>' +
          (o.trangThai === 'DaGiao' ? '<div class="actions">' + (daDg ? '<span class="badge badge--green">✓ Đã đánh giá</span>' : u && u.id === o.khachHang ? '<button class="btn btn--sm btn--primary" type="button" data-danh-gia="' + esc(x.ma) + '">Đánh giá +' + d.cauHinh.nutriCoins.danhGiaChu + '–' + d.cauHinh.nutriCoins.danhGiaAnh + ' xu</button>' : '<a class="small" href="account.html?tiep=' + encodeURIComponent('orders.html?ma=' + o.ma) + '">Đăng nhập để đánh giá</a>') + '</div>' : '') + '</div>';
      }).join('') + '</section>' +
      '<section class="panel"><div class="flex between center wrap gap-1"><h2 class="mb-0">Đổi trả &amp; khiếu nại</h2>' + (DH.coTheDoiTra(o) ? '<button class="btn btn--sm" type="button" data-doi-tra>Gửi yêu cầu đổi trả</button>' : '') + '</div>' +
      (yc.length ? yc.map((r) => '<div class="ret mt-1"><div class="flex between wrap gap-1"><strong>' + esc(r.ma) + ' · ' + esc(r.lyDo) + '</strong><span class="badge badge--' + ({ DaTiepNhan: 'orange', DangXuLy: 'blue', DaGiaiQuyet: 'green', TuChoi: 'red' }[r.trangThai]) + '">' + esc(NG.doiTra.TT[r.trangThai]) + '</span></div><p class="small mb-0">' + esc(r.moTa) + '</p><p class="xs muted">Phương án mong muốn: ' + esc(r.phuongAn) + ' · gửi ' + NG.gioNgay(r.taoLuc) + '</p>' + (r.anh && r.anh.length ? '<div class="review__imgs">' + r.anh.map((a) => '<img src="' + a + '" alt="Ảnh minh chứng" style="width:64px;height:64px;object-fit:cover;border-radius:8px">').join('') + '</div>' : '') + (r.phanHoi ? '<div class="review__reply"><strong>NutriGreen:</strong> ' + esc(r.phanHoi) + '</div>' : '') + '</div>').join('')
        : '<p class="small muted mt-1 mb-0">' + (o.trangThai === 'DaGiao' ? (DH.coTheDoiTra(o) ? 'Bánh vỡ, hạt ôi dầu, giao sai/thiếu? Gửi yêu cầu kèm ảnh trước ' + NG.gioNgay(hanDt) + '.' : 'Đơn đã quá thời hạn đổi trả 7 ngày (đến ' + NG.ngay(hanDt) + '). Vui lòng liên hệ hotline nếu cần hỗ trợ.') : 'Yêu cầu đổi trả mở trong 7 ngày kể từ khi nhận hàng.') + '</p>') + '</section>' +
      '<section class="panel"><h2>Lịch sử đơn</h2><ol class="timeline">' + (o.lichSu || []).map((h) => '<li><span class="t">' + esc(DH.TT[h.trangThai] || h.trangThai) + '</span> – ' + esc(h.ghiChu || '') + '<br><span class="d">' + NG.gioNgay(h.luc) + ' · ' + esc(h.boi || '') + '</span></li>').join('') + '</ol></section>' +
      '</div><aside class="co__side"><div class="panel"><h2>Thanh toán</h2><div class="sum"><div class="sum__row"><span>Tạm tính</span><span>' + tien(o.tamTinh) + '</span></div>' + (o.giam ? '<div class="sum__row sum__row--disc"><span>Giảm (' + esc(o.maUuDai) + ')</span><span>−' + tien(o.giam) + '</span></div>' : '') + '<div class="sum__row"><span>Phí giao</span><span>' + (o.phiGiao ? tien(o.phiGiao) : 'Miễn phí') + '</span></div><div class="sum__row sum__row--total"><span>Tổng</span><span>' + tien(o.tongTien) + '</span></div>' +
      '<div class="sum__row xs"><span class="muted">Phương thức</span><span>' + esc(pt ? pt.ten : o.thanhToan.phuongThuc) + '</span></div><div class="sum__row xs"><span class="muted">Trạng thái</span><span class="strong">' + esc(DH.TT_TT[o.thanhToan.trangThai] || '') + '</span></div></div></div>' +
      '<div class="panel"><h2>Nhận hàng</h2><p class="small mb-0"><strong>' + esc(o.hoTen) + '</strong> · ' + esc(o.sdt) + '<br>' + esc(o.diaChi.chiTiet + ', ' + o.diaChi.phuong + ', ' + o.diaChi.tinh) + (o.ghiChu ? '<br><span class="muted">Ghi chú: ' + esc(o.ghiChu) + '</span>' : '') + '</p></div>' +
      (o.khachHang && o.trangThai !== 'DaHuy' ? '<div class="panel"><p class="small mb-0">' + (o.trangThai === 'DaGiao' ? 'Đơn đã tích <strong>' : 'Đơn sẽ tích <strong>') + so(Math.floor((o.tamTinh - o.giam) / 1000)) + ' NutriCoins</strong>' + (o.trangThai === 'DaGiao' ? '.' : ' khi giao thành công.') + ' <a href="rewards.html">Ví ưu đãi</a></p></div>' : '') +
      '<div class="panel flex wrap gap-1">' + (DH.coTheHuy(o) ? '<button class="btn btn--sm btn--danger" type="button" data-huy="' + o.ma + '">Hủy đơn</button>' : '') + (['DaGiao', 'DaHuy'].includes(o.trangThai) ? '<button class="btn btn--sm btn--primary" type="button" data-dat-lai="' + o.ma + '">' + (o.coCombo ? 'Đặt lại combo' : 'Mua lại') + '</button>' : '') + '<a class="btn btn--sm" href="contact.html">Cần hỗ trợ?</a></div></aside></div>';
  }

  /* ---------- hộp thoại ---------- */
  async function moHuy(ma) {
    const m = NG.ui.modal('<h2>Hủy đơn ' + esc(ma) + '?</h2><p class="small">Đơn chưa được xác nhận nên có thể hủy ngay. Vui lòng cho NutriGreen biết lý do:</p><form data-f-huy><div class="opt-stack">' + ['Muốn đổi sản phẩm / combo khác', 'Muốn đổi địa chỉ giao hàng', 'Đặt trùng đơn', 'Tìm được giá tốt hơn', 'Không còn nhu cầu', 'Lý do khác'].map((l, i) => '<label class="option-card"><input type="radio" name="lyDo" value="' + l + '"' + (i === 0 ? ' checked' : '') + '><span class="t small">' + l + '</span></label>').join('') + '</div>' +
      '<p class="xs muted mt-1">Muốn đổi sản phẩm hoặc địa chỉ? Bạn có thể chat Zalo để được điều chỉnh đơn mà không cần hủy.</p><div class="modal__actions"><button class="btn" type="button" data-dong>Giữ đơn</button><button class="btn btn--danger" type="submit">Xác nhận hủy</button></div></form>', { nhan: 'Hủy đơn' });
    m.querySelector('form').addEventListener('submit', (e) => { e.preventDefault(); try { DH.huy(ma, e.target.lyDo.value); NG.track('huy_don', { ma, lyDo: e.target.lyDo.value }); m.dong(); NG.ui.toast('Đã hủy đơn ' + ma); render(); } catch (er) { NG.ui.toast(er.message, 'error'); m.dong(); } });
  }
  function hopAnh(toiDa) {
    const anhs = [];
    const html = '<div class="uploads" data-uploads><label class="uploads__add">+ Ảnh<br>(tối đa ' + toiDa + ')<input type="file" accept="image/*" multiple hidden data-file></label></div>';
    const gan = (m) => {
      const box = m.querySelector('[data-uploads]');
      const ve = () => { $$('.uploads__item', box).forEach((x) => x.remove()); anhs.forEach((a, i) => box.insertAdjacentHTML('afterbegin', '<div class="uploads__item"><img src="' + a + '" alt=""><button type="button" data-bo-anh="' + i + '" aria-label="Bỏ ảnh">×</button></div>')); box.querySelector('.uploads__add').hidden = anhs.length >= toiDa; };
      box.addEventListener('change', async (e) => { for (const f of Array.from(e.target.files).slice(0, toiDa - anhs.length)) { try { anhs.push(await NG.ui.nenAnh(f, 800)); } catch (er) { NG.ui.toast('Không đọc được ảnh ' + f.name, 'error'); } } e.target.value = ''; ve(); });
      box.addEventListener('click', (e) => { const b = e.target.closest('[data-bo-anh]'); if (b) { anhs.splice(+b.dataset.boAnh, 1); ve(); } });
    };
    return { html, gan, anhs };
  }
  function moDoiTra(ma) {
    const o = DH.xem(ma); const cf = d.cauHinh.doiTra; const da = o.thanhToan.trangThai === 'DaThanhToan' || o.thanhToan.phuongThuc !== 'COD';
    const h = hopAnh(cf.toiDaAnh);
    const m = NG.ui.modal('<h2>Yêu cầu đổi trả</h2><p class="small">Đơn ' + esc(ma) + ' · hạn gửi đến ' + NG.gioNgay(DH.hanDoiTra(o)) + '</p><form data-f-dt novalidate>' +
      '<div class="field"><span class="label">Sản phẩm gặp vấn đề</span>' + o.dong.map((x) => '<label class="check"><input type="checkbox" name="sp" value="' + esc(x.ma) + '"' + (o.dong.length === 1 ? ' checked' : '') + '> ' + esc(x.ten) + (x.tenChon ? ' (' + esc(x.tenChon) + ')' : '') + '</label>').join('') + '</div>' +
      '<div class="field"><label for="dt-ly">Vấn đề</label><select class="select" id="dt-ly" name="lyDo">' + cf.lyDo.map((l) => '<option>' + esc(l) + '</option>').join('') + '</select></div>' +
      '<div class="field"><label for="dt-mt">Mô tả</label><textarea class="textarea" id="dt-mt" name="moTa" placeholder="VD: 3/10 thanh hạt bị vỡ vụn, hộp móp góc"></textarea><span class="err"></span></div>' +
      '<div class="field"><span class="label">Ảnh minh chứng</span>' + h.html + '<span class="hint">Chụp rõ sản phẩm và tem lô/HSD trên bao bì giúp xử lý nhanh hơn.</span></div>' +
      '<div class="field"><label for="dt-vd">Video mở hộp <span class="muted xs">(không bắt buộc)</span></label><input class="input" id="dt-vd" name="video" type="file" accept="video/*"><span class="hint">Bản demo chỉ lưu tên tệp video.</span></div>' +
      '<div class="field"><span class="label">Bạn muốn</span><div class="flex gap-1 wrap">' + cf.phuongAn.map((p0, i) => '<label class="option-card" style="flex:1"><input type="radio" name="phuongAn" value="' + esc(p0) + '"' + (i === 0 ? ' checked' : '') + '><span class="t small">' + esc(p0) + '</span></label>').join('') + '</div></div>' +
      '<div class="field" data-tk hidden><label for="dt-tk">Tài khoản nhận hoàn tiền</label><input class="input" id="dt-tk" name="taiKhoan" placeholder="Ngân hàng – số tài khoản – tên chủ tài khoản"><span class="hint">' + (da ? 'Đơn đã thanh toán trực tuyến: hoàn về tài khoản này trong 3–5 ngày làm việc.' : 'Đơn COD: hoàn tiền về tài khoản này sau khi NutriGreen nhận lại hàng.') + '</span></div>' +
      '<p class="err small" data-loi></p><div class="modal__actions"><button class="btn" type="button" data-dong>Hủy</button><button class="btn btn--primary" type="submit">Gửi yêu cầu</button></div></form>', { rong: true, nhan: 'Yêu cầu đổi trả' });
    h.gan(m);
    const f = m.querySelector('form');
    f.addEventListener('change', () => { m.querySelector('[data-tk]').hidden = f.phuongAn.value !== 'Hoàn tiền'; });
    f.addEventListener('submit', (e) => {
      e.preventDefault(); const sp = $$('input[name="sp"]:checked', f).map((i) => i.value); const l = f.querySelector('[data-loi]');
      if (!sp.length) { l.textContent = 'Chọn ít nhất 1 sản phẩm.'; return; }
      if (f.moTa.value.trim().length < 10) { l.textContent = 'Mô tả tối thiểu 10 ký tự.'; return; }
      if (!h.anhs.length) { l.textContent = 'Vui lòng đính kèm ít nhất 1 ảnh minh chứng.'; return; }
      if (f.phuongAn.value === 'Hoàn tiền' && f.taiKhoan.value.trim().length < 8) { l.textContent = 'Vui lòng nhập tài khoản nhận hoàn tiền.'; return; }
      try {
        const r = NG.doiTra.tao({ maDon: ma, sanPham: sp, lyDo: f.lyDo.value, moTa: f.moTa.value.trim(), anh: h.anhs.slice(), video: f.video.files[0] ? [f.video.files[0].name] : [], phuongAn: f.phuongAn.value, taiKhoanHoan: f.phuongAn.value === 'Hoàn tiền' ? f.taiKhoan.value.trim() : '' });
        m.dong(); NG.ui.toast('Đã gửi yêu cầu ' + r.ma + '. NutriGreen phản hồi trong giờ hành chính.'); render();
      } catch (er) { l.textContent = er.message; }
    });
  }
  function moDanhGia(maDon, maSp) {
    const o = DH.xem(maDon); const x = o.dong.find((y) => y.ma === maSp); const h = hopAnh(3); const nc = d.cauHinh.nutriCoins;
    const m = NG.ui.modal('<h2>Đánh giá ' + esc(x.ten) + '</h2><form data-f-dg novalidate><div class="field"><span class="label">Chấm điểm</span><div class="star-input">' + [5, 4, 3, 2, 1].map((s) => '<input type="radio" name="sao" id="sao' + s + '" value="' + s + '"' + (s === 5 ? ' checked' : '') + '><label for="sao' + s + '" title="' + s + ' sao">' + NG.IC.sao + '</label>').join('') + '</div></div>' +
      '<div class="field"><label for="dg-nd">Nhận xét</label><textarea class="textarea" id="dg-nd" name="noiDung" placeholder="Vị, độ giòn, đóng gói, bảng dinh dưỡng có hữu ích không…"></textarea><span class="hint">Tối thiểu 20 ký tự</span></div>' +
      '<div class="field"><span class="label">Ảnh thật <span class="muted xs">(+' + (nc.danhGiaAnh - nc.danhGiaChu) + ' xu)</span></span>' + h.html + '</div>' +
      '<p class="xs muted">Đánh giá được hiển thị công khai với tên viết tắt và nhãn “Đã mua hàng”. NutriGreen chỉ ẩn đánh giá vi phạm quy định, không ẩn đánh giá tiêu cực.</p><p class="err small" data-loi></p>' +
      '<div class="modal__actions"><button class="btn" type="button" data-dong>Để sau</button><button class="btn btn--primary" type="submit">Gửi đánh giá</button></div></form>', { nhan: 'Đánh giá sản phẩm' });
    h.gan(m);
    m.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault(); const f = e.target;
      if (f.noiDung.value.trim().length < 20) { f.querySelector('[data-loi]').textContent = 'Nhận xét tối thiểu 20 ký tự.'; return; }
      try { const r = await NG.danhGia.tao({ maDon, maSp, sao: +f.sao.value, noiDung: f.noiDung.value.trim(), anh: h.anhs.slice() }); m.dong(); NG.ui.toast('Cảm ơn bạn! +' + r.xu + ' NutriCoins', 'ok', { text: 'Xem ví', href: 'rewards.html' }); render(); }
      catch (er) { f.querySelector('[data-loi]').textContent = er.message; }
    });
  }

  vung.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-tab]'); if (t) { tab = t.dataset.tab; return veDanhSach(); }
    if (e.target.closest('[data-tra-cuu-khac]')) { e.preventDefault(); return veTraCuu(); }
    const h = e.target.closest('[data-huy]'); if (h) return moHuy(h.dataset.huy);
    const r = e.target.closest('[data-dat-lai]'); if (r) { const n = await DH.datLai(r.dataset.datLai); if (n) location.href = 'cart.html'; else NG.ui.toast('Sản phẩm trong đơn hiện đã hết hàng.', 'error'); return; }
    if (e.target.closest('[data-doi-tra]')) return moDoiTra(NG.qs('ma'));
    const g = e.target.closest('[data-danh-gia]'); if (g) return moDanhGia(NG.qs('ma'), g.dataset.danhGia);
  });
  function render() { const ma = NG.qs('ma'); if (ma) veChiTiet(ma.toUpperCase()); else if (NG.taiKhoan.hienTai()) veDanhSach(); else veTraCuu(); }
  // trang quản trị (thẻ khác) đổi trạng thái đơn / phản hồi đổi trả → tự cập nhật
  window.addEventListener('ng:doi', (e) => { if (e.detail.tuTheKhac && ['donHang', 'doiTra', 'danhGia'].includes(e.detail.khoa)) render(); });
  render();
})();
