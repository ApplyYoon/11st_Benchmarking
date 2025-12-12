import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

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
        <div style={{ maxWidth: '360px', margin: '80px auto', fontFamily: 'sans-serif' }}>
            <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#f01a21', textAlign: 'center', marginBottom: '40px', letterSpacing: '-1px' }}>11st</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="아이디 (test@11st.co.kr)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                />
                <input
                    type="password"
                    placeholder="비밀번호 (1234)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '14px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                />

                {error && <div style={{ color: '#f01a21', fontSize: '13px' }}>{error}</div>}

                <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0 15px', color: '#666', fontSize: '13px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ marginRight: '6px' }} /> 로그인 상태 유지
                    </label>
                </div>

                <button
                    type="submit"
                    style={{ padding: '15px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    로그인
                </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#666', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                <span style={{ cursor: 'pointer' }}>아이디 찾기</span>
                <span style={{ borderLeft: '1px solid #ddd', height: '12px', display: 'inline-block' }}></span>
                <span style={{ cursor: 'pointer' }}>비밀번호 찾기</span>
                <span style={{ borderLeft: '1px solid #ddd', height: '12px', display: 'inline-block' }}></span>
                <span style={{ cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/signup')}>회원가입</span>
            </div>
        </div>
    );
};

export default Login;
