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
        console.warn("addOrder is deprecated, use API");
    };

    const cancelOrder = (orderId) => {
        // Placeholder
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading, addOrder, cancelOrder }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
