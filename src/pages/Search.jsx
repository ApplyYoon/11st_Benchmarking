import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/shared/ProductCard';
import { productApi } from '../api/productApi';
import { getCategoryName } from '../utils/categoryUtils';
import '../styles/Search.css';

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
            setCategory('all'); // 검색어 변경 시 카테고리 리셋

            try {
                const products = await productApi.searchProductsPaginated(query, category, price, 0, ITEMS_PER_PAGE);
                setResults(products);
                setOffset(ITEMS_PER_PAGE);
                setHasMore(products.length === ITEMS_PER_PAGE);

                // 카테고리 목록 가져오기 (검색 결과에 맞는 카테고리만)
                try {
                    const categoryList = await productApi.getCategories(query);
                    const uniqueCategories = ['all', ...categoryList.filter(Boolean)];
                    setCategories(uniqueCategories);
                } catch (catError) {
                    console.error('카테고리 로딩 실패:', catError);
                    // Fallback handles by default state
                }

                // 연관 검색어는 현재 페이지 검색 결과에서 추출 (or dedicated API if available)
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
        <div className="search-container">
            {/* Sidebar Filter */}
            <div className="search-sidebar">
                <div className="search-filter-box">
                    <h3 className="search-filter-title">혜택/조건 검색</h3>

                    <div className="search-filter-section">
                        <h4 className="search-filter-section-title">카테고리</h4>
                        {categories.map(cat => (
                            <div key={cat} className="search-filter-option">
                                <label className="search-filter-label">
                                    <input
                                        type="radio"
                                        name="cat"
                                        checked={category === cat}
                                        onChange={() => setCategory(cat)}
                                        className="search-filter-radio"
                                    />
                                    {cat === 'all' ? '전체' : getCategoryName(cat)}
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="search-filter-section">
                        <h4 className="search-filter-section-title">가격대</h4>
                        {[
                            { label: '전체', val: 'all' },
                            { label: '~1만원', val: 'under10k' },
                            { label: '1만원~5만원', val: '10k-50k' },
                            { label: '5만원~', val: 'over50k' }
                        ].map(opt => (
                            <div key={opt.val} className="search-filter-option">
                                <label className="search-filter-label">
                                    <input
                                        type="radio"
                                        name="price"
                                        checked={price === opt.val}
                                        onChange={() => setPrice(opt.val)}
                                        className="search-filter-radio"
                                    />
                                    {opt.label}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Result */}
            <div className="search-main">
                <div className="search-header">
                    <div className="search-result-header">
                        {originalQuery ? (
                            <div className="search-correction-notice">
                                <span className="search-correction-original">'{originalQuery}'</span>
                                일치하는 항목이 존재하지 않아 <span className="search-correction-query">'{query}'</span>(으)로 수정한 검색 결과입니다.
                            </div>
                        ) : (
                            <div className="search-result-title">
                                <span className="search-result-query">'{query}'</span> 검색결과 <span className="search-result-count">({results.length}건)</span>
                            </div>
                        )}

                        {/* Related Keywords Bar */}
                        {relatedKeywords.length > 0 && (
                            <div className="search-related-keywords">
                                <span className="search-related-label">연관검색어</span>
                                {relatedKeywords.map((keyword, index) => (
                                    <a
                                        key={index}
                                        href={`/search?q=${encodeURIComponent(keyword)}`}
                                        className="search-related-link"
                                    >
                                        {keyword}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {loading ? (
                    <div className="search-loading">
                        <div className="search-spinner" />
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <div className="search-results-grid">
                            {results.map((product, index) => (
                                <ProductCard key={`${product.id}-${index}`} product={product} />
                            ))}
                        </div>

                        {/* 무한 스크롤 로더 */}
                        <div ref={loaderRef} className="search-infinite-loader">
                            {loadingMore && (
                                <div className="search-loading-more">
                                    <div className="search-spinner" />
                                </div>
                            )}
                            {!hasMore && results.length > 0 && (
                                <div className="search-all-loaded">
                                    모든 검색 결과를 불러왔습니다 ({results.length}개)
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="search-empty">
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;
