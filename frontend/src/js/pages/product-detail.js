/* Chi tiết sản phẩm / combo (?ma=MÃ): bảng dinh dưỡng 100g – khẩu phần – cả gói, lô hàng & hạn dùng,
   % mục tiêu calo cá nhân, chọn bún/phở/nui cho combo, đánh giá, sản phẩm liên quan (FR03, FR04, FR11) */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, so, tien, anh } = NG;
  const d = await NG.duLieu.coBan();
  const ma = NG.qs('ma'); const sp = d.theoMa[ma];
  const box = $('[data-chi-tiet]');
  if (!sp || sp.an) {
    box.innerHTML = '<div class="empty"><h3>Không tìm thấy sản phẩm</h3><p>Sản phẩm có thể đã ngừng bán hoặc đường dẫn chưa đúng.</p><a class="btn btn--primary" href="products.html">Xem sản phẩm khác</a></div>';
    document.title = 'Không tìm thấy sản phẩm | NutriGreen'; return;
  }
  const combo = sp.loai === 'combo';
  const nguonVao = NG.qs('nguon') === 'tdee' ? 'tdee' : null;
  NG.daXem.them(sp.ma);
  NG.track('xem_san_pham', { ma: sp.ma, ten: sp.ten, loai: sp.loai, gia: sp.gia, nguon: nguonVao });
  if (combo && nguonVao) NG.track('xem_combo_goi_y', { combo: sp.ma, vitri: 'chi-tiet' });

  // SEO động: tiêu đề, mô tả, dữ liệu có cấu trúc Product
  const moTa = combo ? sp.ten + ': ' + sp.moTaNgan + ' Cung cấp ≈' + so(sp.kcalNgay) + ' kcal/ngày.' : sp.ten + ' ' + sp.quyCach + ' – ' + so(sp.kp.kcal) + ' kcal, ' + so(sp.kp.protein, 1) + 'g protein mỗi khẩu phần ' + sp.dinhDuong.khauPhan.g + 'g. ' + sp.moTaNgan;
  document.title = sp.ten + (combo ? '' : ' ' + sp.quyCach) + ' | NutriGreen';
  $$('meta[name="description"], meta[property="og:description"]').forEach((m) => m.setAttribute('content', moTa));
  $$('meta[property="og:title"]').forEach((m) => m.setAttribute('content', document.title));
  $$('meta[property="og:image"]').forEach((m) => m.setAttribute('content', anh(sp.anh)));
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Product', name: sp.ten, image: anh(sp.anh), description: moTa, sku: sp.ma, brand: { '@type': 'Brand', name: 'NutriGreen' },
    offers: { '@type': 'Offer', priceCurrency: 'VND', price: sp.gia, availability: sp.conHang ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
    nutrition: combo ? undefined : { '@type': 'NutritionInformation', servingSize: sp.dinhDuong.khauPhan.g + ' g', calories: sp.kp.kcal + ' kcal', proteinContent: sp.kp.protein + ' g', fatContent: sp.kp.beo + ' g', carbohydrateContent: sp.kp.carb + ' g', sugarContent: sp.kp.duong + ' g', fiberContent: sp.kp.xo + ' g' } });
  document.head.appendChild(ld);

  const tenDm = combo ? 'Combo theo calo' : NG.duLieu.tenDanhMuc(d, sp.danhMuc);
  $('[data-bc]').insertAdjacentHTML('beforeend', '<li><a href="products.html?danhmuc=' + sp.danhMuc + '">' + esc(tenDm) + '</a></li><li aria-current="page">' + esc(sp.ten) + '</li>');

  const tdee = NG.tdee.ganNhat(); const mucTieu = tdee ? tdee.mucTieuKcal : null;
  const dg = NG.danhGia.tongHop(sp.ma);
  const ic = {
    xe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/></svg>',
    doi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9h13l-3-3M20 15H7l3 3"/></svg>',
    lo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h5"/></svg>',
    tien: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/></svg>'
  };

  const tonText = !sp.conHang ? '<span class="pd__stock pd__stock--out">Tạm hết hàng</span>' : (!combo && sp.ton <= 5 ? '<span class="pd__stock pd__stock--low">Chỉ còn ' + sp.ton + ' sản phẩm</span>' : '<span class="pd__stock pd__stock--ok">● Còn hàng</span>');
  const so4 = combo
    ? [['≈' + so(sp.kcalNgay), 'kcal/ngày'], [sp.proteinNgay + 'g', 'protein/ngày'], [so(sp.duongNgay, 1) + 'g', 'đường/ngày'], [so(sp.kcal7), 'kcal cả gói']]
    : [[so(sp.kp.kcal), 'kcal'], [so(sp.kp.protein, 1) + 'g', 'protein'], [so(sp.kp.duong, 1) + 'g', 'đường'], [so(sp.kcalGoi), 'kcal cả gói']];
  const per = combo ? 'Trung bình mỗi ngày trong 7 ngày · dành cho mục tiêu ' + so(sp.mucTieuKcal) + ' kcal/ngày' : 'Mỗi khẩu phần ' + esc(sp.dinhDuong.khauPhan.moTa);

  // phần trăm mục tiêu cá nhân
  let fit;
  if (mucTieu) {
    const k = combo ? sp.kcalNgay : sp.kp.kcal; const pct = Math.round(k / mucTieu * 100);
    fit = '<div class="pd__fit"><div class="ring" style="--p:' + Math.min(pct, 100) + '"><span>' + pct + '%</span></div><div>' + (combo ? 'Mỗi ngày combo cung cấp' : '1 khẩu phần bằng') + ' <b>' + pct + '%</b> mục tiêu <b>' + so(mucTieu) + ' kcal/ngày</b> của bạn' + (combo ? '. Phần còn lại nên đến từ rau và đạm tươi.' : '.') + ' <a href="tdee.html">Tính lại</a></div></div>';
  } else fit = '<div class="pd__fit"><div class="ring" style="--p:0"><span>?</span></div><div>Muốn biết sản phẩm chiếm bao nhiêu % nhu cầu của bạn? <a href="tdee.html">Tính TDEE trong 30 giây</a>.</div></div>';

  let bienThe = '';
  if (combo) {
    const lc = sp.thanhPhanDayDu.find((t) => t.laLuaChon);
    if (lc) bienThe = '<fieldset class="mt-2" style="border:0;padding:0;margin:0"><legend class="strong small">Chọn 1 bộ gạo lứt cho bữa chính</legend><div class="pd__variants">' +
      lc.cacLua.map((x, i) => '<label class="option-card"><input type="radio" name="chon" value="' + x.ma + '"' + (i === 0 ? ' checked' : '') + (x.conHang ? '' : ' disabled') + '><img src="' + anh(x.anh, true) + '" alt=""><span class="t small">' + esc(x.ten) + '</span>' + (x.conHang ? '' : '<span class="xs" style="color:var(--ng-red)">Tạm hết</span>') + '</label>').join('') + '</div></fieldset>';
  }

  box.innerHTML = '<div class="pd' + (combo ? ' pd--combo' : '') + '">' +
    '<div class="pd__media" data-zoom><img src="' + anh(sp.anh) + '" alt="' + esc(sp.ten + ' ' + sp.quyCach) + '" width="640" height="640"><div class="pcard__tags">' + (combo ? '<span class="badge badge--forest">Chỉ bán trên website</span>' : '') + (!combo && sp.dinhDuong.tren100g.duong <= d.cauHinh.nguongLoc.itDuong ? '<span class="badge badge--lime">Đường ' + so(sp.dinhDuong.tren100g.duong, 1) + 'g/100g</span>' : '') + (!combo && sp.dinhDuong.tren100g.protein >= d.cauHinh.nguongLoc.proteinCao ? '<span class="badge badge--green">Protein ' + so(sp.dinhDuong.tren100g.protein, 1) + 'g/100g</span>' : '') + '</div>' +
    '<button class="pcard__fav" type="button" aria-label="Yêu thích" aria-pressed="' + NG.yeuThich.co(sp.ma) + '" data-yeu-thich="' + sp.ma + '">' + NG.IC.tim + '</button></div>' +
    '<div class="pd__main"><span class="pd__cat">' + esc(combo ? sp.nhan : tenDm) + '</span><h1>' + esc(sp.ten) + '</h1>' +
    '<div class="pd__meta"><span>' + esc(sp.quyCach) + '</span><span>Mã: ' + esc(sp.ma) + '</span>' + (dg.soLuong ? '<a href="#danh-gia">' + NG.ui.sao(dg.trungBinh) + ' ' + so(dg.trungBinh, 1) + ' (' + dg.soLuong + ' đánh giá)</a>' : '<a href="#danh-gia">Chưa có đánh giá</a>') + '</div>' +
    '<p class="pd__short">' + esc(sp.moTaNgan) + '</p>' +
    '<div class="pd__nums">' + so4.map((x) => '<div><b>' + x[0] + '</b><span>' + x[1] + '</span></div>').join('') + '</div><p class="pd__per">' + per + '</p>' +
    fit +
    '<div class="pd__price"><span class="price">' + tien(sp.gia) + '</span>' + (combo ? '<span class="price-old">' + tien(sp.giaLe) + '</span><span class="badge badge--lime">Tiết kiệm ' + tien(sp.tietKiem) + '</span>' : '<span class="small muted">' + so(Math.round(sp.gia / sp.khoiLuong * 100)) + 'đ/100g</span>') + '</div>' + tonText +
    bienThe +
    '<div class="pd__buy"><div class="qty"><button type="button" data-sl="-1" aria-label="Giảm">−</button><input type="number" min="1" max="' + (combo ? 10 : Math.max(1, Math.min(sp.ton, 20))) + '" value="1" aria-label="Số lượng" data-so-luong><button type="button" data-sl="1" aria-label="Tăng">+</button></div>' +
    '<button class="btn btn--primary" type="button" data-them' + (sp.conHang ? '' : ' disabled') + '>' + NG.IC.gio.replace('<svg', '<svg width="20" height="20"') + 'Thêm vào giỏ</button>' +
    '<button class="btn" type="button" data-mua-ngay' + (sp.conHang ? '' : ' disabled') + '>Mua ngay</button></div>' +
    (sp.conHang ? '' : '<form class="flex gap-1 wrap" data-bao-hang><input class="input" style="flex:1;min-width:200px" type="email" placeholder="Email nhận thông báo khi có hàng" required><button class="btn btn--sm" type="submit">Báo khi có hàng</button></form>') +
    '<div class="pd__info">' +
    '<div class="pd__info-row">' + ic.xe + '<div><strong>Giao trong ngày nội thành TP.HCM</strong> (AhaMove, đơn trước 16:00) · GHTK toàn quốc 2–5 ngày.<br>Miễn phí giao cho đơn từ ' + tien(d.cauHinh.giaoHang.mienPhiTu) + '. <a href="policy.html#giao-hang">Chi tiết</a></div></div>' +
    '<div class="pd__info-row">' + ic.doi + '<div><strong>Đổi trả 7 ngày</strong> khi bánh vỡ, hạt ôi dầu, giao sai – gửi ảnh ngay trong đơn hàng. <a href="policy.html#doi-tra">Chính sách</a></div></div>' +
    '<div class="pd__info-row">' + ic.tien + '<div><strong>Thanh toán</strong> COD, chuyển khoản VietQR, ví MoMo / ZaloPay. Không cần tạo tài khoản.</div></div>' +
    (combo ? '' : '<div class="pd__info-row">' + ic.lo + '<div style="flex:1"><strong>Lô đang bán</strong> – xuất kho theo nguyên tắc hết hạn trước, xuất trước<div class="lot"><div><span>Mã lô</span><b>' + esc(sp.lo.ma) + '</b></div><div><span>Ngày sản xuất</span><b>' + NG.ngay(sp.lo.nsx) + '</b></div><div><span>Hạn sử dụng</span><b>' + NG.ngay(sp.lo.hsd) + '</b></div></div></div></div>') +
    '</div></div></div>' +

    // khu vực dinh dưỡng và thông tin
    '<section class="pd-sec" aria-labelledby="tieu-de-dd"><div class="pd-sec__grid"><div><h2 id="tieu-de-dd" class="sr-only">Dinh dưỡng</h2><div data-nhan></div></div><div class="spec">' +
    (combo ? comboInfo() : '<h2>Thông tin sản phẩm</h2><dl><dt>Thành phần</dt><dd>' + esc(sp.thanhPhan) + '</dd><dt>Lưu ý dị ứng</dt><dd>' + esc(diUng(sp.thanhPhan)) + '</dd><dt>Xuất xứ</dt><dd>' + esc(sp.xuatXu) + '</dd><dt>Hạn sử dụng</dt><dd>' + esc(sp.hanSuDung) + '</dd><dt>Bảo quản</dt><dd>' + esc(sp.baoQuan) + '</dd><dt>Cách dùng</dt><dd>' + esc(sp.huongDan) + '</dd><dt>Khẩu phần gợi ý</dt><dd>' + esc(sp.dinhDuong.khauPhan.moTa) + ' – ' + so(sp.khoiLuong / sp.dinhDuong.khauPhan.g) + ' khẩu phần mỗi ' + esc(sp.quyCach.toLowerCase()) + '.</dd></dl>' +
      '<p class="callout small mt-2">Số liệu dinh dưỡng mang tính tham khảo cho người trưởng thành khỏe mạnh, không thay thế tư vấn của bác sĩ hay chuyên gia dinh dưỡng. NutriGreen không quảng cáo sản phẩm có tác dụng chữa bệnh.</p>') +
    '</div></div></section>' +
    '<section class="pd-sec" id="danh-gia" aria-labelledby="tieu-de-dg"><h2 id="tieu-de-dg">Đánh giá từ khách đã mua</h2><div data-danh-gia></div></section>' +
    '<section class="pd-sec" aria-labelledby="tieu-de-lq"><h2 id="tieu-de-lq">' + (combo ? 'Mua lẻ từng món' : 'Thường mua cùng') + '</h2><div class="rail" data-lien-quan></div></section>';

  // lưu ý dị ứng suy ra từ thành phần (an toàn thực phẩm – đọc kỹ thành phần trên bao bì)
  function diUng(tp) {
    const ds = [];
    if (/hạnh nhân|điều|óc chó/i.test(tp)) ds.push('các loại hạt cây (hạnh nhân, điều, óc chó)');
    if (/đậu phộng/i.test(tp)) ds.push('đậu phộng');
    if (/bột mì|yến mạch/i.test(tp)) ds.push('ngũ cốc chứa gluten (lúa mì, yến mạch)');
    if (/trứng|lòng trắng/i.test(tp)) ds.push('trứng');
    if (/(^|[\s,(])bơ([\s,).]|$)|sữa/i.test(tp)) ds.push('sữa (bơ)');
    return (ds.length ? 'Chứa ' + ds.join(', ') + '. ' : '') + 'Sản xuất trên dây chuyền có chế biến các loại hạt, đậu phộng và ngũ cốc chứa gluten.';
  }
  function comboInfo() {
    let tongPro = 0;
    const rows = sp.thanhPhanDayDu.map((t) => {
      const s = t.sp; const f = s.khoiLuong / 100 * t.soLuong; const n = s.dinhDuong.tren100g; tongPro += Math.round(n.protein * f);
      return '<tr><td><a href="' + NG.url('chiTiet', { ma: s.ma }) + '"><img src="' + anh(s.anh, true) + '" alt="">' + (t.soLuong > 1 ? t.soLuong + ' × ' : '') + esc(t.laLuaChon ? 'Bún / phở / nui gạo lứt (chọn 1)' : s.ten) + '</a></td><td>' + esc(s.quyCach) + '</td><td class="num">' + so(n.kcal * f) + '</td><td class="num">' + so(n.protein * f) + 'g</td><td class="num">' + tien(s.gia * t.soLuong) + '</td></tr>';
    }).join('');
    return '<h2>Trong combo có gì?</h2><div class="table-wrap"><table class="combo-parts"><thead><tr><th>Món</th><th>Quy cách</th><th>kcal</th><th>Protein</th><th>Giá lẻ</th></tr></thead><tbody>' + rows + '</tbody><tfoot><tr><td colspan="2">Tổng 7 ngày</td><td class="num">' + so(sp.kcal7) + '</td><td class="num">' + so(tongPro) + 'g</td><td class="num">' + tien(sp.giaLe) + '</td></tr></tfoot></table></div>' +
      '<h3 class="mt-3">Một ngày với ' + esc(sp.ten) + '</h3><div class="day-plan"><div><b>Bữa sáng</b><span>' + esc(sp.thanhPhanDayDu[0].sp.ten) + ' + sữa chua/sữa không đường</span></div><div><b>Bữa phụ</b><span>' + esc(sp.thanhPhanDayDu[1].sp.ten) + '</span></div><div><b>Bữa chính</b><span>Bún/phở/nui gạo lứt + rau + đạm (thịt, cá, trứng, đậu)</span></div></div>' +
      '<p class="callout small"><strong>Vì sao combo không đủ ' + so(sp.mucTieuKcal) + ' kcal?</strong> Combo cung cấp khoảng ' + so(sp.kcalNgay) + ' kcal/ngày (' + sp.phanTramMucTieu + '% mức ' + so(sp.mucTieuKcal) + '). Phần còn lại nên đến từ rau, trái cây và đạm tươi để bữa ăn đủ vi chất. Phù hợp với: ' + esc(sp.phuHop) + '</p>' +
      '<p class="small"><a href="tdee.html">Chưa chắc combo nào hợp? Tính TDEE để được gợi ý →</a></p>';
  }

  // bảng dinh dưỡng
  const vungNhan = $('[data-nhan]');
  if (combo) {
    vungNhan.innerHTML = '<div class="nlabel"><div class="nlabel__head"><h3>Dinh dưỡng trung bình mỗi ngày</h3></div><div class="nlabel__serv">Tổng 7 ngày chia đều · ' + sp.thanhPhanDayDu.length + ' món</div>' +
      '<div class="nlabel__kcal"><span>Năng lượng</span><span><b>' + so(sp.kcalNgay) + '</b> kcal</span></div>' + (mucTieu ? '<div class="nlabel__split small">Bằng <strong>' + Math.round(sp.kcalNgay / mucTieu * 100) + '%</strong> mục tiêu ' + so(mucTieu) + ' kcal/ngày của bạn</div>' : '') +
      '<table><tbody><tr><td><i style="background:var(--ng-protein)"></i>Protein</td><td>' + sp.proteinNgay + ' g</td></tr><tr><td><i style="background:var(--ng-fat)"></i>Chất béo</td><td>' + sp.beoNgay + ' g</td></tr><tr><td><i style="background:var(--ng-carb)"></i>Carbohydrate</td><td>' + sp.carbNgay + ' g</td></tr><tr class="sub"><td>trong đó: Đường</td><td>' + so(sp.duongNgay, 1) + ' g</td></tr></tbody></table>' +
      '<div class="nlabel__split"><span class="xs muted">Tỷ lệ năng lượng</span>' + NG.ui.macroBar(sp.tyLe) + '<div class="macro-legend"><span class="p"><i></i>Protein ' + sp.tyLe.p + '%</span><span class="c"><i></i>Carb ' + sp.tyLe.c + '%</span><span class="f"><i></i>Béo ' + sp.tyLe.f + '%</span></div></div>' +
      '<div class="nlabel__foot">Cộng từ bảng dinh dưỡng của từng món trong combo (tính với bún gạo lứt; phở và nui chênh lệch dưới 1%).</div></div>';
  } else {
    let che = 'kp'; try { che = JSON.parse(localStorage.getItem('ng.cheNhan')) || 'kp'; } catch (e) { /* bỏ qua */ }
    vungNhan.innerHTML = NG.ui.nhanDinhDuong(sp, { che, mucTieuKcal: mucTieu });
    NG.ui.ganNhan(vungNhan, () => ({ mucTieuKcal: mucTieu }));
  }

  // đánh giá
  function veDanhGia() {
    const ds = NG.danhGia.theoSp(sp.ma); const th = NG.danhGia.tongHop(sp.ma); const v = $('[data-danh-gia]');
    const huongDan = '<p class="small mb-0">Đánh giá được viết từ đơn hàng đã giao trong <a href="orders.html">Đơn hàng của tôi</a>. Nhận <strong>' + d.cauHinh.nutriCoins.danhGiaChu + ' NutriCoins</strong>, hoặc <strong>' + d.cauHinh.nutriCoins.danhGiaAnh + '</strong> khi kèm ảnh.</p>';
    if (!ds.length) { v.innerHTML = '<div class="reviews__sum"><div><p class="strong mb-0">Chưa có đánh giá cho sản phẩm này</p>' + huongDan + '</div></div>'; return; }
    const phanBo = [5, 4, 3, 2, 1].map((s) => [s, ds.filter((r) => r.sao === s).length]);
    v.innerHTML = '<div class="reviews__sum"><div><div class="reviews__avg">' + so(th.trungBinh, 1) + '</div>' + NG.ui.sao(th.trungBinh) + '<div class="xs muted">' + th.soLuong + ' đánh giá · ' + th.coAnh + ' có ảnh</div></div><div style="flex:1;min-width:200px">' +
      phanBo.map(([s, n]) => '<div class="flex center gap-1 xs"><span style="width:28px">' + s + '★</span><div class="ship-meter__bar" style="flex:1;margin:0"><span style="width:' + (n / ds.length * 100) + '%"></span></div><span style="width:20px">' + n + '</span></div>').join('') + '</div><div style="flex-basis:100%">' + huongDan + '</div></div>' +
      ds.map((r) => '<article class="review"><div class="review__head">' + NG.ui.sao(r.sao) + '<strong>' + esc(r.ten) + '</strong><span class="badge badge--green">Đã mua hàng</span><span class="xs muted">' + NG.ngay(r.luc) + '</span></div><p class="mt-1 mb-0">' + esc(r.noiDung) + '</p>' +
        (r.anh && r.anh.length ? '<div class="review__imgs">' + r.anh.map((a) => '<img src="' + a + '" alt="Ảnh khách gửi" loading="lazy">').join('') + '</div>' : '') +
        (r.phanHoi ? '<div class="review__reply"><strong>NutriGreen phản hồi:</strong> ' + esc(r.phanHoi) + '</div>' : '') + '</article>').join('');
  }
  veDanhGia();
  $('[data-danh-gia]').addEventListener('click', (e) => { const i = e.target.closest('.review__imgs img'); if (i) NG.ui.modal('<img src="' + i.src + '" alt="Ảnh đánh giá" style="width:100%;border-radius:12px">', { nhan: 'Ảnh đánh giá' }); });

  // liên quan
  let lq;
  if (combo) lq = sp.thanhPhanDayDu.flatMap((t) => t.cacLua);
  else lq = d.combo.filter((c) => c.thanhPhanDayDu.some((t) => t.cacLua.some((x) => x.ma === sp.ma))).concat(d.sanPham.filter((s) => s.ma !== sp.ma && s.danhMuc === sp.danhMuc && s.conHang)).concat(d.sanPham.filter((s) => s.ma !== sp.ma && s.danhMuc !== sp.danhMuc && (s.mucTieu || []).some((m) => (sp.mucTieu || []).includes(m))));
  const daCo = new Set(); lq = lq.filter((s) => !daCo.has(s.ma) && daCo.add(s.ma)).slice(0, 8);
  $('[data-lien-quan]').innerHTML = lq.map((s) => NG.ui.the(s, d)).join('');

  // tương tác mua
  const sl = $('[data-so-luong]');
  const layChon = () => { const r = $('input[name="chon"]:checked'); return r ? r.value : null; };
  box.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-sl]');
    if (b) { const v = Math.max(1, Math.min(+sl.max, (+sl.value || 1) + +b.dataset.sl)); sl.value = v; return; }
    if (e.target.closest('[data-them]')) { await NG.gio.them(sp.ma, +sl.value || 1, { chon: layChon(), nguon: nguonVao }); return; }
    if (e.target.closest('[data-mua-ngay]')) { if (await NG.gio.them(sp.ma, +sl.value || 1, { chon: layChon(), nguon: nguonVao, imLang: true })) location.href = 'checkout.html'; }
  });
  sl.addEventListener('change', () => { sl.value = Math.max(1, Math.min(+sl.max, Math.round(+sl.value) || 1)); });
  const fb = $('[data-bao-hang]');
  fb && fb.addEventListener('submit', (e) => {
    e.preventDefault(); const em = fb.querySelector('input').value;
    if (!NG.emailHopLe(em)) return NG.ui.toast('Email chưa đúng định dạng', 'error');
    const ds = NG.kho.doc('baoCoHang', []); ds.push({ ma: sp.ma, email: em.trim().toLowerCase(), luc: new Date().toISOString() }); NG.kho.ghi('baoCoHang', ds);
    fb.innerHTML = '<p class="alert">Đã ghi nhận. NutriGreen sẽ email cho bạn khi ' + esc(sp.ten) + ' có hàng lại.</p>';
  });
  // phóng to ảnh
  const z = $('[data-zoom]');
  z.addEventListener('click', (e) => { if (e.target.closest('button')) return; const r = z.getBoundingClientRect(); z.style.setProperty('--zx', ((e.clientX - r.left) / r.width * 100) + '%'); z.style.setProperty('--zy', ((e.clientY - r.top) / r.height * 100) + '%'); z.classList.toggle('is-zoom'); });

  // thanh mua dính đáy trên điện thoại
  const bar = $('[data-sticky]');
  bar.innerHTML = '<div class="sticky-bar__info"><span class="xs muted">' + esc(sp.ten) + '</span><span class="price">' + tien(sp.gia) + '</span></div><button class="btn btn--primary" type="button"' + (sp.conHang ? '' : ' disabled') + '>' + (sp.conHang ? 'Thêm vào giỏ' : 'Tạm hết') + '</button>';
  bar.hidden = false;
  bar.querySelector('button').addEventListener('click', () => NG.gio.them(sp.ma, +sl.value || 1, { chon: layChon(), nguon: nguonVao }));
})();
