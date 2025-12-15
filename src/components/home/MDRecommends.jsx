import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../../api/mockData';
import ProductCard from '../shared/ProductCard';

const MDRecommends = () => {
    const allItems = PRODUCTS.filter(p => !p.isTimeDeal && !p.isBest);
    const [items, setItems] = useState(allItems.slice(0, 8));
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const ITEMS_PER_LOAD = 8;
    const MAX_ITEMS = Math.min(allItems.length, 32); // 최대 32개까지만 표시

    const loadMore = async () => {
        if (loading || items.length >= MAX_ITEMS) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const nextStart = items.length;
        const nextEnd = Math.min(nextStart + ITEMS_PER_LOAD, MAX_ITEMS);
        const newItems = allItems.slice(nextStart, nextEnd);

        setItems(prev => [...prev, ...newItems]);
        setLoading(false);
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
