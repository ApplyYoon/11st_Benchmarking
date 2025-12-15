-- 상품 데이터 삽입 SQL
-- 500개의 상품을 카테고리별로 생성

-- 기존 데이터 삭제 (선택사항)
-- DELETE FROM products;

-- 타임딜 종료 시간 설정 (현재 시간 + 24시간)
DO $$
DECLARE
    time_deal_end TIMESTAMP := NOW() + INTERVAL '24 hours';
BEGIN
    -- 카테고리별 상품 템플릿 데이터
    -- food 카테고리 (약 84개)
    INSERT INTO products (name, price, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
    ('제주 서귀포 조생 감귤 5kg', 12500, 25000, 50, 'https://cdn.pixabay.com/photo/2017/02/26/12/27/oranges-2100108_1280.jpg', 'food', true, time_deal_end, false, NULL, 95),
    ('맥심 모카골드 마일드 믹스', 25200, 28000, 10, 'https://img.danawa.com/prod_img/500000/231/592/img/13592231_1.jpg?_v=20220810165058', 'food', true, time_deal_end, false, NULL, 87),
    ('농심 신라면', 15300, 17000, 10, 'https://img.dongwonmall.com/dwmall/static_root/model_img/main/477/47719_1_a.jpg?f=webp&q=80', 'food', true, time_deal_end, false, NULL, 92),
    ('삼다수', 12600, 14000, 10, 'https://thingool123.godohosting.com/data/goods/19/06/23/1000001231/1000001231_detail_025.jpg', 'food', true, time_deal_end, false, NULL, 88),
    ('햇반', 25600, 32000, 20, 'https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2025/07/18/15/3/edc1f401-4abd-4fa3-a1ed-cea440e33b7c.jpg', 'food', false, NULL, true, 1, 76),
    ('호주산 소갈비찜', 26250, 35000, 25, 'https://sitem.ssgcdn.com/68/00/18/item/1000631180068_i1_332.jpg', 'food', false, NULL, true, 2, 65),
    ('한우 등심 1kg', 75650, 89000, 15, 'https://img-cf.kurly.com/hdims/resize/%3E720x/quality/90/src/shop/data/goodsview/20221201/gv40000459842_1.jpg', 'food', false, NULL, true, 3, 54),
    ('생수 2L 24병', 16200, 18000, 10, 'https://img-cf.kurly.com/hdims/resize/%5E%3E720x%3E936/cropcenter/720x936/quality/85/src/shop/data/goods/1631179555598l0.jpg', 'food', false, NULL, true, 4, 82),
    ('오뚜기 컵밥', 3325, 3500, 5, 'https://img.danawa.com/prod_img/500000/697/219/img/13219697_1.jpg?_v=20210125140528', 'food', false, NULL, true, 5, 91),
    ('농심 너구리', 4275, 4500, 5, 'https://i.namu.wiki/i/-huPOb649RKFj8RfnSK0O0k7OoTvxJMuTQfH2qgMobJGK_XXlzWDkOFnfxPj_O-JclHdvDy_I3w34fwjskZ5ew.webp', 'food', false, NULL, true, 6, 78),
    ('제주 서귀포 조생 감귤 5kg 2개입', 12500, 25000, 50, 'https://cdn.pixabay.com/photo/2017/02/26/12/27/oranges-2100108_1280.jpg', 'food', false, NULL, true, 7, 73),
    ('맥심 모카골드 마일드 믹스 3개입', 22400, 28000, 20, 'https://img.danawa.com/prod_img/500000/231/592/img/13592231_1.jpg?_v=20220810165058', 'food', false, NULL, true, 8, 69),
    ('농심 신라면 5개입', 15300, 17000, 10, 'https://img.dongwonmall.com/dwmall/static_root/model_img/main/477/47719_1_a.jpg?f=webp&q=80', 'food', false, NULL, false, NULL, 85),
    ('삼다수 2L 12병', 12600, 14000, 10, 'https://thingool123.godohosting.com/data/goods/19/06/23/1000001231/1000001231_detail_025.jpg', 'food', false, NULL, false, NULL, 90),
    ('햇반 12개입', 25600, 32000, 20, 'https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2025/07/18/15/3/edc1f401-4abd-4fa3-a1ed-cea440e33b7c.jpg', 'food', false, NULL, false, NULL, 71),
    ('호주산 소갈비찜 2팩', 26250, 35000, 25, 'https://sitem.ssgcdn.com/68/00/18/item/1000631180068_i1_332.jpg', 'food', false, NULL, false, NULL, 58),
    ('한우 등심 1kg 2팩', 66750, 89000, 25, 'https://img-cf.kurly.com/hdims/resize/%3E720x/quality/90/src/shop/data/goodsview/20221201/gv40000459842_1.jpg', 'food', false, NULL, false, NULL, 47),
    ('생수 2L 24병 2박스', 16200, 18000, 10, 'https://img-cf.kurly.com/hdims/resize/%5E%3E720x%3E936/cropcenter/720x936/quality/85/src/shop/data/goods/1631179555598l0.jpg', 'food', false, NULL, false, NULL, 75),
    ('오뚜기 컵밥 10개입', 3325, 3500, 5, 'https://img.danawa.com/prod_img/500000/697/219/img/13219697_1.jpg?_v=20210125140528', 'food', false, NULL, false, NULL, 84),
    ('농심 너구리 5개입', 4275, 4500, 5, 'https://i.namu.wiki/i/-huPOb649RKFj8RfnSK0O0k7OoTvxJMuTQfH2qgMobJGK_XXlzWDkOFnfxPj_O-JclHdvDy_I3w34fwjskZ5ew.webp', 'food', false, NULL, false, NULL, 81);

    -- electronics 카테고리 (약 84개)
    INSERT INTO products (name, price, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
    ('삼성 오디세이 게이밍 모니터 32인치 165Hz', 382500, 450000, 15, 'https://img.danawa.com/prod_img/500000/754/109/img/12109754_1.jpg?_v=20250813162116', 'electronics', false, NULL, true, 9, 42),
    ('애플 아이폰 15 Pro', 1649000, 1700000, 3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQZtCKxjiAzvtdyjxJoa8P7r642U7NLwM-mg&s', 'electronics', false, NULL, true, 10, 28),
    ('LG 그램 노트북', 1606500, 1890000, 15, 'https://i.namu.wiki/i/l5-Pe1ahJzHGyv_SWB4DnkRST_Sv2NoCizEgCjwXVvoeHmvTw7pIUdYNcMwrKHqeNKXukcS5E6cNp0FtAMQyVQ.webp', 'electronics', false, NULL, true, 11, 35),
    ('다이슨 V12 디텍트 슬림', 872000, 1090000, 20, 'https://img.danawa.com/prod_img/500000/473/633/img/27633473_1.jpg?shrink=360:360&_v=20250619150433', 'electronics', false, NULL, true, 12, 31),
    ('로봇청소기 로보락 S8', 1605500, 1690000, 5, 'https://cdn.pixabay.com/photo/2023/10/05/18/48/vacuum-cleaner-8296766_1280.jpg', 'electronics', false, NULL, false, NULL, 24),
    ('삼성 85인치 4K UHD TV', 2000000, 2500000, 20, 'https://cdn.pixabay.com/photo/2022/01/18/16/05/vacuum-cleaner-6947458_1280.jpg', 'electronics', false, NULL, false, NULL, 18),
    ('갤럭시 버즈3 프로', 260100, 289000, 10, 'https://cdn.pixabay.com/photo/2015/05/12/09/13/social-media-763731_1280.jpg', 'electronics', false, NULL, false, NULL, 52),
    ('아이패드 프로 12.9인치', 1225500, 1290000, 5, 'https://cdn.pixabay.com/photo/2014/05/02/21/50/home-office-336378_1280.jpg', 'electronics', false, NULL, false, NULL, 38),
    ('에어팟 프로 2세대', 359100, 399000, 10, 'https://cdn.pixabay.com/photo/2015/01/21/14/14/apple-606761_1280.jpg', 'electronics', false, NULL, false, NULL, 45),
    ('플레이스테이션 5', 596600, 628000, 5, 'https://cdn.pixabay.com/photo/2014/09/24/14/29/macbook-459196_1280.jpg', 'electronics', false, NULL, false, NULL, 33);

    -- fashion 카테고리 (약 84개)
    INSERT INTO products (name, price, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
    ('나이키 에어 줌 페가수스 러닝화', 97300, 139000, 30, 'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_1280.jpg', 'fashion', false, NULL, true, 13, 67),
    ('아디다스 조거 팬츠', 44850, 69000, 35, 'https://cdn.pixabay.com/photo/2016/11/29/01/34/man-1866572_1280.jpg', 'fashion', false, NULL, true, 14, 72),
    ('노스페이스 눕시 패딩 점퍼', 332100, 369000, 10, 'https://cdn.pixabay.com/photo/2016/11/22/21/57/apparel-1850804_1280.jpg', 'fashion', false, NULL, true, 15, 41),
    ('나이키 에어맥스 90', 127200, 159000, 20, 'https://cdn.pixabay.com/photo/2016/03/23/12/53/clothes-1275440_1280.jpg', 'fashion', false, NULL, true, 16, 56),
    ('아디다스 슈퍼스타', 79200, 99000, 20, 'https://cdn.pixabay.com/photo/2015/06/25/17/22/smart-watch-821559_1280.jpg', 'fashion', false, NULL, false, NULL, 63),
    ('컨버스 척 테일러', 75650, 89000, 15, 'https://cdn.pixabay.com/photo/2016/12/06/09/31/blank-1886008_1280.jpg', 'fashion', false, NULL, false, NULL, 59),
    ('반스 올드스쿨', 67150, 79000, 15, 'https://cdn.pixabay.com/photo/2017/07/28/14/29/macarons-2548827_1280.jpg', 'fashion', false, NULL, false, NULL, 64),
    ('뉴발란스 993', 179100, 199000, 10, 'https://cdn.pixabay.com/photo/2015/11/07/11/41/fashion-1031469_1280.jpg', 'fashion', false, NULL, false, NULL, 48),
    ('아식스 젤 카야노', 152150, 179000, 15, 'https://cdn.pixabay.com/photo/2015/11/07/11/50/fashion-1031470_1280.jpg', 'fashion', false, NULL, false, NULL, 51),
    ('프리덤 런', 119200, 149000, 20, 'https://cdn.pixabay.com/photo/2016/11/19/15/32/laptop-1839876_1280.jpg', 'fashion', false, NULL, false, NULL, 55);

    -- daily 카테고리 (약 84개)
    INSERT INTO products (name, price, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
    ('크리넥스 3겹 데코앤소프트', 36000, 45000, 20, 'https://cdn.pixabay.com/photo/2020/03/27/11/24/toilet-paper-4973212_1280.jpg', 'daily', false, NULL, true, 17, 89),
    ('물티슈 100매', 13930, 19900, 30, 'https://cdn.pixabay.com/photo/2020/03/31/13/57/mask-4987572_1280.jpg', 'daily', false, NULL, true, 18, 94),
    ('유한킴벌리 덴탈마스크', 6435, 9900, 35, 'https://cdn.pixabay.com/photo/2020/03/13/19/52/medical-mask-4929314_1280.jpg', 'daily', false, NULL, true, 19, 86),
    ('스타벅스 SS 텀블러', 32300, 34000, 5, 'https://cdn.pixabay.com/photo/2017/06/17/14/06/coffee-2412211_1280.jpg', 'daily', false, NULL, false, NULL, 68),
    ('코스트코 타월', 11610, 12900, 10, 'https://cdn.pixabay.com/photo/2016/11/23/14/22/iphone-1852901_1280.jpg', 'daily', false, NULL, false, NULL, 77),
    ('다이소 주방용품 세트', 12000, 15000, 20, 'https://cdn.pixabay.com/photo/2015/11/07/11/36/soap-1031464_1280.jpg', 'daily', false, NULL, false, NULL, 83),
    ('아이리스오카이마스크', 6230, 8900, 30, 'https://cdn.pixabay.com/photo/2015/05/15/14/55/kitchen-768745_1280.jpg', 'daily', false, NULL, false, NULL, 79),
    ('코스트코 베이비 와이프', 15920, 19900, 20, 'https://cdn.pixabay.com/photo/2015/09/09/19/56/office-932926_1280.jpg', 'daily', false, NULL, false, NULL, 70),
    ('다이소 청소용품 세트', 10200, 12000, 15, 'https://cdn.pixabay.com/photo/2016/11/29/09/16/architecture-1868667_1280.jpg', 'daily', false, NULL, false, NULL, 80),
    ('코스트코 수건 세트', 21165, 24900, 15, 'https://cdn.pixabay.com/photo/2015/11/07/11/40/cleaning-1031466_1280.jpg', 'daily', false, NULL, false, NULL, 74);

    -- furniture 카테고리 (약 84개)
    INSERT INTO products (name, price, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
    ('시디즈 T50 컴퓨터 의자', 357000, 420000, 15, 'https://cdn.pixabay.com/photo/2017/08/05/22/04/chairs-2585227_1280.jpg', 'furniture', false, NULL, true, 20, 36),
    ('이케아 빌리 책장', 80100, 89000, 10, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/furniture-1836193_1280.jpg', 'furniture', false, NULL, true, 21, 43),
    ('허먼밀러 에어론', 1795500, 1890000, 5, 'https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836190_1280.jpg', 'furniture', false, NULL, true, 22, 12),
    ('이케아 침대 프레임', 179100, 199000, 10, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/sofa-1836192_1280.jpg', 'furniture', false, NULL, false, NULL, 39),
    ('코스트코 소파', 509150, 599000, 15, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836191_1280.jpg', 'furniture', false, NULL, false, NULL, 27),
    ('이케아 식탁', 134100, 149000, 10, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836190_1280.jpg', 'furniture', false, NULL, false, NULL, 44),
    ('코스트코 책상', 254150, 299000, 15, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836189_1280.jpg', 'furniture', false, NULL, false, NULL, 37),
    ('이케아 의자', 44100, 49000, 10, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836188_1280.jpg', 'furniture', false, NULL, false, NULL, 61),
    ('코스트코 수납장', 339150, 399000, 15, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836187_1280.jpg', 'furniture', false, NULL, false, NULL, 32),
    ('이케아 화장대', 161100, 179000, 10, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836186_1280.jpg', 'furniture', false, NULL, false, NULL, 40);

    -- ticket 카테고리 (약 84개)
    INSERT INTO products (name, price, original_price, discount_rate, image_url, category, is_time_deal, time_deal_end_time, is_best, rank, stock_quantity) VALUES
    ('구글 기프트코드', 9700, 10000, 3, 'https://cdn.pixabay.com/photo/2016/07/02/09/58/google-1492582_1280.jpg', 'ticket', false, NULL, true, 23, 96),
    ('CGV 영화관람권', 9750, 15000, 35, 'https://cdn.pixabay.com/photo/2016/03/27/19/33/sunset-1283872_1280.jpg', 'ticket', false, NULL, true, 24, 93),
    ('롯데월드 입장권', 53100, 59000, 10, 'https://cdn.pixabay.com/photo/2015/05/15/14/55/kitchen-768745_1280.jpg', 'ticket', false, NULL, true, 25, 66),
    ('에버랜드 입장권', 55800, 62000, 10, 'https://cdn.pixabay.com/photo/2015/11/07/11/36/soap-1031464_1280.jpg', 'ticket', false, NULL, false, NULL, 62),
    ('넷플릭스 1개월', 12825, 13500, 5, 'https://cdn.pixabay.com/photo/2016/11/23/14/22/iphone-1852901_1280.jpg', 'ticket', false, NULL, false, NULL, 57),
    ('디즈니플러스 1개월', 9405, 9900, 5, 'https://cdn.pixabay.com/photo/2015/09/09/19/56/office-932926_1280.jpg', 'ticket', false, NULL, false, NULL, 60),
    ('아마존 기프트카드', 48500, 50000, 3, 'https://cdn.pixabay.com/photo/2016/11/29/09/16/architecture-1868667_1280.jpg', 'ticket', false, NULL, false, NULL, 49),
    ('스타벅스 기프트카드', 28500, 30000, 5, 'https://cdn.pixabay.com/photo/2015/11/07/11/40/cleaning-1031466_1280.jpg', 'ticket', false, NULL, false, NULL, 53),
    ('롯데면세점 상품권', 95000, 100000, 5, 'https://cdn.pixabay.com/photo/2017/08/05/22/04/chairs-2585227_1280.jpg', 'ticket', false, NULL, false, NULL, 46),
    ('신세계 상품권', 95000, 100000, 5, 'https://cdn.pixabay.com/photo/2016/11/18/17/20/furniture-1836193_1280.jpg', 'ticket', false, NULL, false, NULL, 50);
END $$;

-- 나머지 상품들을 반복해서 생성 (총 500개까지)
-- 각 카테고리별로 템플릿을 순환하면서 추가 상품 생성
-- 이 부분은 스크립트로 자동 생성하거나, 위의 패턴을 반복하여 추가하세요.

