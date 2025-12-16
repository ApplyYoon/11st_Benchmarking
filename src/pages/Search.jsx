import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/shared/ProductCard';
import { productApi } from '../api/productApi';
import { getCategoryName } from '../utils/categoryUtils';

const ITEMS_PER_PAGE = 32;
const MAX_ITEMS = 15000;

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const originalQuery = searchParams.get('original');
    const [results, setResults] = useState([]);
    const [relatedKeywords, setRelatedKeywords] = useState([]);
    const [categories, setCategories] = useState(['all']);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);

    // Filters
    const [category, setCategory] = useState('all');
    const [price, setPrice] = useState('all');

    // 추가 데이터 로딩
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || results.length >= MAX_ITEMS || !query) return;
        
        setLoadingMore(true);
        try {
            const newProducts = await productApi.searchProductsPaginated(query, category, price, offset, ITEMS_PER_PAGE);
            
            if (newProducts.length === 0 || newProducts.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }
            
            if (newProducts.length > 0) {
                setResults(prev => [...prev, ...newProducts]);
                setOffset(prev => prev + ITEMS_PER_PAGE);
            }
        } catch (error) {
            console.error('추가 검색 결과 로딩 실패:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [query, category, price, offset, loadingMore, hasMore, results.length]);

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

    // 초기 데이터 및 필터 변경 시 로딩
    useEffect(() => {
        const fetchData = async () => {
            if (!query) {
                setResults([]);
                setHasMore(false);
                return;
            }

            setLoading(true);
            setResults([]);
            setOffset(0);
            setHasMore(true);
            
            try {
                const products = await productApi.searchProductsPaginated(query, category, price, 0, ITEMS_PER_PAGE);
                setResults(products);
                setOffset(ITEMS_PER_PAGE);
                setHasMore(products.length === ITEMS_PER_PAGE);

                // 카테고리 목록 가져오기
                const allProducts = await productApi.getProducts();
                const uniqueCategories = ['all', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
                setCategories(uniqueCategories);

                // 연관 검색어는 검색 결과에서 추출
                const related = products
                    .map(p => p.name)
                    .filter(name => name.includes(query) && name !== query)
                    .slice(0, 8);
                setRelatedKeywords(related);
            } catch (error) {
                console.error('검색 실패:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [query, category, price]);

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
                                    {cat === 'all' ? '전체' : getCategoryName(cat)}
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

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                        <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {results.map((product, index) => (
                                <ProductCard key={`${product.id}-${index}`} product={product} />
                            ))}
                        </div>

                        {/* 무한 스크롤 로더 */}
                        <div ref={loaderRef} style={{ height: '50px', margin: '20px 0' }}>
                            {loadingMore && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                                </div>
                            )}
                            {!hasMore && results.length > 0 && (
                                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                                    모든 검색 결과를 불러왔습니다 ({results.length}개)
                                </div>
                            )}
                        </div>
                    </>
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
