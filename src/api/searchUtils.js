
// Known valid keywords derived from our product database for "Auto Correct" targets
export const VALID_KEYWORDS = [
    // Electronics
    '모니터', '게이밍 모니터', '삼성 모니터', 'LG 모니터', '4K 모니터',
    '노트북', '게이밍 노트북', '삼성전자 노트북', 'LG 그램', '맥북',
    '이어폰', '무선 이어폰', '블루투스 이어폰', '노이즈캔슬링 이어폰', '에어팟', '갤럭시 버즈',
    '냉장고', '양문형 냉장고', '김치냉장고',
    '세탁기', '드럼세탁기', '건조기', '의류건조기',
    '청소기', '무선 청소기', '로봇청소기',

    // Fashion
    '신발', '운동화', '나이키 운동화', '아디다스 운동화', '슬리퍼', '러닝화',
    '티셔츠', '반팔 티셔츠', '맨투맨', '후드티',

    // Food
    '생수', '삼다수', '백산수',
    '라면', '신라면', '진라면', '컵라면',
    '커피', '맥심', '카누', '캡슐커피',
    '휴지', '롤화장지', '물티슈'
];

// Simple Levenshtein distance algorithm for Hangul/Text
const getLevenshteinDistance = (a, b) => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

export const findClosestMatch = (query) => {
    if (!query || query.length < 2) return null; // Too short to correct

    let bestMatch = null;
    let minDistance = Infinity;

    // Iterate through valid keywords
    for (const keyword of VALID_KEYWORDS) {
        // If exact match (substring), no need to correct
        if (keyword.includes(query) || query.includes(keyword)) return null;

        const distance = getLevenshteinDistance(query, keyword);

        // Threshold: Allow 1 typo for short words, 2 for longer
        const threshold = keyword.length > 4 ? 2 : 1;

        if (distance <= threshold && distance < minDistance) {
            minDistance = distance;
            bestMatch = keyword;
        }
    }

    return bestMatch;
};

export const getRelatedKeywords = (query) => {
    if (!query) return [];

    // 1. Find keywords that contain the query (e.g. '노트북' -> '게이밍 노트북')
    // and exclude exact match
    const related = VALID_KEYWORDS.filter(k =>
        k.includes(query) && k !== query
    );

    // Sort by length (shorter usually arguably more relevant or at least better looking)
    // Randomize slightly for variety or just take top 8
    return related.slice(0, 8);
};
