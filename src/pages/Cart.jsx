import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { COUPONS } from '../api/mockData';
import { useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, totalAmount, clearCart } = useCart();
    const { user, login } = useAuth();
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const navigate = useNavigate();

    const discountAmount = selectedCoupon
        ? (selectedCoupon.type === 'amount'
            ? selectedCoupon.discountAmount
            : Math.floor((totalAmount * selectedCoupon.discountRate) / 100))
        : 0;

    const finalAmount = totalAmount - discountAmount + (totalAmount > 0 ? 0 : 0); // Add shipping if needed

    const handlePayment = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        // Pass payment data via state or query params, but better to use a dedicated Payment page wrapper
        // Here we just navigate to /payment with state
        navigate('/payment', { state: { amount: finalAmount, orderName: cart[0].name + (cart.length > 1 ? ` 외 ${cart.length - 1}건` : '') } });
    };

    if (cart.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ fontSize: '18px', color: '#333', marginBottom: '20px' }}>장바구니에 담긴 상품이 없습니다.</div>
                <button
                    onClick={() => navigate('/')}
                    style={{ padding: '10px 30px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    쇼핑 계속하기
                </button>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '40px' }}>
            {/* Cart Items */}
            <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '22px', fontWeight: 'bold', borderBottom: '2px solid #333', paddingBottom: '15px', marginBottom: '0' }}>장바구니</h2>

                {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid #ddd' }}>
                        <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '15px', color: '#333', marginBottom: '8px' }}>{item.name}</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.price.toLocaleString()}원</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: '28px', height: '28px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>-</button>
                            <span style={{ width: '30px', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: '28px', height: '28px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>+</button>
                        </div>
                        <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()}원</div>
                        <button onClick={() => removeFromCart(item.id)} style={{ alignSelf: 'flex-start', border: '1px solid #ddd', background: 'white', padding: '4px 8px', fontSize: '12px', color: '#666', cursor: 'pointer' }}>삭제</button>
                    </div>
                ))}
            </div>

            {/* Payment Summary */}
            <div style={{ width: '320px' }}>
                <div style={{ position: 'sticky', top: '100px', border: '1px solid #ddd', padding: '25px', borderRadius: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>결제 예정 금액</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>상품금액</span>
                        <span>{totalAmount.toLocaleString()}원</span>
                    </div>

                    {user && (
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>할인 쿠폰 적용</div>
                            <select
                                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                onChange={(e) => {
                                    const cId = parseInt(e.target.value);
                                    setSelectedCoupon(COUPONS.find(c => c.id === cId) || null);
                                }}
                            >
                                <option value="">쿠폰 선택 안함</option>
                                {COUPONS.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({c.type === 'amount' ? `${c.discountAmount}원` : `${c.discountRate}%`} 할인)
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {discountAmount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: '#f01a21' }}>
                            <span>할인금액</span>
                            <span>-{discountAmount.toLocaleString()}원</span>
                        </div>
                    )}

                    <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>총 결제금액</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#f01a21' }}>{finalAmount.toLocaleString()}원</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        style={{ width: '100%', padding: '18px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        주문하기
                    </button>

                    {!user && <div style={{ marginTop: '10px', fontSize: '12px', color: '#888', textAlign: 'center' }}>로그인 후 쿠폰 적용 및 결제가 가능합니다.</div>}
                </div>
            </div>
        </div>
    );
};

export default Cart;
