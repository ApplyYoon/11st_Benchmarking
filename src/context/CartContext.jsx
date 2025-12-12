import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart((prev) => {
            // 같은 상품 + 같은 사이즈인 경우에만 수량 증가
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
            // 장바구니 아이템에 고유 키 부여 (id + size 조합)
            const cartItemId = product.selectedSize 
                ? `${product.id}-${product.selectedSize}` 
                : `${product.id}`;
            return [...prev, { ...product, cartItemId, quantity: 1 }];
        });
    };

    const removeFromCart = (cartItemId) => {
        setCart((prev) => prev.filter((item) => (item.cartItemId || item.id) !== cartItemId));
    };

    const updateQuantity = (cartItemId, quantity) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                (item.cartItemId || item.id) === cartItemId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
