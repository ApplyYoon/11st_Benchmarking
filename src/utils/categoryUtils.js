/**
 * 카테고리명 변환 유틸리티
 * 데이터베이스의 영어 카테고리명을 한글명으로 변환
 */
export const categoryMap = {
    'food': '식품',
    'electronics': '전자제품',
    'fashion': '패션',
    'daily': '생활용품',
    'furniture': '가구',
    'ticket': '상품권'
};

/**
 * 영어 카테고리명을 한글명으로 변환
 * @param {string} category - 영어 카테고리명
 * @returns {string} 한글 카테고리명 (없으면 원본 반환)
 */
export const getCategoryName = (category) => {
    if (!category) return '';
    return categoryMap[category] || category;
};

/**
 * 한글 카테고리명을 영어 카테고리명으로 변환 (필요시)
 * @param {string} koreanCategory - 한글 카테고리명
 * @returns {string} 영어 카테고리명
 */
export const getCategoryKey = (koreanCategory) => {
    const entries = Object.entries(categoryMap);
    const found = entries.find(([_, korean]) => korean === koreanCategory);
    return found ? found[0] : koreanCategory;
};

