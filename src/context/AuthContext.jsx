import React, { createContext, useState, useContext, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 테스트용 Mock User - 항상 로그인 상태
    const mockUser = {
        id: 1,
        name: '테스트유저',
        email: 'test@test.com',
        phone: '010-1234-5678',
        address: '서울시 강남구 테헤란로 123',
        grade: 'VIP',
        points: 5000,
        coupons: [1, 2],
        orders: [
            {
                id: 'ORD-20241213-001',
                date: '2024.12.13',
                name: '[나이키] 에어맥스 90 화이트/블랙',
                amount: 159000,
                status: '주문완료',
                earnedPoints: 795,
                productId: 101
            },
            {
                id: 'ORD-20241210-002',
                date: '2024.12.10',
                name: '[삼성] 갤럭시 버즈3 프로',
                amount: 289000,
                status: '배송완료',
                earnedPoints: 1445,
                productId: 103
            },
            {
                id: 'ORD-20241205-003',
                date: '2024.12.05',
                name: '[애플] 아이폰 15 Pro 케이스',
                amount: 49000,
                status: '구매확정',
                earnedPoints: 245,
                productId: 105
            },
            {
                id: 'ORD-20241201-004',
                date: '2024.12.01',
                name: '[LG] 스탠바이미 GO',
                amount: 1290000,
                status: '취소완료',
                earnedPoints: 0,
                productId: 107
            }
        ]
    };

    const [user, setUser] = useState(mockUser); // 항상 로그인 상태
    const [loading, setLoading] = useState(false); // 로딩 없이 바로 시작

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
        // loadUser();
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
        <AuthContext.Provider value={{ user, login, signup, logout, loading, addOrder, cancelOrder, confirmPurchase, addCoupon, updateAddress, setUserDirectly }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
