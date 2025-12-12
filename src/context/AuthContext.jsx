import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // Mock login API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'test@11st.co.kr' && password === '1234') {
                    const userData = {
                        id: 'user_11st_001',
                        name: '유지원',
                        email: email,
                        grade: 'VIP',
                        points: 12500,
                        coupons: [1, 3, 4], // Coupon IDs
                        orders: []
                    };
                    setUser(userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                    resolve(userData);
                } else {
                    reject(new Error('아이디 또는 비밀번호를 확인해주세요.'));
                }
            }, 600);
        });
    };

    const signup = async (userData) => {
        // Mock signup API call
        return new Promise((resolve) => {
            setTimeout(() => {
                const newUser = {
                    ...userData,
                    id: `user_${Date.now()}`,
                    grade: 'FAMILY',
                    points: 1000,
                    coupons: [1],
                    orders: []
                };
                setUser(newUser);
                localStorage.setItem('user', JSON.stringify(newUser));
                resolve(newUser);
            }, 600);
        });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const addOrder = (order) => {
        if (user) {
            const updatedUser = {
                ...user,
                orders: [order, ...(user.orders || [])],
                // Deduct points if used, simplistic logic for now
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const cancelOrder = (orderId) => {
        if (user) {
            const updatedOrders = user.orders.map(order =>
                order.id === orderId ? { ...order, status: '취소완료' } : order
            );
            const updatedUser = { ...user, orders: updatedOrders };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, addOrder, cancelOrder }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
