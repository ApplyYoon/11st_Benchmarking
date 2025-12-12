import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [agreed, setAgreed] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirm: '' });
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) return alert('약관에 동의해주세요.');
        if (formData.password !== formData.passwordConfirm) return alert('비밀번호가 일치하지 않습니다.');

        await signup(formData);
        alert('회원가입이 완료되었습니다.');
        navigate('/');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '60px auto', padding: '0 20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>회원가입</h2>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>이름</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>이메일</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>비밀번호</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>비밀번호 확인</label>
                    <input
                        type="password"
                        value={formData.passwordConfirm}
                        onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
                        required
                    />
                </div>

                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '30px' }}>
                    <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', gap: '8px' }}>
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            style={{ marginTop: '3px' }}
                        />
                        <div>
                            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>[필수] 11번가 이용약관 동의</span>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px', lineHeight: '1.4' }}>
                                전자상거래 표준약관 및 개인정보 수집 이용에 대한 내용을 확인하였으며 이에 동의합니다.
                            </div>
                        </div>
                    </label>
                </div>

                <button
                    type="submit"
                    style={{ width: '100%', padding: '16px', backgroundColor: agreed ? '#f01a21' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: agreed ? 'pointer' : 'default' }}
                    disabled={!agreed}
                >
                    가입하기
                </button>
            </form>
        </div>
    );
};

export default Signup;
