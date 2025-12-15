import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { COUPONS } from '../api/mockData';
import client from '../api/client';

const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addOrder, user, loadUser } = useAuth();

    // Payment Status State
    const [status, setStatus] = useState('ready');
    const [errorMsg, setErrorMsg] = useState('');

    // Form and Payment Method State
    const [paymentMethod, setPaymentMethod] = useState('카카오페이');
    const [shippingInfo, setShippingInfo] = useState({
        recipient: user?.name || '',
        postalCode: user?.zipCode || '',
        baseAddress: user?.address || '',
        detailAddress: user?.detailAddress || '',
        phone: ''
    });

    // Update shipping info when user data loads
    useEffect(() => {
        if (user) {
            setShippingInfo(prev => ({
                ...prev,
                recipient: prev.recipient || user.name || '',
                postalCode: prev.postalCode || user.zipCode || '',
                baseAddress: prev.baseAddress || user.address || '',
                detailAddress: prev.detailAddress || user.detailAddress || ''
            }));
        }
    }, [user]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Coupon State
    const [selectedCouponId, setSelectedCouponId] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    // Destructure location state
    const { amount, orderName, category } = location.state || {};

    const finalAmount = amount ? amount - discountAmount : 0;

    // Point Calculation: 0.5%, max 5000
    const calculateEarnedPoints = (payAmount) => {
        const basePoints = Math.floor(payAmount * 0.005);
        return Math.min(basePoints, 5000);
    };

    const earnedPoints = finalAmount ? calculateEarnedPoints(finalAmount) : 0;

    // Coupon Logic
    const userCoupons = useMemo(() => {
        if (!user || !user.coupons) return [];
        return user.coupons
            .map(id => {
                const coupon = COUPONS.find(c => c.id === id);
                if (!coupon) return null;

                const isAmountSatisfied = !coupon.minOrderAmount || coupon.minOrderAmount <= amount;
                const isCategorySatisfied = !coupon.category || coupon.category === category;

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
            .filter(Boolean);
    }, [user, amount, category]);

    const handleCouponChange = (e) => {
        const couponId = Number(e.target.value);
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

    // Payment Processing Effect - KakaoPay 인증 후 돌아왔을 때 처리
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amountVal = urlParams.get('amount');

        // KakaoPay 인증 완료 후 redirect로 돌아온 경우
        if (paymentKey && orderId && amountVal) {
            const saveDemoOrder = async () => {
                setStatus('processing');
                try {
                    // 토스 API 승인 대신 데모 주문 생성 (테스트 키로는 실제 승인 불가)
                    // 클론코딩/포트폴리오 목적이므로 결제 흐름만 시연
                    const response = await client.post('/orders/demo', {
                        orderName: decodeURIComponent(urlParams.get('orderName') || '상품 결제'),
                        amount: parseInt(amountVal)
                    });

                    setStatus('success');
                    clearCart();
                    await loadUser(); // 주문 목록 새로고침
                    console.log("KakaoPay Demo Order Created:", response.data);

                } catch (err) {
                    console.error("Demo Order Failed", err);
                    setStatus('fail');
                    setErrorMsg(err.response?.data?.message || '주문 생성 중 오류가 발생했습니다.');
                }
            };
            saveDemoOrder();
        }
    }, []);

    // Handlers
    const handleInputChange = (field, value) => {
        setShippingInfo(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressSearch = () => {
        setIsAddressModalOpen(true);
    };

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') extraAddress += data.bname;
            if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setShippingInfo(prev => ({
            ...prev,
            postalCode: data.zonecode,
            baseAddress: fullAddress
        }));
        setIsAddressModalOpen(false);
    };

    const validateShippingInfo = () => {
        if (!shippingInfo.recipient) { alert('받는 사람을 입력해주세요.'); return false; }
        if (!shippingInfo.postalCode || !shippingInfo.baseAddress) { alert('주소를 입력해주세요.'); return false; }
        if (!shippingInfo.detailAddress) { alert('상세 주소를 입력해주세요.'); return false; }
        if (!shippingInfo.phone) { alert('휴대폰 번호를 입력해주세요.'); return false; }
        return true;
    };

    // 카카오페이 결제 시작 (토스 위젯으로 QR 표시)
    const handleKakaoPayment = async () => {
        if (!validateShippingInfo()) return;

        try {
            const tossPayments = await loadTossPayments(clientKey);
            const orderId = `ORDER_${Date.now()}`;

            await tossPayments.requestPayment('카드', {
                amount: finalAmount,
                orderId: orderId,
                orderName: orderName,
                customerName: shippingInfo.recipient,
                successUrl: window.location.origin + `/payment?orderName=${encodeURIComponent(orderName)}`,
                failUrl: window.location.origin + '/payment',
                flowMode: 'DIRECT',
                easyPay: 'KAKAOPAY'
            });
        } catch (err) {
            console.error(err);
            // 사용자가 결제창을 닫은 경우 등 - 무시
            if (err.code !== 'USER_CANCEL') {
                setStatus('fail');
                setErrorMsg('결제 초기화 중 오류가 발생했습니다.');
            }
        }
    };

    // Render Logic
    if (status === 'processing') return <div style={{ textAlign: 'center', padding: '100px' }}>결제 승인 중입니다...</div>;
    if (status === 'fail') return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <h2>결제 실패</h2>
            <p>{errorMsg}</p>
            <button onClick={() => navigate('/cart')}>장바구니로 돌아가기</button>
        </div>
    );
    if (status === 'success') return (
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', paddingTop: '60px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <div style={{ fontSize: '72px', marginBottom: '20px' }}>✅</div>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px', color: '#111' }}>주문이 완료되었습니다</h2>
                    <p style={{ color: '#666', fontSize: '15px', marginBottom: '40px' }}>11번가를 이용해 주셔서 감사합니다.</p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        <button onClick={() => navigate('/mypage')} style={{ flex: 1, maxWidth: '200px', padding: '16px 30px', border: '1px solid #e5e5e5', background: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold', color: '#333' }}>주문내역 보기</button>
                        <button onClick={() => navigate('/')} style={{ flex: 1, maxWidth: '200px', padding: '16px 30px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', fontWeight: 'bold' }}>쇼핑 계속하기</button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!amount) return (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>잘못된 접근입니다</div>
        </div>
    );

    return (
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', paddingTop: '40px', paddingBottom: '60px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111', marginBottom: '30px' }}>주문/결제</h1>

                {isAddressModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0 }}>주소 찾기</h3>
                                <button onClick={() => setIsAddressModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                            </div>
                            <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '400px' }} />
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '20px' }}>
                    {/* Left Column */}
                    <div>
                        {/* Order Product */}
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>주문상품</h2>
                            <div style={{ padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '6px', fontSize: '15px' }}>
                                <div style={{ fontWeight: 'bold', color: '#333' }}>{orderName}</div>
                            </div>
                        </div>

                        {/* Coupon Discount */}
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', margin: 0 }}>쿠폰 할인</h2>
                                {discountAmount > 0 && <span style={{ color: '#f01a21', fontWeight: 'bold' }}>-{discountAmount.toLocaleString()}원 할인 적용 중</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <select value={selectedCouponId} onChange={handleCouponChange} style={{ padding: '12px', borderRadius: '4px', border: '1px solid #e5e5e5', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
                                    <option value="">쿠폰을 선택해 주세요</option>
                                    {userCoupons.map(coupon => (
                                        <option key={coupon.id} value={coupon.id} disabled={!coupon.isApplicable} style={{ color: !coupon.isApplicable ? '#ccc' : '#333' }}>
                                            {coupon.name}
                                            {coupon.type === 'amount' ? ` (${coupon.discountAmount.toLocaleString()}원 할인)` : ` (${coupon.discountRate}% 할인)`}
                                            {!coupon.isApplicable && ` [${coupon.reason}]`}
                                        </option>
                                    ))}
                                </select>
                                <div style={{ fontSize: '13px', color: '#888' }}>* 조건이 맞지 않는 쿠폰은 선택할 수 없습니다.</div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>배송정보</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>받는 사람 <span style={{ color: '#f01a21' }}>*</span></label>
                                    <input type="text" value={shippingInfo.recipient} onChange={(e) => handleInputChange('recipient', e.target.value)} placeholder="받는 사람 이름을 입력하세요" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>주소 <span style={{ color: '#f01a21' }}>*</span></label>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input type="text" value={shippingInfo.postalCode} readOnly placeholder="우편번호" style={{ flex: 1, padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f8f8f8', boxSizing: 'border-box' }} />
                                        <button onClick={handleAddressSearch} style={{ padding: '12px 24px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}>주소 찾기</button>
                                    </div>
                                    <input type="text" value={shippingInfo.baseAddress} readOnly placeholder="기본 주소" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', backgroundColor: '#f8f8f8', marginBottom: '10px', boxSizing: 'border-box' }} />
                                    <input type="text" value={shippingInfo.detailAddress} onChange={(e) => handleInputChange('detailAddress', e.target.value)} placeholder="상세 주소 및 건물명을 입력하세요" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>휴대폰 번호 <span style={{ color: '#f01a21' }}>*</span></label>
                                    <input type="tel" value={shippingInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="010-0000-0000" style={{ width: '100%', padding: '12px 15px', border: '1px solid #e5e5e5', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>결제수단 <span style={{ color: '#f01a21' }}>*</span></h2>
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

                    {/* Right Column: Payment Amount */}
                    <div>
                        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', position: 'sticky', top: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#111' }}>결제금액</h2>
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
                                <span style={{ fontWeight: '900', color: '#f01a21' }}>{finalAmount.toLocaleString()}원</span>
                            </div>
                            <button onClick={handleKakaoPayment} style={{ width: '100%', padding: '18px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '6px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}>
                                {finalAmount.toLocaleString()}원 결제하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;
