"""Kiểm tra dữ liệu mock-data/products.json:
- năng lượng tính từ macro khớp kcal công bố (sai lệch <= 3%)
- kcal cả gói khớp Bảng 3.3 của báo cáo
- giá trong khung 80.000–180.000đ, giá combo > 299.000đ (ngưỡng freeship) và rẻ hơn mua lẻ ~10%
Chạy: python scripts/check_data.py
"""
import json, pathlib, sys
sys.stdout.reconfigure(encoding='utf-8')
root = pathlib.Path(__file__).resolve().parents[1]
d = json.loads((root / 'frontend/mock-data/products.json').read_text(encoding='utf-8'))
BANG_33 = {'hat-mix-5-loai':1530,'hanh-nhan-rang-moc':1500,'hat-dieu-rang-moc':1440,'granola-it-duong':1410,'granola-cacao':1410,
  'yen-mach-can-det':1900,'banh-hat-an-kieng':1000,'biscotti-nguyen-cam':1080,'banh-quy-yen-mach':900,'thanh-hat-ngu-coc':1180,
  'bun-gao-lut':3600,'pho-gao-lut':3600,'nui-gao-lut':3600}
loi = 0; by = {}
print('%-22s %6s %6s %6s %7s %6s %7s' % ('Sản phẩm','kcal','tính','lệch%','gói','B3.3','giá'))
for s in d['sanPham']:
    by[s['ma']] = s; n = s['dinhDuong']['tren100g']
    tinh = 4*n['protein'] + 9*n['beo'] + 4*(n['carb']-n['xo']) + 2*n['xo']
    lech = (tinh-n['kcal'])/n['kcal']*100; goi = round(n['kcal']*s['khoiLuong']/100)
    b33 = BANG_33.get(s['slug'], goi)  # sản phẩm mới chưa có trong Bảng 3.3
    ok = abs(lech) <= 3 and goi == b33 and 80000 <= s['gia'] <= 180000 and n['duong'] <= n['carb']
    loi += not ok
    print('%-22s %6d %6.0f %6.1f %7d %6d %7d %s' % (s['slug'][:22], n['kcal'], tinh, lech, goi, b33, s['gia'], '' if ok else '  <-- LỖI'))
print()
for c in d['combo']:
    le = 0; kcal = 0; pro = 0
    for t in c['thanhPhan']:
        s = by[t['ma'] if 'ma' in t else t['chon'][0]]
        le += s['gia']*t['soLuong']; f = s['khoiLuong']/100*t['soLuong']
        kcal += s['dinhDuong']['tren100g']['kcal']*f; pro += s['dinhDuong']['tren100g']['protein']*f
    tk = (le-c['gia'])/le*100
    ok = c['gia'] > 299000 and 8 <= tk <= 12
    loi += not ok
    print('%-24s giá %d | lẻ %d | tiết kiệm %.1f%% | %.0f kcal/7 ngày = %.0f kcal/ngày (%.0f%% mức %d) | protein %.0fg/ngày %s' % (
        c['slug'], c['gia'], le, tk, kcal, kcal/7, kcal/7/c['mucTieuKcal']*100, c['mucTieuKcal'], pro/7, '' if ok else '<-- LỖI'))
print('\nKẾT QUẢ:', 'ĐẠT' if loi == 0 else '%d lỗi' % loi)
