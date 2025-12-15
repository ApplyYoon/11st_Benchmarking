import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';

const MDRecommends = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false); // 섹션 표시 여부

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const allProducts = await productApi.getAllProducts();
                // Start with non-Timedeal/Best items
                const initialItems = allProducts.filter(p => !p.isTimeDeal && !p.isBest);
                setItems(initialItems);
            } catch (error) {
                console.error('상품 로딩 실패:', error);
            }
        };
        fetchProducts();
    }, []);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        // Simulate fetch
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate mock unique items
        const allProducts = await productApi.getAllProducts();
        const initialItems = allProducts.filter(p => !p.isTimeDeal && !p.isBest);
        const newItems = initialItems.map((item, idx) => ({
            ...item,
            id: Date.now() + idx + Math.random(),
            name: `[추천] ${item.name}`
        }));

        setItems(prev => [...prev, ...newItems]);
        setLoading(false);
    };

    // 11번가 베스트 섹션 감지 - 베스트가 화면에서 벗어나면 MD 추천 표시
    useEffect(() => {
        let observer;
        let timeoutId;

        // 11번가 베스트가 렌더링될 때까지 대기
        const checkAndObserve = () => {
            const bestSection = document.getElementById('best-section');
            if (!bestSection) {
                console.log('11번가 베스트 섹션을 찾을 수 없습니다. 재시도 중...');
                // 100ms 후 다시 시도
                timeoutId = setTimeout(checkAndObserve, 100);
                return;
            }

            console.log('11번가 베스트 섹션 발견! Observer 설정');
            observer = new IntersectionObserver((entries) => {
                const entry = entries[0];
                console.log('11번가 베스트 IntersectionObserver:', {
                    isIntersecting: entry.isIntersecting,
                    intersectionRatio: entry.intersectionRatio,
                    boundingClientRect: entry.boundingClientRect.top,
                    isVisible: isVisible
                });

                // 11번가 베스트 섹션이 화면에 보이면 MD 추천 표시
                if (entry.isIntersecting && !isVisible) {
                    console.log('MD 추천 표시!');
                    setIsVisible(true);
                }
            }, {
                threshold: [0, 0.1, 0.5, 1],
                rootMargin: '0px'
            });

            observer.observe(bestSection);
        };

        checkAndObserve();

        // Cleanup function for useEffect
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
                </div>
            )}
        </>
    );
};

export default MDRecommends;
