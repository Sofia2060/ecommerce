/* Sản phẩm đã xem & Sản phẩm yêu thích (sitemap 4.1) – dùng chung một tệp, phân biệt bằng data-danh-sach trên <body> */
(async function () {
  'use strict';
  const NG = window.NG; const { $, esc, so, tien } = NG;
  const d = await NG.duLieu.coBan();
  const loai = document.body.dataset.danhSach; const yt = loai === 'yeu-thich';
  const nguon = yt ? NG.yeuThich : NG.daXem;
  const tieuDe = yt ? 'Sản phẩm yêu thích' : 'Sản phẩm đã xem';
  $('[data-bc]').textContent = tieuDe; $('[data-tieu-de]').textContent = tieuDe;

  function ve() {
    const ds = nguon.ds().map((m) => d.theoMa[m]).filter(Boolean);
    $('[data-mo-ta]').textContent = ds.length ? ds.length + ' sản phẩm · lưu trên trình duyệt này' : '';
    $('[data-hanh-dong]').innerHTML = ds.length ? (yt ? '<button class="btn btn--sm btn--primary" type="button" data-them-het>Thêm tất cả còn hàng vào giỏ</button>' : '<button class="btn btn--sm" type="button" data-xoa-het>Xóa lịch sử xem</button>') : '';
    // so sánh nhanh dinh dưỡng các sản phẩm đã lưu (không gồm combo)
    const le = ds.filter((s) => s.loai !== 'combo');
    $('[data-tong-hop]').innerHTML = le.length >= 2 ? '<div class="table-wrap"><table class="cmp"><caption class="sr-only">So sánh nhanh</caption><thead><tr><th>So sánh nhanh · mỗi khẩu phần</th><th>kcal</th><th>Protein</th><th>Đường</th><th>Giá</th></tr></thead><tbody>' +
      le.map((s) => '<tr><td><a href="' + NG.url('chiTiet', { ma: s.ma }) + '"><img src="' + NG.anh(s.anh, true) + '" alt="">' + esc(s.ten) + '</a></td><td class="num">' + so(s.kp.kcal) + '</td><td class="num">' + so(s.kp.protein, 1) + 'g</td><td class="num">' + so(s.kp.duong, 1) + 'g</td><td class="num strong">' + tien(s.gia) + '</td></tr>').join('') + '</tbody></table></div>' : '';
    $('[data-ds]').innerHTML = ds.length ? ds.map((s) => NG.ui.the(s, d)).join('')
      : '<div class="empty" style="grid-column:1/-1">' + NG.IC.tim.replace('<svg', '<svg width="64" height="64"') + '<h3>' + (yt ? 'Chưa có sản phẩm yêu thích' : 'Bạn chưa xem sản phẩm nào') + '</h3><p>' + (yt ? 'Bấm biểu tượng ♡ trên sản phẩm để lưu lại và so sánh sau.' : 'Các sản phẩm bạn xem sẽ hiện ở đây để quay lại nhanh.') + '</p><a class="btn btn--primary" href="products.html">Khám phá sản phẩm</a></div>';
  }
  document.addEventListener('click', async (e) => {
    if (e.target.closest('[data-xoa-het]')) { NG.daXem.xoa(); ve(); }
    if (e.target.closest('[data-them-het]')) { let n = 0; for (const m of NG.yeuThich.ds()) { const s = d.theoMa[m]; if (s && s.conHang && await NG.gio.them(m, 1, { imLang: true })) n++; } NG.ui.toast('Đã thêm ' + n + ' sản phẩm vào giỏ', 'ok', { text: 'Xem giỏ', href: 'cart.html' }); }
  });
  window.addEventListener('ng:doi', (e) => { if (e.detail.khoa === (yt ? 'yeuThich' : 'daXem')) ve(); });
  ve();
})();
