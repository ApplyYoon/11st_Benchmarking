import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import client from '../api/client';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);

    // 장바구니 데이터 불러오기 (로그인: DB / 비로그인: LocalStorage)
    const fetchCart = async () => {
        if (user) {
            try {
                const response = await client.get('/cart');
                // Backend RedisCartItem -> Frontend Cart Item 매핑
                const mappedCart = response.data.map(item => ({
                    id: item.productId,
                    name: item.productName,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    image: item.productImage,
                    discount: item.discountRate,
                    quantity: item.quantity,
                    // 백엔드에 사이즈 정보가 없으므로 옵션 기능은 제한됨
                    cartItemId: item.productId,
                    selectedSize: null
                }));
                setCart(mappedCart);
            } catch (error) {
                console.error("Failed to fetch cart:", error);
            }
        } else {
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
                setCart(JSON.parse(storedCart));
            } else {
                setCart([]);
            }
        }
    };

    // 사용자 상태가 변경되면 장바구니 다시 로드
    useEffect(() => {
        fetchCart();
    }, [user]);

    // 비로그인 상태일 때만 LocalStorage에 저장
    useEffect(() => {
        if (!user) {
            localStorage.setItem('cart', JSON.stringify(cart));
        } else {
            localStorage.removeItem('cart');
        }
    }, [cart, user]);

    const addToCart = async (product) => {
        if (user) {
            try {
                await client.post('/cart', {
                    productId: product.id,
                    quantity: 1
                });
                await fetchCart(); // DB 동기화
            } catch (error) {
                console.error("Failed to add to cart:", error);
                alert("장바구니 담기에 실패했습니다.");
            }
        } else {
            // LocalStorage 로직 (기존 유지)
            setCart((prev) => {
                const existing = prev.find((item) =>
                    item.id === product.id && item.selectedSize === product.selectedSize
                );
                if (existing) {
                    return prev.map((item) =>
                        item.id === product.id && item.selectedSize === product.selectedSize
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                const cartItemId = product.selectedSize
                    ? `${product.id}-${product.selectedSize}`
                    : `${product.id}`;
                return [...prev, { ...product, cartItemId, quantity: 1 }];
            });
        }
    };

    const removeFromCart = async (cartItemId) => {
        if (user) {
            try {
                // 백엔드는 productId를 식별자로 사용 (cartItemId = productId로 매핑됨)
                await client.delete(`/cart/${cartItemId}`);
                await fetchCart();
            } catch (error) {
                console.error("Failed to remove from cart:", error);
            }
        } else {
            setCart((prev) => prev.filter((item) => (item.cartItemId || item.id) !== cartItemId));
        }
    };

    const updateQuantity = async (cartItemId, quantity) => {
        if (quantity < 1) return;

        if (user) {
            try {
                await client.put(`/cart/${cartItemId}`, { quantity });
                await fetchCart();
            } catch (error) {
                console.error("Failed to update quantity:", error);
            }
        } else {
            setCart((prev) =>
                prev.map((item) =>
                    (item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (user) {
            try {
                await client.delete('/cart');
                setCart([]);
            } catch (error) {
                console.error("Failed to clear cart:", error);
            }
        } else {
            setCart([]);
        }
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
