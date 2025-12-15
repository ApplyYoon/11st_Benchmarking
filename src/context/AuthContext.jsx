/**
 * AuthContext.jsx
 * 
 * [역할]
 * - 애플리케이션 전역의 인증 상태(User) 관리
 * - 주문 취소, 구매 확정 등 사용자와 직접 관련된 주요 액션 처리
 * - 백엔드 API와 프론트엔드 UI 사이의 브리지 역할
 * 
 * [주요 기능]
 * - login/signup/logout: 인증 API 호출
 * - loadUser: 앱 시작/새로고침 시 사용자 정보 및 주문 내역 로드
 * - cancelOrder: 주문 취소 (DELETE API 호출 및 로컬 상태 동기화) - [NEW]
 * - confirmPurchase: 구매 확정 (Demo)
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadUser = async () => {
        // First, load from localStorage for immediate display
        const storedProfile = localStorage.getItem('user_profile');
        if (storedProfile) {
            try {
                setUser(JSON.parse(storedProfile));
            } catch (e) {
                localStorage.removeItem('user_profile');
            }
        }

        // Try to validate with backend (for cookie-based auth)
        try {
            const response = await client.get('/auth/me');
            const userData = response.data;

            // Fetch orders explicitly from MongoDB endpoint
            // Since User entity (Postgres) no longer has orders
            let orders = [];
            try {
                const orderResponse = await client.get('/orders');
                orders = orderResponse.data.map(o => ({
                    ...o,
                    // Normalize backend fields (camelCase/date) to frontend expectations
                    date: o.createdAt ? o.createdAt.split('T')[0] : '', // "2024-12-14"
                    name: o.orderName,
                    amount: o.totalAmount
                }));
            } catch (err) {
                console.log("Failed to fetch orders:", err);
            }

            const finalUser = {
                ...userData,
                coupons: userData.coupons || [],
                orders: orders
            };
            setUser(finalUser);
            localStorage.setItem('user_profile', JSON.stringify(finalUser));
        } catch (error) {
            // Don't clear user if we have a valid localStorage profile (OAuth users)
            // Only clear if there's no stored profile at all
            if (!storedProfile) {
                setUser(null);
            }
            console.log("Backend auth check failed, using localStorage if available");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 테스트 모드: loadUser 호출 안 함 (항상 mockUser 사용)
        // 실제 API 연동 시 아래 주석 해제
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
            const errorMessage = error.response?.data?.message || error.response?.data || '회원가입 실패';
            throw new Error(errorMessage);
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

    const cancelOrder = async (orderId) => {
        if (!user) return;

        if (window.confirm('주문을 취소하시겠습니까? 복구할 수 없습니다.')) {
            try {
                await client.delete(`/orders/${orderId}`);

                // Remove order from local state (Hard Delete)
                const updatedOrders = user.orders.filter(order => order.id !== orderId);
                const updatedUser = { ...user, orders: updatedOrders };
                setUser(updatedUser);
                localStorage.setItem('user_profile', JSON.stringify(updatedUser));
                alert('주문이 취소되었습니다.');
            } catch (error) {
                console.error("Order cancellation failed:", error);
                alert('주문 취소에 실패했습니다.');
            }
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

    const updateAddress = async (addressData) => {
        try {
            // Call backend API
            const response = await client.put('/users/me/address', addressData);
            const updatedUser = {
                ...user,
                ...response.data
            };
            setUser(updatedUser);
            localStorage.setItem('user_profile', JSON.stringify(updatedUser)); // Update cached profile
            return updatedUser;
        } catch (error) {
            console.error('Failed to update address:', error);
            throw error;
        }
    };

    // Direct user setter for OAuth callbacks (skips API call)
    const setUserDirectly = (userData) => {
        const finalUser = {
            ...userData,
            coupons: userData.coupons || [],
            orders: userData.orders || []
        };
        setUser(finalUser);
        localStorage.setItem('user_profile', JSON.stringify(finalUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, loadUser, addOrder, cancelOrder, confirmPurchase, addCoupon, updateAddress, setUserDirectly }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
