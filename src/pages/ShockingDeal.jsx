import React, { useState, useEffect, useRef, useCallback } from 'react';
import { productApi } from '../api/productApi';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles/ShockingDeal.css';

const ITEMS_PER_PAGE = 32;
const MAX_ITEMS = 15000;

const ShockingDeal = () => {
    const { addToCart } = useCart();

    // Filter Time Deal items (treated as Shocking Deal)
    const [shockingDeals, setShockingDeals] = useState([]);
    const [bannerItems, setBannerItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const loaderRef = useRef(null);

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState('');

    // Banner Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);

    // 추가 데이터 로딩
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore || shockingDeals.length >= MAX_ITEMS) return;
        
        setLoadingMore(true);
        try {
            const newProducts = await productApi.getTimeDealProductsPaginated(offset, ITEMS_PER_PAGE);
            
            if (newProducts.length === 0 || newProducts.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }
            
            if (newProducts.length > 0) {
                setShockingDeals(prev => [...prev, ...newProducts]);
                setOffset(prev => prev + ITEMS_PER_PAGE);
            }
        } catch (error) {
            console.error('추가 상품 로딩 실패:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [offset, loadingMore, hasMore, shockingDeals.length]);

    // IntersectionObserver로 하단 감지
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loadingMore && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [loadMore, loadingMore, hasMore, loading]);

    useEffect(() => {
        const fetchTimeDealData = async () => {
            try {
                setLoading(true);
                const [products, endTimeData] = await Promise.all([
                    productApi.getTimeDealProductsPaginated(0, ITEMS_PER_PAGE),
                    productApi.getTimeDealEndTime()
                ]);
                
                setShockingDeals(products);
                setOffset(ITEMS_PER_PAGE);
                setHasMore(products.length === ITEMS_PER_PAGE);
                setBannerItems(products.slice(0, 5));

                // 타임딜 종료 시간 설정
                if (endTimeData.endTime) {
                    const endTime = new Date(endTimeData.endTime);
                    const calculateTimeLeft = () => {
                        const now = new Date();
                        const diff = endTime - now;

                        if (diff > 0) {
                            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                            const minutes = Math.floor((diff / 1000 / 60) % 60);
                            const seconds = Math.floor((diff / 1000) % 60);
                            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        } else {
                            setTimeLeft('00:00:00');
                        }
                    };
                    
                    calculateTimeLeft();
                    const timer = setInterval(calculateTimeLeft, 1000);
                    return () => clearInterval(timer);
                } else {
                    // 종료 시간이 없으면 자정으로 설정
                    const calculateTimeLeft = () => {
                        const now = new Date();
                        const tomorrow = new Date(now);
                        tomorrow.setHours(24, 0, 0, 0);

                        const diff = tomorrow - now;

                        if (diff > 0) {
                            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                            const minutes = Math.floor((diff / 1000 / 60) % 60);
                            const seconds = Math.floor((diff / 1000) % 60);
                            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                        } else {
                            setTimeLeft('00:00:00');
                        }
                    };
                    calculateTimeLeft();
                    const timer = setInterval(calculateTimeLeft, 1000);
                    return () => clearInterval(timer);
                }
            } catch (error) {
                console.error('타임딜 데이터 로딩 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTimeDealData();
    }, []);

    // Auto-slide effect
    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerItems.length);
        }, 4000); // 4 seconds per slide

        return () => clearInterval(slideInterval);
    }, [bannerItems.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % bannerItems.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + bannerItems.length) % bannerItems.length);

    return (
        <div className="shocking-deal-container">
            {/* Hero Banner with Carousel */}
            <div className="shocking-deal-hero">
                <div className="shocking-deal-hero-wrapper">

                    {/* Left: Branding & Timer */}
                    <div className="shocking-deal-hero-left">
                        <h1 className="shocking-deal-hero-title">
                            SHOCKING<br />DEAL
                        </h1>
                        <p className="shocking-deal-hero-subtitle">
                            오늘만 이 가격! 망설이면 품절됩니다.
                        </p>
                        <div className="shocking-deal-timer-box">
                            남은 시간 <span className="shocking-deal-timer-time">{timeLeft}</span>
                        </div>
                    </div>

                    {/* Right: Product Carousel */}
                    <div className="shocking-deal-carousel-wrapper">
                        <div className="shocking-deal-carousel">
                            {/* Individual Slide */}
                            {bannerItems.map((item, index) => (
                                <div key={item.id} className="shocking-deal-carousel-slide" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                    <div className="shocking-deal-carousel-image-container">
                                        <img src={item.imageUrl || item.image} alt={item.name} className="shocking-deal-carousel-image" />
                                        <div className="shocking-deal-carousel-badge">
                                            {item.discountRate || item.discount}% OFF
                                        </div>
                                    </div>
                                    <div className="shocking-deal-carousel-content">
                                        <h3 className="shocking-deal-carousel-product-name">
                                            {(item.isTimeDeal || item.timeDeal) ? `[타임딜] ${item.name}` : item.name}
                                        </h3>
                                        <div className="shocking-deal-carousel-price-row">
                                            <div>
                                                <span className="shocking-deal-carousel-original-price">{item.originalPrice.toLocaleString()}원</span>
                                                <span className="shocking-deal-carousel-price">{item.price.toLocaleString()}원</span>
                                            </div>
                                            <Link to={`/product/${item.id}`} className="shocking-deal-carousel-buy-btn">
                                                구매하기
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Carousel Controls */}
                        <button onClick={prevSlide} className="shocking-deal-carousel-control shocking-deal-carousel-control-prev">
                            <ChevronLeft size={24} color="#333" />
                        </button>
                        <button onClick={nextSlide} className="shocking-deal-carousel-control shocking-deal-carousel-control-next">
                            <ChevronRight size={24} color="#333" />
                        </button>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="shocking-deal-hero-decoration"></div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="shocking-deal-grid-wrapper">
                <h2 className="shocking-deal-section-title">
                    <span className="shocking-deal-section-icon">⚡</span>
                    지금 가장 핫한 딜
                </h2>

                {loading ? (
                    <div className="shocking-deal-loading">
                        <div className="shocking-deal-spinner" />
                    </div>
                ) : (
                    <>
                    <div className="shocking-deal-products-grid">
                        {shockingDeals.map((product, index) => (
                            <Link to={`/product/${product.id}`} className="shocking-deal-product-link" key={`${product.id}-${index}`}>
                                <div className="shocking-deal-product-card">
                                    {/* Badge */}
                                    <div className="shocking-deal-product-badge">
                                        {product.discountRate || product.discount}% OFF
                                    </div>
                                    {/* Image */}
                                    <div className="shocking-deal-product-image-container">
                                        <img
                                            src={product.imageUrl || product.image}
                                            alt={product.name}
                                            className="shocking-deal-product-image"
                                        />
                                    </div>
                                    {/* Content */}
                                    <div className="shocking-deal-product-content">
                                        <h3 className="shocking-deal-product-name">
                                            {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                                        </h3>
                                        <div className="shocking-deal-product-price-row">
                                            <div>
                                                <div className="shocking-deal-product-original-price">
                                                    {product.originalPrice.toLocaleString()}원
                                                </div>
                                                <div className="shocking-deal-product-price">
                                                    {product.price.toLocaleString()}원
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="shocking-deal-product-cart-btn"
                                            >
                                                <ShoppingCart size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* 무한 스크롤 로더 */}
                    <div ref={loaderRef} className="shocking-deal-loader">
                        {loadingMore && (
                            <div className="shocking-deal-loader-spinner">
                                <div className="shocking-deal-loader-spinner-inner" />
                            </div>
                        )}
                        {!hasMore && shockingDeals.length > 0 && (
                            <div className="shocking-deal-loader-complete">
                                모든 상품을 불러왔습니다 ({shockingDeals.length}개)
                            </div>
                        )}
                    </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShockingDeal;
