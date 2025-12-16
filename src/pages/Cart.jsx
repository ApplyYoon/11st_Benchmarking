import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Cart.css';

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
                category: firstItemCategory,
                items: cart
            }
        });
    };

    if (cart.length === 0) {
        return (
            <div className="cart-empty-container">
                <div className="cart-empty-message">장바구니에 담긴 상품이 없습니다.</div>
                <button
                    onClick={() => navigate('/')}
                    className="cart-empty-button"
                >
                    쇼핑 계속하기
                </button>
            </div>
        );
    }

    return (
        <div className="cart-page-container">
            {/* Cart Items */}
            <div className="cart-items-section">
                <h2 className="cart-title">장바구니</h2>

                {cart.map(item => {
                    const itemKey = item.cartItemId || item.id;
                    return (
                        <div key={itemKey} className="cart-item">
                            <img src={item.image} alt={item.name} className="cart-item-image" />
                            <div className="cart-item-info">
                                <div className="cart-item-name">{item.name}</div>
                                {item.selectedSize && (
                                    <div className="cart-item-size">
                                        사이즈: <span className="cart-item-size-bold">{item.selectedSize}</span>
                                    </div>
                                )}
                                <div className="cart-item-price">{item.price.toLocaleString()}원</div>
                            </div>
                            <div className="cart-item-quantity-controls">
                                <button onClick={() => updateQuantity(itemKey, item.quantity - 1)} className="cart-quantity-btn">-</button>
                                <span className="cart-quantity-value">{item.quantity}</span>
                                <button onClick={() => updateQuantity(itemKey, item.quantity + 1)} className="cart-quantity-btn">+</button>
                            </div>
                            <div className="cart-item-total">{(item.price * item.quantity).toLocaleString()}원</div>
                            <button onClick={() => removeFromCart(itemKey)} className="cart-item-delete-btn">삭제</button>
                        </div>
                    );
                })}
            </div>

            {/* Payment Summary */}
            <div className="cart-summary-section">
                <div className="cart-summary-box">
                    <h3 className="cart-summary-title">결제 예정 금액</h3>

                    <div className="cart-summary-row">
                        <span className="cart-summary-label">상품금액</span>
                        <span>{totalAmount.toLocaleString()}원</span>
                    </div>

                    <div className="cart-summary-divider"></div>

                    <div className="cart-summary-total-row">
                        <span className="cart-summary-total-label">총 결제금액</span>
                        <span className="cart-summary-total-amount">{totalAmount.toLocaleString()}원</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        className="cart-order-button"
                    >
                        주문하기
                    </button>

                    {!user && <div className="cart-login-notice">로그인 후 결제가 가능합니다.</div>}
                </div>
            </div>
        </div>
    );
};

export default Cart;
