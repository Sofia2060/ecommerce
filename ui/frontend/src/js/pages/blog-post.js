/* Bài viết (?bai=slug): nội dung, liên kết dẫn về sản phẩm/combo/công cụ TDEE, chia sẻ có gắn UTM, bài liên quan */
(async function () {
  'use strict';
  const NG = window.NG; const { $, $$, esc, anh } = NG;
  const b = await NG.duLieu.blog(); const slug = NG.qs('bai');
  const bai = b.baiViet.find((x) => x.slug === slug); const vung = $('[data-bai]');
  if (!bai) { vung.innerHTML = '<div class="empty"><h3>Không tìm thấy bài viết</h3><a class="btn btn--primary" href="blog.html">Xem các bài khác</a></div>'; return; }
  document.title = bai.tieuDe + ' | Góc dinh dưỡng NutriGreen';
  $$('meta[name="description"], meta[property="og:description"]').forEach((m) => m.setAttribute('content', bai.tomTat));
  $$('meta[property="og:title"]').forEach((m) => m.setAttribute('content', bai.tieuDe));
  $$('meta[property="og:image"]').forEach((m) => m.setAttribute('content', anh(bai.anh)));
  const ld = document.createElement('script'); ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: bai.tieuDe, datePublished: bai.ngay, image: anh(bai.anh), author: { '@type': 'Organization', name: 'NutriGreen' }, description: bai.tomTat });
  document.head.appendChild(ld);
  $('[data-bc]').textContent = bai.tieuDe;
  NG.track('doc_bai_viet', { slug });
  const lk = bai.lienKet.map((l) => '<a href="' + NG.url(l.url, l.thamSo) + '" data-lk>' + esc(l.ten) + ' →</a>').join('');
  const url = location.href.split('?')[0] + '?bai=' + encodeURIComponent(slug);
  const utm = (s) => url + '&utm_source=' + s + '&utm_medium=social&utm_campaign=blog-share';
  const khac = b.baiViet.filter((x) => x.slug !== slug).sort((x, y) => (y.chuDe === bai.chuDe) - (x.chuDe === bai.chuDe)).slice(0, 3);
  // nội dung bài viết lấy từ mock-data/blog.json do nhóm soạn (không phải dữ liệu người dùng nhập)
  vung.innerHTML = '<div class="post"><article><header class="post__head"><p class="eyebrow">' + esc(bai.chuDe) + '</p><h1>' + esc(bai.tieuDe) + '</h1><div class="post__meta"><span>NutriGreen</span><span>' + NG.ngay(bai.ngay) + '</span><span>' + bai.phutDoc + ' phút đọc</span></div></header>' +
    '<div class="post__cover"><img src="' + anh(bai.anh) + '" alt="" width="640" height="640"></div><p class="lead strong">' + esc(bai.tomTat) + '</p><div class="prose">' + bai.noiDung + '</div>' +
    '<div class="share"><span class="small strong">Chia sẻ:</span><a class="btn btn--sm" target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(utm('facebook')) + '">Facebook</a><a class="btn btn--sm" target="_blank" rel="noopener" href="https://zalo.me/share?url=' + encodeURIComponent(utm('zalo')) + '">Zalo</a><button class="btn btn--sm" type="button" data-copy="' + esc(utm('copy')) + '">Sao chép link</button></div>' +
    '<p class="xs muted mt-2">Bài viết mang tính tham khảo, không thay thế tư vấn của bác sĩ hoặc chuyên gia dinh dưỡng.</p></article>' +
    '<aside class="post__side"><div class="try"><h2>Đọc xong, thử ngay</h2>' + lk + '<a href="tdee.html" data-lk>Tính TDEE &amp; nhận combo →</a></div></aside></div>' +
    '<section class="section"><h2>Bài viết khác</h2><div class="grid grid-3">' + khac.map(NG.ui.theBaiViet).join('') + '</div></section>';
  vung.addEventListener('click', (e) => { const a = e.target.closest('[data-lk]'); if (a) NG.track('blog_click', { slug, toi: a.getAttribute('href') }); });
})();
