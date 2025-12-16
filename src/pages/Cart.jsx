import React from 'react';
import { useAuth } from '../context/AuthContext'; // 사용자 정보 가져오기
import { useCart } from '../context/CartContext'; // 장바구니 정보 가져오기
import { useNavigate } from 'react-router-dom'; // 페이지 이동
import '../styles/Cart.css'; // 스타일 적용 

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

        // 장바구니에 있는 모든 상품의 카테고리를 추출하여 배열로 전달
        // 이를 통해 여러 카테고리의 상품이 섞여 있어도 모든 관련 쿠폰을 조회할 수 있음
        const uniqueCategories = [...new Set(cart.map(item => item.category).filter(Boolean))];

        navigate('/payment', {
            state: {
                amount: totalAmount,
                orderName: cart[0].name + (cart.length > 1 ? ` 외 ${cart.length - 1}건` : ''),
                category: uniqueCategories, // 배열로 전달
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
