import React, { useState, useEffect, useRef } from 'react';
import client from '../../api/client';
import ProductCard from '../shared/ProductCard';
import ProductSkeleton from '../shared/ProductSkeleton';

const MDRecommends = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasFetched) {
                setLoading(true);
                fetchItems();
            }
        }, { threshold: 0.1, rootMargin: '100px' });

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [hasFetched]);

    const fetchItems = async () => {
        try {
            const response = await client.get('/products');
            const allProducts = response.data;
            const recommends = allProducts.filter(p => !p.isTimeDeal && !p.isBest);
            setItems(recommends.length > 0 ? recommends : allProducts);
            setHasFetched(true);
        } catch (error) {
            console.error("Failed to fetch recommended items", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={sectionRef}>
            <h2 style={{ fontSize: '26px', fontWeight: '900', marginBottom: '20px', color: '#111' }}>MD 추천</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px 20px' }}>
                {loading || (!hasFetched && items.length === 0) ? (
                    Array.from({ length: 8 }).map((_, idx) => (
                        <ProductSkeleton key={idx} />
                    ))
                ) : (
                    items.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>
                <button
                    onClick={() => alert("더 많은 상품 보기 기능은 준비중입니다.")}
                    style={{
                        padding: '14px 40px',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        color: '#333',
                        backgroundColor: '#fff',
                        border: '2px solid #333',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    새상품 더보기
                </button>
            </div>
        </div>
    );
};

export default MDRecommends;
