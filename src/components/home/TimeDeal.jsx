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
        <div id="timedeal-section" style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#111' }}>타임딜</h2>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                        <div style={{ backgroundColor: '#333', color: 'white', borderRadius: '4px', padding: '0 6px', minWidth: '40px', textAlign: 'center' }}>{formatTime(timeLeft.h)}</div>
                        <span>:</span>
                        <div style={{ backgroundColor: '#333', color: 'white', borderRadius: '4px', padding: '0 6px', minWidth: '40px', textAlign: 'center' }}>{formatTime(timeLeft.m)}</div>
                        <span>:</span>
                        <div style={{ backgroundColor: '#f01a21', color: 'white', borderRadius: '4px', padding: '0 6px', minWidth: '40px', textAlign: 'center' }}>{formatTime(timeLeft.s)}</div>
                    </div>
                </div>
                <span style={{ fontSize: '14px', color: '#666', cursor: 'pointer' }}>더보기 &gt;</span>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    {deals.map(product => (
                        <Link to={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                                <div style={{ position: 'relative', paddingTop: '100%' }}>
                                    <img src={product.imageUrl || product.image} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ fontSize: '16px', color: '#111', fontWeight: 'bold', height: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '10px' }}>
                                        {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <span style={{ color: '#f01a21', fontSize: '24px', fontWeight: '900' }}>{product.discountRate || product.discount}%</span>
                                        <span style={{ color: '#111', fontSize: '24px', fontWeight: '900' }}>{product.price.toLocaleString()}</span>
                                        <span style={{ fontSize: '14px' }}>원</span>
                                    </div>
                                    <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>{product.originalPrice.toLocaleString()}원</div>
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
