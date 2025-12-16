import React, { useState, useEffect, useRef, useCallback } from 'react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/shared/ProductCard';
import { getCategoryName, getCategoryKey, categoryMap } from '../utils/categoryUtils';

const PAGE_SIZE = 8;

const Best = () => {
    const [mainTab, setMainTab] = useState('베스트 25');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [sortBy, setSortBy] = useState('인기순');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const [categories, setCategories] = useState(['전체']);

    const sortOptions = ['인기순', '낮은가격순', '높은가격순'];

    // Intersection Observer ref
    const observerRef = useRef();
    const lastProductRef = useCallback(node => {
        if (loadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prev => prev + 1);
            }
        }, { threshold: 0.1 });

        if (node) observerRef.current.observe(node);
    }, [loadingMore, hasMore, loading]);

    // 탭 변경 시 초기화
    useEffect(() => {
        setProducts([]);
        setPage(0);
        setHasMore(true);
        setLoading(true);
    }, [mainTab]);

    // 초기 데이터 로드 또는 페이지 변경 시 데이터 로드
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (page === 0) {
                    setLoading(true);
                } else {
                    setLoadingMore(true);
                }

                let data;
                if (mainTab === '베스트 25') {
                    data = await productApi.getBestProducts(page, PAGE_SIZE);
                } else {
                    // 쇼킹딜 베스트: 타임딜 상품 사용
                    data = await productApi.getTimeDealProducts(page, PAGE_SIZE);
                }

                if (data.length < PAGE_SIZE) {
                    setHasMore(false);
                }

                if (page === 0) {
                    setProducts(data);
                } else {
                    setProducts(prev => [...prev, ...data]);
                }
            } catch (error) {
                console.error('상품 로딩 실패:', error);
            } finally {
                setLoading(false);
                setLoadingMore(false);
            }
        };
        fetchProducts();
    }, [mainTab, page]);

    // 탭에 따라 카테고리 목록 업데이트
    useEffect(() => {
        if (products.length === 0) return;

        const uniqueCategories = ['전체', ...new Set(products.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
    }, [products]);

    // 선택된 카테고리가 현재 카테고리 목록에 없으면 '전체'로 리셋
    useEffect(() => {
        if (selectedCategory !== '전체' && !categories.includes(selectedCategory)) {
            setSelectedCategory('전체');
        }
    }, [categories, selectedCategory]);

    // 카테고리 필터링 (백엔드에서 이미 베스트/타임딜 필터링됨)
    let filteredProducts = selectedCategory === '전체'
        ? products
        : products.filter(p => p.category === selectedCategory);

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
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', paddingBottom: '60px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                {/* 메인 탭 (베스트 500 / 쇼핑몰 베스트) */}
                <div style={{
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e5e5',
                    display: 'flex'
                }}>
                    <button
                        onClick={() => {
                            setMainTab('베스트 25');
                            setSelectedCategory('전체');
                        }}
                        style={{
                            flex: 1,
                            padding: '20px',
                            border: 'none',
                            backgroundColor: 'white',
                            borderBottom: mainTab === '베스트 25' ? '3px solid #f01a21' : '3px solid transparent',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: mainTab === '베스트 25' ? '#f01a21' : '#666',
                            transition: 'all 0.2s'
                        }}
                    >
                        베스트 <span style={{ color: '#f01a21' }}>25</span>
                    </button>
                    <button
                        onClick={() => {
                            setMainTab('쇼킹딜 베스트');
                            setSelectedCategory('전체');
                        }}
                        style={{
                            flex: 1,
                            padding: '20px',
                            border: 'none',
                            backgroundColor: 'white',
                            borderBottom: mainTab === '쇼킹딜 베스트' ? '3px solid #f01a21' : '3px solid transparent',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: mainTab === '쇼킹딜 베스트' ? '#f01a21' : '#666',
                            transition: 'all 0.2s'
                        }}
                    >
                        쇼킹딜 베스트
                    </button>
                </div>

                {/* 카테고리 탭 */}
                <div style={{
                    backgroundColor: 'white',
                    borderBottom: '1px solid #e5e5e5',
                    padding: '0 20px',
                    overflowX: 'auto',
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        gap: '0',
                        minWidth: '100%'
                    }}>
                        {categories.map((category) => {
                            // 카테고리를 한글로 표시 (전체는 그대로, 영어 카테고리는 한글로 변환)
                            const displayName = category === '전체' ? '전체' : getCategoryName(category);
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    style={{
                                        padding: '18px 20px',
                                        border: 'none',
                                        backgroundColor: 'white',
                                        borderBottom: selectedCategory === category ? '3px solid #f01a21' : '3px solid transparent',
                                        color: selectedCategory === category ? '#f01a21' : '#666',
                                        fontSize: '14px',
                                        fontWeight: selectedCategory === category ? 'bold' : 'normal',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedCategory !== category) {
                                            e.target.style.color = '#333';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedCategory !== category) {
                                            e.target.style.color = '#666';
                                        }
                                    }}
                                >
                                    {displayName}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 안내 */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '15px 20px',
                    borderBottom: '1px solid #e5e5e5',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '13px', color: '#999' }}>
                        {mainTab === '베스트 25' ? '베스트 25 ?' : '쇼킹딜 베스트 ?'}
                    </span>
                </div>

                {/* 정렬 옵션 */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                }}>
                    <div style={{ fontSize: '15px', color: '#333', fontWeight: 'bold' }}>
                        총 <span style={{ color: '#f01a21' }}>{filteredProducts.length}</span>개
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {sortOptions.map((option) => (
                            <button
                                key={option}
                                onClick={() => setSortBy(option)}
                                style={{
                                    padding: '8px 16px',
                                    border: '1px solid #e5e5e5',
                                    backgroundColor: sortBy === option ? '#f01a21' : 'white',
                                    color: sortBy === option ? 'white' : '#666',
                                    fontSize: '13px',
                                    fontWeight: sortBy === option ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    borderRadius: '4px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (sortBy !== option) {
                                        e.target.style.backgroundColor = '#f8f8f8';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (sortBy !== option) {
                                        e.target.style.backgroundColor = 'white';
                                    }
                                }}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 상품 그리드 */}
                <div style={{ padding: '0 20px' }}>
                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', backgroundColor: 'white' }}>
                            <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(4, 1fr)',
                                gap: '20px',
                                backgroundColor: 'white',
                                padding: '20px'
                            }}>
                                {filteredProducts.map((product, index) => {
                                    const isLast = index === filteredProducts.length - 1;
                                    return (
                                        <div key={product.id} ref={isLast ? lastProductRef : null}>
                                            <ProductCard product={product} />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Loading More Indicator */}
                            {loadingMore && (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', backgroundColor: 'white' }}>
                                    <div style={{ width: '24px', height: '24px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                </div>
                            )}

                            {/* End of List */}
                            {!hasMore && filteredProducts.length > 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#999', fontSize: '14px', backgroundColor: 'white' }}>
                                    모든 상품을 불러왔습니다 ✨
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* 빈 상태 */}
                {filteredProducts.length === 0 && (
                    <div style={{
                        backgroundColor: 'white',
                        textAlign: 'center',
                        padding: '100px 20px',
                        margin: '0 20px',
                        color: '#999'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                            상품이 없습니다
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            다른 카테고리를 선택해보세요
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Best;
