import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../../api/mockData';
import ProductCard from '../shared/ProductCard';

const BestSwiper = ({ onLoadComplete }) => {
    const initialBestItems = PRODUCTS.filter(p => p.isBest).sort((a, b) => a.rank - b.rank);
    const [bestItems, setBestItems] = useState(initialBestItems.slice(0, 4));
    const [loading, setLoading] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false); // 섹션 표시 여부
    const MAX_LOADS = 3; // 최대 3번만 로드

    const loadMore = async () => {
        if (loading || loadCount >= MAX_LOADS) return;
        setLoading(true);
        // Simulate fetch
        await new Promise(resolve => setTimeout(resolve, 800));

        // Generate mock unique items
        const newItems = initialBestItems.slice(0, 4).map((item, idx) => ({
            ...item,
            id: Date.now() + idx + Math.random(),
            name: `[베스트] ${item.name}`
        }));

        setBestItems(prev => [...prev, ...newItems]);
        setLoadCount(prev => prev + 1);
        setLoading(false);
    };

    // 로딩 완료 감지
    useEffect(() => {
        if (loadCount >= MAX_LOADS && onLoadComplete) {
            onLoadComplete();
        }
    }, [loadCount, onLoadComplete]);

    // 타임딜 섹션 감지 - 타임딜이 화면에서 벗어나면 11번가 베스트 표시
    useEffect(() => {
        const timedealSection = document.getElementById('timedeal-section');
        if (!timedealSection) {
            // console.log('타임딜 섹션을 찾을 수 없습니다');
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];

            // 타임딜의 하단이 화면 상단을 지나갔을 때
            if (entry.boundingClientRect.top < 0 && !isVisible) {
                // console.log('11번가 베스트 표시!');
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
        if (!isVisible || loadCount >= MAX_LOADS) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, { threshold: 0.1 }); // 트리거 영역이 10% 보이면 로드

        const triggerElement = document.getElementById('best-loading-trigger');
        if (triggerElement) observer.observe(triggerElement);
        return () => observer.disconnect();
    }, [bestItems, loadCount, isVisible]);

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
                    {loadCount < MAX_LOADS && (
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
