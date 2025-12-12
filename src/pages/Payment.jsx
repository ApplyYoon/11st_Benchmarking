import React, { useEffect, useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COUPONS } from '../api/mockData';

const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addOrder, user } = useAuth();
    const [status, setStatus] = useState('ready');
    const [paymentMethod, setPaymentMethod] = useState('카카오페이');

    // 쿠폰 관련 상태
    const [selectedCouponId, setSelectedCouponId] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    // 배송 정보 상태
    const [shippingInfo, setShippingInfo] = useState({
        recipient: user?.name || '',
        postalCode: '',
        baseAddress: '',
        detailAddress: '',
        phone: ''
    });

    const { amount, orderName, category } = location.state || {}; // category 추가

    // 사용자의 보유 쿠폰 매핑 및 사용 가능 여부 계산
    const userCoupons = React.useMemo(() => {
        if (!user || (!user.coupons)) return [];
        return user.coupons
            .map(id => {
                const coupon = COUPONS.find(c => c.id === id);
                if (!coupon) return null;

                // 1. 최소 주문금액 체크
                const isAmountSatisfied = !coupon.minOrderAmount || coupon.minOrderAmount <= amount;

                // 2. 카테고리 체크
                const isCategorySatisfied = !coupon.category || coupon.category === category;

                // 비활성화 사유
                let reason = '';
                if (!isAmountSatisfied) reason = `최소주문 ${coupon.minOrderAmount.toLocaleString()}원 이상`;
                else if (!isCategorySatisfied) {
                    const categoryName = coupon.category === 'fashion' ? '의류' : coupon.category;
                    reason = `${categoryName} 전용`;
                }

                return {
                    ...coupon,
                    isApplicable: isAmountSatisfied && isCategorySatisfied,
                    reason: reason
                };
            })
            .filter(Boolean); // 유효하지 않은 ID 제거
    }, [user, amount, category]);

    // 쿠폰 선택 핸들러
    const handleCouponChange = (e) => {
        const couponId = Number(e.target.value);

        // 유효성 검사 (혹시 비활성화된 쿠폰을 선택하려 할 경우 방지)
        const selectedCoupon = userCoupons.find(c => c.id === couponId);
        if (couponId && selectedCoupon && !selectedCoupon.isApplicable) {
            alert('이 쿠폰은 현재 주문에 적용할 수 없습니다.\n사유: ' + selectedCoupon.reason);
            return;
        }

        setSelectedCouponId(couponId);

        if (!couponId) {
            setDiscountAmount(0);
            return;
        }

        if (selectedCoupon) {
            let discount = 0;
            if (selectedCoupon.type === 'amount') {
                discount = selectedCoupon.discountAmount;
            } else if (selectedCoupon.type === 'percent') {
                discount = Math.floor(amount * (selectedCoupon.discountRate / 100));
                if (selectedCoupon.maxDiscountAmount) {
                    discount = Math.min(discount, selectedCoupon.maxDiscountAmount);
                }
            }
            setDiscountAmount(discount);
        }
    };

    const finalAmount = amount ? amount - discountAmount : 0;

    // 적립 포인트 계산: 실 결제 금액의 0.5%, 최대 5000포인트
    const calculateEarnedPoints = (payAmount) => {
        const basePoints = Math.floor(payAmount * 0.005); // 0.5%
        return Math.min(basePoints, 5000); // 최대 5000포인트
    };

    const earnedPoints = finalAmount ? calculateEarnedPoints(finalAmount) : 0;

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amountVal = urlParams.get('amount');

        if (paymentKey && orderId && amountVal) {
            setStatus('success');
            clearCart();
            const orderAmount = parseInt(amountVal);
            const earnedPoints = calculateEarnedPoints(orderAmount);

            addOrder({
                id: orderId,
                name: '상품 결제',
                amount: orderAmount,
                date: new Date().toISOString().split('T')[0],
                status: '주문완료',
                earnedPoints: earnedPoints
            });
        }
    }, []);

    const handleInputChange = (field, value) => {
        setShippingInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddressSearch = () => {
        alert('주소 검색 기능은 Daum 우편번호 API를 연동하여 구현할 수 있습니다.');
        setShippingInfo(prev => ({
            ...prev,
            postalCode: '06234',
            baseAddress: '서울시 강남구 테헤란로 123'
        }));
    };

    const validateShippingInfo = () => {
        if (!shippingInfo.recipient) {
            alert('받는 사람을 입력해주세요.');
            return false;
        }
        if (!shippingInfo.postalCode || !shippingInfo.baseAddress) {
            alert('주소를 입력해주세요.');
            return false;
        }
        if (!shippingInfo.detailAddress) {
            alert('상세 주소를 입력해주세요.');
            return false;
        }
        if (!shippingInfo.phone) {
            alert('휴대폰 번호를 입력해주세요.');
            return false;
        }
        return true;
    };

    const handleTossPayment = async () => {
        if (!validateShippingInfo()) {
            return;
        }

        const tossPayments = await loadTossPayments(clientKey);
        const orderId = `ORDER_${Date.now()}`;

        // 카카오페이 바로 결제 요청 (할인된 금액으로 요청)
        await tossPayments.requestPayment('카드', {
            amount: finalAmount,
            orderId: orderId,
            orderName: orderName,
            customerName: shippingInfo.recipient,
            successUrl: window.location.origin + '/payment?earnedPoints=' + earnedPoints,
            failUrl: window.location.origin + '/payment',
            flowMode: 'DIRECT',
            easyPay: 'KAKAOPAY'
        });
    };

    if (status === 'processing') {
        return <div style={{ textAlign: 'center', padding: '100px' }}>결제 승인 중입니다...</div>;
    }

    if (status === 'fail') {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <h2>결제 실패</h2>
                <p>{errorMsg}</p>
                <button onClick={() => navigate('/cart')}>장바구니로 돌아가기</button>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', paddingTop: '60px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '60px 40px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{ fontSize: '72px', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px', color: '#111' }}>
                            주문이 완료되었습니다
                        </h2>
                        <p style={{ color: '#666', fontSize: '15px', marginBottom: '40px' }}>
                            11번가를 이용해 주셔서 감사합니다.
                        </p>

                        <div style={{
                            backgroundColor: '#f8f8f8',
                            padding: '20px',
                            borderRadius: '6px',
                            marginBottom: '40px',
                            textAlign: 'left'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#666', fontSize: '14px' }}>주문번호</span>
                                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>ORDER_{Date.now()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ color: '#666', fontSize: '14px' }}>결제금액</span>
                                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#f01a21' }}>
                                    {location.state?.amount?.toLocaleString()}원
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={() => navigate('/mypage')}
                                style={{
                                    flex: 1,
                                    maxWidth: '200px',
                                    padding: '16px 30px',
                                    border: '1px solid #e5e5e5',
                                    background: 'white',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    color: '#333',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f8f8'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                            >
                                주문내역 보기
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                style={{
                                    flex: 1,
                                    maxWidth: '200px',
                                    padding: '16px 30px',
                                    backgroundColor: '#f01a21',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#d01519'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = '#f01a21'}
                            >
                                쇼핑 계속하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!amount) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '100px 20px',
                color: '#999'
            }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>잘못된 접근입니다</div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', paddingTop: '40px', paddingBottom: '60px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111', marginBottom: '30px' }}>
                    주문/결제
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>

                    {/* 왼쪽 컨텐츠 */}
                    <div>
                        {/* 주문 상품 */}
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>
                                주문상품
                            </h2>
                            <div style={{ padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '6px', fontSize: '15px' }}>
                                <div style={{ fontWeight: 'bold', color: '#333' }}>{orderName}</div>
                            </div>
                        </div>

                        {/* 쿠폰 할인 */}
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', margin: 0 }}>
                                    쿠폰 할인
                                </h2>
                                {discountAmount > 0 && (
                                    <span style={{ color: '#f01a21', fontWeight: 'bold' }}>
                                        -{discountAmount.toLocaleString()}원 할인 적용 중
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <select
                                    value={selectedCouponId}
                                    onChange={handleCouponChange}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '4px',
                                        border: '1px solid #e5e5e5',
                                        fontSize: '14px',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">쿠폰을 선택해 주세요</option>
                                    {userCoupons.map(coupon => (
                                        <option
                                            key={coupon.id}
                                            value={coupon.id}
                                            disabled={!coupon.isApplicable}
                                            style={{ color: !coupon.isApplicable ? '#ccc' : '#333' }}
                                        >
                                            {coupon.name}
                                            {coupon.type === 'amount'
                                                ? ` (${coupon.discountAmount.toLocaleString()}원 할인)`
                                                : ` (${coupon.discountRate}% 할인)`
                                            }
                                            {!coupon.isApplicable && ` [${coupon.reason}]`}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '13px', color: '#888' }}>
                                    * 조건이 맞지 않는 쿠폰은 선택할 수 없습니다.
                                </div>
                            </div>
                        </div>

                        {/* 배송 정보 */}
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>
                                배송정보
                            </h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                        받는 사람 <span style={{ color: '#f01a21' }}>*</span>
                                    </label>
                                    <input type="text" value={shippingInfo.recipient} onChange={(e) => handleInputChange('recipient', e.target.value)} placeholder="받는 사람 이름을 입력하세요" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#f01a21'} onBlur={(e) => e.target.style.borderColor = '#e5e5e5'} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                        주소 <span style={{ color: '#f01a21' }}>*</span>
                                    </label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input type="text" value={shippingInfo.postalCode} readOnly placeholder="우편번호" style={{ flex: 1, padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f8f8f8', boxSizing: 'border-box' }} />
                                        <button onClick={handleAddressSearch} style={{ padding: '12px 24px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#555'} onMouseLeave={(e) => e.target.style.backgroundColor = '#666'}>주소 찾기</button>
                                    </div>
                                    <input type="text" value={shippingInfo.baseAddress} readOnly placeholder="기본 주소" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f8f8f8', marginBottom: '10px', boxSizing: 'border-box' }} />
                                    <input type="text" value={shippingInfo.detailAddress} onChange={(e) => handleInputChange('detailAddress', e.target.value)} placeholder="상세 주소 및 건물명을 입력하세요" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#f01a21'} onBlur={(e) => e.target.style.borderColor = '#e5e5e5'} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                                        휴대폰 번호 <span style={{ color: '#f01a21' }}>*</span>
                                    </label>
                                    <input type="tel" value={shippingInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="010-0000-0000" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} onFocus={(e) => e.target.style.borderColor = '#f01a21'} onBlur={(e) => e.target.style.borderColor = '#e5e5e5'} />
                                </div>
                            </div>
                        </div>

                        {/* 결제 수단 */}
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>
                                결제수단 <span style={{ color: '#f01a21' }}>*</span>
                            </h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button style={{ padding: '12px 24px', border: '2px solid #fecb02', backgroundColor: '#fffbe6', color: '#3c1e1e', borderRadius: '6px', cursor: 'default', fontSize: '15px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center', maxWidth: '200px' }}>
                                    <span style={{ fontSize: '18px' }}>💬</span> 카카오페이
                                </button>
                            </div>
                            <div style={{ marginTop: '15px', padding: '12px 15px', backgroundColor: '#f8f8f8', borderRadius: '4px', fontSize: '13px', color: '#666' }}>
                                선택된 결제수단: <strong style={{ color: '#333' }}>카카오페이</strong>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 결제 금액 */}
                    <div>
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>
                                결제금액
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid #e5e5e5', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#666' }}>상품금액</span>
                                    <span style={{ color: '#333' }}>{amount?.toLocaleString()}원</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#666' }}>배송비</span>
                                    <span style={{ color: '#333' }}>무료</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                    <span style={{ color: '#666' }}>할인금액</span>
                                    <span style={{ color: '#f01a21' }}>-{discountAmount.toLocaleString()}원</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '20px' }}>
                                <span style={{ fontWeight: 'bold', color: '#111' }}>최종 결제금액</span>
                                <span style={{ fontWeight: '900', color: '#f01a21' }}>
                                    {finalAmount.toLocaleString()}원
                                </span>
                            </div>

                            <div style={{ padding: '15px', backgroundColor: '#fff5f5', borderRadius: '6px', marginBottom: '25px', border: '1px solid #ffe5e5' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#f01a21' }}>💰 적립 예정</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', color: '#666' }}>
                                        구매 확정 시 (0.5%, 최대 5,000P)
                                    </span>
                                    <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f01a21' }}>
                                        {earnedPoints.toLocaleString()}P
                                    </span>
                                </div>
                            </div>

                            <button onClick={handleTossPayment} style={{ width: '100%', padding: '18px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '6px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#d01519'} onMouseLeave={(e) => e.target.style.backgroundColor = '#f01a21'}>
                                {finalAmount.toLocaleString()}원 결제하기
                            </button>

                            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f8f8', borderRadius: '6px', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                                • 주문 내용을 확인하였으며, 정보 제공 등에 동의합니다.<br />
                                • 결제 대행 서비스: 토스페이먼츠
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
