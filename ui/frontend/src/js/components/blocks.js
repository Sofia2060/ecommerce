/* Khối giao diện dùng lại: bảng dinh dưỡng (FR03), thẻ combo, thẻ bài viết */
(function () {
  'use strict';
  const NG = window.NG; const { esc, so, tien, anh } = NG;

  // Bảng dinh dưỡng dạng nhãn, chuyển được giữa 100g / khẩu phần / cả gói
  NG.ui.nhanDinhDuong = function (sp, opt = {}) {
    const n = sp.dinhDuong.tren100g; const kp = sp.dinhDuong.khauPhan;
    const che = opt.che || 'kp';
    const he = che === '100g' ? 1 : che === 'goi' ? sp.khoiLuong / 100 : kp.g / 100;
    const nhan = che === '100g' ? '100g' : che === 'goi' ? 'Cả gói (' + sp.khoiLuong + 'g)' : 'Khẩu phần: ' + kp.moTa;
    const v = (x, le = 1) => so(x * he, le);
    const mucTieu = opt.mucTieuKcal ? Math.round(n.kcal * he / opt.mucTieuKcal * 100) : null;
    return '<div class="nlabel" data-nlabel="' + esc(sp.ma) + '">' +
      '<div class="nlabel__head"><h3>Giá trị dinh dưỡng</h3>' +
      (opt.khongChuyen ? '' : '<div class="seg" role="group" aria-label="Đơn vị">' + [['kp', 'Khẩu phần'], ['100g', '100g'], ['goi', 'Cả gói']].map((x) => '<button type="button" data-che="' + x[0] + '" aria-pressed="' + (che === x[0]) + '">' + x[1] + '</button>').join('') + '</div>') + '</div>' +
      '<div class="nlabel__serv">' + esc(nhan) + (che !== 'goi' ? ' · ' + so(sp.khoiLuong / kp.g, 0) + ' khẩu phần/gói' : '') + '</div>' +
      '<div class="nlabel__kcal"><span>Năng lượng</span><span><b>' + v(n.kcal, 0) + '</b> kcal</span></div>' +
      (mucTieu != null ? '<div class="nlabel__split small">Bằng <strong>' + mucTieu + '%</strong> mục tiêu ' + so(opt.mucTieuKcal) + ' kcal/ngày của bạn</div>' : '') +
      '<table><tbody>' +
      '<tr><td><i style="background:var(--ng-protein)"></i>Protein (chất đạm)</td><td>' + v(n.protein) + ' g</td></tr>' +
      '<tr><td><i style="background:var(--ng-fat)"></i>Chất béo</td><td>' + v(n.beo) + ' g</td></tr>' +
      '<tr><td><i style="background:var(--ng-carb)"></i>Carbohydrate</td><td>' + v(n.carb) + ' g</td></tr>' +
      '<tr class="sub"><td>trong đó: Chất xơ</td><td>' + v(n.xo) + ' g</td></tr>' +
      '<tr class="sub"><td>trong đó: Đường</td><td>' + v(n.duong) + ' g</td></tr>' +
      '</tbody></table>' +
      '<div class="nlabel__split"><span class="xs muted">Tỷ lệ năng lượng</span>' + NG.ui.macroBar(sp.tyLe) +
      '<div class="macro-legend"><span class="p"><i></i>Protein ' + sp.tyLe.p + '%</span><span class="c"><i></i>Carb ' + sp.tyLe.c + '%</span><span class="f"><i></i>Béo ' + sp.tyLe.f + '%</span></div></div>' +
      '<div class="nlabel__foot">Nguồn số liệu: ' + esc(sp.nguonSoLieu) + ' Năng lượng tính theo hệ số 4 – 4 – 9 (protein – carb – béo), chất xơ 2 kcal/g.</div></div>';
  };
  // gắn nút chuyển đơn vị cho mọi bảng trong vùng
  NG.ui.ganNhan = function (vung, layOpt) {
    vung.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-che]'); if (!b) return;
      const box = b.closest('[data-nlabel]'); const d = await NG.duLieu.coBan(); const sp = d.theoMa[box.dataset.nlabel];
      box.outerHTML = NG.ui.nhanDinhDuong(sp, Object.assign({}, layOpt ? layOpt() : {}, { che: b.dataset.che }));
      try { localStorage.setItem('ng.cheNhan', JSON.stringify(b.dataset.che)); } catch (er) { /* bỏ qua */ }
    });
  };

  // Thẻ combo lớn (trang chủ, kết quả TDEE)
  NG.ui.theCombo = function (c, opt = {}) {
    const ds = c.thanhPhanDayDu.map((t) => '<li><span>' + (t.soLuong > 1 ? t.soLuong + ' × ' : '') + esc(t.laLuaChon ? '1 bộ bún / phở / nui gạo lứt' : t.sp.ten) + '</span><span>' + esc(t.sp.quyCach) + '</span></li>').join('');
    return '<article class="combo-card' + (opt.noiBat ? ' combo-card--hot' : '') + '">' +
      '<div class="combo-card__top"><div class="combo-card__kcal">' + so(c.mucTieuKcal) + '<small>mức kcal/ngày · ' + esc(c.nhan) + '</small></div>' + (opt.noiBat ? '<span class="badge badge--forest">' + esc(opt.nhanNoiBat || 'Phù hợp với bạn') + '</span>' : '<span class="badge">7 ngày</span>') + '</div>' +
      '<a href="' + NG.url('chiTiet', { ma: c.ma }) + '" tabindex="-1" aria-hidden="true"><img src="' + anh(c.anh) + '" alt="" loading="lazy" width="640" height="640"></a>' +
      '<div class="combo-card__body"><h3><a href="' + NG.url('chiTiet', { ma: c.ma }) + '">' + esc(c.ten) + '</a></h3>' + (opt.gon ? '<p class="small mb-0">' + esc(c.moTaNgan) + '</p>' : '<ul>' + ds + '</ul>') +
      '<div class="combo-card__nums"><div><b>≈' + so(c.kcalNgay) + '</b><span>kcal/ngày</span></div><div><b>' + c.proteinNgay + 'g</b><span>protein/ngày</span></div><div><b>' + c.phanTramMucTieu + '%</b><span>mức ' + so(c.mucTieuKcal) + '</span></div></div>' +
      (opt.gon ? '' : '<p class="combo-card__note">Combo cung cấp khoảng ' + so(c.kcalNgay) + ' kcal mỗi ngày; phần còn lại nên đến từ rau và đạm tươi.</p>') +
      '<div class="combo-card__price"><span class="price">' + tien(c.gia) + '</span><span class="price-old">' + tien(c.giaLe) + '</span><span class="badge badge--lime">−' + c.phanTramTietKiem + '%</span></div>' +
      '<div class="combo-card__actions"><a class="btn btn--sm" href="' + NG.url('chiTiet', { ma: c.ma }) + '">Chi tiết</a><button class="btn btn--primary btn--sm" type="button" data-them-gio="' + esc(c.ma) + '"' + (opt.nguon ? ' data-nguon="' + esc(opt.nguon) + '"' : '') + (c.conHang ? '' : ' disabled') + '>' + (c.conHang ? 'Thêm trọn gói' : 'Tạm hết') + '</button></div>' +
      '</div></article>';
  };

  NG.ui.theBaiViet = function (b) {
    return '<a class="post-card" href="blog-post.html?bai=' + encodeURIComponent(b.slug) + '"><div class="post-card__img"><img src="' + anh(b.anh, true) + '" alt="" loading="lazy" width="320" height="320"></div>' +
      '<div class="post-card__body"><span class="post-card__meta">' + esc(b.chuDe) + ' · ' + b.phutDoc + ' phút đọc</span><h3>' + esc(b.tieuDe) + '</h3><p>' + esc(b.tomTat) + '</p></div></a>';
  };
})();
