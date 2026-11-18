/* Đăng nhập quản trị */
(function () {
  'use strict';
  if (window.NGA.phien()) { location.replace('dashboard.html'); return; }
  const f = document.querySelector('[data-qt-dn]');
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    try { await window.NGA.dangNhap(f.email.value, f.mk.value); location.href = 'dashboard.html'; }
    catch (er) { f.querySelector('[data-loi]').textContent = er.message; }
  });
})();
