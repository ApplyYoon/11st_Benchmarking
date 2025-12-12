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
            // 포인트 적립 계산: 0.5%, 최대 5000포인트
            const earnedPoints = order.earnedPoints || 0;

            const updatedUser = {
                ...user,
                orders: [order, ...(user.orders || [])],
                points: user.points + earnedPoints
            };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    const confirmPurchase = (orderId) => {
        if (user) {
            const updatedOrders = user.orders.map(order => {
                if (order.id === orderId && order.status === '배송완료') {
                    // 구매 확정 시 포인트 적립
                    const earnedPoints = order.earnedPoints || 0;
                    return { ...order, status: '구매확정', pointsEarned: true };
                }
                return order;
            });

            const confirmedOrder = updatedOrders.find(o => o.id === orderId);
            const earnedPoints = confirmedOrder?.earnedPoints || 0;

            const updatedUser = {
                ...user,
                orders: updatedOrders,
                points: user.points + earnedPoints
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
    };

    const addCoupon = (couponId) => {
        if (!user) return { success: false, message: '로그인이 필요합니다.' };

        // 이미 보유한 쿠폰인지 확인 (중복 방지)
        if (user.coupons && user.coupons.includes(couponId)) {
            return { success: false, message: '이미 발급받은 쿠폰입니다.' };
        }

        const updatedUser = {
            ...user,
            coupons: [...(user.coupons || []), couponId]
        };

        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, message: '쿠폰이 발급되었습니다!' };
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, addOrder, cancelOrder, confirmPurchase, addCoupon }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
