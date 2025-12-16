import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/shared/ProductCard';
import { productApi } from '../api/productApi';
import { getCategoryName } from '../utils/categoryUtils';
import '../styles.css';

const Search = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || '';
    const originalQuery = searchParams.get('original');
    const [results, setResults] = useState([]);
    const [relatedKeywords, setRelatedKeywords] = useState([]);
    const [categories, setCategories] = useState(['all']);
    const [loading, setLoading] = useState(false);

    // Filters
    const [category, setCategory] = useState('all');
    const [price, setPrice] = useState('all');

    useEffect(() => {
        const fetchData = async () => {
            if (!query) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const products = await productApi.searchProducts(query, category, price);
                setResults(products);

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

                    <div>
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
            <div className="search-results">
                <div className="search-header">
                    <div>
                        {originalQuery ? (
                            <div className="search-correction-notice">
                                <span className="search-correction-original">'{originalQuery}'</span>
                                일치하는 항목이 존재하지 않아 <span className="search-correction-corrected">'{query}'</span>(으)로 수정한 검색 결과입니다.
                            </div>
                        ) : (
                            <div className="search-query">
                                <span className="search-query-text">'{query}'</span> 검색결과 <span className="search-query-count">({results.length}건)</span>
                            </div>
                        )}

                        {/* Related Keywords Bar */}
                        {relatedKeywords.length > 0 && (
                            <div className="search-related">
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
                    <div className="loading-container">
                        <div className="spinner" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="search-results-grid">
                        {results.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
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
