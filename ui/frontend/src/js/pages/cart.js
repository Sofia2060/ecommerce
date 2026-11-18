/* Giỏ hàng thông minh (FR04): tổng tiền + tổng kcal/protein, mã giảm giá, ước tính phí giao theo khu vực ngay
   từ bước 1 (giảm bỏ giỏ vì chi phí phát sinh), thanh freeship 299.000đ, gợi ý nâng lên combo. */
(async function () {
  'use strict';
  const NG = window.NG; const { $, esc, so, tien, anh } = NG;
  const d = await NG.duLieu.coBan();
  const tinhDs = (await NG.duLieu.tinh()).tinh;
  const vung = $('[data-gio]');
  const luu = () => { try { return JSON.parse(sessionStorage.getItem('ng.thanhToan') || '{}'); } catch (e) { return {}; } };
  const ghi = (x) => { try { sessionStorage.setItem('ng.thanhToan', JSON.stringify(Object.assign(luu(), x))); } catch (e) { /* bỏ qua */ } };
  const u = NG.taiKhoan.hienTai();
  const st = Object.assign({ maUuDai: '', tinh: u && u.diaChi && u.diaChi[0] ? u.diaChi[0].diaChi.tinh : '', dichVu: '' }, luu());

  async function ve() {
    const g = await NG.gio.tinh({ maUuDai: st.maUuDai, tinh: st.tinh, dichVu: st.dichVu });
    if (!g.dong.length) {
      vung.innerHTML = '<div class="empty">' + NG.IC.trong + '<h3>Giỏ hàng đang trống</h3><p>Bắt đầu từ mục tiêu calo của bạn, hoặc xem các combo 7 ngày.</p><div class="flex gap-1 wrap" style="justify-content:center"><a class="btn btn--primary" href="tdee.html">Tính TDEE &amp; nhận gợi ý</a><a class="btn" href="products.html?danhmuc=combo">Xem combo</a></div></div>';
      return;
    }
    const tdee = NG.tdee.ganNhat();
    const lines = g.dong.map((x) => {
      const s = x.sp; const combo = s.loai === 'combo';
      let variant = '';
      if (combo) { const lc = s.thanhPhanDayDu.find((t) => t.laLuaChon); if (lc) variant = '<div class="line__variant" role="group" aria-label="Chọn bộ gạo lứt">' + lc.cacLua.map((c) => '<button class="chip' + (c.ma === x.chon ? ' is-active' : '') + '" type="button" data-doi-chon="' + esc(x.khoa) + '" data-chon="' + c.ma + '"' + (c.conHang ? '' : ' disabled') + '>' + esc(c.ten) + '</button>').join('') + '</div>'; }
      return '<div class="line' + (x.conHang ? '' : ' line--out') + '"><a class="line__img" href="' + NG.url('chiTiet', { ma: s.ma }) + '"><img src="' + anh(s.anh, true) + '" alt="" loading="lazy"></a><div>' +
        '<div class="line__top"><div><a class="line__name" href="' + NG.url('chiTiet', { ma: s.ma }) + '">' + esc(s.ten) + '</a><div class="line__meta">' + esc(s.quyCach) + ' · ' + so(Math.round(x.kcal / x.soLuong)) + ' kcal/' + (combo ? 'gói' : 'sp') + (x.nguon === 'tdee' ? ' · <span class="badge badge--lime">Gợi ý từ TDEE</span>' : '') + '</div>' + variant +
        (x.conHang ? '' : '<div class="alert alert--error mt-1">Sản phẩm tạm hết hàng, vui lòng xóa để tiếp tục.</div>') + '</div>' +
        '<div class="line__price"><span class="price">' + tien(x.thanhTien) + '</span>' + (x.soLuong > 1 ? '<small>' + tien(x.donGia) + ' × ' + x.soLuong + '</small>' : '') + '</div></div>' +
        '<div class="line__bot"><div class="qty"><button type="button" data-sl="-1" data-khoa="' + esc(x.khoa) + '" aria-label="Giảm">−</button><input type="number" value="' + x.soLuong + '" min="1" max="' + x.toiDa + '" data-o-sl="' + esc(x.khoa) + '" aria-label="Số lượng ' + esc(s.ten) + '"><button type="button" data-sl="1" data-khoa="' + esc(x.khoa) + '" aria-label="Tăng"' + (x.soLuong >= x.toiDa ? ' disabled' : '') + '>+</button></div>' +
        '<span class="small muted">' + so(x.kcal) + ' kcal · ' + so(x.protein) + 'g protein</span>' +
        '<span><button class="x" type="button" data-yeu-thich="' + s.ma + '" aria-pressed="' + NG.yeuThich.co(s.ma) + '">Lưu</button> · <button class="x" type="button" data-xoa="' + esc(x.khoa) + '">Xóa</button></span></div></div></div>';
    }).join('');

    // gợi ý nâng lên combo: giỏ có món thuộc combo nhưng chưa có combo
    let upsell = '';
    if (!g.coCombo) {
      const maTrongGio = new Set(g.dong.map((x) => x.ma));
      const c = d.combo.find((cb) => cb.conHang && cb.thanhPhanDayDu.some((t) => t.cacLua.some((s) => maTrongGio.has(s.ma)))) || d.combo[0];
      upsell = '<div class="upsell"><img src="' + anh(c.anh, true) + '" alt=""><div><strong>' + esc(c.ten) + '</strong><div class="small">Đủ bữa sáng, bữa phụ, bữa chính 7 ngày · tiết kiệm ' + tien(c.tietKiem) + ' so với mua lẻ</div></div><button class="btn btn--sm btn--primary" type="button" data-them-gio="' + c.ma + '">Thêm combo</button></div>';
    }

    const tinhOpts = '<option value="">Chọn tỉnh/thành để tính phí giao</option>' + tinhDs.map((t) => '<option' + (t.ten === st.tinh ? ' selected' : '') + '>' + esc(t.ten) + '</option>').join('');
    const lc = st.tinh ? await NG.giaoHang.luaChon(st.tinh) : [];
    const pct = Math.min(100, Math.round(g.tamTinh / g.mienPhiTu * 100));
    const viMa = u ? NG.xu.vi(u.id).filter((v) => !v.daDung) : [];
    const hom = new Date().toISOString().slice(0, 10);
    const maCong = d.cauHinh.maUuDai.filter((m) => m.tu <= hom && hom <= m.den && !m.koc);
    const ngayDu = tdee ? Math.round(g.tongKcal / tdee.mucTieuKcal * 10) / 10 : null;

    vung.innerHTML = '<div class="co"><section class="panel" aria-label="Sản phẩm trong giỏ"><div class="flex between center mb-2"><h2 class="mb-0" style="font-size:var(--ng-fs-lg)">' + g.soLuong + ' sản phẩm</h2><button class="link-btn small" type="button" data-xoa-het>Xóa tất cả</button></div>' + lines + upsell + '</section>' +
      '<aside class="co__side"><div class="panel"><h2>Tóm tắt đơn hàng</h2>' +
      '<div class="energy mb-2"><div><b>' + so(g.tongKcal) + '</b><span>tổng kcal trong giỏ</span></div><div><b>' + so(g.tongProtein) + 'g</b><span>tổng protein</span></div></div>' +
      (ngayDu ? '<p class="xs muted" style="margin-top:-8px">≈ ' + so(ngayDu, 1) + ' ngày theo mục tiêu ' + so(tdee.mucTieuKcal) + ' kcal của bạn (nếu chỉ ăn sản phẩm trong giỏ).</p>' : '') +
      '<div class="ship-meter mb-2">' + (g.duMienPhi ? '🎉 Đơn của bạn được <strong>miễn phí giao hàng</strong>.' : 'Mua thêm <strong>' + tien(g.conThieu) + '</strong> để được miễn phí giao hàng.') + '<div class="ship-meter__bar"><span style="width:' + pct + '%"></span></div></div>' +
      '<div class="field"><label for="ma-giam">Mã giảm giá</label><div class="voucher"><input class="input" id="ma-giam" value="' + esc(st.maUuDai) + '" placeholder="Nhập mã" autocomplete="off"><button class="btn btn--sm" type="button" data-ap-ma>Áp dụng</button></div>' +
      (g.loiUuDai ? '<span class="err">' + esc(g.loiUuDai) + '</span>' : g.uuDai ? '<span class="hint" style="color:var(--ng-green)">✓ ' + esc(g.uuDai.moTa || g.uuDai.ten) + '</span>' : '') +
      '<div class="voucher-list">' + maCong.concat(viMa).map((m) => '<button type="button" data-chon-ma="' + esc(m.ma) + '">' + esc(m.ma) + '<small>' + esc(m.moTa || m.ten) + '</small></button>').join('') + '</div></div>' +
      '<div class="field"><label for="tinh-uoc">Giao đến</label><select class="select" id="tinh-uoc" data-tinh>' + tinhOpts + '</select>' +
      (lc.length ? '<div class="opt-stack mt-1">' + lc.map((o) => '<label class="option-card"><input type="radio" name="dv" value="' + o.ma + '"' + ((g.dichVu && g.dichVu.ma === o.ma) ? ' checked' : '') + '><span><span class="t">' + esc(o.donVi) + ' – ' + esc(o.ten) + '</span><br><span class="d">' + esc(o.thoiGian) + '</span></span><span class="r">' + (g.duMienPhi ? '<span class="price-old">' + tien(o.phi) + '</span> 0đ' : tien(o.phi)) + '</span></label>').join('') + '</div>' : '') + '</div>' +
      '<div class="sum"><div class="sum__row"><span>Tạm tính</span><span>' + tien(g.tamTinh) + '</span></div>' +
      (g.giam ? '<div class="sum__row sum__row--disc"><span>Giảm giá (' + esc(g.uuDai.ma) + ')</span><span>−' + tien(g.giam) + '</span></div>' : '') +
      '<div class="sum__row"><span>Phí giao hàng</span><span>' + (g.phiGiao == null ? (g.duMienPhi ? 'Miễn phí' : '<span class="muted">Chọn nơi giao</span>') : g.phiGiao === 0 ? 'Miễn phí' : tien(g.phiGiao)) + '</span></div>' +
      '<div class="sum__row sum__row--total"><span>Tổng cộng</span><span>' + tien(g.tongTien) + '</span></div></div>' +
      (g.phiGiao == null && !g.duMienPhi ? '<p class="xs muted mt-1">Chưa gồm phí giao (từ ' + tien(20000) + ').</p>' : '') +
      '<a class="btn btn--primary btn--lg btn--block mt-2' + (g.hetHang.length ? ' is-disabled' : '') + '" href="checkout.html" data-di-thanh-toan>Tiến hành đặt hàng</a>' +
      '<p class="secure"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Không cần tạo tài khoản · Kết nối HTTPS · Không lưu thông tin thẻ</p>' +
      '</div><a class="btn btn--ghost btn--block mt-1" href="products.html">← Tiếp tục mua sắm</a></aside></div>';
  }

  vung.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-sl]');
    if (b) { const ip = vung.querySelector('[data-o-sl="' + b.dataset.khoa + '"]'); NG.gio.capNhat(b.dataset.khoa, Math.min(+ip.max, (+ip.value || 1) + +b.dataset.sl)); return ve(); }
    const x = e.target.closest('[data-xoa]');
    if (x) { NG.gio.xoa(x.dataset.xoa); NG.track('xoa_khoi_gio', { khoa: x.dataset.xoa }); return ve(); }
    if (e.target.closest('[data-xoa-het]')) { if (await NG.ui.xacNhan('Xóa tất cả?', 'Toàn bộ sản phẩm sẽ bị xóa khỏi giỏ hàng.', 'Xóa')) { NG.gio.xoaHet(); ve(); } return; }
    const dc = e.target.closest('[data-doi-chon]');
    if (dc) { NG.gio.doiLuaChon(dc.dataset.doiChon, dc.dataset.chon); return ve(); }
    if (e.target.closest('[data-ap-ma]')) { st.maUuDai = $('#ma-giam').value.trim().toUpperCase(); ghi({ maUuDai: st.maUuDai }); if (st.maUuDai) NG.track('ap_ma', { ma: st.maUuDai }); return ve(); }
    const cm = e.target.closest('[data-chon-ma]');
    if (cm) { st.maUuDai = cm.dataset.chonMa; ghi({ maUuDai: st.maUuDai }); return ve(); }
    if (e.target.closest('[data-di-thanh-toan]')) { ghi(st); NG.track('bat_dau_thanh_toan', {}); }
  });
  vung.addEventListener('change', (e) => {
    if (e.target.matches('[data-o-sl]')) { const v = Math.max(0, Math.min(+e.target.max, Math.round(+e.target.value) || 0)); NG.gio.capNhat(e.target.dataset.oSl, v); ve(); }
    if (e.target.matches('[data-tinh]')) { st.tinh = e.target.value; st.dichVu = ''; ghi(st); ve(); }
    if (e.target.name === 'dv') { st.dichVu = e.target.value; ghi(st); ve(); }
  });
  vung.addEventListener('keydown', (e) => { if (e.target.id === 'ma-giam' && e.key === 'Enter') { e.preventDefault(); vung.querySelector('[data-ap-ma]').click(); } });
  window.addEventListener('ng:doi', (e) => { if (e.detail.khoa === 'gioHang' && e.detail.tuTheKhac) ve(); });
  // nút "Thêm combo" trong upsell dùng sự kiện chung; vẽ lại sau khi thêm
  window.addEventListener('ng:doi', (e) => { if (e.detail.khoa === 'gioHang' && !e.detail.tuTheKhac) setTimeout(ve, 0); });
  ve();
})();
