import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';

const MDRecommends = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_LOAD = 8;
    const MAX_ITEMS = 10000;

    useEffect(() => {
        const fetchInitialProducts = async () => {
            try {
                // Fetch first page (page 0)
                const initialItems = await productApi.getRecommendedProducts(0, ITEMS_PER_LOAD);
                setItems(initialItems);
                setPage(1); // Next page will be 1
                if (initialItems.length < ITEMS_PER_LOAD) {
                    setHasMore(false);
                }
            } catch (error) {
                console.error('상품 로딩 실패:', error);
            }
        };
        fetchInitialProducts();
    }, []);

    const loadMore = async () => {
        if (loading || items.length >= MAX_ITEMS) return;
        setLoading(true);

        try {
            const newItems = await productApi.getRecommendedProducts(page, ITEMS_PER_LOAD);

            if (newItems.length === 0) {
                setHasMore(false);
            } else {
                setItems(prev => [...prev, ...newItems]);
                setPage(prev => prev + 1);
                if (newItems.length < ITEMS_PER_LOAD) {
                    setHasMore(false);
                }
            }
        } catch (error) {
            console.error('추가 상품 로딩 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 11번가 베스트 섹션 감지 - 베스트가 화면에서 벗어나면 MD 추천 표시
    useEffect(() => {
        let observer;
        let timeoutId;

        const checkAndObserve = () => {
            const bestSection = document.getElementById('best-section');
            if (!bestSection) {
                timeoutId = setTimeout(checkAndObserve, 100);
                return;
            }

            observer = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            }, {
                threshold: [0, 0.1, 0.5, 1],
                rootMargin: '0px'
            });

            observer.observe(bestSection);
        };

        checkAndObserve();

        return () => {
            if (observer) {
                observer.disconnect();
            }
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [isVisible]);

    return (
        <>
            {isVisible && (
                <div>
                    <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '20px', color: '#111' }}>MD 추천</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 20px' }}>
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {items.length < MAX_ITEMS && (
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
                </div>
            )}
        </>
    );
};

export default MDRecommends;
