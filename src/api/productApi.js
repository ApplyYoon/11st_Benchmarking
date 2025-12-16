import client from './client';

/**
 * 상품 API 호출 함수
 */
export const productApi = {
    // 상품 조회 (limit를 주면 해당 개수만, 없으면 전체)
    getProducts: async (limit) => {
        const config = {};
        if (limit != null) {
            config.params = { limit };
        }
        const response = await client.get('/products', config);
        return response.data;
    },

    // MD 추천 상품 (페이징 지원)
    getRecommendedProducts: async (page, size) => {
        const response = await client.get('/products', {
            params: { page, size }
        });
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

    // 타임딜 상품 페이지네이션 조회
    getTimeDealProductsPaginated: async (offset = 0, limit = 32) => {
        const response = await client.get('/products', {
            params: { type: 'timedeal', offset, limit }
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

    // 전체 상품 페이지네이션 조회 (type 추가)
    getProductsPaginated: async (offset = 0, limit = 32, type = null) => {
        const params = { offset, limit };
        if (type) {
            params.type = type;
        }
        const response = await client.get('/products', { params });
        return response.data;
    },

    // 카테고리별 상품 조회
    getProductsByCategory: async (category) => {
        const response = await client.get('/products', {
            params: { category }
        });
        return response.data;
    },

    // 카테고리 목록 조회
    getCategories: async () => {
        const response = await client.get('/products/categories');
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

    // 검색 페이지네이션
    searchProductsPaginated: async (query, category = 'all', priceRange = 'all', offset = 0, limit = 32) => {
        const params = { search: query, offset, limit };
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
    getAvailableCoupons: async (amount, categories) => {
        const params = { amount };
        if (categories) {
            // 배열인 경우 콤마로 구분된 문자열로 변환
            if (Array.isArray(categories)) {
                // 빈 배열이 아닌 경우에만 추가
                if (categories.length > 0) {
                    params.categories = categories.join(',');
                }
            } else if (typeof categories === 'string' && categories.trim() !== '') {
                // 문자열인 경우 그대로 전달
                params.categories = categories;
            }
        }
        const response = await client.get('/coupons/available', { params });
        return response.data;
    }
};

