import React, { useState, useEffect, useRef } from 'react';
import client from '../../api/client';
import ProductCard from '../shared/ProductCard';
import ProductSkeleton from '../shared/ProductSkeleton';

const BestSwiper = ({ onLoadComplete }) => {
    const [bestItems, setBestItems] = useState([]);
    const [loading, setLoading] = useState(false); // Start false, set true when fetching
    const [hasFetched, setHasFetched] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasFetched) {
                setLoading(true);
                fetchBestItems();
            }
        }, { threshold: 0.1, rootMargin: '100px' });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [hasFetched]);

    const fetchBestItems = async () => {
        try {
            const response = await client.get('/products', {
                params: { type: 'best' }
            });
            setBestItems(response.data);
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch best items", error);
        } finally {
            setLoading(false);
            if (onLoadComplete) onLoadComplete();
        }
    };

    return (
        <div id="best-section" style={{ marginBottom: '60px' }} ref={sectionRef}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#111' }}>11번가 베스트</h2>
                <span style={{ fontSize: '14px', color: '#666', cursor: 'pointer' }}>더보기 &gt;</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {loading || (!hasFetched && bestItems.length === 0) ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                        <ProductSkeleton key={idx} />
                    ))
                ) : (
                    bestItems.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>
        </div>
    );
};

export default BestSwiper;
