import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, totalAmount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handlePayment = async () => {
        if (!user) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        // Pass payment data via state
        // Here we just navigate to /payment with state
        // 장바구니 결제 시엔 category 정보가 모호하므로(여러 상품 섞임), 
        // 대표 상품의 카테고리나, 혹은 'mix' 등으로 처리해야 할 수 있음.
        // 현재는 첫 번째 상품의 카테고리를 넘기거나, 생략하여 Payment에서 '전체 대상' 쿠폰만 뜨게 유도.
        const firstItemCategory = cart.length > 0 ? cart[0].category : undefined;

        navigate('/payment', {
            state: {
                amount: totalAmount,
                orderName: cart[0].name + (cart.length > 1 ? ` 외 ${cart.length - 1}건` : ''),
                category: firstItemCategory
            }
        });
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

                {cart.map(item => {
                    const itemKey = item.cartItemId || item.id;
                    return (
                        <div key={itemKey} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid #ddd' }}>
                            <img src={item.image} alt={item.name} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px', color: '#333', marginBottom: '8px' }}>{item.name}</div>
                                {item.selectedSize && (
                                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                                        사이즈: <span style={{ fontWeight: 'bold' }}>{item.selectedSize}</span>
                                    </div>
                                )}
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.price.toLocaleString()}원</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <button onClick={() => updateQuantity(itemKey, item.quantity - 1)} style={{ width: '28px', height: '28px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>-</button>
                                <span style={{ width: '30px', textAlign: 'center', fontSize: '14px' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(itemKey, item.quantity + 1)} style={{ width: '28px', height: '28px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}>+</button>
                            </div>
                            <div style={{ width: '100px', textAlign: 'right', fontWeight: 'bold' }}>{(item.price * item.quantity).toLocaleString()}원</div>
                            <button onClick={() => removeFromCart(itemKey)} style={{ alignSelf: 'flex-start', border: '1px solid #ddd', background: 'white', padding: '4px 8px', fontSize: '12px', color: '#666', cursor: 'pointer' }}>삭제</button>
                        </div>
                    );
                })}
            </div>

            {/* Payment Summary */}
            <div style={{ width: '320px' }}>
                <div style={{ position: 'sticky', top: '100px', border: '1px solid #ddd', padding: '25px', borderRadius: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>결제 예정 금액</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>상품금액</span>
                        <span>{totalAmount.toLocaleString()}원</span>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', margin: '20px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>총 결제금액</span>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: '#f01a21' }}>{totalAmount.toLocaleString()}원</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        style={{ width: '100%', padding: '18px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '4px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        주문하기
                    </button>

                    {!user && <div style={{ marginTop: '10px', fontSize: '12px', color: '#888', textAlign: 'center' }}>로그인 후 결제가 가능합니다.</div>}
                </div>
            </div>
        </div>
    );
};

export default Cart;
