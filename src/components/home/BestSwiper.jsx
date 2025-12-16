import React, { useState, useEffect } from 'react';
import { productApi } from '../../api/productApi';
import ProductCard from '../shared/ProductCard';
import { Link } from 'react-router-dom';
import '../../styles/BestSwiper.css';

const BestSwiper = ({ onLoadComplete }) => {
    const [initialBestItems, setInitialBestItems] = useState([]);
    const [bestItems, setBestItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    // Config constants
    const MAX_ITEMS_LIMIT = 16;

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
            {isVisible && (
                <div id="best-section" className="best-swiper-section">
                    <div className="best-swiper-header">
                        <h2 className="best-swiper-title">11번가 베스트</h2>
                        <Link to='/best'><span className="best-swiper-more">더보기 &gt;</span></Link>
                    </div>

                    <div className="best-swiper-grid">
                        {bestItems.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {/* 로딩 트리거 - 섹션 하단에 위치 */}
                    {bestItems.length < Math.min(initialBestItems.length, MAX_ITEMS_LIMIT) && (
                        <div id="best-loading-trigger" className="best-swiper-loading-trigger" />
                    )}

                    {loading && (
                        <div className="best-swiper-loading">
                            <div className="best-swiper-spinner" />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default BestSwiper;
