import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';

const BestSwiper = ({ onLoadComplete }) => {
    const [initialBestItems, setInitialBestItems] = useState([]);
    const [bestItems, setBestItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false); // 섹션 표시 여부
    const MAX_LOADS = 3; // 최대 3번만 로드

    useEffect(() => {
        const fetchBestProducts = async () => {
            try {
                const products = await productApi.getBestProducts();
                const sorted = products.sort((a, b) => (a.rank || 0) - (b.rank || 0));
                setInitialBestItems(sorted);
                setBestItems(sorted.slice(0, 4));
            } catch (error) {
                console.error('베스트 상품 로딩 실패:', error);
            }
        };
        fetchBestProducts();
    }, []);

    const loadMore = async () => {
        if (loading || loadCount >= MAX_LOADS || initialBestItems.length === 0) return;
        setLoading(true);
        // Simulate fetch
        await new Promise(resolve => setTimeout(resolve, 800));

        // 현재 표시된 상품 수를 기준으로 다음 상품들 가져오기
        setBestItems(prev => {
            const currentCount = prev.length;
            const nextItems = initialBestItems.slice(currentCount, currentCount + 4);
            return [...prev, ...nextItems];
        });
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

            // 타임딜 섹션이 화면에 보이면 11번가 베스트 표시
            if (entry.isIntersecting && !isVisible) {
                console.log('11번가 베스트 표시!');
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
