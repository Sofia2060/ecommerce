import json
# (ma, slug, ten, danhMuc, mucTieu, quyCach, khoiLuong, gia, kcal100, P, F, C, xo, duong, khauPhan_g, khauPhan_moTa, hsdThang, ton, noiBat, anhMinhHoa)
R=[
("NG-HAT-01","hat-mix-5-loai","Hạt mix 5 loại","hat-granola",["tang-co"],"Hũ 250g",250,169000,612,19,51.5,22,8,4.5,30,"1 nắm vừa (30g)",6,46,True,False),
("NG-HAT-02","hanh-nhan-rang-moc","Hạnh nhân rang mộc","hat-granola",["tang-co"],"Hũ 250g",250,155000,600,21,50.5,21,11,4.9,30,"khoảng 23 hạt (30g)",6,38,False,True),
("NG-HAT-03","hat-dieu-rang-moc","Hạt điều rang mộc","hat-granola",["tang-co"],"Hũ 250g",250,149000,576,15.5,44,32,3.3,5,30,"khoảng 18 hạt (30g)",6,41,False,True),
("NG-GRA-01","granola-it-duong","Granola ít đường","hat-granola",["an-sang-nhanh","giam-can"],"Túi 300g",300,125000,470,11,22,60,8,4.8,40,"4 muỗng canh (40g)",6,62,True,False),
("NG-GRA-02","granola-cacao","Granola vị cacao","hat-granola",["an-sang-nhanh"],"Túi 300g",300,129000,470,10.5,21.5,62,9,9,40,"4 muỗng canh (40g)",6,35,False,True),
("NG-YM-01","yen-mach-can-det","Yến mạch cán dẹt","hat-granola",["an-sang-nhanh","giam-can","tang-co"],"Túi 500g",500,85000,380,13.5,7.5,69,10,1,40,"1/2 chén (40g)",12,57,False,True),
("NG-BAN-01","banh-hat-an-kieng","Bánh hạt ăn kiêng","banh-an-kieng",["giam-can"],"Hộp 200g",200,119000,500,14,34,38,7,4,25,"2 miếng (25g)",6,29,True,True),
("NG-BAN-02","biscotti-nguyen-cam","Biscotti nguyên cám","banh-an-kieng",["giam-can","an-sang-nhanh"],"Hộp 250g",250,109000,432,11,16,64,7,8,25,"2 thanh (25g)",6,0,False,True),
("NG-BAN-03","banh-quy-yen-mach","Bánh quy yến mạch","banh-an-kieng",["an-sang-nhanh"],"Hộp 200g",200,89000,450,8,19.5,64,6,9,30,"2 cái (30g)",6,44,False,False),
("NG-BAN-04","thanh-hat-ngu-coc","Thanh hạt ngũ cốc","banh-an-kieng",["an-sang-nhanh","tang-co"],"Hộp 10 thanh × 25g",250,135000,472,10,24,58,7,12,25,"1 thanh (25g)",6,5,False,True),
("NG-GL-01","bun-gao-lut","Bún gạo lứt","gao-lut",["giam-can"],"Bộ 2 gói × 500g",1000,98000,360,7.5,1.5,80,3.5,0.5,80,"1 bữa (80g khô)",12,70,True,False),
("NG-GL-02","pho-gao-lut","Phở gạo lứt","gao-lut",["giam-can"],"Bộ 2 gói × 500g",1000,98000,360,7,1.2,81,3,0.5,80,"1 bữa (80g khô)",12,52,False,True),
("NG-GL-03","nui-gao-lut","Nui gạo lứt","gao-lut",["giam-can"],"Bộ 2 gói × 500g",1000,98000,360,7.5,2,79.5,3.8,0.6,80,"1 bữa (80g khô)",12,48,False,False),
# ---- 7 sản phẩm mới (moi=True) – chưa có ảnh, website tự hiện khung "Ảnh đang cập nhật" cho tới khi thêm file <slug>.webp và <slug>-sm.webp
("NG-HAT-04","hat-oc-cho-rang-moc","Hạt óc chó rang mộc","hat-granola",["tang-co"],"Hũ 250g",250,179000,654,15.2,62,14,6.7,2.6,30,"khoảng 7 nửa nhân (30g)",6,33,False,True),
("NG-HAT-05","hat-chia-uc","Hạt chia Úc","hat-granola",["giam-can","an-sang-nhanh"],"Túi 300g",300,99000,450,16.5,30.7,42,34,0.5,15,"1 muỗng canh (15g)",12,64,False,True),
("NG-GRA-03","granola-trai-cay-nhiet-doi","Granola trái cây nhiệt đới","hat-granola",["an-sang-nhanh"],"Túi 300g",300,135000,440,9,17,66,7,12,40,"4 muỗng canh (40g)",6,40,False,True),
("NG-BAN-05","banh-gao-lut-me-den","Bánh gạo lứt mè đen","banh-an-kieng",["giam-can","an-sang-nhanh"],"Túi 200g",200,85000,395,8.5,6,80,4.5,0.8,20,"2 miếng (20g)",9,55,False,True),
("NG-BAN-06","thanh-protein-hat","Thanh protein hạt","banh-an-kieng",["tang-co"],"Hộp 8 thanh × 40g",320,179000,410,25,18,42,9,7,40,"1 thanh (40g)",6,27,False,True),
("NG-GL-04","mi-gao-lut-rau-cu","Mì gạo lứt rau củ","gao-lut",["giam-can"],"Bộ 2 gói × 500g",1000,105000,355,7.5,2,78,4,1.5,80,"1 bữa (80g khô)",12,45,False,True),
("NG-GL-05","gao-lut-huyet-rong","Gạo lứt đỏ huyết rồng","gao-lut",["giam-can","tang-co"],"Túi 2kg",2000,129000,355,7.8,2.5,76,3.5,0.7,60,"1 chén cơm (60g gạo)",12,58,False,True),
]
TXT={
"hat-mix-5-loai":dict(moTaNgan="Hạnh nhân, điều, óc chó, hạt bí xanh và nam việt quất sấy, rang mộc không muối.",thanhPhan="Hạnh nhân (30%), hạt điều (25%), óc chó (20%), hạt bí xanh (15%), nam việt quất sấy (10%).",xuatXu="Hạnh nhân, óc chó nhập khẩu Mỹ; điều Bình Phước (nay thuộc Đồng Nai); đóng gói tại TP.HCM.",huongDan="Ăn trực tiếp như bữa phụ, rắc lên sữa chua, salad hoặc granola.",nguon="USDA FoodData Central – nhóm Nuts, mixed nuts, dry roasted (đối chiếu theo tỷ lệ phối trộn)."),
"hanh-nhan-rang-moc":dict(moTaNgan="Hạnh nhân Mỹ nguyên hạt, rang mộc ở nhiệt độ thấp, không muối, không dầu.",thanhPhan="100% hạnh nhân.",xuatXu="Hạnh nhân nhập khẩu Mỹ; rang và đóng gói tại TP.HCM.",huongDan="Ăn trực tiếp, xay làm sữa hạt hoặc rắc lên yến mạch.",nguon="USDA FoodData Central – Nuts, almonds, dry roasted, without salt added."),
"hat-dieu-rang-moc":dict(moTaNgan="Điều nguyên hạt loại W320, rang mộc, giữ vị béo tự nhiên.",thanhPhan="100% hạt điều.",xuatXu="Điều Bình Phước (nay thuộc Đồng Nai); rang và đóng gói tại TP.HCM.",huongDan="Ăn trực tiếp như bữa phụ hoặc dùng nấu sữa hạt.",nguon="USDA FoodData Central – Nuts, cashew nuts, dry roasted, without salt added."),
"granola-it-duong":dict(moTaNgan="Yến mạch nướng cùng hạnh nhân, hạt bí, dừa sấy; tạo ngọt bằng erythritol, không thêm đường mía.",thanhPhan="Yến mạch cán dẹt (55%), hạnh nhân lát (12%), hạt bí xanh (10%), dừa sấy (8%), dầu dừa, erythritol, quế.",xuatXu="Phối trộn và nướng tại TP.HCM.",huongDan="Dùng với sữa chua không đường hoặc sữa hạt; ăn trực tiếp như snack.",nguon="Tính theo công thức phối trộn, đối chiếu USDA FoodData Central cho từng nguyên liệu."),
"granola-cacao":dict(moTaNgan="Granola yến mạch phủ bột cacao nguyên chất, ngọt nhẹ từ mật dừa.",thanhPhan="Yến mạch cán dẹt (55%), hạnh nhân (10%), hạt bí (8%), bột cacao (6%), mật hoa dừa, dầu dừa.",xuatXu="Cacao Bến Tre (nay thuộc Vĩnh Long); nướng và đóng gói tại TP.HCM.",huongDan="Dùng với sữa tươi không đường hoặc sữa chua.",nguon="Tính theo công thức phối trộn, đối chiếu USDA FoodData Central cho từng nguyên liệu."),
"yen-mach-can-det":dict(moTaNgan="Yến mạch nguyên hạt cán dẹt, nấu cháo 3 phút hoặc ngâm qua đêm (overnight oats).",thanhPhan="100% yến mạch nguyên hạt.",xuatXu="Yến mạch nhập khẩu Úc; đóng gói tại TP.HCM.",huongDan="Nấu với nước/sữa 3–5 phút hoặc ngâm sữa trong tủ lạnh qua đêm.",nguon="USDA FoodData Central – Oats, whole grain, rolled, old fashioned."),
"banh-hat-an-kieng":dict(moTaNgan="Bánh ngói hạt giòn mỏng, không bột mì, tạo ngọt bằng erythritol.",thanhPhan="Hạnh nhân lát (40%), hạt bí (15%), hạt hướng dương (15%), lòng trắng trứng, bột yến mạch, erythritol.",xuatXu="Sản xuất và đóng gói tại TP.HCM.",huongDan="Dùng như bữa phụ cùng trà, cà phê không đường.",nguon="Tính theo công thức, đối chiếu USDA FoodData Central cho từng nguyên liệu."),
"biscotti-nguyen-cam":dict(moTaNgan="Biscotti nướng hai lần từ bột mì nguyên cám và hạnh nhân, giòn lâu.",thanhPhan="Bột mì nguyên cám (45%), hạnh nhân (18%), trứng, mật hoa dừa, dầu hướng dương, vani.",xuatXu="Sản xuất và đóng gói tại TP.HCM.",huongDan="Chấm cà phê, trà hoặc sữa hạt.",nguon="Tính theo công thức, đối chiếu USDA FoodData Central cho từng nguyên liệu."),
"banh-quy-yen-mach":dict(moTaNgan="Bánh quy yến mạch nướng mềm giữa, giòn viền, ngọt dịu từ chuối và mật dừa.",thanhPhan="Yến mạch (40%), bột mì nguyên cám (20%), chuối sấy, bơ, mật hoa dừa, trứng.",xuatXu="Sản xuất và đóng gói tại TP.HCM.",huongDan="Bữa sáng nhanh cùng sữa hoặc mang theo làm bữa phụ.",nguon="Tính theo công thức, đối chiếu USDA FoodData Central cho từng nguyên liệu."),
"thanh-hat-ngu-coc":dict(moTaNgan="Thanh năng lượng từ yến mạch, hạt và mật ong, đóng gói từng thanh tiện mang theo.",thanhPhan="Yến mạch (35%), đậu phộng (15%), hạt điều (12%), mật ong, hạt chia, nho khô.",xuatXu="Sản xuất và đóng gói tại TP.HCM.",huongDan="Ăn trước tập 30–60 phút hoặc thay bữa phụ.",nguon="Tính theo công thức, đối chiếu USDA FoodData Central cho từng nguyên liệu."),
"bun-gao-lut":dict(moTaNgan="Bún khô 100% gạo lứt đỏ, sợi dai, không chất tẩy trắng.",thanhPhan="Gạo lứt đỏ (98%), nước, muối.",xuatXu="Gạo lứt Đồng Tháp; sản xuất tại Đồng Tháp, đóng gói tại TP.HCM.",huongDan="Luộc 5–7 phút trong nước sôi, xả nước lạnh. 80g khô ≈ 1 tô bún.",nguon="USDA FoodData Central – Noodles, brown rice, dry (đối chiếu)."),
"pho-gao-lut":dict(moTaNgan="Bánh phở khô từ gạo lứt, sợi dẹt mềm, nấu nước dùng hoặc xào.",thanhPhan="Gạo lứt (98%), nước, muối.",xuatXu="Gạo lứt Đồng Tháp; sản xuất tại Đồng Tháp, đóng gói tại TP.HCM.",huongDan="Trụng 3–4 phút trong nước sôi. 80g khô ≈ 1 tô phở.",nguon="USDA FoodData Central – Noodles, brown rice, dry (đối chiếu)."),
"nui-gao-lut":dict(moTaNgan="Nui xoắn gạo lứt, giữ dáng khi nấu, hợp salad và súp.",thanhPhan="Gạo lứt (95%), bột năng, nước.",xuatXu="Gạo lứt Đồng Tháp; sản xuất tại Đồng Tháp, đóng gói tại TP.HCM.",huongDan="Luộc 8–10 phút, xả nước lạnh. 80g khô ≈ 1 đĩa.",nguon="USDA FoodData Central – Pasta, brown rice, dry (đối chiếu)."),
"hat-oc-cho-rang-moc":dict(moTaNgan="Óc chó nửa nhân vàng sáng, rang mộc nhiệt độ thấp, giàu omega-3 thực vật.",thanhPhan="100% óc chó.",xuatXu="Óc chó nhập khẩu Mỹ; rang và đóng gói tại TP.HCM.",huongDan="Ăn trực tiếp, rắc lên yến mạch, salad hoặc xay sữa hạt.",nguon="USDA FoodData Central – Nuts, walnuts, english (đối chiếu)."),
"hat-chia-uc":dict(moTaNgan="Hạt chia đen Úc, nở gấp 10 lần khi ngâm, rất nhiều chất xơ.",thanhPhan="100% hạt chia.",xuatXu="Hạt chia nhập khẩu Úc; đóng gói tại TP.HCM.",huongDan="Ngâm 1 muỗng với 150ml nước/sữa 10 phút; trộn sữa chua, sinh tố, overnight oats.",nguon="USDA FoodData Central – Seeds, chia seeds, dried (đối chiếu)."),
"granola-trai-cay-nhiet-doi":dict(moTaNgan="Granola yến mạch với xoài, thơm, dừa sấy dẻo – vị chua ngọt tự nhiên.",thanhPhan="Yến mạch cán dẹt (50%), xoài sấy (10%), thơm sấy (8%), dừa sấy (8%), hạt điều (8%), mật ong, dầu dừa.",xuatXu="Trái cây sấy Tiền Giang; phối trộn và nướng tại TP.HCM.",huongDan="Dùng với sữa chua không đường hoặc sữa hạt.",nguon="Tính theo công thức phối trộn, đối chiếu USDA FoodData Central cho từng nguyên liệu."),
"banh-gao-lut-me-den":dict(moTaNgan="Bánh gạo lứt nổ giòn xốp phủ mè đen rang, không chiên, ít béo.",thanhPhan="Gạo lứt (88%), mè đen (8%), muối hồng, dầu gạo.",xuatXu="Gạo lứt Đồng Tháp; sản xuất và đóng gói tại TP.HCM.",huongDan="Ăn trực tiếp hoặc phết bơ đậu phộng, bơ, phô mai ít béo.",nguon="Tính theo công thức, đối chiếu USDA FoodData Central – Rice cakes, brown rice."),
"thanh-protein-hat":dict(moTaNgan="Thanh protein từ whey và hạt, 10g protein mỗi thanh, ngọt nhẹ từ chà là.",thanhPhan="Whey protein (22%), hạnh nhân (18%), chà là (18%), yến mạch (15%), hạt điều, cacao, hạt chia.",xuatXu="Whey nhập khẩu New Zealand; sản xuất và đóng gói tại TP.HCM.",huongDan="Ăn sau tập 30 phút hoặc thay bữa phụ.",nguon="Tính theo công thức, đối chiếu USDA FoodData Central cho từng nguyên liệu."),
"mi-gao-lut-rau-cu":dict(moTaNgan="Mì gạo lứt trộn bột rau bina, cà rốt, củ dền – 3 màu tự nhiên, không phẩm màu.",thanhPhan="Gạo lứt (90%), bột rau bina, bột cà rốt, bột củ dền, muối.",xuatXu="Gạo lứt Đồng Tháp; sản xuất tại Đồng Tháp, đóng gói tại TP.HCM.",huongDan="Trụng 4–5 phút trong nước sôi. 80g khô ≈ 1 tô mì.",nguon="USDA FoodData Central – Noodles, brown rice, dry (đối chiếu)."),
"gao-lut-huyet-rong":dict(moTaNgan="Gạo lứt đỏ huyết rồng Long An, hạt dài, dẻo nhẹ, giữ nguyên lớp cám.",thanhPhan="100% gạo lứt huyết rồng.",xuatXu="Long An (nay thuộc Tây Ninh); đóng gói tại TP.HCM.",huongDan="Ngâm 2 giờ, nấu tỉ lệ 1 gạo : 1,8 nước. 60g gạo ≈ 1 chén cơm.",nguon="USDA FoodData Central – Rice, brown, long-grain, raw (đối chiếu)."),
}
BAOQUAN={"hat-granola":"Nơi khô ráo, thoáng mát, tránh nắng. Sau khi mở, đậy kín nắp/túi zip kèm gói hút ẩm, dùng trong 30 ngày.","banh-an-kieng":"Nơi khô ráo, dưới 30°C. Sau khi mở, cho vào hộp kín, dùng trong 14 ngày.","gao-lut":"Nơi khô ráo, tránh ẩm. Gói đã mở cần kẹp kín."}
import datetime
def lo(i,thang):
    nsx=datetime.date(2026,9,20)+datetime.timedelta(days=i*2)
    m=nsx.month+thang; y=nsx.year+(m-1)//12; m=(m-1)%12+1
    hsd=datetime.date(y,m,min(nsx.day,28))
    return {"ma":"L%s-%02d"%(nsx.strftime('%y%m%d'),i+1),"nsx":nsx.isoformat(),"hsd":hsd.isoformat()}
MOI={"NG-HAT-04","NG-HAT-05","NG-GRA-03","NG-BAN-05","NG-BAN-06","NG-GL-04","NG-GL-05"}
sp=[]
for i,r in enumerate(R):
    (ma,slug,ten,dm,mt,qc,kl,gia,kcal,P,F,C,xo,du,kp,kpm,hsd,ton,nb,mh)=r
    t=TXT[slug]
    sp.append({"ma":ma,"slug":slug,"loai":"san-pham","ten":ten,"danhMuc":dm,"mucTieu":mt,"quyCach":qc,"khoiLuong":kl,"gia":gia,
      "anh":slug,"anhMinhHoa":mh,"moTaNgan":t["moTaNgan"],"thanhPhan":t["thanhPhan"],"xuatXu":t["xuatXu"],
      "hanSuDung":"%d tháng kể từ ngày sản xuất"%hsd,"baoQuan":BAOQUAN[dm],"huongDan":t["huongDan"],
      "dinhDuong":{"tren100g":{"kcal":kcal,"protein":P,"beo":F,"carb":C,"xo":xo,"duong":du},"khauPhan":{"g":kp,"moTa":kpm}},
      "nguonSoLieu":t["nguon"],"ton":ton,"lo":lo(i,hsd),"noiBat":nb,"moi":ma in MOI})
combos=[
 {"ma":"NG-CB-1200","slug":"combo-giam-can-1200","ten":"Combo Giảm cân 1.200","mucTieuKcal":1200,"mucTieu":["giam-can"],"gia":308000,"nhan":"Giảm cân, giữ dáng",
  "thanhPhan":[{"ma":"NG-GRA-01","soLuong":1},{"ma":"NG-BAN-01","soLuong":1},{"chon":["NG-GL-01","NG-GL-02","NG-GL-03"],"soLuong":1}],
  "moTaNgan":"Bữa sáng granola ít đường, bữa phụ bánh hạt và 1 bộ bún/phở/nui gạo lứt cho bữa chính, đủ dùng 7 ngày.","phuHop":"Dân văn phòng, phụ nữ giữ dáng muốn kiểm soát calo mà không phải tự tính."},
 {"ma":"NG-CB-1500","slug":"combo-can-bang-1500","ten":"Combo Cân bằng 1.500","mucTieuKcal":1500,"mucTieu":["duy-tri"],"gia":353000,"nhan":"Duy trì cân nặng, ăn sạch",
  "thanhPhan":[{"ma":"NG-GRA-01","soLuong":1},{"ma":"NG-HAT-01","soLuong":1},{"chon":["NG-GL-01","NG-GL-02","NG-GL-03"],"soLuong":1}],
  "moTaNgan":"Granola ít đường, hạt mix 5 loại và 1 bộ bún/phở/nui gạo lứt, cân bằng tinh bột – chất béo tốt cho 7 ngày.","phuHop":"Người muốn duy trì cân nặng, ăn sạch đều đặn."},
 {"ma":"NG-CB-1800","slug":"combo-tang-co-1800","ten":"Combo Tăng cơ 1.800","mucTieuKcal":1800,"mucTieu":["tang-co"],"gia":465000,"nhan":"Tập gym, tăng cơ",
  "thanhPhan":[{"ma":"NG-GRA-01","soLuong":2},{"ma":"NG-HAT-01","soLuong":1},{"chon":["NG-GL-01","NG-GL-02","NG-GL-03"],"soLuong":1}],
  "moTaNgan":"2 túi granola ít đường, hạt mix 5 loại và 1 bộ bún/phở/nui gạo lứt, nhiều năng lượng cho ngày tập.","phuHop":"Người tập gym/yoga cần thêm năng lượng và chất béo tốt."},
]
for c in combos:
    c.update({"loai":"combo","danhMuc":"combo","anh":"combo-%d"%c["mucTieuKcal"],"anhMinhHoa":False,"soNgay":7,"noiBat":True,"chiBanTrenWebsite":True})
json.dump({"ghiChu":"Giá theo khung 80.000–180.000đ (mục 3.2.2). kcal/100g khớp Bảng 3.3 (kcal cả gói = kcal/100g × khối lượng). Năng lượng kiểm tra theo hệ số 4 (protein, carb trừ xơ) – 9 (béo) – 2 (xơ). Ảnh có anhMinhHoa=true là ảnh dựng lại từ bao bì mẫu, cần thay ảnh thật.",
  "sanPham":sp,"combo":combos},open('frontend/mock-data/products.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('ok',len(sp),len(combos))
