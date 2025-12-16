import React, { useState, useEffect, useRef, useCallback } from 'react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/shared/ProductCard';
import { getCategoryName } from '../utils/categoryUtils';

const ITEMS_PER_PAGE = 32;
const MAX_ITEMS = 15000;

// Lazy loading wrapper 컴포넌트
const LazyProductCard = ({ product }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '100px', threshold: 0 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className="lazy-card-wrapper">
            {isVisible ? (
                <ProductCard product={product} />
            ) : (
                <div className="skeleton" />
            )}
        </div>
    );
};

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
            const newProducts = await productApi.getProductsPaginated(offset, ITEMS_PER_PAGE);
            
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
    }, [offset, loadingMore, hasMore, products.length]);

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

    // 초기 데이터 로딩
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productApi.getProductsPaginated(0, ITEMS_PER_PAGE);
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
    }, []);

    // 탭에 따라 카테고리 목록 업데이트
    useEffect(() => {
        if (products.length === 0) return;

        let baseProductsForCategories = [];
        if (mainTab === '베스트 25') {
            baseProductsForCategories = products.filter(p => p.isBest || p.best);
        } else if (mainTab === '쇼킹딜 베스트') {
            baseProductsForCategories = products.filter(p => {
                const discountRate = p.discountRate || p.discount || 0;
                return discountRate >= 20 || p.isTimeDeal || p.timeDeal;
            });
        }

        if (baseProductsForCategories.length > 0) {
            const uniqueCategories = ['전체', ...new Set(baseProductsForCategories.map(p => p.category).filter(Boolean))];
            setCategories(uniqueCategories);
        } else {
            setCategories(['전체']);
        }
    }, [mainTab, products]);

    // 선택된 카테고리가 현재 카테고리 목록에 없으면 '전체'로 리셋
    useEffect(() => {
        if (selectedCategory !== '전체' && !categories.includes(selectedCategory)) {
            setSelectedCategory('전체');
        }
    }, [categories, selectedCategory]);

    // 탭에 따라 상품 필터링
    let baseProducts = [];
    if (mainTab === '베스트 25') {
        baseProducts = products.filter(p => p.isBest || p.best);
    } else if (mainTab === '쇼킹딜 베스트') {
        baseProducts = products.filter(p => {
            const discountRate = p.discountRate || p.discount || 0;
            return discountRate >= 20 || p.isTimeDeal || p.timeDeal;
        }).sort((a, b) => {
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
        <div className="page-wrapper">
            <div className="container">
                {/* 메인 탭 */}
                <div className="tabs-container">
                    <button
                        onClick={() => {
                            setMainTab('베스트 25');
                            setSelectedCategory('전체');
                        }}
                        className={`tab-btn ${mainTab === '베스트 25' ? 'active' : ''}`}
                    >
                        베스트 <span className="text-primary">25</span>
                    </button>
                    <button
                        onClick={() => {
                            setMainTab('쇼킹딜 베스트');
                            setSelectedCategory('전체');
                        }}
                        className={`tab-btn ${mainTab === '쇼킹딜 베스트' ? 'active' : ''}`}
                    >
                        쇼킹딜 베스트
                    </button>
                </div>

                {/* 카테고리 탭 */}
                <div className="category-tabs">
                    <div className="category-tabs-inner">
                        {categories.map((category) => {
                            const displayName = category === '전체' ? '전체' : getCategoryName(category);
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 안내 */}
                <div className="info-bar">
                    <span className="info-text">
                        {mainTab === '베스트 25' ? '베스트 25' : '쇼킹딜 베스트'}
                    </span>
                </div>

                {/* 정렬 옵션 */}
                <div className="sort-container">
                    <div className="sort-count">
                        총 <span className="sort-count-number">{filteredProducts.length}</span>개
                    </div>
                    <div className="sort-buttons">
                        {sortOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setSortBy(option)}
                                className={`sort-btn ${sortBy === option ? 'active' : ''}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 상품 그리드 */}
                <div className="content-padding">
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner" />
                        </div>
                    ) : (
                        <>
                            <div className="product-grid-wrapper">
                                <div className="product-grid">
                                    {filteredProducts.map((product, index) => (
                                        <LazyProductCard key={`${product.id}-${index}`} product={product} />
                                    ))}
                                </div>
                            </div>

                            {/* 무한 스크롤 로더 */}
                            <div ref={loaderRef} style={{ height: '50px', margin: '20px 0' }}>
                                {loadingMore && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                        <div className="spinner" />
                                    </div>
                                )}
                                {!hasMore && products.length > 0 && (
                                    <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                        모든 상품을 불러왔습니다 ({products.length}개)
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* 빈 상태 */}
                {!loading && filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📦</div>
                        <div className="empty-state-title">상품이 없습니다</div>
                        <div className="empty-state-text">다른 카테고리를 선택해보세요</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Best;
