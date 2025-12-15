import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../../api/mockData';
import ProductCard from '../shared/ProductCard';

const BestSwiper = ({ onLoadComplete }) => {
    const allBestItems = PRODUCTS.filter(p => p.isBest).sort((a, b) => a.rank - b.rank);
    const [bestItems, setBestItems] = useState(allBestItems.slice(0, 4));
    const [loading, setLoading] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const ITEMS_PER_LOAD = 4;
    const MAX_ITEMS = Math.min(allBestItems.length, 16); // 최대 16개까지만 표시

    const loadMore = async () => {
        if (loading || bestItems.length >= MAX_ITEMS) return;
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        const nextStart = bestItems.length;
        const nextEnd = Math.min(nextStart + ITEMS_PER_LOAD, MAX_ITEMS);
        const newItems = allBestItems.slice(nextStart, nextEnd);

        setBestItems(prev => [...prev, ...newItems]);
        setLoadCount(prev => prev + 1);
        setLoading(false);

        if (onLoadComplete && (nextEnd >= MAX_ITEMS || nextEnd >= allBestItems.length)) {
            onLoadComplete();
        }
    };

    // 타임딜 섹션 감지 - 타임딜이 화면에서 벗어나면 11번가 베스트 표시
    useEffect(() => {
        const timedealSection = document.getElementById('timedeal-section');
        if (!timedealSection) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry.isIntersecting && !isVisible) {
                setIsVisible(true);
            }
        }, {
            threshold: [0, 0.1, 0.5, 1],
            rootMargin: '0px'
        });

        observer.observe(timedealSection);
        return () => observer.disconnect();
    }, [isVisible]);

    // 레이지 로딩 감지
    useEffect(() => {
        if (!isVisible || bestItems.length >= MAX_ITEMS) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, { threshold: 0.1 });

        const triggerElement = document.getElementById('best-loading-trigger');
        if (triggerElement) observer.observe(triggerElement);
        return () => observer.disconnect();
    }, [bestItems.length, isVisible]);

    return (
        <>
            {isVisible && (
                <div id="best-section" style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#111' }}>11번가 베스트</h2>
                        <span style={{ fontSize: '14px', color: '#666', cursor: 'pointer' }}>더보기 &gt;</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {bestItems.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* 로딩 트리거 - 섹션 하단에 위치 */}
                    {bestItems.length < MAX_ITEMS && (
                        <div id="best-loading-trigger" style={{ height: '1px', marginTop: '20px' }} />
                    )}

                    {loading && (
                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                            <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        </div>
                    )}
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            )}
        </>
    );
};

export default BestSwiper;
