import React, { useState, useEffect, useRef, useCallback } from 'react';
import { productApi } from '../api/productApi';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import '../styles.css';

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
        <div className="shockingdeal-container">
            {/* Hero Banner with Carousel */}
            <div className="shockingdeal-hero">
                <div className="shockingdeal-hero-inner">

                    {/* Left: Branding & Timer */}
                    <div className="shockingdeal-branding">
                        <h1 className="shockingdeal-title">
                            SHOCKING<br />DEAL
                        </h1>
                        <p className="shockingdeal-subtitle">
                            오늘만 이 가격! 망설이면 품절됩니다.
                        </p>
                        <div className="shockingdeal-timer">
                            남은 시간 <span className="shockingdeal-timer-time">{timeLeft}</span>
                        </div>
                    </div>

                    {/* Right: Product Carousel */}
                    <div className="shockingdeal-carousel-wrapper">
                        <div className="shockingdeal-carousel">
                            {/* Individual Slide */}
                            {bannerItems.map((item, index) => (
                                <div key={item.id} className="shockingdeal-slide" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                                    <div className="shockingdeal-slide-image">
                                        <img src={item.imageUrl || item.image} alt={item.name} className="shockingdeal-slide-img" />
                                        <div className="shockingdeal-slide-badge">
                                            {item.discountRate || item.discount}% OFF
                                        </div>
                                    </div>
                                    <div className="shockingdeal-slide-content">
                                        <h3 className="shockingdeal-slide-name">
                                            {(item.isTimeDeal || item.timeDeal) ? `[타임딜] ${item.name}` : item.name}
                                        </h3>
                                        <div className="shockingdeal-slide-price-row">
                                            <div>
                                                <span className="shockingdeal-slide-original-price">{item.originalPrice.toLocaleString()}원</span>
                                                <span className="shockingdeal-slide-price">{item.price.toLocaleString()}원</span>
                                            </div>
                                            <Link to={`/product/${item.id}`} className="shockingdeal-slide-buy-btn">
                                                구매하기
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Carousel Controls */}
                        <button onClick={prevSlide} className="shockingdeal-carousel-prev">
                            <ChevronLeft size={24} color="#333" />
                        </button>
                        <button onClick={nextSlide} className="shockingdeal-carousel-next">
                            <ChevronRight size={24} color="#333" />
                        </button>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="shockingdeal-decorative"></div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="shockingdeal-content">
                <h2 className="shockingdeal-section-title">
                    <span className="shockingdeal-section-icon">⚡</span>
                    지금 가장 핫한 딜
                </h2>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner" />
                    </div>
                ) : (
                    <>
                        <div className="shockingdeal-grid">
                            {shockingDeals.map((product, index) => (
                            <div key={`${product.id}-${index}`} className="shockingdeal-product-card">
                                {/* Badge */}
                                <div className="shockingdeal-product-badge">
                                    {product.discountRate || product.discount}% OFF
                                </div>

                                {/* Image */}
                                <div className="shockingdeal-product-image">
                                    <img
                                        src={product.imageUrl || product.image}
                                        alt={product.name}
                                        className="shockingdeal-product-img"
                                    />
                                </div>

                                {/* Content */}
                                <div className="shockingdeal-product-content">
                                    {product.stockQuantity !== undefined && (
                                        <>
                                            <div className="shockingdeal-product-stock">
                                                남은 수량 <span className="shockingdeal-product-stock-number">{product.stockQuantity}개</span>
                                            </div>

                                            {/* Stock Bar */}
                                            <div className="shockingdeal-product-stock-bar">
                                                <div className="shockingdeal-product-stock-bar-fill" style={{ width: `${Math.min((product.stockQuantity / 100) * 100, 100)}%` }}></div>
                                            </div>
                                        </>
                                    )}

                                    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                                        <h3 className="shockingdeal-product-name">
                                            {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                                        </h3>
                                    </Link>

                                    <div className="shockingdeal-product-price-row">
                                        <div>
                                            <div className="shockingdeal-product-original-price">
                                                {product.originalPrice.toLocaleString()}원
                                            </div>
                                            <div className="shockingdeal-product-price">
                                                {product.price.toLocaleString()}원
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => addToCart(product)}
                                            className="shockingdeal-product-cart-btn"
                                        >
                                            <ShoppingCart size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>

                        {/* 무한 스크롤 로더 */}
                        <div ref={loaderRef} style={{ height: '50px', margin: '20px 0' }}>
                            {loadingMore && (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <div className="spinner" />
                                </div>
                            )}
                            {!hasMore && shockingDeals.length > 0 && (
                                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
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
