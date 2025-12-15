import client from './client';

/**
 * 상품 API 호출 함수
 */
export const productApi = {
    // 모든 상품 조회
    getAllProducts: async () => {
        const response = await client.get('/products');
        return response.data;
    },

    // 상품 상세 조회
    getProduct: async (id) => {
        const response = await client.get(`/products/${id}`);
        return response.data;
    },

    // 타임딜 상품 조회
    getTimeDealProducts: async () => {
        const response = await client.get('/products', {
            params: { type: 'timedeal' }
        });
        return response.data;
    },

    // 베스트 상품 조회
    getBestProducts: async () => {
        const response = await client.get('/products', {
            params: { type: 'best' }
        });
        return response.data;
    },

    // 카테고리별 상품 조회
    getProductsByCategory: async (category) => {
        const response = await client.get('/products', {
            params: { category }
        });
        return response.data;
    },

    // 검색
    searchProducts: async (query, category = 'all', priceRange = 'all') => {
        const params = { search: query };
        if (category !== 'all') {
            params.category = category;
        }
        if (priceRange !== 'all') {
            params.priceRange = priceRange;
        }
        const response = await client.get('/products', { params });
        return response.data;
    },

    // 검색어 오타수정
    correctSearchQuery: async (query) => {
        const response = await client.get('/products/search/correct', {
            params: { query }
        });
        return response.data;
    },

    // 연관 검색어 조회
    getRelatedKeywords: async (query) => {
        const response = await client.get('/products/search/related', {
            params: { query }
        });
        return response.data;
    },

    // 타임딜 종료 시간 조회
    getTimeDealEndTime: async () => {
        const response = await client.get('/products/timedeal/endtime');
        return response.data;
    }
};

/**
 * 쿠폰 API 호출 함수
 */
export const couponApi = {
    // 사용자 보유 쿠폰 조회
    getMyCoupons: async () => {
        const response = await client.get('/coupons/my');
        return response.data;
    },

    // 주문에 사용 가능한 쿠폰 조회
    getAvailableCoupons: async (amount, category) => {
        const params = { amount };
        if (category) {
            params.category = category;
        }
        const response = await client.get('/coupons/available', { params });
        return response.data;
    }
};

