/* Danh sách bài viết "Góc dinh dưỡng" (FR07 – blog kiến thức; mục 3.4.4 SEO & content) lọc theo cụm chủ đề */
(async function () {
  'use strict';
  const NG = window.NG; const { $, esc } = NG;
  const b = await NG.duLieu.blog(); const ds = b.baiViet.slice().sort((x, y) => y.ngay.localeCompare(x.ngay));
  const chuDe = ['Tất cả'].concat([...new Set(ds.map((x) => x.chuDe))]);
  let chon = NG.qs('chude') || 'Tất cả';
  const ve = () => {
    $('[data-chu-de]').innerHTML = chuDe.map((c) => '<button class="chip' + (c === chon ? ' is-active' : '') + '" type="button" role="tab" aria-selected="' + (c === chon) + '" data-cd="' + esc(c) + '">' + esc(c) + '</button>').join('');
    $('[data-ds-bai]').innerHTML = ds.filter((x) => chon === 'Tất cả' || x.chuDe === chon).map(NG.ui.theBaiViet).join('');
  };
  document.addEventListener('click', (e) => { const c = e.target.closest('[data-cd]'); if (c) { chon = c.dataset.cd; ve(); } });
  ve();
})();
