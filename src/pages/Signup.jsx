import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

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
        <div className="signup-container">
            <h2 className="signup-title">회원가입</h2>

            {isAddressModalOpen && (
                <div className="address-modal-overlay">
                    <div className="address-modal-content">
                        <div className="address-modal-header">
                            <h3 style={{ margin: 0 }}>주소 찾기</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="address-modal-close">✕</button>
                        </div>
                        <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '400px' }} />
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="signup-form-group">
                    <label className="signup-label">이름</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="signup-input"
                        required
                    />
                </div>
                <div className="signup-form-group">
                    <label className="signup-label">이메일</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="signup-input"
                        required
                    />
                </div>
                <div className="signup-form-group">
                    <label className="signup-label">비밀번호</label>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="signup-input"
                        required
                    />
                </div>
                <div className="signup-form-group">
                    <label className="signup-label">비밀번호 확인</label>
                    <input
                        type="password"
                        value={formData.passwordConfirm}
                        onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                        className="signup-input"
                        required
                    />
                </div>

                <div className="signup-form-group">
                    <label className="signup-label">주소</label>
                    <div className="signup-address-row">
                        <input
                            type="text"
                            value={formData.zipCode}
                            placeholder="우편번호"
                            readOnly
                            className="signup-input signup-input-readonly"
                        />
                        <button
                            type="button"
                            onClick={() => setIsAddressModalOpen(true)}
                            className="signup-address-btn"
                        >
                            주소 찾기
                        </button>
                    </div>
                    <input
                        type="text"
                        value={formData.address}
                        placeholder="기본 주소"
                        readOnly
                        className="signup-input signup-input-readonly"
                    />
                    <input
                        type="text"
                        value={formData.detailAddress}
                        onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                        placeholder="상세 주소를 입력해주세요"
                        className="signup-input"
                    />
                </div>

                <div className="signup-agreement">
                    <label className="signup-agreement-label">
                        <input
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="signup-agreement-checkbox"
                        />
                        <div>
                            <span className="signup-agreement-title">[필수] 11번가 이용약관 동의</span>
                            <div className="signup-agreement-text">
                                전자상거래 표준약관 및 개인정보 수집 이용에 대한 내용을 확인하였으며 이에 동의합니다.
                            </div>
                        </div>
                    </label>
                </div>

                <button
                    type="submit"
                    className="signup-submit-btn"
                    disabled={!agreed}
                >
                    가입하기
                </button>
            </form>
        </div>
    );
};

export default Signup;
