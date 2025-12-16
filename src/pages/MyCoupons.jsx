import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { couponApi } from '../api/productApi';
import '../styles.css';

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
                // is_used가 false인 쿠폰만 표시
                setMyCoupons(coupons.filter(coupon => !coupon.isUsed));
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
            <div className="mycoupons-login-required">
                <p>로그인이 필요한 서비스입니다.</p>
                <button onClick={() => navigate('/login')} className="mycoupons-login-btn">
                    로그인하러 가기
                </button>
            </div>
        );
    }

    return (
        <div className="mycoupons-container">
            <div className="mycoupons-inner">
                <h1 className="mycoupons-title">나의 쿠폰</h1>

                <div className="mycoupons-box">
                    <div className="mycoupons-header">
                        <div className="mycoupons-count">
                            보유 쿠폰 <span className="mycoupons-count-number">{myCoupons.length}</span>장
                        </div>
                        <button className="mycoupons-register-btn">
                            + 쿠폰 등록하기
                        </button>
                    </div>

                    {loading ? (
                        <div className="mycoupons-loading">
                            <div className="spinner" />
                        </div>
                    ) : myCoupons.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {myCoupons
                                .filter(coupon => !coupon.isUsed)
                                .map(coupon => (
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
                                        <div className="mycoupons-discount">
                                            {coupon.type === 'amount'
                                                ? `${coupon.discountAmount.toLocaleString()}원 할인`
                                                : `${coupon.discountRate}% 할인`
                                            }
                                        </div>
                                        <div className="mycoupons-name">
                                            {coupon.name}
                                        </div>
                                        <div className="mycoupons-condition">
                                            {coupon.minOrderAmount ? `${coupon.minOrderAmount.toLocaleString()}원 이상 구매 시` : '조건 없음'}
                                            {coupon.maxDiscountAmount && ` (최대 ${coupon.maxDiscountAmount.toLocaleString()}원)`}
                                        </div>
                                    </div>
                                    <div className="mycoupons-validity">
                                        유효기간: {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString('ko-KR') : '제한 없음'} 까지
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mycoupons-empty">
                            보유한 쿠폰이 없습니다.
                        </div>
                    )}
                </div>

                <div className="mycoupons-actions">
                    <button onClick={() => navigate('/')} className="mycoupons-shopping-btn">
                        쇼핑하러 가기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyCoupons;
