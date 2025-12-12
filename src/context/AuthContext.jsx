import React, { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            const response = await client.get('/auth/me');
            const userData = response.data;
            // Ensure compatibility with frontend expectations
            const finalUser = {
                ...userData,
                coupons: userData.coupons || [],
                orders: userData.orders || []
            };
            setUser(finalUser);
            localStorage.setItem('user_profile', JSON.stringify(finalUser)); // Only for quick display, not auth
        } catch (error) {
            console.log("Not authenticated or session expired");
            setUser(null);
            localStorage.removeItem('user_profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Optimistic load for UI
        const storedProfile = localStorage.getItem('user_profile');
        if (storedProfile) {
            setUser(JSON.parse(storedProfile));
        }

        loadUser();
    }, []);

    const login = async (email, password) => {
        try {
            // Expecting 200 OK and User object. Cookie set by browser.
            const response = await client.post('/auth/login', { email, password });
            const userResponse = response.data.user; // AuthResponse(token, user) - token is null/dummy, user is set

            const finalUser = {
                ...userResponse,
                coupons: userResponse.coupons || [],
                orders: userResponse.orders || []
            };

            setUser(finalUser);
            localStorage.setItem('user_profile', JSON.stringify(finalUser));
            return finalUser;
        } catch (error) {
            console.error(error);
            throw new Error('아이디 또는 비밀번호를 확인해주세요.');
        }
    };

    const signup = async (signupData) => {
        try {
            await client.post('/auth/signup', signupData);
            return true;
        } catch (error) {
            console.error(error);
            throw new Error('회원가입 실패');
        }
    };

    const logout = async () => {
        try {
            await client.post('/auth/logout');
        } catch (e) {
            console.error(e);
        } finally {
            setUser(null);
            localStorage.removeItem('user_profile');
        }
    };

    // Placeholder functions
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
