import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { couponApi } from '../api/productApi';

const MyCoupons = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [myCoupons, setMyCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const coupons = await couponApi.getMyCoupons();
                setMyCoupons(coupons);
            } catch (error) {
                console.error('쿠폰 로딩 실패:', error);
                setMyCoupons([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, [user]);

    // 로그인하지 않은 경우 처리
    if (!user) {
        return (
            <div style={{ padding: '50px', textAlign: 'center' }}>
                <p>로그인이 필요한 서비스입니다.</p>
                <button onClick={() => navigate('/login')} style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}>
                    로그인하러 가기
                </button>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', padding: '40px 0' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>나의 쿠폰</h1>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                        <div style={{ fontSize: '18px' }}>
                            보유 쿠폰 <span style={{ color: '#f01a21', fontWeight: 'bold' }}>{myCoupons.length}</span>장
                        </div>
                        <button
                            style={{
                                padding: '8px 16px',
                                border: '1px solid #ddd',
                                backgroundColor: 'white',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            + 쿠폰 등록하기
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
                            <div style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #f01a21', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        </div>
                    ) : myCoupons.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {myCoupons.map(coupon => (
                                <div key={coupon.id} style={{
                                    border: '1px solid #e5e5e5',
                                    borderRadius: '8px',
                                    padding: '20px',
                                    position: 'relative',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '180px',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
                                }}>
                                    <div>
                                        <div style={{
                                            color: '#f01a21',
                                            fontWeight: 'bold',
                                            fontSize: '24px',
                                            marginBottom: '5px'
                                        }}>
                                            {coupon.type === 'amount'
                                                ? `${coupon.discountAmount.toLocaleString()}원 할인`
                                                : `${coupon.discountRate}% 할인`
                                            }
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                                            {coupon.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#888' }}>
                                            {coupon.minOrderAmount ? `${coupon.minOrderAmount.toLocaleString()}원 이상 구매 시` : '조건 없음'}
                                            {coupon.maxDiscountAmount && ` (최대 ${coupon.maxDiscountAmount.toLocaleString()}원)`}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#666', borderTop: '1px dashed #eee', paddingTop: '10px', marginTop: '15px' }}>
                                        유효기간: {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString('ko-KR') : '제한 없음'} 까지
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '50px 0', color: '#888' }}>
                            보유한 쿠폰이 없습니다.
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            padding: '15px 40px',
                            backgroundColor: '#333',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        쇼핑하러 가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyCoupons;
