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
    getAvailableCoupons: async (amount, categories) => {
        const params = { amount };
        if (categories) {
            params.categories = categories; // Array passed to params
        }
        // Note: Axios by default serializes arrays as categories[]=v1&categories[]=v2
        // Spring MVC requires brackets or configuration. 
        // To be safe with default Spring Boot @RequestParam List, we often need to pass same key.
        // client.get handles params. 
        const response = await client.get('/coupons/available', {
            params,
            paramsSerializer: params => {
                // Custom serializer to match Spring's default expectation for simple lists if needed, 
                // but standard formatted usually works. 
                // Let's use simple comma separation if string, or keep array. 
                // Actually safer to join with comma for simple list in Spring Boot default
                if (Array.isArray(categories)) {
                    return `amount=${amount}&categories=${categories.join(',')}`;
                }
                return `amount=${amount}`;
            }
        });
        return response.data;
    }
};

