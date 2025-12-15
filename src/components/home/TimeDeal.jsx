import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';

const TimeDeal = () => {
    const [deals, setDeals] = useState([]);
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTimeDealData = async () => {
            try {
                setLoading(true);
                const [products, endTimeData] = await Promise.all([
                    productApi.getTimeDealProducts(),
                    productApi.getTimeDealEndTime()
                ]);
                
                setDeals(products.slice(0, 3));
                
                if (endTimeData.endTime) {
                    const endTime = new Date(endTimeData.endTime);
                    const calculateTimeLeft = () => {
                        const now = new Date();
                        const diff = endTime - now;

                        if (diff <= 0) {
                            setTimeLeft({ h: 0, m: 0, s: 0 });
                            return;
                        }

                        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                        const m = Math.floor((diff / 1000 / 60) % 60);
                        const s = Math.floor((diff / 1000) % 60);

                        setTimeLeft({ h, m, s });
                    };
                    
                    calculateTimeLeft();
                    const timer = setInterval(calculateTimeLeft, 1000);
                    return () => clearInterval(timer);
                } else {
                    const calculateTimeLeft = () => {
                        const now = new Date();
                        const end = new Date();
                        end.setHours(24, 0, 0, 0);
                        const diff = end - now;

                        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                        const m = Math.floor((diff / 1000 / 60) % 60);
                        const s = Math.floor((diff / 1000) % 60);

                        setTimeLeft({ h, m, s });
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

    const formatTime = (num) => String(num).padStart(2, '0');

    return (
        <div id="timedeal-section" className="timedeal-section">
            <div className="section-header">
                <div className="timedeal-header">
                    <h2 className="section-title">타임딜</h2>
                    <div className="timedeal-timer">
                        <div className="timer-digit">{formatTime(timeLeft.h)}</div>
                        <span>:</span>
                        <div className="timer-digit">{formatTime(timeLeft.m)}</div>
                        <span>:</span>
                        <div className="timer-digit seconds">{formatTime(timeLeft.s)}</div>
                    </div>
                </div>
                <Link to='/shocking-deal'><span className="section-more">더보기 &gt;</span></Link>
            </div>

            {loading ? (
                <div className="loading-container-small">
                    <div className="spinner" />
                </div>
            ) : (
                <div className="product-grid-3">
                    {deals.map(product => (
                        <Link to={`/product/${product.id}`} key={product.id} className="product-card-link">
                            <div className="timedeal-card">
                                <div className="timedeal-image-container">
                                    <img src={product.imageUrl || product.image} className="timedeal-image" alt="" />
                                </div>
                                <div className="timedeal-content">
                                    <div className="timedeal-name">
                                        {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                                    </div>
                                    <div className="timedeal-price-row">
                                        <span className="timedeal-discount">{product.discountRate || product.discount}%</span>
                                        <span className="timedeal-price">{product.price.toLocaleString()}</span>
                                        <span className="product-card-currency">원</span>
                                    </div>
                                    <div className="timedeal-original-price">{product.originalPrice.toLocaleString()}원</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimeDeal;
