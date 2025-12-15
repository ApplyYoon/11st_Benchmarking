import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';

const BestSwiper = ({ onLoadComplete }) => {
    const [initialBestItems, setInitialBestItems] = useState([]);
    const [bestItems, setBestItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Config constants
    const MAX_ITEMS_LIMIT = 25;

    useEffect(() => {
        const fetchBestProducts = async () => {
            try {
                const products = await productApi.getBestProducts();
                // Backend now returns sorted Top 25
                setInitialBestItems(products);
                setBestItems(products);
            } catch (error) {
                console.error('베스트 상품 로딩 실패:', error);
            }
        };
        fetchBestProducts();
    }, []);

    const loadMore = async () => {
        if (loading || bestItems.length >= Math.min(initialBestItems.length, MAX_ITEMS_LIMIT) || initialBestItems.length === 0) return;

        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));

        // 현재 표시된 상품 수를 기준으로 다음 상품들 가져오기
        setBestItems(prev => {
            const currentCount = prev.length;
            const nextItems = initialBestItems.slice(currentCount, currentCount + 4);
            return [...prev, ...nextItems];
        });
        setLoading(false);

        // 모든 아이템 로드 완료 체크
        if (onLoadComplete && (bestItems.length + 4 >= Math.min(initialBestItems.length, MAX_ITEMS_LIMIT))) {
            onLoadComplete();
        }
    };

    // 타임딜 섹션 감지 - 타임딜이 화면에서 벗어나면 11번가 베스트 표시
    useEffect(() => {
        const timedealSection = document.getElementById('timedeal-section');
        if (!timedealSection) {
            setIsVisible(true); // 타임딜이 없으면 바로 표시
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            // 타임딜이 화면에서 벗어나면 베스트 표시
            if (!entry.isIntersecting && !isVisible) {
                setIsVisible(true);
            }
        }, {
            threshold: 0,
            rootMargin: '0px'
        });

        observer.observe(timedealSection);
        return () => observer.disconnect();
    }, [isVisible]);

    // 레이지 로딩 감지
    useEffect(() => {
        const maxDisplay = Math.min(initialBestItems.length, MAX_ITEMS_LIMIT);
        if (!isVisible || bestItems.length >= maxDisplay) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, { threshold: 0.1 });

        const triggerElement = document.getElementById('best-loading-trigger');
        if (triggerElement) observer.observe(triggerElement);
        return () => observer.disconnect();
    }, [bestItems.length, isVisible, initialBestItems.length, MAX_ITEMS_LIMIT]);

    return (
        <>
            {isVisible ? (
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
                    {bestItems.length < Math.min(initialBestItems.length, MAX_ITEMS_LIMIT) && (
                        <div id="best-loading-trigger" style={{ height: '1px', marginTop: '20px' }} />
                    )}

                    {loading && (
                        <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
                            <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        </div>
                    )}
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <div id="best-section" style={{ height: '500px' }}></div>
            )}
        </>
    );
};

export default BestSwiper;
