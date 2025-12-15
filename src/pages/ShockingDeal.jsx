import React, { useState, useEffect } from 'react';
import { productApi } from '../api/productApi';
import { Link } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ShockingDeal = () => {
    const { addToCart } = useCart();

    // Filter Time Deal items (treated as Shocking Deal)
    const [shockingDeals, setShockingDeals] = useState([]);
    const [bannerItems, setBannerItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Countdown Timer Logic
    const [timeLeft, setTimeLeft] = useState('');

    // Banner Carousel State
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchTimeDealData = async () => {
            try {
                setLoading(true);
                const [products, endTimeData] = await Promise.all([
                    productApi.getTimeDealProducts(),
                    productApi.getTimeDealEndTime()
                ]);
                
                setShockingDeals(products);
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
        <div style={{ backgroundColor: '#f4f4f4', minHeight: '100vh', paddingBottom: '50px' }}>
            {/* Hero Banner with Carousel */}
            <div style={{
                background: 'linear-gradient(90deg, #d32323 0%, #f15757 100%)',
                color: 'white',
                padding: '40px 0',
                marginBottom: '30px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

                    {/* Left: Branding & Timer */}
                    <div style={{ flex: 1, paddingRight: '40px', zIndex: 2 }}>
                        <h1 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '15px', fontStyle: 'italic', textShadow: '2px 2px 4px rgba(0,0,0,0.2)', lineHeight: 1.1 }}>
                            SHOCKING<br />DEAL
                        </h1>
                        <p style={{ fontSize: '22px', marginBottom: '30px', opacity: 0.9, fontWeight: '500' }}>
                            오늘만 이 가격! 망설이면 품절됩니다.
                        </p>
                        <div style={{
                            display: 'inline-block',
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            padding: '12px 35px',
                            borderRadius: '50px',
                            fontSize: '28px',
                            fontWeight: 'bold',
                            border: '2px solid rgba(255,255,255,0.3)',
                            backdropFilter: 'blur(5px)'
                        }}>
                            남은 시간 <span style={{ color: '#fff000', marginLeft: '10px', fontFamily: 'monospace' }}>{timeLeft}</span>
                        </div>
                    </div>

                    {/* Right: Product Carousel */}
                    <div style={{ width: '640px', position: 'relative', zIndex: 2 }}>
                        <div style={{
                            backgroundColor: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                            height: '320px',
                            display: 'flex'
                        }}>
                            {/* Individual Slide */}
                            {bannerItems.map((item, index) => (
                                <div key={item.id} style={{
                                    minWidth: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'transform 0.5s ease-in-out',
                                    transform: `translateX(-${currentSlide * 100}%)`
                                }}>
                                    <div style={{ height: '60%', overflow: 'hidden', position: 'relative' }}>
                                        <img src={item.imageUrl || item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', top: 0, left: 0, padding: '10px 20px', background: '#f01a21', color: 'white', fontWeight: 'bold', fontSize: '18px', borderRadius: '0 0 10px 0' }}>
                                            {item.discountRate || item.discount}% OFF
                                        </div>
                                    </div>
                                    <div style={{ padding: '20px', height: '40%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <h3 style={{ color: '#333', margin: '0 0 10px 0', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {(item.isTimeDeal || item.timeDeal) ? `[타임딜] ${item.name}` : item.name}
                                        </h3>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px', marginRight: '8px' }}>{item.originalPrice.toLocaleString()}원</span>
                                                <span style={{ color: '#f01a21', fontSize: '24px', fontWeight: 'bold' }}>{item.price.toLocaleString()}원</span>
                                            </div>
                                            <Link to={`/product/${item.id}`} style={{ padding: '8px 20px', backgroundColor: '#333', color: 'white', textDecoration: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                                                구매하기
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Carousel Controls */}
                        <button onClick={prevSlide} style={{ position: 'absolute', top: '50%', left: '-20px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: 'white', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                            <ChevronLeft size={24} color="#333" />
                        </button>
                        <button onClick={nextSlide} style={{ position: 'absolute', top: '50%', right: '-20px', transform: 'translateY(-50%)', width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: 'white', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                            <ChevronRight size={24} color="#333" />
                        </button>
                    </div>

                    {/* Decorative Background Element */}
                    <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', zIndex: 1, pointerEvents: 'none' }}></div>
                </div>
            </div>

            {/* Product Grid */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#f01a21', marginRight: '10px' }}>⚡</span>
                    지금 가장 핫한 딜
                </h2>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                        <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                        {shockingDeals.map(product => (
                        <div key={product.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            position: 'relative',
                            transition: 'transform 0.2s',
                        }}>
                            {/* Badge */}
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                left: '0',
                                backgroundColor: '#f01a21',
                                color: 'white',
                                padding: '5px 15px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                borderRadius: '0 4px 4px 0',
                                zIndex: 1
                            }}>
                                {product.discountRate || product.discount}% OFF
                            </div>

                            {/* Image */}
                            <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                                <img
                                    src={product.imageUrl || product.image}
                                    alt={product.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            {/* Content */}
                            <div style={{ padding: '20px' }}>
                                {product.stockQuantity !== undefined && (
                                    <>
                                        <div style={{ fontSize: '13px', color: '#888', marginBottom: '5px' }}>
                                            남은 수량 <span style={{ color: '#f01a21', fontWeight: 'bold' }}>{product.stockQuantity}개</span>
                                        </div>

                                        {/* Stock Bar */}
                                        <div style={{
                                            width: '100%',
                                            height: '6px',
                                            backgroundColor: '#eee',
                                            borderRadius: '3px',
                                            marginBottom: '15px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${Math.min((product.stockQuantity / 100) * 100, 100)}%`,
                                                height: '100%',
                                                backgroundColor: '#f01a21',
                                                borderRadius: '3px'
                                            }}></div>
                                        </div>
                                    </>
                                )}

                                <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: '#333' }}>
                                    <h3 style={{
                                        fontSize: '16px',
                                        fontWeight: 'normal',
                                        lineHeight: '1.4',
                                        marginBottom: '15px',
                                        height: '44px',
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical'
                                    }}>
                                        {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                                    </h3>
                                </Link>

                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ textDecoration: 'line-through', color: '#aaa', fontSize: '13px' }}>
                                            {product.originalPrice.toLocaleString()}원
                                        </div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#f01a21' }}>
                                            {product.price.toLocaleString()}원
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => addToCart(product)}
                                        style={{
                                            backgroundColor: '#333',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShockingDeal;
