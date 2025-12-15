import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

const KakaoCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUserDirectly } = useAuth();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState('');
    const hasProcessed = useRef(false); // Prevent double processing in React Strict Mode

    useEffect(() => {
        // Prevent double execution in React Strict Mode
        if (hasProcessed.current) return;

        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setStatus('error');
            setError('카카오 로그인이 취소되었습니다.');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        if (code) {
            hasProcessed.current = true; // Mark as processed
            // Send the authorization code to our backend
            handleKakaoLogin(code);
        } else {
            setStatus('error');
            setError('인증 코드가 없습니다.');
            setTimeout(() => navigate('/login'), 2000);
        }
    }, [searchParams]);

    const handleKakaoLogin = async (code) => {
        try {
            setStatus('processing');

            // Call backend to exchange code for user info and create session
            const response = await client.post('/auth/oauth/kakao', { code });

            if (response.data && response.data.user) {
                // Directly set user in AuthContext (no page reload needed)
                setUserDirectly(response.data.user);

                setStatus('success');

                // Navigate to home (React Router navigation, not full reload)
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err) {
            console.error('Kakao login error:', err);
            setStatus('error');
            setError(err.response?.data?.message || err.message || '로그인 처리 중 오류가 발생했습니다.');
            setTimeout(() => navigate('/login'), 3000);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f8f8'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '60px 80px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                {status === 'processing' && (
                    <>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            border: '4px solid #f0f0f0',
                            borderTop: '4px solid #FEE500',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 20px'
                        }} />
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                        <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '10px' }}>카카오 로그인 처리 중...</h2>
                        <p style={{ color: '#888', fontSize: '14px' }}>잠시만 기다려 주세요</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
                        <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '10px' }}>로그인 성공!</h2>
                        <p style={{ color: '#888', fontSize: '14px' }}>홈페이지로 이동합니다...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>❌</div>
                        <h2 style={{ fontSize: '20px', color: '#f01a21', marginBottom: '10px' }}>로그인 실패</h2>
                        <p style={{ color: '#888', fontSize: '14px' }}>{error}</p>
                        <p style={{ color: '#aaa', fontSize: '12px', marginTop: '15px' }}>로그인 페이지로 이동합니다...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default KakaoCallback;
