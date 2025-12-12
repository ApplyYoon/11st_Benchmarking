import React, { useState, useEffect } from 'react';
import { PRODUCTS } from '../../api/mockData';
import ProductCard from '../shared/ProductCard';

const TimeDeal = () => {
    const deals = PRODUCTS.filter(p => p.isTimeDeal).slice(0, 3);
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const end = new Date();
            end.setHours(24, 0, 0, 0); // Midnight
            const diff = end - now;

            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / 1000 / 60) % 60);
            const s = Math.floor((diff / 1000) % 60);

            setTimeLeft({ h, m, s });
        };
        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft();
        return () => clearInterval(timer);
    }, []);

    const formatTime = (num) => String(num).padStart(2, '0');

    return (
        <div style={{ marginBottom: '60px' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                {deals.map(product => (
                    <div key={product.id} style={{ border: '1px solid #eee', borderRadius: '8px', padding: '0', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', paddingTop: '100%' }}>
                            <img src={product.image} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div style={{ fontSize: '16px', color: '#111', fontWeight: 'bold', height: '44px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', marginBottom: '10px' }}>
                                {product.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <span style={{ color: '#f01a21', fontSize: '24px', fontWeight: '900' }}>{product.discount}%</span>
                                <span style={{ color: '#111', fontSize: '24px', fontWeight: '900' }}>{product.price.toLocaleString()}</span>
                                <span style={{ fontSize: '14px' }}>원</span>
                            </div>
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px' }}>{product.originalPrice.toLocaleString()}원</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TimeDeal;
