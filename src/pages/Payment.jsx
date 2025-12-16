import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { couponApi } from '../api/productApi';
import client from '../api/client';

const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addOrder, user, loadUser } = useAuth();

    const [status, setStatus] = useState('ready');
    const [errorMsg, setErrorMsg] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('카카오페이');
    const [shippingInfo, setShippingInfo] = useState({
        recipient: user?.name || '',
        postalCode: user?.zipCode || '',
        baseAddress: user?.address || '',
        detailAddress: user?.detailAddress || '',
        phone: ''
    });

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
    const [selectedCouponId, setSelectedCouponId] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [usedPoints, setUsedPoints] = useState(0);
    const availablePoints = user?.points || 0;

    const { amount, orderName, category, items } = location.state || {};
    const finalAmount = amount ? Math.max(0, amount - discountAmount - usedPoints) : 0;

    const calculateEarnedPoints = (payAmount) => {
        const basePoints = Math.floor(payAmount * 0.005);
        return Math.min(basePoints, 5000);
    };

    const earnedPoints = finalAmount ? calculateEarnedPoints(finalAmount) : 0;

    const [userCoupons, setUserCoupons] = useState([]);
    const [couponsLoading, setCouponsLoading] = useState(false);

    useEffect(() => {
        const fetchCoupons = async () => {
            if (!user || !amount) {
                setUserCoupons([]);
                return;
            }

            try {
                setCouponsLoading(true);
                const coupons = await couponApi.getAvailableCoupons(amount, category);
                setUserCoupons(coupons);
            } catch (error) {
                console.error('쿠폰 로딩 실패:', error);
                setUserCoupons([]);
            } finally {
                setCouponsLoading(false);
            }
        };

        fetchCoupons();
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

    const handlePointChange = (e) => {
        const inputValue = parseInt(e.target.value) || 0;
        const amountAfterCoupon = amount - discountAmount;
        const maxUsablePoints = Math.min(availablePoints, amountAfterCoupon);
        const finalUsedPoints = Math.min(Math.max(0, inputValue), maxUsablePoints);
        setUsedPoints(finalUsedPoints);
    };

    const handleUseAllPoints = () => {
        const amountAfterCoupon = amount - discountAmount;
        const maxUsablePoints = Math.min(availablePoints, amountAfterCoupon);
        setUsedPoints(maxUsablePoints);
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amountVal = urlParams.get('amount');
        const usedPointsParam = urlParams.get('usedPoints');

        if (paymentKey && orderId && amountVal) {
            const saveDemoOrder = async () => {
                setStatus('processing');
                try {
                    // 토스 API 승인 대신 데모 주문 생성 (테스트 키로는 실제 승인 불가)
                    // 클론코딩/포트폴리오 목적이므로 결제 흐름만 시연
                    const couponIdParam = urlParams.get('couponId');
                    const itemsParam = urlParams.get('items');
                    const response = await client.post('/orders/demo', {
                        orderName: decodeURIComponent(urlParams.get('orderName') || '상품 결제'),
                        amount: parseInt(amountVal),
                        usedPoints: usedPointsParam ? parseInt(usedPointsParam) : 0,
                        couponId: couponIdParam ? parseInt(couponIdParam) : null,
                        items: itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : items || []
                    });

                    setStatus('success');
                    clearCart();
                    await loadUser();
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
                successUrl: window.location.origin + `/payment?orderName=${encodeURIComponent(orderName)}&usedPoints=${usedPoints}${selectedCouponId ? `&couponId=${selectedCouponId}` : ''}${items ? `&items=${encodeURIComponent(JSON.stringify(items))}` : ''}`,
                failUrl: window.location.origin + '/payment',
                flowMode: 'DIRECT',
                easyPay: 'KAKAOPAY'
            });
        } catch (err) {
            console.error(err);
            if (err.code !== 'USER_CANCEL') {
                setStatus('fail');
                setErrorMsg('결제 초기화 중 오류가 발생했습니다.');
            }
        }
    };

    if (status === 'processing') return <div style={{ textAlign: 'center', padding: '100px' }}>결제 승인 중입니다...</div>;
    
    if (status === 'fail') return (
        <div style={{ textAlign: 'center', padding: '100px' }}>
            <h2>결제 실패</h2>
            <p>{errorMsg}</p>
            <button onClick={() => navigate('/cart')}>장바구니로 돌아가기</button>
        </div>
    );
    
    if (status === 'success') return (
        <div className="payment-result-container">
            <div className="payment-result-inner">
                <div className="payment-result-box">
                    <div className="payment-result-icon">✅</div>
                    <h2 className="payment-result-title">주문이 완료되었습니다</h2>
                    <p className="payment-result-text">11번가를 이용해 주셔서 감사합니다.</p>
                    <div className="payment-result-buttons">
                        <button onClick={() => navigate('/mypage')} className="payment-result-btn payment-result-btn-secondary">주문내역 보기</button>
                        <button onClick={() => navigate('/')} className="payment-result-btn payment-result-btn-primary">쇼핑 계속하기</button>
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
        <div className="payment-container">
            <div className="payment-inner">
                <h1 className="payment-title">주문/결제</h1>

                {isAddressModalOpen && (
                    <div className="address-modal-overlay">
                        <div className="address-modal-content">
                            <div className="address-modal-header">
                                <h3>주소 찾기</h3>
                                <button onClick={() => setIsAddressModalOpen(false)} className="address-modal-close">✕</button>
                            </div>
                            <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '400px' }} />
                        </div>
                    </div>
                )}

                <div className="payment-grid">
                    {/* Left Column */}
                    <div>
                        {/* Order Product */}
                        <div className="payment-section">
                            <h2 className="payment-section-title">
                                주문상품 <span className="text-primary">{items ? items.length : 1}건</span>
                            </h2>
                            {items && items.length > 0 ? (
                                <div className="payment-item-grid">
                                    {items.map((item, index) => (
                                        <div key={index} className="payment-item">
                                            <img src={item.imageUrl || item.image} alt={item.name} className="payment-item-image" />
                                            <div className="payment-item-info">
                                                <div className="payment-item-name">{item.name}</div>
                                                {item.selectedSize && <div className="payment-item-option">옵션: {item.selectedSize}</div>}
                                                <div className="payment-item-quantity">
                                                    {item.quantity}개 / {item.price.toLocaleString()}원
                                                </div>
                                            </div>
                                            <div className="payment-item-price">
                                                {(item.price * item.quantity).toLocaleString()}원
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', backgroundColor: '#f8f8f8', borderRadius: '6px', fontSize: '15px' }}>
                                    <div style={{ fontWeight: 'bold', color: '#333' }}>{orderName}</div>
                                </div>
                            )}
                        </div>

                        {/* Coupon Discount */}
                        <div className="payment-section">
                            <div className="payment-section-title-flex">
                                <h2 className="payment-section-title" style={{ margin: 0 }}>쿠폰 할인</h2>
                                {discountAmount > 0 && <span className="text-primary text-bold">-{discountAmount.toLocaleString()}원 할인 적용 중</span>}
                            </div>
                            <div className="payment-form-group">
                                {couponsLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                                        <div className="spinner" />
                                    </div>
                                ) : (
                                    <>
                                        <select value={selectedCouponId} onChange={handleCouponChange} className="payment-coupon-select">
                                            <option value="">쿠폰을 선택해 주세요</option>
                                            {userCoupons
                                                .filter(coupon => !coupon.isUsed)
                                                .map(coupon => (
                                                    <option key={coupon.id} value={coupon.id} disabled={!coupon.isApplicable || coupon.isUsed} style={{ color: (!coupon.isApplicable || coupon.isUsed) ? '#ccc' : '#333' }}>
                                                        {coupon.name}
                                                        {coupon.type === 'amount' ? ` (${coupon.discountAmount.toLocaleString()}원 할인)` : ` (${coupon.discountRate}% 할인)`}
                                                        {(!coupon.isApplicable || coupon.isUsed) && ` [${coupon.reason || '이미 사용된 쿠폰'}]`}
                                                    </option>
                                                ))}
                                        </select>
                                        <div className="payment-hint-text">* 조건이 맞지 않는 쿠폰은 선택할 수 없습니다.</div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Point Usage */}
                        <div className="payment-section">
                            <div className="payment-section-title-flex">
                                <h2 className="payment-section-title" style={{ margin: 0 }}>포인트 사용</h2>
                                {usedPoints > 0 && <span className="text-primary text-bold">-{usedPoints.toLocaleString()}P 사용</span>}
                            </div>
                            <div className="payment-form-group">
                                <div className="payment-summary-row" style={{ marginBottom: '8px' }}>
                                    <span style={{ color: '#666' }}>보유 포인트</span>
                                    <span className="text-primary text-bold" style={{ fontSize: '16px' }}>{availablePoints.toLocaleString()}P</span>
                                </div>
                                <div className="payment-point-row">
                                    <input
                                        type="number"
                                        value={usedPoints || ''}
                                        onChange={handlePointChange}
                                        placeholder="사용할 포인트"
                                        min="0"
                                        max={Math.min(availablePoints, amount - discountAmount)}
                                        className="payment-point-input"
                                    />
                                    <button onClick={handleUseAllPoints} className="payment-point-btn">
                                        모두 사용
                                    </button>
                                </div>
                                <div className="payment-hint-text">
                                    * 최대 {Math.min(availablePoints, amount - discountAmount).toLocaleString()}P까지 사용 가능합니다.
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="payment-section">
                            <h2 className="payment-section-title">배송정보</h2>
                            <div className="payment-form-group">
                                <div>
                                    <label className="payment-label">받는 사람 <span className="payment-required">*</span></label>
                                    <input type="text" value={shippingInfo.recipient} onChange={(e) => handleInputChange('recipient', e.target.value)} placeholder="받는 사람 이름을 입력하세요" className="payment-input" />
                                </div>
                                <div>
                                    <label className="payment-label">주소 <span className="payment-required">*</span></label>
                                    <div className="payment-address-row">
                                        <input type="text" value={shippingInfo.postalCode} readOnly placeholder="우편번호" className="payment-input" style={{ flex: 1 }} />
                                        <button onClick={handleAddressSearch} className="payment-address-btn">주소 찾기</button>
                                    </div>
                                    <input type="text" value={shippingInfo.baseAddress} readOnly placeholder="기본 주소" className="payment-input" style={{ marginBottom: '10px' }} />
                                    <input type="text" value={shippingInfo.detailAddress} onChange={(e) => handleInputChange('detailAddress', e.target.value)} placeholder="상세 주소 및 건물명을 입력하세요" className="payment-input" />
                                </div>
                                <div>
                                    <label className="payment-label">휴대폰 번호 <span className="payment-required">*</span></label>
                                    <input type="tel" value={shippingInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="010-0000-0000" className="payment-input" />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="payment-section">
                            <h2 className="payment-section-title">결제수단 <span className="payment-required">*</span></h2>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="payment-method-btn">
                                    <span style={{ fontSize: '18px' }}>💬</span> 카카오페이
                                </button>
                            </div>
                            <div className="payment-method-info">
                                선택된 결제수단: <strong style={{ color: '#333' }}>카카오페이</strong>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment Amount */}
                    <div>
                        <div className="payment-summary-sticky">
                            <h2 className="payment-section-title">결제금액</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '20px', borderBottom: '1px solid #e5e5e5', marginBottom: '20px' }}>
                                <div className="payment-summary-row">
                                    <span>상품금액</span>
                                    <span>{amount?.toLocaleString()}원</span>
                                </div>
                                <div className="payment-summary-row">
                                    <span>배송비</span>
                                    <span>무료</span>
                                </div>
                                <div className="payment-summary-row">
                                    <span>쿠폰 할인</span>
                                    <span className="text-primary">-{discountAmount.toLocaleString()}원</span>
                                </div>
                                <div className="payment-summary-row">
                                    <span>포인트 사용</span>
                                    <span className="text-primary">-{usedPoints.toLocaleString()}원</span>
                                </div>
                            </div>
                            <div className="payment-summary-total">
                                <span className="payment-summary-total-label">최종 결제금액</span>
                                <span className="payment-summary-total-amount">{finalAmount.toLocaleString()}원</span>
                            </div>
                            {earnedPoints > 0 && (
                                <div className="payment-points-notice">
                                    💰 결제 시 {earnedPoints.toLocaleString()}P 적립 예정
                                </div>
                            )}
                            <button onClick={handleKakaoPayment} className="payment-submit-btn">
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
