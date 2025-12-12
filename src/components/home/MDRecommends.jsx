import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS } from '../../api/mockData';
import ProductCard from '../shared/ProductCard';

const MDRecommends = () => {
    // Start with non-Timedeal/Best items
    const initialItems = PRODUCTS.filter(p => !p.isTimeDeal && !p.isBest);
    const [items, setItems] = useState(initialItems);
    const [loading, setLoading] = useState(false);
    const loadingRef = useRef(null);

    const loadMore = async () => {
        if (loading) return;
        setLoading(true);
        // Simulate fetch
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate mock unique items
        const newItems = initialItems.map((item, idx) => ({
            ...item,
            id: Date.now() + idx + Math.random(),
            name: `[추천] ${item.name}`
        }));

        setItems(prev => [...prev, ...newItems]);
        setLoading(false);
    };

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, { threshold: 0.1 });

        if (loadingRef.current) observer.observe(loadingRef.current);
        return () => observer.disconnect();
    }, [items]);

    return (
        <div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '20px', color: '#111' }}>MD 추천</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 20px' }}>
                {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <div ref={loadingRef} style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading && (
                    <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                )}
            </div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default MDRecommends;
