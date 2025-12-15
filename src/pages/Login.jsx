import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

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
        <div className="login-container">
            <div className="login-box">
                {/* 로고 */}
                <div className="login-logo">
                    <h1 className="login-logo-text">11st</h1>
                </div>

                {/* 로그인 폼 */}
                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="text"
                        placeholder="이메일을 입력해 주세요"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="login-input"
                    />
                    <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            placeholder="비밀번호 8자~20자"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="login-input"
                        />
                    </div>

                    {error && <div className="login-error">{error}</div>}

                    {/* 로그인 버튼 */}
                    <button type="submit" className="login-submit-btn">
                        로그인
                    </button>
                </form>

                {/* 소셜 로그인 - 카카오톡, 네이버만 */}
                <div className="login-social">
                    <div className="login-social-buttons">
                        {/* 카카오톡 */}
                        <div className="login-social-btn login-social-kakao" onClick={() => handleSocialLogin('Kakao')}>
                            <span className="login-social-icon">💬</span>
                        </div>

                        {/* 네이버 */}
                        <div className="login-social-btn login-social-naver" onClick={() => handleSocialLogin('Naver')}>
                            <span className="login-social-naver-text">N</span>
                        </div>
                    </div>
                </div>

                {/* 로그인 상태 유지 */}
                <div className="login-remember">
                    <label className="login-remember-label">
                        <input type="checkbox" className="login-remember-checkbox" />
                        로그인 상태 유지
                    </label>
                </div>
            </div>

            {/* 하단 링크 - 박스 밖 */}
            <div className="login-footer">
                <span className="login-footer-link">아이디찾기</span>
                <span className="login-footer-divider">·</span>
                <span className="login-footer-link">비밀번호찾기</span>
                <span className="login-footer-divider">·</span>
                <span className="login-footer-signup" onClick={() => navigate('/signup')}>회원가입</span>
            </div>
        </div>
    );
};

export default Login;
