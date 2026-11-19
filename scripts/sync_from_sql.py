"""Đồng bộ dữ liệu từ file SQL của nhóm (nutrigreen_data.sql) vào frontend/mock-data/products.json.

- Kiểm tra các trường chung (giá, tên, mô tả, quy cách, thành phần, dinh dưỡng…) giữa SQL và products.json, báo nếu lệch.
- Bổ sung các trường chỉ có trong SQL:
    diUng      ← product.allergen_note        (lưu ý dị ứng trên trang chi tiết)
    soCongBo   ← product.food_safety_cert     (số tự công bố an toàn thực phẩm)
    anhPhu     ← item_image                   (4 ảnh phụ: nguyên liệu, cận cảnh, cách dùng, mặt sau)
    ngayLenKe  ← item.created_at              (ngày lên kệ)
Chạy ở gốc repo, SAU gen_products.py:
    python scripts/sync_from_sql.py duong/den/nutrigreen_data.sql
"""
import json, pathlib, re, sys
sys.stdout.reconfigure(encoding='utf-8')
root = pathlib.Path(__file__).resolve().parents[1]
P = root / 'frontend/mock-data/products.json'


def parse_values(s, i):
    rows = []
    while True:
        while s[i] in ' \n\r\t,': i += 1
        if s[i] == ';': return rows
        i += 1; row = []
        while True:
            while s[i] in ' \n\r\t': i += 1
            if s[i] == "'":
                i += 1; buf = []
                while True:
                    c = s[i]
                    if c == '\\': buf.append(s[i + 1]); i += 2; continue
                    if c == "'" and s[i + 1] == "'": buf.append("'"); i += 2; continue
                    if c == "'": i += 1; break
                    buf.append(c); i += 1
                row.append(''.join(buf))
            else:
                m = re.match(r"[^,)]+", s[i:]); tok = m.group(0).strip(); i += m.end()
                if tok.upper() == 'NULL': row.append(None)
                else:
                    try: row.append(int(tok))
                    except ValueError: row.append(float(tok))
            while s[i] in ' \n\r\t': i += 1
            if s[i] == ',': i += 1; continue
            if s[i] == ')': i += 1; break
        rows.append(row)


def doc_sql(path):
    s = pathlib.Path(path).read_text(encoding='utf-8'); out = {}
    for m in re.finditer(r"INSERT INTO (\w+) \(([^)]*)\) VALUES", s):
        cols = [c.strip() for c in m.group(2).split(',')]
        out.setdefault(m.group(1), []).extend(dict(zip(cols, r)) for r in parse_values(s, m.end()))
    return out


def main(path):
    d = doc_sql(path); data = json.loads(P.read_text(encoding='utf-8'))
    theo_ma = {s['ma']: s for s in data['sanPham'] + data['combo']}
    prod = {r['product_id']: r for r in d['product']}; nf = {r['product_id']: r for r in d['nutrition_fact']}
    anh = {}
    for r in d['item_image']:
        m = re.search(r'products/(.+)\.webp$', r['image_url'] or '')
        if m: anh.setdefault(r['item_id'], []).append({'loai': r['image_type'], 'anh': m.group(1)})
    lech = 0
    for it in d['item']:
        s = theo_ma.get(it['item_code'])
        if not s: print('THIẾU trong products.json:', it['item_code']); lech += 1; continue
        so = [('gia', s['gia'], it['price']), ('ten', s['ten'], it['name']), ('moTaNgan', s['moTaNgan'], it['short_description'])]
        pr = prod.get(it['item_id'])
        if pr:
            n = nf[it['item_id']]; t = s['dinhDuong']['tren100g']; k = s['dinhDuong']['khauPhan']
            so += [('quyCach', s['quyCach'], pr['package_spec']), ('khoiLuong', s['khoiLuong'], pr['net_weight_g']), ('thanhPhan', s['thanhPhan'], pr['ingredients']),
                   ('dinhDuong', [t['kcal'], t['protein'], t['beo'], t['carb'], t['xo'], t['duong'], k['g']],
                    [n['kcal_100g'], n['protein_g'], n['fat_g'], n['carb_g'], n['fiber_g'], n['sugar_g'], n['serving_size_g']])]
            s['diUng'] = pr['allergen_note']; s['soCongBo'] = pr['food_safety_cert']
        for ten, a, b in so:
            if a != b: print('LỆCH', it['item_code'], ten, a, '≠ SQL', b); lech += 1
        if it['item_id'] in anh: s['anhPhu'] = anh[it['item_id']]
        s['ngayLenKe'] = str(it['created_at'])[:10]
    P.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print('Đã bổ sung diUng, soCongBo, anhPhu, ngayLenKe cho', len(d['item']), 'mặt hàng.', 'Không có trường lệch.' if not lech else '%d trường lệch – xem ở trên.' % lech)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else root / 'nutrigreen_data.sql')
