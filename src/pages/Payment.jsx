import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { couponApi } from '../api/productApi';
import client from '../api/client';
import '../styles/Payment.css';

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
    const [addressType, setAddressType] = useState('default'); // 'default' | 'custom'
    const [shippingInfo, setShippingInfo] = useState({
        recipient: user?.name || '',
        postalCode: user?.zipCode || '',
        baseAddress: user?.address || '',
        detailAddress: user?.detailAddress || '',
        phone: ''
    });

    // Check if user has default address
    const hasDefaultAddress = user && user.zipCode && user.address;

    // Update shipping info when user data loads
    useEffect(() => {
        if (user && addressType === 'default') {
            setShippingInfo({
                recipient: user.name || '',
                postalCode: user.zipCode || '',
                baseAddress: user.address || '',
                detailAddress: user.detailAddress || '',
                phone: ''
            });
        }
    }, [user, addressType]);

    // Handle address type change
    const handleAddressTypeChange = (type) => {
        setAddressType(type);
        if (type === 'default' && user) {
            setShippingInfo({
                recipient: user.name || '',
                postalCode: user.zipCode || '',
                baseAddress: user.address || '',
                detailAddress: user.detailAddress || '',
                phone: shippingInfo.phone // 전화번호는 유지
            });
        } else if (type === 'custom') {
            setShippingInfo({
                recipient: '',
                postalCode: '',
                baseAddress: '',
                detailAddress: '',
                phone: shippingInfo.phone // 전화번호는 유지
            });
        }
    };
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // Coupon State
    const [selectedCouponId, setSelectedCouponId] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);

    // Point State
    const [usedPoints, setUsedPoints] = useState(0);
    const availablePoints = user?.points || 0;

    // Destructure location state
    const { amount, orderName, category, items } = location.state || {};

    const finalAmount = amount ? Math.max(0, amount - discountAmount - usedPoints) : 0;

    // Point Calculation: 0.5%, max 5000
    const calculateEarnedPoints = (payAmount) => {
        const basePoints = Math.floor(payAmount * 0.005);
        return Math.min(basePoints, 5000);
    };

    const earnedPoints = finalAmount ? calculateEarnedPoints(finalAmount) : 0;

    // Coupon Logic
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
                // category가 없거나 빈 배열이면 items에서 추출
                let categories = Array.isArray(category) ? category : (category ? [category] : []);
                
                // category가 없거나 빈 배열이고 items가 있으면 items에서 category 추출
                if ((!categories || categories.length === 0) && items && items.length > 0) {
                    // items에서 category 추출 시도
                    const itemCategories = items.map(item => item.category).filter(Boolean);
                    
                    // items에 category가 없으면 상품 ID로 조회
                    if (itemCategories.length === 0) {
                        const { productApi } = await import('../api/productApi');
                        const categoryPromises = items
                            .filter(item => item.id || item.productId)
                            .map(async (item) => {
                                try {
                                    const productId = item.id || item.productId;
                                    const product = await productApi.getProduct(productId);
                                    return product.category;
                                } catch (err) {
                                    console.error(`Failed to fetch product ${item.id || item.productId}:`, err);
                                    return null;
                                }
                            });
                        const fetchedCategories = await Promise.all(categoryPromises);
                        categories = [...new Set(fetchedCategories.filter(Boolean))];
                    } else {
                        categories = [...new Set(itemCategories)];
                    }
                }
                
                const coupons = await couponApi.getAvailableCoupons(amount, categories);
                setUserCoupons(coupons);
            } catch (error) {
                console.error('쿠폰 로딩 실패:', error);
                setUserCoupons([]);
            } finally {
                setCouponsLoading(false);
            }
        };

        fetchCoupons();
    }, [user, amount, category, items]);

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
            
            // 카테고리 제한 쿠폰인 경우, 해당 카테고리 상품 금액만 계산
            let applicableAmount = amount;
            if (selectedCoupon.category && items && items.length > 0) {
                // 해당 카테고리의 상품 금액만 합산
                applicableAmount = items
                    .filter(item => item.category === selectedCoupon.category)
                    .reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
            }
            
            if (selectedCoupon.type === 'amount') {
                // 금액 할인: 해당 카테고리 상품 금액을 초과할 수 없음
                discount = Math.min(selectedCoupon.discountAmount, applicableAmount);
            } else if (selectedCoupon.type === 'percent') {
                // 비율 할인: 해당 카테고리 상품 금액 기준으로 계산
                discount = Math.floor(applicableAmount * (selectedCoupon.discountRate / 100));
                if (selectedCoupon.maxDiscountAmount) {
                    discount = Math.min(discount, selectedCoupon.maxDiscountAmount);
                }
                // 해당 카테고리 상품 금액을 초과할 수 없음
                discount = Math.min(discount, applicableAmount);
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

    // Payment Processing Effect - KakaoPay 인증 후 돌아왔을 때 처리
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amountVal = urlParams.get('amount');
        const usedPointsParam = urlParams.get('usedPoints');

        // KakaoPay 인증 완료 후 redirect로 돌아온 경우
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
        // 전화번호 입력 시 숫자만 허용
        if (field === 'phone') {
            const numbersOnly = value.replace(/[^0-9]/g, '');
            setShippingInfo(prev => ({ ...prev, [field]: numbersOnly }));
            return;
        }
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
        if (shippingInfo.phone.length !== 11) { alert('휴대폰 번호는 11자리 숫자여야 합니다.'); return false; }
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
                successUrl: window.location.origin + `/payment?orderName=${encodeURIComponent(orderName)}&usedPoints=${usedPoints}${selectedCouponId ? `&couponId=${selectedCouponId}` : ''}${items ? `&items=${encodeURIComponent(JSON.stringify(items))}` : ''}`,
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
    if (status === 'processing') return <div className="payment-status-processing">결제 승인 중입니다...</div>;
    if (status === 'fail') return (
        <div className="payment-status-fail">
            <h2>결제 실패</h2>
            <p>{errorMsg}</p>
            <button onClick={() => navigate('/cart')}>장바구니로 돌아가기</button>
        </div>
    );
    if (status === 'success') return (
        <div className="payment-status-success">
            <div className="payment-success-wrapper">
                <div className="payment-success-box">
                    <div className="payment-success-icon">✅</div>
                    <h2 className="payment-success-title">주문이 완료되었습니다</h2>
                    <p className="payment-success-message">11번가를 이용해 주셔서 감사합니다.</p>
                    <div className="payment-success-buttons">
                        <button onClick={() => navigate('/mypage')} className="payment-success-btn payment-success-btn-secondary">주문내역 보기</button>
                        <button onClick={() => navigate('/')} className="payment-success-btn payment-success-btn-primary">쇼핑 계속하기</button>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!amount) return (
        <div className="payment-error-state">
            <div className="payment-error-icon">⚠️</div>
            <div className="payment-error-title">잘못된 접근입니다</div>
        </div>
    );

    return (
        <div className="payment-container">
            <div className="payment-wrapper">
                <h1 className="payment-title">주문/결제</h1>

                {isAddressModalOpen && (
                    <div className="payment-address-modal">
                        <div className="payment-address-modal-box">
                            <div className="payment-address-modal-header">
                                <h3 className="payment-address-modal-title">주소 찾기</h3>
                                <button onClick={() => setIsAddressModalOpen(false)} className="payment-address-modal-close">✕</button>
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
                                주문상품 <span className="payment-section-title-count">{items ? items.length : 1}건</span>
                            </h2>
                            {items && items.length > 0 ? (
                                <div className="payment-order-items">
                                    {items.map((item, index) => (
                                        <div key={index} className="payment-order-item">
                                            <img src={item.imageUrl || item.image} alt={item.name} className="payment-order-item-image" />
                                            <div className="payment-order-item-info">
                                                <div className="payment-order-item-name">{item.name}</div>
                                                {item.selectedSize && <div className="payment-order-item-option">옵션: {item.selectedSize}</div>}
                                                <div className="payment-order-item-details">
                                                    {item.quantity}개 / {item.price.toLocaleString()}원
                                                </div>
                                            </div>
                                            <div className="payment-order-item-total">
                                                {(item.price * item.quantity).toLocaleString()}원
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="payment-order-simple">
                                    <div className="payment-order-simple-name">{orderName}</div>
                                </div>
                            )}
                        </div>

                        {/* Coupon Discount */}
                        <div className="payment-section">
                            <div className="payment-coupon-header">
                                <h2 className="payment-coupon-header-title">쿠폰 할인</h2>
                                {discountAmount > 0 && <span className="payment-coupon-discount">-{discountAmount.toLocaleString()}원 할인 적용 중</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {couponsLoading ? (
                                    <div className="payment-coupon-loading">
                                        <div className="payment-coupon-spinner" />
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
                                        <div className="payment-coupon-note">* 조건이 맞지 않는 쿠폰은 선택할 수 없습니다.</div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Point Usage */}
                        <div className="payment-section">
                            <div className="payment-point-header">
                                <h2 className="payment-point-header-title">포인트 사용</h2>
                                {usedPoints > 0 && <span className="payment-point-used">-{usedPoints.toLocaleString()}P 사용</span>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div className="payment-point-info">
                                    <span className="payment-point-label">보유 포인트</span>
                                    <span className="payment-point-available">{availablePoints.toLocaleString()}P</span>
                                </div>
                                <div className="payment-point-input-group">
                                    <input
                                        type="number"
                                        value={usedPoints || ''}
                                        onChange={handlePointChange}
                                        placeholder="사용할 포인트"
                                        min="0"
                                        max={Math.min(availablePoints, amount - discountAmount)}
                                        className="payment-point-input"
                                    />
                                    <button
                                        onClick={handleUseAllPoints}
                                        className="payment-point-all-btn"
                                    >
                                        모두 사용
                                    </button>
                                </div>
                                <div className="payment-point-note">
                                    * 최대 {Math.min(availablePoints, amount - discountAmount).toLocaleString()}P까지 사용 가능합니다.
                                </div>
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="payment-section">
                            <h2 className="payment-section-title">배송정보</h2>
                            
                            {/* Address Type Selection */}
                            <div className="payment-shipping-address-type">
                                <label className={`payment-address-type-label ${addressType === 'default' ? 'payment-address-type-label-selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="addressType"
                                        checked={addressType === 'default'}
                                        onChange={() => handleAddressTypeChange('default')}
                                        className="payment-address-type-radio"
                                    />
                                    <div>
                                        <div className={`payment-address-type-info ${addressType === 'default' ? 'payment-address-type-info-selected' : ''}`}>기본 배송지</div>
                                        {hasDefaultAddress && (
                                            <div className="payment-address-type-preview">{user.address}</div>
                                        )}
                                        {!hasDefaultAddress && (
                                            <div className="payment-address-type-preview-empty">등록된 기본 배송지가 없습니다</div>
                                        )}
                                    </div>
                                </label>
                                <label className={`payment-address-type-label ${addressType === 'custom' ? 'payment-address-type-label-selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="addressType"
                                        checked={addressType === 'custom'}
                                        onChange={() => handleAddressTypeChange('custom')}
                                        className="payment-address-type-radio"
                                    />
                                    <div>
                                        <div className={`payment-address-type-info ${addressType === 'custom' ? 'payment-address-type-info-selected' : ''}`}>직접 입력</div>
                                        <div className="payment-address-type-preview">새로운 배송지를 입력합니다</div>
                                    </div>
                                </label>
                            </div>

                            <div className="payment-form-group">
                                <div>
                                    <label className="payment-form-field">받는 사람 <span className="payment-form-field-required">*</span></label>
                                    <input type="text" value={shippingInfo.recipient} onChange={(e) => handleInputChange('recipient', e.target.value)} placeholder="받는 사람 이름을 입력하세요" className="payment-form-input" />
                                </div>
                                <div>
                                    <label className="payment-form-field">주소 <span className="payment-form-field-required">*</span></label>
                                    <div className="payment-form-input-group">
                                        <input type="text" value={shippingInfo.postalCode} readOnly placeholder="우편번호" className="payment-form-input payment-form-input-readonly" />
                                        <button onClick={handleAddressSearch} className="payment-address-search-btn">주소 찾기</button>
                                    </div>
                                    <input type="text" value={shippingInfo.baseAddress} readOnly placeholder="기본 주소" className="payment-form-input payment-form-input-readonly" style={{ marginBottom: '10px' }} />
                                    <input type="text" value={shippingInfo.detailAddress} onChange={(e) => handleInputChange('detailAddress', e.target.value)} placeholder="상세 주소 및 건물명을 입력하세요" className="payment-form-input" />
                                </div>
                                <div>
                                    <label className="payment-form-field">휴대폰 번호 <span className="payment-form-field-required">*</span></label>
                                    <input type="tel" value={shippingInfo.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="010-XXXX-XXXX (숫자만 입력)" maxLength={11} className="payment-form-input" />
                                    <div className={`payment-phone-hint ${shippingInfo.phone.length === 11 ? 'payment-phone-hint-valid' : ''}`}>
                                        <span>* 숫자 11자리를 입력해주세요 (-)제외</span>
                                        {shippingInfo.phone.length === 11 && ' ✓'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="payment-section">
                            <h2 className="payment-method-title">결제수단 <span className="payment-method-title-required">*</span></h2>
                            <div className="payment-method-buttons">
                                <button className="payment-method-btn">
                                    <span className="payment-method-icon">💬</span> 카카오페이
                                </button>
                            </div>
                            <div className="payment-method-info">
                                선택된 결제수단: <strong>카카오페이</strong>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment Amount */}
                    <div>
                        <div className="payment-summary-box">
                            <h2 className="payment-summary-title">결제금액</h2>
                            <div className="payment-summary-list">
                                <div className="payment-summary-row">
                                    <span className="payment-summary-label">상품금액</span>
                                    <span className="payment-summary-value">{amount?.toLocaleString()}원</span>
                                </div>
                                <div className="payment-summary-row">
                                    <span className="payment-summary-label">배송비</span>
                                    <span className="payment-summary-value">무료</span>
                                </div>
                                <div className="payment-summary-row">
                                    <span className="payment-summary-label">쿠폰 할인</span>
                                    <span className="payment-summary-value-discount">-{discountAmount.toLocaleString()}원</span>
                                </div>
                                <div className="payment-summary-row">
                                    <span className="payment-summary-label">포인트 사용</span>
                                    <span className="payment-summary-value-discount">-{usedPoints.toLocaleString()}원</span>
                                </div>
                            </div>
                            <div className="payment-summary-total">
                                <span className="payment-summary-total-label">최종 결제금액</span>
                                <span className="payment-summary-total-amount">{finalAmount.toLocaleString()}원</span>
                            </div>
                            {earnedPoints > 0 && (
                                <div className="payment-summary-points">
                                    💰 결제 시 {earnedPoints.toLocaleString()}P 적립 예정
                                </div>
                            )}
                            <button onClick={handleKakaoPayment} className="payment-summary-button">
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
