import React, { useState, useEffect, useRef } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';

const MDRecommends = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false); // Data fetched flag
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_LOAD = 24;
    const MAX_ITEMS = 96;
    const sectionRef = useRef(null);

    // Lazy load: Fetch data when BestSwiper section leaves viewport
    useEffect(() => {
        if (isLoaded) return; // Already loaded

        const bestSection = document.getElementById('best-section');
        if (!bestSection) {
            // 베스트 섹션이 없으면 바로 로드
            fetchInitialProducts();
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            // 베스트 섹션이 화면에서 벗어나면 MD 추천 로드
            if (!entries[0].isIntersecting && !isLoaded) {
                fetchInitialProducts();
            }
        }, {
            threshold: 0,
            rootMargin: '0px'
        });

        observer.observe(bestSection);
        return () => observer.disconnect();
    }, [isLoaded]);

    const fetchInitialProducts = async () => {
        try {
            setLoading(true);
            const newProducts = await productApi.getAllProducts(0, ITEMS_PER_LOAD);
            const filteredItems = newProducts.filter(p => !p.isTimeDeal && !p.isBest);
            setItems(filteredItems);
            setPage(1);
            if (newProducts.length < ITEMS_PER_LOAD) setHasMore(false);
            setIsLoaded(true);
        } catch (error) {
            console.error('상품 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMore = async () => {
        if (loading || !hasMore || items.length >= MAX_ITEMS) return;
        setLoading(true);

        try {
            // Fetch Next Page
            const newProducts = await productApi.getAllProducts(page, ITEMS_PER_LOAD);

            if (newProducts.length === 0) {
                setHasMore(false);
                setLoading(false);
                return;
            }

            const filteredItems = newProducts.filter(p => !p.isTimeDeal && !p.isBest);

            setItems(prev => [...prev, ...filteredItems]);
            setPage(prev => prev + 1);

            if (newProducts.length < ITEMS_PER_LOAD) setHasMore(false);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div ref={sectionRef} style={{ marginTop: '40px', minHeight: '200px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '20px', color: '#111' }}>MD 추천</h2>

            {/* Loading spinner for initial load */}
            {loading && items.length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                    <div style={{ width: '40px', height: '40px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 20px' }}>
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {items.length > 0 && items.length < MAX_ITEMS && hasMore && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        style={{
                            padding: '14px 40px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            color: '#333',
                            backgroundColor: '#fff',
                            border: '2px solid #333',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s',
                            opacity: loading ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = '#333';
                                e.target.style.color = '#fff';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#fff';
                            e.target.style.color = '#333';
                        }}
                    >
                        {loading ? '로딩 중...' : '새상품 더보기'}
                    </button>
                </div>
            )}
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default MDRecommends;
