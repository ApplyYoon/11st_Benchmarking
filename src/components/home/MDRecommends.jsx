import React, { useState, useEffect, useRef } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';

const MDRecommends = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const MAX_ITEMS = 15000;

    // isVisible이 true가 되었을 때만 데이터 로딩
    useEffect(() => {
        if (!isVisible || items.length > 0) return;
        
        const fetchProducts = async () => {
            try {
                const productsBlock = await productApi.getProducts(32);
                const initialItems = productsBlock.filter(p => !p.isTimeDeal && !p.isBest);
                setItems(initialItems);
            } catch (error) {
                console.error('상품 로딩 실패:', error);
            }
        };
        fetchProducts();
    }, [isVisible, items.length]);

    const loadMore = async () => {
        if (loading || items.length >= MAX_ITEMS) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const productsBlock = await productApi.getProducts(32);
        const filteredItems = productsBlock.filter(p => !p.isTimeDeal && !p.isBest);
        const newItems = filteredItems.map((item, idx) => ({
            ...item,
            id: Date.now() + idx + Math.random(),
            name: `[추천] ${item.name}`
        }));

        setItems(prev => [...prev, ...newItems]);
        setLoading(false);
    };

    // MDRecommends 섹션 자체를 관찰
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isVisible) {
                    setIsVisible(true);
                    observer.disconnect(); // 한 번 감지되면 관찰 중단
                }
            },
            { threshold: 0.1, rootMargin: '100px' } // 100px 미리 로딩
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [isVisible]);

    return (
        <div ref={sectionRef}>
            <h2 className="section-title" style={{ marginBottom: '20px' }}>MD 추천</h2>

            {isVisible ? (
                <>
                    <div className="product-grid">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {items.length > 0 && items.length < MAX_ITEMS && (
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
                </>
            ) : (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" />
                </div>
            )}
        </div>
    );
};

export default MDRecommends;
