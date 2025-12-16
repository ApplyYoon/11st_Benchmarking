import React, { useState, useEffect, useRef, useCallback } from 'react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/shared/ProductCard';
import { getCategoryName, getCategoryKey, categoryMap } from '../utils/categoryUtils';
import '../styles/Best.css';

const ITEMS_PER_PAGE = 32;
const MAX_ITEMS = 15000;

const Best = () => {
    const [mainTab, setMainTab] = useState('베스트 25');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [sortBy, setSortBy] = useState('인기순');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [categories, setCategories] = useState(['전체']);
    const loaderRef = useRef(null);

    const sortOptions = ['인기순', '낮은가격순', '높은가격순'];

    // 추가 데이터 로딩
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || products.length >= MAX_ITEMS) return;

        setLoadingMore(true);
        try {
            const type = mainTab === '베스트 25' ? 'best' : 'timedeal';
            const newProducts = await productApi.getProductsPaginated(offset, ITEMS_PER_PAGE, type);

            if (newProducts.length === 0 || newProducts.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }

            if (newProducts.length > 0) {
                setProducts(prev => [...prev, ...newProducts]);
                setOffset(prev => prev + ITEMS_PER_PAGE);
            }
        } catch (error) {
            console.error('추가 상품 로딩 실패:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [offset, loadingMore, hasMore, products.length, mainTab]);

    // IntersectionObserver로 하단 감지
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loadMore, loadingMore, hasMore, loading]);

    // 탭 변경 시 데이터 초기화 및 로딩
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setProducts([]);
                setOffset(0);

                const type = mainTab === '베스트 25' ? 'best' : 'timedeal';
                const data = await productApi.getProductsPaginated(0, ITEMS_PER_PAGE, type);

                setProducts(data);
                setOffset(ITEMS_PER_PAGE);
                setHasMore(data.length === ITEMS_PER_PAGE);
            } catch (error) {
                console.error('상품 로딩 실패:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [mainTab]);

    // 탭에 따라 카테고리 목록 업데이트
    useEffect(() => {
        if (products.length === 0) return;

        // Backend now returns filtered products, so use all of them to determine categories
        const uniqueCategories = ['전체', ...new Set(products.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
    }, [products]);

    // 선택된 카테고리가 현재 카테고리 목록에 없으면 '전체'로 리셋
    useEffect(() => {
        if (selectedCategory !== '전체' && !categories.includes(selectedCategory)) {
            setSelectedCategory('전체');
        }
    }, [categories, selectedCategory]);

    // 탭에 따라 상품 필터링 (backend has already filtered by type)
    let baseProducts = products;
    if (mainTab === '쇼킹딜 베스트') {
        // 쇼킹딜의 경우 추가적인 정렬만 적용 (이미 timedeal로 필터링됨)
        // 할인율이 높은 순으로 정렬 (Optional clientside sort)
        baseProducts = [...products].sort((a, b) => {
            const discountA = a.discountRate || a.discount || 0;
            const discountB = b.discountRate || b.discount || 0;
            return discountB - discountA;
        });
    }

    // 카테고리 필터링
    let filteredProducts = selectedCategory === '전체'
        ? baseProducts
        : baseProducts.filter(p => p.category === selectedCategory);

    // 정렬
    if (sortBy === '인기순') {
        // 베스트 상품을 먼저, 그 다음 ID 순서
        filteredProducts = [...filteredProducts].sort((a, b) => {
            if (a.isBest && !b.isBest) return -1;
            if (!a.isBest && b.isBest) return 1;
            if (a.isBest && b.isBest) return (a.rank || 0) - (b.rank || 0);
            return a.id - b.id;
        });
    } else if (sortBy === '낮은가격순') {
        filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
    } else if (sortBy === '높은가격순') {
        filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
    }

    return (
        <div className="best-page-container">
            <div className="best-page-wrapper">
                {/* 메인 탭 (베스트 500 / 쇼핑몰 베스트) */}
                <div className="best-main-tabs">
                    <button
                        onClick={() => {
                            setMainTab('베스트 25');
                            setSelectedCategory('전체');
                        }}
                        className={`best-main-tab-btn ${mainTab === '베스트 25' ? 'best-main-tab-btn-active' : ''}`}
                    >
                        베스트 <span className="best-main-tab-number">25</span>
                    </button>
                    <button
                        onClick={() => {
                            setMainTab('쇼킹딜 베스트');
                            setSelectedCategory('전체');
                        }}
                        className={`best-main-tab-btn ${mainTab === '쇼킹딜 베스트' ? 'best-main-tab-btn-active' : ''}`}
                    >
                        쇼킹딜 베스트
                    </button>
                </div>

                {/* 카테고리 탭 */}
                <div className="best-category-tabs">
                    <div className="best-category-tabs-inner">
                        {categories.map((category) => {
                            // 카테고리를 한글로 표시 (전체는 그대로, 영어 카테고리는 한글로 변환)
                            const displayName = category === '전체' ? '전체' : getCategoryName(category);
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`best-category-tab-btn ${selectedCategory === category ? 'best-category-tab-btn-active' : ''}`}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 안내 */}
                <div className="best-info-section">
                    <span className="best-info-text">
                        {mainTab === '베스트 25' ? '베스트 25 ?' : '쇼킹딜 베스트 ?'}
                    </span>
                </div>

                {/* 정렬 옵션 */}
                <div className="best-sort-section">
                    <div className="best-product-count">
                        총 <span className="best-product-count-number">{filteredProducts.length}</span>개
                    </div>
                    <div className="best-sort-buttons">
                        {sortOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setSortBy(option)}
                                className={`best-sort-btn ${sortBy === option ? 'best-sort-btn-active' : ''}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 상품 그리드 */}
                <div className="best-products-wrapper">
                    {loading ? (
                        <div className="best-loading-container">
                            <div className="best-spinner" />
                        </div>
                    ) : (
                        <>
                            <div className="best-products-grid">
                                {filteredProducts.map((product, index) => (
                                    <ProductCard key={`${product.id}-${index}`} product={product} />
                                ))}
                            </div>

                            {/* 무한 스크롤 로더 */}
                            <div ref={loaderRef} className="best-infinite-loader">
                                {loadingMore && (
                                    <div className="best-loading-more-container">
                                        <div className="best-spinner" />
                                    </div>
                                )}
                                {!hasMore && products.length > 0 && (
                                    <div className="best-all-loaded-message">
                                        모든 상품을 불러왔습니다 ({products.length}개)
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* 빈 상태 */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="best-empty-state">
                        <div className="best-empty-icon">📦</div>
                        <div className="best-empty-title">
                            상품이 없습니다
                        </div>
                        <div className="best-empty-message">
                            다른 카테고리를 선택해보세요
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Best;
