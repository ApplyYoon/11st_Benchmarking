import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSocialLogin = (provider) => {
        if (provider === 'Kakao') {
            // Redirect to Kakao OAuth authorization URL
            const KAKAO_CLIENT_ID = 'df51448645c334cdd1f85b5521edfe51';
            const REDIRECT_URI = encodeURIComponent('http://localhost:5173/oauth/kakao/callback');
            const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
            window.location.href = kakaoAuthUrl;
        } else if (provider === 'Naver') {
            // Naver OAuth will be implemented when API key is provided
            alert('현재 버전에서는 이 기능을 지원하지 않습니다. \n다른 로그인 방법을 사용해 주세요');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: '#f8f8f8',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '460px',
                width: '100%',
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '60px 50px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
                {/* 로고 */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '900',
                        margin: 0,
                        background: 'linear-gradient(135deg, #f01a21 0%, #ff1744 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        letterSpacing: '-2px'
                    }}>11st</h1>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="이메일을 입력해 주세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            padding: '16px 18px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            fontSize: '15px',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#f01a21'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            placeholder="비밀번호 8자~20자"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px 18px',
                                border: '1px solid #e0e0e0',
                                borderRadius: '4px',
                                fontSize: '15px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                boxSizing: 'border-box'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#f01a21'}
                            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        />
                    </div>

                    {error && <div style={{ color: '#f01a21', fontSize: '13px', marginTop: '5px' }}>{error}</div>}

                    {/* 로그인 버튼 */}
                    <button
                        type="submit"
                        style={{
                            padding: '18px',
                            backgroundColor: '#f01a21',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '17px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#d01519'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#f01a21'}
                    >
                        로그인
                    </button>
                </form>

                {/* 소셜 로그인 - 카카오톡, 네이버만 */}
                <div style={{ marginTop: '35px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        justifyContent: 'center'
                    }}>
                        {/* 카카오톡 */}
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: '#FEE500',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                            onClick={() => handleSocialLogin('Kakao')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{ fontSize: '22px' }}>💬</span>
                        </div>

                        {/* 네이버 */}
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: '#03C75A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                        }}
                            onClick={() => handleSocialLogin('Naver')}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{ color: 'white', fontSize: '22px', fontWeight: 'bold' }}>N</span>
                        </div>
                    </div>
                </div>

                {/* 로그인 상태 유지 */}
                <div style={{
                    marginTop: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        <input
                            type="checkbox"
                            style={{
                                marginRight: '8px',
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer'
                            }}
                        />
                        로그인 상태 유지
                    </label>
                </div>
            </div>

            {/* 하단 링크 - 박스 밖 */}
            <div style={{
                marginTop: '25px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#666',
                display: 'flex',
                justifyContent: 'center',
                gap: '15px'
            }}>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#f01a21'}
                    onMouseLeave={(e) => e.target.style.color = '#666'}
                >아이디찾기</span>
                <span style={{ color: '#ddd' }}>·</span>
                <span style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.target.style.color = '#f01a21'}
                    onMouseLeave={(e) => e.target.style.color = '#666'}
                >비밀번호찾기</span>
                <span style={{ color: '#ddd' }}>·</span>
                <span
                    style={{
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        color: '#333',
                        transition: 'color 0.2s'
                    }}
                    onClick={() => navigate('/signup')}
                    onMouseEnter={(e) => e.target.style.color = '#f01a21'}
                    onMouseLeave={(e) => e.target.style.color = '#333'}
                >회원가입</span>
            </div>
        </div>
    );
};

export default Login;
