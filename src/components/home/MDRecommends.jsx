import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';

const MDRecommends = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const ITEMS_PER_LOAD = 8;
    const MAX_ITEMS = 32;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const allProducts = await productApi.getAllProducts();
                const initialItems = allProducts.filter(p => !p.isTimeDeal && !p.isBest);
                setItems(initialItems);
            } catch (error) {
                console.error('상품 로딩 실패:', error);
            }
        };
        fetchProducts();
    }, []);

    const loadMore = async () => {
        if (loading || items.length >= MAX_ITEMS) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

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
                    <h2 className="section-title" style={{ marginBottom: '20px' }}>MD 추천</h2>

                    <div className="product-grid">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {items.length < MAX_ITEMS && (
                        <div className="load-more-container">
                            <button
                                onClick={loadMore}
                                disabled={loading}
                                className="load-more-btn"
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
