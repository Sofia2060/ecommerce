"""Đồng bộ đầu trang / chân trang dùng chung vào mọi trang khách hàng.

Đầu trang và chân trang được chép sẵn trong từng file HTML (để trang hiển thị
ngay, tốt cho SEO, không cần máy chủ). Khi sửa menu hay chân trang:
  1. sửa frontend/src/partials/header.html hoặc footer.html
  2. chạy:  python scripts/build_pages.py
Script thay nội dung giữa các dấu <!-- @header --> ... <!-- /@header -->
và <!-- @footer --> ... <!-- /@footer --> trong frontend/src/pages/client/*.html.
"""
import pathlib, re
root = pathlib.Path(__file__).resolve().parents[1] / 'frontend' / 'src'
parts = {k: (root / 'partials' / (k + '.html')).read_text(encoding='utf-8').strip() for k in ('header', 'footer')}
n = 0
for f in sorted((root / 'pages' / 'client').glob('*.html')):
    s = f.read_text(encoding='utf-8'); s0 = s
    for k, v in parts.items():
        s = re.sub(r'(<!-- @%s -->)(.*?)(<!-- /@%s -->)' % (k, k), lambda m: m.group(1) + '\n' + v + '\n' + m.group(3), s, flags=re.S)
    if s != s0:
        f.write_text(s, encoding='utf-8'); n += 1
print('Đã cập nhật', n, 'trang')
