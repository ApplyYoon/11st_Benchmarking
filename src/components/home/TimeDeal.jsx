import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/productApi';
import '../../styles/TimeDeal.css';

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
                
                // 타임딜 종료 시간 설정
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
                    // 종료 시간이 없으면 자정으로 설정
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
            <div className="timedeal-header">
                <div className="timedeal-header-left">
                    <h2 className="timedeal-title">타임딜</h2>
                    <div className="timedeal-timer">
                        <div className="timedeal-timer-box">{formatTime(timeLeft.h)}</div>
                        <span>:</span>
                        <div className="timedeal-timer-box">{formatTime(timeLeft.m)}</div>
                        <span>:</span>
                        <div className="timedeal-timer-box timedeal-timer-box-seconds">{formatTime(timeLeft.s)}</div>
                    </div>
                </div>
                <Link to='/shocking-deal'><span className="timedeal-more">더보기 &gt;</span></Link>
            </div>

            {loading ? (
                <div className="timedeal-loading">
                    <div className="timedeal-spinner" />
                </div>
            ) : (
                <div className="timedeal-grid">
                    {deals.map(product => (
                        <Link to={`/product/${product.id}`} key={product.id} className="timedeal-product-link">
                            <div className="timedeal-product-card">
                                <div className="timedeal-product-image-container">
                                    <img src={product.imageUrl || product.image} className="timedeal-product-image" alt="" />
                                </div>
                                <div className="timedeal-product-content">
                                    <div className="timedeal-product-name">
                                        {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                                    </div>
                                    <div className="timedeal-product-price-row">
                                        <span className="timedeal-product-discount">{product.discountRate || product.discount}%</span>
                                        <span className="timedeal-product-price">{product.price.toLocaleString()}</span>
                                        <span className="timedeal-product-price-unit">원</span>
                                    </div>
                                    <div className="timedeal-product-original-price">{product.originalPrice.toLocaleString()}원</div>
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
