export const PRODUCTS = [
    // Time Deal Items
    { id: 101, name: '[타임딜] 제주 서귀포 조생 감귤 5kg (소과/로얄과)', price: 12900, originalPrice: 25000, discount: 48, image: 'https://cdn.pixabay.com/photo/2017/02/26/12/27/oranges-2100108_1280.jpg', category: 'food', isTimeDeal: true, endTime: new Date(Date.now() + 86400000).toISOString(), remainingStock: 15 },
    { id: 102, name: '[타임딜] 삼성 오디세이 게이밍 모니터 32인치 165Hz', price: 349000, originalPrice: 450000, discount: 22, image: 'https://cdn.pixabay.com/photo/2021/08/28/02/43/gaming-pc-6579893_1280.jpg', category: 'electronics', isTimeDeal: true, endTime: new Date(Date.now() + 86400000).toISOString(), remainingStock: 3 },
    { id: 103, name: '[타임딜] 나이키 에어 줌 페가수스 40 러닝화', price: 89000, originalPrice: 139000, discount: 36, image: 'https://cdn.pixabay.com/photo/2016/11/19/18/06/feet-1840619_1280.jpg', category: 'fashion', isTimeDeal: true, endTime: new Date(Date.now() + 86400000).toISOString(), remainingStock: 82 },
    { id: 104, name: '[타임딜] 다이슨 V12 디텍트 슬림 컴플리트', price: 799000, originalPrice: 1090000, discount: 26, image: 'https://cdn.pixabay.com/photo/2023/10/05/18/48/vacuum-cleaner-8296766_1280.jpg', category: 'electronics', isTimeDeal: true, endTime: new Date(Date.now() + 86400000).toISOString(), remainingStock: 7 },

    // Best Items (Ranked)
    { id: 201, name: '맥심 모카골드 마일드 믹스 180T + 20T 증정', price: 23500, originalPrice: 28000, discount: 16, image: 'https://cdn.pixabay.com/photo/2014/12/11/02/56/coffee-563797_1280.jpg', category: 'food', isBest: true, rank: 1 },
    { id: 202, name: '크리넥스 3겹 데코앤소프트 30롤 x 2팩', price: 32900, originalPrice: 45000, discount: 27, image: 'https://cdn.pixabay.com/photo/2020/03/27/11/24/toilet-paper-4973212_1280.jpg', category: 'daily', isBest: true, rank: 2 },
    { id: 203, name: '농심 신라면 120g x 20개입 (1박스)', price: 14500, originalPrice: 17000, discount: 14, image: 'https://cdn.pixabay.com/photo/2016/09/16/00/22/ramen-1673004_1280.jpg', category: 'food', isBest: true, rank: 3 },
    { id: 204, name: '애플 아이폰 15 Pro 256GB 자급제', price: 1650000, originalPrice: 1700000, discount: 3, image: 'https://cdn.pixabay.com/photo/2014/08/05/10/30/iphone-410324_1280.jpg', category: 'electronics', isBest: true, rank: 4 },
    { id: 205, name: '구글 기프트코드 1만원권', price: 9500, originalPrice: 10000, discount: 5, image: 'https://cdn.pixabay.com/photo/2016/07/02/09/58/google-1492582_1280.jpg', category: 'ticket', isBest: true, rank: 5 },
    { id: 206, name: '삼다수 2L x 12병', price: 11900, originalPrice: 14000, discount: 15, image: 'https://cdn.pixabay.com/photo/2017/02/02/15/15/bottle-2032980_1280.jpg', category: 'food', isBest: true, rank: 6 },
    { id: 207, name: '물티슈 100매 x 20팩 캡형', price: 12900, originalPrice: 19900, discount: 35, image: 'https://cdn.pixabay.com/photo/2020/03/31/13/57/mask-4987572_1280.jpg', category: 'daily', isBest: true, rank: 7 },
    { id: 208, name: 'CGV 영화관람권 1매 (주중/주말)', price: 11000, originalPrice: 15000, discount: 26, image: 'https://cdn.pixabay.com/photo/2016/03/27/19/33/sunset-1283872_1280.jpg', category: 'ticket', isBest: true, rank: 8 },

    // MD Recommendations / Search Items
    { id: 301, name: '유한킴벌리 덴탈마스크 50매', price: 5900, originalPrice: 9900, discount: 40, image: 'https://cdn.pixabay.com/photo/2020/03/13/19/52/medical-mask-4929314_1280.jpg', category: 'daily' },
    { id: 302, name: '햇반 210g x 24개', price: 23900, originalPrice: 32000, discount: 25, image: 'https://cdn.pixabay.com/photo/2016/01/22/02/13/rice-1155099_1280.jpg', category: 'food' },
    { id: 303, name: 'LG 그램 16인치 2024년형', price: 1550000, originalPrice: 1890000, discount: 18, image: 'https://cdn.pixabay.com/photo/2015/01/08/18/25/desk-593327_1280.jpg', category: 'electronics' },
    { id: 304, name: '아디다스 조거 팬츠', price: 39000, originalPrice: 69000, discount: 43, image: 'https://cdn.pixabay.com/photo/2016/11/29/01/34/man-1866572_1280.jpg', category: 'fashion' },
    { id: 305, name: '스타벅스 SS 텀블러 블랙 473ml', price: 31000, originalPrice: 34000, discount: 9, image: 'https://cdn.pixabay.com/photo/2017/06/17/14/06/coffee-2412211_1280.jpg', category: 'daily' },
    { id: 306, name: '로봇청소기 로보락 S8 Pro Ultra', price: 1590000, originalPrice: 1690000, discount: 6, image: 'https://cdn.pixabay.com/photo/2022/01/18/16/05/vacuum-cleaner-6947458_1280.jpg', category: 'electronics' },
    { id: 307, name: '시디즈 T50 컴퓨터 의자', price: 329000, originalPrice: 420000, discount: 21, image: 'https://cdn.pixabay.com/photo/2017/08/05/22/04/chairs-2585227_1280.jpg', category: 'furniture' },
    { id: 308, name: '호주산 소갈비찜 1kg', price: 24900, originalPrice: 35000, discount: 28, image: 'https://cdn.pixabay.com/photo/2016/03/05/19/02/hamburger-1238246_1280.jpg', category: 'food' },
    { id: 309, name: '삼성 85인치 4K UHD TV', price: 1890000, originalPrice: 2500000, discount: 24, image: 'https://cdn.pixabay.com/photo/2016/11/30/12/16/computer-1873322_1280.jpg', category: 'electronics' },
    { id: 310, name: '노스페이스 눕시 패딩 점퍼', price: 329000, originalPrice: 369000, discount: 10, image: 'https://cdn.pixabay.com/photo/2016/11/22/21/57/apparel-1850804_1280.jpg', category: 'fashion' },
];

export const COUPONS = [
    { id: 1, name: '신규가입 감사 쿠폰', discountAmount: 3000, minOrderAmount: 10000, type: 'amount' },
    { id: 2, name: '패션 카테고리 15% 할인', discountRate: 15, maxDiscountAmount: 10000, type: 'percent', category: 'fashion' },
    { id: 3, name: '전상품 10% 더블 할인', discountRate: 10, maxDiscountAmount: 5000, type: 'percent' },
    { id: 4, name: '연말 감사제 5,000원 장바구니 쿠폰', discountAmount: 5000, minOrderAmount: 50000, type: 'amount' },
    { id: 5, name: '의류 대상 5,000원 할인 쿠폰', discountAmount: 5000, minOrderAmount: 30000, type: 'amount', category: 'fashion' }
];
