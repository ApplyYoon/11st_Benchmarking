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

// 리뷰 데이터 (productId로 상품별 리뷰 연결)
export const REVIEWS = [
    // 타임딜 상품 리뷰
    { id: 1, productId: 101, user: '김**', rating: 5, date: '2024.12.10', content: '감귤이 정말 달고 맛있어요! 신선하게 잘 왔습니다.', helpful: 23 },
    { id: 2, productId: 101, user: '이**', rating: 5, date: '2024.12.08', content: '아이들이 너무 좋아해요. 재구매 의사 있습니다!', helpful: 15 },
    { id: 3, productId: 101, user: '박**', rating: 4, date: '2024.12.05', content: '대체로 만족하지만 크기가 조금 작았어요.', helpful: 8 },
    { id: 4, productId: 102, user: '최**', rating: 5, date: '2024.12.11', content: '게이밍 모니터 최고입니다! 화질도 좋고 반응속도 빨라요.', helpful: 45 },
    { id: 5, productId: 102, user: '정**', rating: 5, date: '2024.12.09', content: '165Hz 정말 부드럽습니다. 강추!', helpful: 32 },
    { id: 6, productId: 103, user: '강**', rating: 5, date: '2024.12.10', content: '러닝할 때 편하고 쿠션감 좋아요!', helpful: 28 },
    { id: 7, productId: 103, user: '윤**', rating: 4, date: '2024.12.07', content: '디자인 예쁘고 편해요. 다만 사이즈가 작게 나와요.', helpful: 19 },
    { id: 8, productId: 103, user: '한**', rating: 5, date: '2024.12.03', content: '가격 대비 훌륭합니다!', helpful: 14 },
    { id: 9, productId: 104, user: '조**', rating: 5, date: '2024.12.12', content: '다이슨 역시 다이슨! 흡입력 대박이에요.', helpful: 67 },
    { id: 10, productId: 104, user: '서**', rating: 5, date: '2024.12.10', content: '가벼워서 청소하기 편해요.', helpful: 41 },

    // 베스트 상품 리뷰
    { id: 11, productId: 201, user: '김**', rating: 5, date: '2024.12.11', content: '커피 맛있어요! 항상 이거 마셔요.', helpful: 12 },
    { id: 12, productId: 201, user: '이**', rating: 4, date: '2024.12.08', content: '양이 많아서 오래 마실 수 있어요.', helpful: 8 },
    { id: 13, productId: 202, user: '박**', rating: 5, date: '2024.12.10', content: '푹신하고 좋아요. 가성비 최고!', helpful: 34 },
    { id: 14, productId: 203, user: '최**', rating: 5, date: '2024.12.09', content: '역시 신라면이 최고죠!', helpful: 22 },
    { id: 15, productId: 204, user: '정**', rating: 5, date: '2024.12.11', content: '아이폰 15 Pro 카메라 성능 미쳤어요!', helpful: 89 },
    { id: 16, productId: 204, user: '강**', rating: 5, date: '2024.12.08', content: '배터리도 오래가고 만족합니다.', helpful: 56 },
    { id: 17, productId: 204, user: '윤**', rating: 4, date: '2024.12.05', content: '좋긴 한데 가격이 좀 비싸네요.', helpful: 33 },

    // MD 추천 상품 리뷰
    { id: 18, productId: 301, user: '한**', rating: 5, date: '2024.12.10', content: '마스크 품질 좋아요!', helpful: 11 },
    { id: 19, productId: 302, user: '조**', rating: 5, date: '2024.12.09', content: '햇반 없으면 못 살아요 ㅋㅋ', helpful: 25 },
    { id: 20, productId: 303, user: '서**', rating: 5, date: '2024.12.11', content: 'LG 그램 가볍고 성능 좋아요!', helpful: 78 },
    { id: 21, productId: 303, user: '임**', rating: 5, date: '2024.12.07', content: '배터리 오래가서 좋습니다.', helpful: 45 },
    { id: 22, productId: 304, user: '권**', rating: 4, date: '2024.12.10', content: '편하고 예뻐요. 사이즈 참고하세요.', helpful: 17 },
    { id: 23, productId: 305, user: '송**', rating: 5, date: '2024.12.08', content: '텀블러 디자인 깔끔하고 보온 잘 돼요!', helpful: 29 },
    { id: 24, productId: 306, user: '신**', rating: 5, date: '2024.12.12', content: '로봇청소기 혁명이에요! 알아서 다 청소해줌.', helpful: 92 },
    { id: 25, productId: 307, user: '황**', rating: 5, date: '2024.12.10', content: '허리 안 아프고 편해요. 재택근무 필수템!', helpful: 63 },
    { id: 26, productId: 308, user: '안**', rating: 5, date: '2024.12.09', content: '고기 질 좋고 맛있어요!', helpful: 31 },
    { id: 27, productId: 309, user: '유**', rating: 5, date: '2024.12.11', content: '85인치 화면 크기가 압도적이에요!', helpful: 54 },
    { id: 28, productId: 310, user: '장**', rating: 5, date: '2024.12.10', content: '따뜻하고 가벼워요. 겨울 필수템!', helpful: 38 },
    { id: 29, productId: 310, user: '오**', rating: 4, date: '2024.12.06', content: '디자인 예쁘고 보온성 좋아요.', helpful: 21 },
];

// Q&A 데이터 (productId로 상품별 Q&A 연결)
export const QNA = [
    // 타임딜 상품 Q&A
    { id: 1, productId: 101, user: '김**', date: '2024.12.11', question: '감귤 크기가 어느 정도인가요?', answer: '소과 기준 약 4-5cm 정도입니다. 감사합니다.', isAnswered: true },
    { id: 2, productId: 101, user: '이**', date: '2024.12.10', question: '유통기한이 어떻게 되나요?', answer: '수확 후 약 2주 정도 신선하게 드실 수 있습니다.', isAnswered: true },
    { id: 3, productId: 102, user: '박**', date: '2024.12.11', question: 'HDMI 케이블 포함인가요?', answer: '네, HDMI 케이블 1개가 기본 포함되어 있습니다.', isAnswered: true },
    { id: 4, productId: 102, user: '최**', date: '2024.12.09', question: 'PS5 연결 가능한가요?', answer: null, isAnswered: false },
    { id: 5, productId: 103, user: '정**', date: '2024.12.10', question: '발볼이 넓은 편인가요?', answer: '일반적인 발볼 사이즈입니다. 넓으시면 반 사이즈 업 추천드립니다.', isAnswered: true },
    { id: 6, productId: 103, user: '강**', date: '2024.12.08', question: '색상 추가 예정 있나요?', answer: null, isAnswered: false },
    { id: 7, productId: 104, user: '윤**', date: '2024.12.12', question: '충전 시간이 어떻게 되나요?', answer: '완충까지 약 4시간 소요됩니다.', isAnswered: true },

    // 베스트 상품 Q&A
    { id: 8, productId: 201, user: '한**', date: '2024.12.10', question: '유통기한이 얼마나 남았나요?', answer: '최소 6개월 이상 남은 제품으로 발송됩니다.', isAnswered: true },
    { id: 9, productId: 202, user: '조**', date: '2024.12.09', question: '캡형인가요 리필형인가요?', answer: '캡형 제품입니다.', isAnswered: true },
    { id: 10, productId: 204, user: '서**', date: '2024.12.11', question: '개통은 어떻게 하나요?', answer: '자급제 상품으로 가까운 대리점에서 유심 개통 가능합니다.', isAnswered: true },
    { id: 11, productId: 204, user: '임**', date: '2024.12.10', question: 'eSIM 지원되나요?', answer: '네, eSIM 지원됩니다.', isAnswered: true },
    { id: 12, productId: 204, user: '권**', date: '2024.12.08', question: '색상 변경 가능한가요?', answer: null, isAnswered: false },

    // MD 추천 상품 Q&A
    { id: 13, productId: 303, user: '송**', date: '2024.12.11', question: 'RAM 업그레이드 가능한가요?', answer: '해당 모델은 온보드 메모리로 업그레이드가 불가합니다.', isAnswered: true },
    { id: 14, productId: 303, user: '신**', date: '2024.12.09', question: 'Windows 11 Pro인가요?', answer: 'Windows 11 Home이 기본 탑재되어 있습니다.', isAnswered: true },
    { id: 15, productId: 304, user: '황**', date: '2024.12.10', question: '키 175cm면 어떤 사이즈가 맞나요?', answer: 'M 또는 L 사이즈 추천드립니다.', isAnswered: true },
    { id: 16, productId: 306, user: '안**', date: '2024.12.12', question: '걸레질 기능도 있나요?', answer: '네, 물걸레 청소 기능이 포함되어 있습니다.', isAnswered: true },
    { id: 17, productId: 307, user: '유**', date: '2024.12.10', question: '의자 높이 조절 범위가 어떻게 되나요?', answer: '좌판 높이 기준 42cm~52cm 조절 가능합니다.', isAnswered: true },
    { id: 18, productId: 310, user: '장**', date: '2024.12.11', question: '세탁기 사용 가능한가요?', answer: '드라이클리닝을 권장드립니다.', isAnswered: true },
    { id: 19, productId: 310, user: '오**', date: '2024.12.09', question: '재입고 예정 있나요?', answer: null, isAnswered: false },
];
