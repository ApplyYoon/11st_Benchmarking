import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '../api/mockData';
import ProductCard from '../components/shared/ProductCard';

import { getRelatedKeywords } from '../api/searchUtils';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const originalQuery = searchParams.get('original');
    const [results, setResults] = useState([]);
    const [relatedKeywords, setRelatedKeywords] = useState([]);

    // Filters
    const [category, setCategory] = useState('all');
    const [price, setPrice] = useState('all');

    useEffect(() => {
        let filtered = PRODUCTS.filter(p =>
            p.name.includes(query) || (p.category && p.category.includes(query))
        );

        if (category !== 'all') {
            filtered = filtered.filter(p => p.category === category);
        }

        if (price !== 'all') {
            if (price === 'under10k') filtered = filtered.filter(p => p.price < 10000);
            else if (price === '10k-50k') filtered = filtered.filter(p => p.price >= 10000 && p.price <= 50000);
            else if (price === 'over50k') filtered = filtered.filter(p => p.price > 50000);
        }

        setResults(filtered);
        setRelatedKeywords(getRelatedKeywords(query));
    }, [query, category, price]);

    const categories = ['all', ...new Set(PRODUCTS.map(p => p.category).filter(Boolean))];

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '30px' }}>
            {/* Sidebar Filter */}
            <div style={{ width: '220px', flexShrink: 0 }}>
                <div style={{ border: '1px solid #eee', borderRadius: '0', padding: '20px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>혜택/조건 검색</h3>

                    <div style={{ marginBottom: '25px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>카테고리</h4>
                        {categories.map(cat => (
                            <div key={cat} style={{ marginBottom: '6px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', color: '#666' }}>
                                    <input
                                        type="radio"
                                        name="cat"
                                        checked={category === cat}
                                        onChange={() => setCategory(cat)}
                                        style={{ accentColor: '#333', marginRight: '6px' }}
                                    />
                                    {cat === 'all' ? '전체' : cat}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '10px' }}>가격대</h4>
                        {[
                            { label: '전체', val: 'all' },
                            { label: '~1만원', val: 'under10k' },
                            { label: '1만원~5만원', val: '10k-50k' },
                            { label: '5만원~', val: 'over50k' }
                        ].map(opt => (
                            <div key={opt.val} style={{ marginBottom: '6px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '13px', color: '#666' }}>
                                    <input
                                        type="radio"
                                        name="price"
                                        checked={price === opt.val}
                                        onChange={() => setPrice(opt.val)}
                                        style={{ accentColor: '#333', marginRight: '6px' }}
                                    />
                                    {opt.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Result */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                    <div style={{ marginBottom: '20px', fontSize: '14px' }}>
                        {originalQuery ? (
                            <div style={{ padding: '10px 15px', backgroundColor: '#f0faff', border: '1px solid #cce5ff', borderRadius: '4px', marginBottom: '15px', color: '#0056b3' }}>
                                <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '8px' }}>'{originalQuery}'</span>
                                일치하는 항목이 존재하지 않아 <span style={{ fontWeight: 'bold', color: '#f01a21' }}>'{query}'</span>(으)로 수정한 검색 결과입니다.
                            </div>
                        ) : (
                            <div style={{ marginBottom: '10px' }}>
                                <span style={{ fontWeight: 'bold', color: '#f01a21' }}>'{query}'</span> 검색결과 <span style={{ color: '#888' }}>({results.length}건)</span>
                            </div>
                        )}

                        {/* Related Keywords Bar */}
                        {relatedKeywords.length > 0 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '15px',
                                padding: '12px 15px',
                                backgroundColor: '#fff',
                                border: '1px solid #eee',
                                borderLeft: '4px solid #333',
                                marginBottom: '20px'
                            }}>
                                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>연관검색어</span>
                                {relatedKeywords.map((keyword, index) => (
                                    <a
                                        key={index}
                                        href={`/search?q=${encodeURIComponent(keyword)}`}
                                        style={{ fontSize: '13px', color: '#666', textDecoration: 'none' }}
                                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                                    >
                                        {keyword}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {results.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                        {results.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div style={{ padding: '100px 0', textAlign: 'center', color: '#666', borderTop: '1px solid #eee' }}>
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
