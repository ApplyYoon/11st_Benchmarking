import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';
import '../../styles/MDRecommends.css';

const MDRecommends = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_LOAD = 32;
    const MAX_ITEMS = 10000;

    useEffect(() => {
        const fetchInitialProducts = async () => {
            try {
                const initialItems = await productApi.getProductsPaginated(0, ITEMS_PER_LOAD);
                setItems(initialItems);
                setOffset(ITEMS_PER_LOAD);
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
            const newItems = await productApi.getProductsPaginated(offset, ITEMS_PER_LOAD);

            if (newItems.length === 0) {
                setHasMore(false);
            } else {
                setItems(prev => [...prev, ...newItems]);
                setOffset(prev => prev + ITEMS_PER_LOAD);
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
                    <h2 className="md-recommends-title">MD 추천</h2>

                    <div className="md-recommends-grid">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {items.length < MAX_ITEMS && (
                        <div className="md-recommends-load-more">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="md-recommends-load-more-btn"
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
