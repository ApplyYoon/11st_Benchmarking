import React, { useState } from 'react';
import { PRODUCTS } from '../api/mockData';
import ProductCard from '../components/shared/ProductCard';

const Best = () => {
    const [mainTab, setMainTab] = useState('베스트 500');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const [sortBy, setSortBy] = useState('인기순');

    const categories = ['전체', '식품', '패션', '생활', '디지털/가전', '도서/문구/취미'];

    const sortOptions = ['인기순', '낮은가격순', '높은가격순', '평점순', '리뷰많은순'];

    // 카테고리 매핑 (한국어 -> 영어)
    const categoryMapping = {
        '전체': null, // 전체는 모든 상품
        '식품': 'food',
        '패션': 'fashion',
        '생활': 'daily',
        '디지털/가전': 'electronics',
        '도서/문구/취미': 'ticket',
    };

    // 필터링 및 정렬
    let filteredProducts = selectedCategory === '전체'
        ? PRODUCTS
        : PRODUCTS.filter(p => {
            const mappedCategory = categoryMapping[selectedCategory];
            return mappedCategory ? p.category === mappedCategory : true;
        });

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
    } else if (sortBy === '평점순') {
        filteredProducts = [...filteredProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === '리뷰많은순') {
        filteredProducts = [...filteredProducts].sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
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
                        onClick={() => setMainTab('베스트 500')}
                        style={{
                            flex: 1,
                            padding: '20px',
                            border: 'none',
                            backgroundColor: 'white',
                            borderBottom: mainTab === '베스트 500' ? '3px solid #f01a21' : '3px solid transparent',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            color: mainTab === '베스트 500' ? '#f01a21' : '#666',
                            transition: 'all 0.2s'
                        }}
                    >
                        베스트 <span style={{ color: '#f01a21' }}>500</span>
                    </button>
                    <button
                        onClick={() => setMainTab('쇼킹딜 베스트')}
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
                        {categories.map((category) => (
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
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 베스트 500 안내 */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '15px 20px',
                    borderBottom: '1px solid #e5e5e5',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '13px', color: '#999' }}>
                        베스트 500 ?
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
