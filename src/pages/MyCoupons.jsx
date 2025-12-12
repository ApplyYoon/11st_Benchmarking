import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyCoupons = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Mock coupon data based on AuthContext or static for now
    const coupons = [
        {
            id: 1,
            name: '신규 회원 가입 감사 쿠폰',
            discount: '5,000원',
            minAmount: '30,000원 이상 구매 시',
            validUntil: '2025-12-31',
            type: 'amount'
        },
        {
            id: 2,
            name: '11절 특별 할인 쿠폰',
            discount: '11%',
            minAmount: '10,000원 이상 구매 시 (최대 5,000원)',
            validUntil: '2025-11-11',
            type: 'percent'
        },
        {
            id: 3,
            name: '무료 배송 쿠폰',
            discount: '배송비 무료',
            minAmount: '10,000원 이상 구매 시',
            validUntil: '2025-12-31',
            type: 'delivery'
        }
    ];

    return (
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', padding: '40px 0' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>나의 쿠폰</h1>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                        <div style={{ fontSize: '18px' }}>
                            보유 쿠폰 <span style={{ color: '#f01a21', fontWeight: 'bold' }}>{coupons.length}</span>장
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

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {coupons.map(coupon => (
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
                                        {coupon.discount}
                                    </div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                                        {coupon.name}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#888' }}>
                                        {coupon.minAmount}
                                    </div>
                                </div>
                                <div style={{ fontSize: '12px', color: '#666', borderTop: '1px dashed #eee', paddingTop: '10px', marginTop: '15px' }}>
                                    유효기간: {coupon.validUntil} 까지
                                </div>
                            </div>
                        ))}
                    </div>
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
