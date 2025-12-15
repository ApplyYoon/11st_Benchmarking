// 상품 카테고리별 템플릿
const productTemplates = {
    food: [
        { name: '제주 서귀포 조생 감귤', basePrice: 25000, discountRange: [30, 50] },
        { name: '맥심 모카골드 마일드 믹스', basePrice: 28000, discountRange: [10, 20] },
        { name: '농심 신라면', basePrice: 17000, discountRange: [10, 20] },
        { name: '삼다수', basePrice: 14000, discountRange: [10, 20] },
        { name: '햇반', basePrice: 32000, discountRange: [20, 30] },
        { name: '호주산 소갈비찜', basePrice: 35000, discountRange: [25, 35] },
        { name: '한우 등심 1kg', basePrice: 89000, discountRange: [15, 25] },
        { name: '생수 2L 24병', basePrice: 18000, discountRange: [10, 20] },
        { name: '오뚜기 컵밥', basePrice: 3500, discountRange: [5, 15] },
        { name: '농심 너구리', basePrice: 4500, discountRange: [5, 15] },
    ],
    electronics: [
        { name: '삼성 오디세이 게이밍 모니터', basePrice: 450000, discountRange: [15, 30] },
        { name: '애플 아이폰 15 Pro', basePrice: 1700000, discountRange: [3, 10] },
        { name: 'LG 그램 노트북', basePrice: 1890000, discountRange: [15, 25] },
        { name: '다이슨 V12 디텍트 슬림', basePrice: 1090000, discountRange: [20, 30] },
        { name: '로봇청소기 로보락 S8', basePrice: 1690000, discountRange: [5, 15] },
        { name: '삼성 85인치 4K UHD TV', basePrice: 2500000, discountRange: [20, 30] },
        { name: '갤럭시 버즈3 프로', basePrice: 289000, discountRange: [10, 20] },
        { name: '아이패드 프로 12.9인치', basePrice: 1290000, discountRange: [5, 15] },
        { name: '에어팟 프로 2세대', basePrice: 399000, discountRange: [10, 20] },
        { name: '플레이스테이션 5', basePrice: 628000, discountRange: [5, 15] },
    ],
    fashion: [
        { name: '나이키 에어 줌 페가수스 러닝화', basePrice: 139000, discountRange: [30, 45] },
        { name: '아디다스 조거 팬츠', basePrice: 69000, discountRange: [35, 50] },
        { name: '노스페이스 눕시 패딩 점퍼', basePrice: 369000, discountRange: [10, 20] },
        { name: '나이키 에어맥스 90', basePrice: 159000, discountRange: [20, 35] },
        { name: '아디다스 슈퍼스타', basePrice: 99000, discountRange: [20, 35] },
        { name: '컨버스 척 테일러', basePrice: 89000, discountRange: [15, 30] },
        { name: '반스 올드스쿨', basePrice: 79000, discountRange: [15, 30] },
        { name: '뉴발란스 993', basePrice: 199000, discountRange: [10, 25] },
        { name: '아식스 젤 카야노', basePrice: 179000, discountRange: [15, 30] },
        { name: '프리덤 런', basePrice: 149000, discountRange: [20, 35] },
    ],
    daily: [
        { name: '크리넥스 3겹 데코앤소프트', basePrice: 45000, discountRange: [20, 35] },
        { name: '물티슈 100매', basePrice: 19900, discountRange: [30, 45] },
        { name: '유한킴벌리 덴탈마스크', basePrice: 9900, discountRange: [35, 50] },
        { name: '스타벅스 SS 텀블러', basePrice: 34000, discountRange: [5, 15] },
        { name: '코스트코 타월', basePrice: 12900, discountRange: [10, 25] },
        { name: '다이소 주방용품 세트', basePrice: 15000, discountRange: [20, 35] },
        { name: '아이리스오카이마스크', basePrice: 8900, discountRange: [30, 45] },
        { name: '코스트코 베이비 와이프', basePrice: 19900, discountRange: [20, 35] },
        { name: '다이소 청소용품 세트', basePrice: 12000, discountRange: [15, 30] },
        { name: '코스트코 수건 세트', basePrice: 24900, discountRange: [15, 30] },
    ],
    furniture: [
        { name: '시디즈 T50 컴퓨터 의자', basePrice: 420000, discountRange: [15, 25] },
        { name: '이케아 빌리 책장', basePrice: 89000, discountRange: [10, 20] },
        { name: '허먼밀러 에어론', basePrice: 1890000, discountRange: [5, 15] },
        { name: '이케아 침대 프레임', basePrice: 199000, discountRange: [10, 25] },
        { name: '코스트코 소파', basePrice: 599000, discountRange: [15, 30] },
        { name: '이케아 식탁', basePrice: 149000, discountRange: [10, 25] },
        { name: '코스트코 책상', basePrice: 299000, discountRange: [15, 30] },
        { name: '이케아 의자', basePrice: 49000, discountRange: [10, 25] },
        { name: '코스트코 수납장', basePrice: 399000, discountRange: [15, 30] },
        { name: '이케아 화장대', basePrice: 179000, discountRange: [10, 25] },
    ],
    ticket: [
        { name: '구글 기프트코드', basePrice: 10000, discountRange: [3, 10] },
        { name: 'CGV 영화관람권', basePrice: 15000, discountRange: [20, 35] },
        { name: '롯데월드 입장권', basePrice: 59000, discountRange: [10, 25] },
        { name: '에버랜드 입장권', basePrice: 62000, discountRange: [10, 25] },
        { name: '넷플릭스 1개월', basePrice: 13500, discountRange: [5, 15] },
        { name: '디즈니플러스 1개월', basePrice: 9900, discountRange: [5, 15] },
        { name: '아마존 기프트카드', basePrice: 50000, discountRange: [3, 10] },
        { name: '스타벅스 기프트카드', basePrice: 30000, discountRange: [5, 15] },
        { name: '롯데면세점 상품권', basePrice: 100000, discountRange: [5, 15] },
        { name: '신세계 상품권', basePrice: 100000, discountRange: [5, 15] },
    ],
};

// 카테고리별 이미지 URL 매핑
const categoryImages = {
    food: [
        'https://cdn.pixabay.com/photo/2017/02/26/12/27/oranges-2100108_1280.jpg',
        'https://img.danawa.com/prod_img/500000/231/592/img/13592231_1.jpg?_v=20220810165058',
        'https://img.dongwonmall.com/dwmall/static_root/model_img/main/477/47719_1_a.jpg?f=webp&q=80',
        'https://thingool123.godohosting.com/data/goods/19/06/23/1000001231/1000001231_detail_025.jpg',
        'https://thumbnail.coupangcdn.com/thumbnails/remote/492x492ex/image/retail/images/2025/07/18/15/3/edc1f401-4abd-4fa3-a1ed-cea440e33b7c.jpg',
        'https://sitem.ssgcdn.com/68/00/18/item/1000631180068_i1_332.jpg',
        'https://img-cf.kurly.com/hdims/resize/%3E720x/quality/90/src/shop/data/goodsview/20221201/gv40000459842_1.jpg',
        'https://img-cf.kurly.com/hdims/resize/%5E%3E720x%3E936/cropcenter/720x936/quality/85/src/shop/data/goods/1631179555598l0.jpg',
        'https://img.danawa.com/prod_img/500000/697/219/img/13219697_1.jpg?_v=20210125140528',
        'https://i.namu.wiki/i/-huPOb649RKFj8RfnSK0O0k7OoTvxJMuTQfH2qgMobJGK_XXlzWDkOFnfxPj_O-JclHdvDy_I3w34fwjskZ5ew.webp',
    ],
    electronics: [
        'https://img.danawa.com/prod_img/500000/754/109/img/12109754_1.jpg?_v=20250813162116',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQZtCKxjiAzvtdyjxJoa8P7r642U7NLwM-mg&s',
        'https://i.namu.wiki/i/l5-Pe1ahJzHGyv_SWB4DnkRST_Sv2NoCizEgCjwXVvoeHmvTw7pIUdYNcMwrKHqeNKXukcS5E6cNp0FtAMQyVQ.webp',
        'https://img.danawa.com/prod_img/500000/473/633/img/27633473_1.jpg?shrink=360:360&_v=20250619150433',
        'https://cdn.pixabay.com/photo/2023/10/05/18/48/vacuum-cleaner-8296766_1280.jpg',
        'https://cdn.pixabay.com/photo/2022/01/18/16/05/vacuum-cleaner-6947458_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/05/12/09/13/social-media-763731_1280.jpg',
        'https://cdn.pixabay.com/photo/2014/05/02/21/50/home-office-336378_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/01/21/14/14/apple-606761_1280.jpg',
        'https://cdn.pixabay.com/photo/2014/09/24/14/29/macbook-459196_1280.jpg',
    ],
    fashion: [
        'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/29/01/34/man-1866572_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/22/21/57/apparel-1850804_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/03/23/12/53/clothes-1275440_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/06/25/17/22/smart-watch-821559_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/12/06/09/31/blank-1886008_1280.jpg',
        'https://cdn.pixabay.com/photo/2017/07/28/14/29/macarons-2548827_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/11/07/11/41/fashion-1031469_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/11/07/11/50/fashion-1031470_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/19/15/32/laptop-1839876_1280.jpg',
    ],
    daily: [
        'https://cdn.pixabay.com/photo/2020/03/27/11/24/toilet-paper-4973212_1280.jpg',
        'https://cdn.pixabay.com/photo/2020/03/31/13/57/mask-4987572_1280.jpg',
        'https://cdn.pixabay.com/photo/2020/03/13/19/52/medical-mask-4929314_1280.jpg',
        'https://cdn.pixabay.com/photo/2017/06/17/14/06/coffee-2412211_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/23/14/22/iphone-1852901_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/11/07/11/36/soap-1031464_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/05/15/14/55/kitchen-768745_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/09/09/19/56/office-932926_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/29/09/16/architecture-1868667_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/11/07/11/40/cleaning-1031466_1280.jpg',
    ],
    furniture: [
        'https://cdn.pixabay.com/photo/2017/08/05/22/04/chairs-2585227_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/furniture-1836193_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/46/house-1836190_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/sofa-1836192_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836191_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836190_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836189_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836188_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836187_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/room-1836186_1280.jpg',
    ],
    ticket: [
        'https://cdn.pixabay.com/photo/2016/07/02/09/58/google-1492582_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/03/27/19/33/sunset-1283872_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/05/15/14/55/kitchen-768745_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/11/07/11/36/soap-1031464_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/23/14/22/iphone-1852901_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/09/09/19/56/office-932926_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/29/09/16/architecture-1868667_1280.jpg',
        'https://cdn.pixabay.com/photo/2015/11/07/11/40/cleaning-1031466_1280.jpg',
        'https://cdn.pixabay.com/photo/2017/08/05/22/04/chairs-2585227_1280.jpg',
        'https://cdn.pixabay.com/photo/2016/11/18/17/20/furniture-1836193_1280.jpg',
    ],
};

// 랜덤 숫자 생성 함수
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 상품 생성 함수
const generateProduct = (id, category, template, imageIndex) => {
    const discount = randomInt(template.discountRange[0], template.discountRange[1]);
    const originalPrice = template.basePrice;
    const price = Math.floor(originalPrice * (1 - discount / 100));
    
    // 카테고리별 이미지 배열에서 선택
    const categoryImageList = categoryImages[category] || categoryImages.food;
    const image = categoryImageList[imageIndex % categoryImageList.length];
    
    return {
        id,
        name: template.name + (randomInt(1, 100) > 50 ? ` ${randomInt(1, 10)}개입` : ''),
        price,
        originalPrice,
        discount,
        image,
        category,
    };
};

// 500개의 상품 생성
const generateProducts = () => {
    const products = [];
    let productId = 1;
    
    // 카테고리별로 상품 생성
    const categories = Object.keys(productTemplates);
    const productsPerCategory = Math.floor(500 / categories.length);
    const remainder = 500 % categories.length;
    
    categories.forEach((category, catIndex) => {
        const templates = productTemplates[category];
        const count = productsPerCategory + (catIndex < remainder ? 1 : 0);
        
        for (let i = 0; i < count; i++) {
            const templateIndex = i % templates.length;
            const template = templates[templateIndex];
            const imageIndex = i % (categoryImages[category]?.length || 10);
            
            const product = generateProduct(productId, category, template, imageIndex);
            
            // 처음 4개는 타임딜
            if (productId <= 4) {
                product.isTimeDeal = true;
                product.endTime = new Date(Date.now() + 86400000).toISOString();
                product.remainingStock = randomInt(5, 100);
            }
            
            // 5~12번은 베스트 (rank 1~8)
            if (productId >= 5 && productId <= 12) {
                product.isBest = true;
                product.rank = productId - 4;
            }
            
            products.push(product);
            productId++;
        }
    });
    
    return products;
};

export const PRODUCTS = generateProducts();

export const COUPONS = [
    { id: 1, name: '신규가입 감사 쿠폰', discountAmount: 3000, minOrderAmount: 10000, type: 'amount' },
    { id: 2, name: '패션 카테고리 15% 할인', discountRate: 15, maxDiscountAmount: 10000, type: 'percent', category: 'fashion' },
    { id: 3, name: '전상품 10% 더블 할인', discountRate: 10, maxDiscountAmount: 5000, type: 'percent' },
    { id: 4, name: '연말 감사제 5,000원 장바구니 쿠폰', discountAmount: 5000, minOrderAmount: 50000, type: 'amount' },
    { id: 5, name: '의류 대상 5,000원 할인 쿠폰', discountAmount: 5000, minOrderAmount: 30000, type: 'amount', category: 'fashion' }
];
