import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [agreed, setAgreed] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        zipCode: '',
        address: '',
        detailAddress: ''
    });
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreed) return alert('약관에 동의해주세요.');
        if (formData.password !== formData.passwordConfirm) return alert('비밀번호가 일치하지 않습니다.');
        if (!formData.zipCode) return alert('주소를 입력해주세요.');

        try {
            await signup(formData);
            alert('회원가입이 완료되었습니다.');
            navigate('/');
        } catch (error) {
            alert(error.message);
        }
    };

    const handleComplete = (data) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
            }
            fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        setFormData({
            ...formData,
            zipCode: data.zonecode,
            address: fullAddress
        });
        setIsAddressModalOpen(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '60px auto', padding: '0 20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>회원가입</h2>

            {isAddressModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ margin: 0 }}>주소 찾기</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }}>✕</button>
                        </div>
                        <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '400px' }} />
                    </div>
                </div>
            )}

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

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>주소</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                            type="text"
                            value={formData.zipCode}
                            placeholder="우편번호"
                            readOnly
                            style={{ flex: 1, padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
                        />
                        <button
                            type="button"
                            onClick={() => setIsAddressModalOpen(true)}
                            style={{ padding: '0 20px', backgroundColor: '#444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                        >
                            주소 찾기
                        </button>
                    </div>
                    <input
                        type="text"
                        value={formData.address}
                        placeholder="기본 주소"
                        readOnly
                        style={{ width: '100%', padding: '12px', marginBottom: '8px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px', backgroundColor: '#f5f5f5' }}
                    />
                    <input
                        type="text"
                        value={formData.detailAddress}
                        onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                        placeholder="상세 주소를 입력해주세요"
                        style={{ width: '100%', padding: '12px', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' }}
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
