import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/shared/ProductCard';
import { getCategoryName, getCategoryKey, categoryMap } from '../utils/categoryUtils';

const Best = () => {
    const [mainTab, setMainTab] = useState('베스트 25');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [sortBy, setSortBy] = useState('인기순');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(['전체']);

    const sortOptions = ['인기순', '낮은가격순', '높은가격순'];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await productApi.getProducts();
                setProducts(data);
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
        // 베스트 25: isBest가 true인 상품만
        baseProducts = products.filter(p => p.isBest || p.best);
    } else if (mainTab === '쇼킹딜 베스트') {
        // 쇼킹딜 베스트: 할인율이 높은 상품들 (할인율 20% 이상 또는 타임딜 상품)
        baseProducts = products.filter(p => {
            const discountRate = p.discountRate || p.discount || 0;
            return discountRate >= 20 || p.isTimeDeal || p.timeDeal;
        }).sort((a, b) => {
            // 할인율이 높은 순으로 정렬
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
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '20px',
                            backgroundColor: 'white',
                            padding: '20px'
                        }}>
                            {filteredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
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
