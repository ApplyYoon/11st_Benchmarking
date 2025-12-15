import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import '../styles.css';

const UserInfo = () => {
    const { user, setUserDirectly } = useAuth();
    const navigate = useNavigate();
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDetailAddress, setEditDetailAddress] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Redirect if not logged in
    if (!user) {
        return (
            <div className="userinfo-login-required">
                <div className="userinfo-login-box">
                    <p className="userinfo-login-text">로그인이 필요합니다.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="userinfo-login-btn"
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        );
    }

    const handleStartEdit = () => {
        setEditName(user.name || '');
        setEditDetailAddress(user.detailAddress || '');
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        if (isSaving) return;
        setIsSaving(true);

        try {
            await client.put('/users/me/profile', {
                name: editName,
                userId: user.id
            });

            setUserDirectly({
                ...user,
                name: editName,
                detailAddress: editDetailAddress
            });

            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('정보 수정에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleComplete = async (data) => {
        if (isSaving) return;
        setIsSaving(true);

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

        setIsAddressModalOpen(false);

        try {
            await client.put('/users/me/address', {
                zipCode: data.zonecode,
                address: fullAddress,
                detailAddress: '',
                userId: user.id
            });

            setUserDirectly({
                ...user,
                zipCode: data.zonecode,
                address: fullAddress,
                detailAddress: ''
            });

        } catch (error) {
            console.error('Failed to update address:', error);
            alert('주소 수정에 실패했습니다.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="userinfo-container">
            {/* Address Modal */}
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

            <div className="userinfo-inner">
                <h1 className="userinfo-title">회원 정보</h1>

                <div className="userinfo-box">
                    {/* Top Section */}
                    <div className="userinfo-header">
                        <div className="userinfo-avatar">
                            👤
                        </div>
                        <div>
                            <div className="userinfo-name">{user.name} 님</div>
                            <div className="userinfo-email">{user.email}</div>
                        </div>
                    </div>

                    <div className="userinfo-section">
                        <h3 className="userinfo-section-title">기본 정보</h3>

                        <div className="userinfo-field">
                            <div className="userinfo-field-label">이름</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="userinfo-field-input"
                                />
                            ) : (
                                <div>{user.name}</div>
                            )}
                        </div>

                        <div className="userinfo-field">
                            <div className="userinfo-field-label">이메일</div>
                            <div>{user.email}</div>
                        </div>

                        <div className="userinfo-field">
                            <div className="userinfo-field-label">휴대폰</div>
                            <div>010-1234-5678 <span className="userinfo-phone-note">(본인인증 완료)</span></div>
                        </div>

                        <div className="userinfo-field">
                            <div className="userinfo-field-label">포인트</div>
                            <div className="userinfo-points">{(user.points || 0).toLocaleString()}P</div>
                        </div>
                    </div>

                    <div className="userinfo-section mt">
                        <h3 className="userinfo-section-title">배송지 관리</h3>
                        <div className="userinfo-address-box">
                            <div className="userinfo-address-header">
                                <span className="userinfo-address-title">우리집 (기본배송지)</span>
                                <button onClick={() => setIsAddressModalOpen(true)} className="userinfo-address-search-btn">주소 검색</button>
                            </div>
                            <div className="userinfo-address-text">
                                {user.name}<br />
                                010-1234-5678<br />
                                {user.address ? (
                                    <>
                                        ({user.zipCode}) {user.address}<br />
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editDetailAddress}
                                                onChange={(e) => setEditDetailAddress(e.target.value)}
                                                placeholder="상세주소 입력"
                                                className="userinfo-address-detail-input"
                                            />
                                        ) : (
                                            user.detailAddress || ''
                                        )}
                                    </>
                                ) : (
                                    <span className="userinfo-address-placeholder">(주소를 등록해주세요 - 위의 "주소 검색" 버튼 클릭)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="userinfo-actions">
                        {isEditing ? (
                            <>
                                <button onClick={handleSaveEdit} className="userinfo-btn userinfo-btn-primary">
                                    저장하기
                                </button>
                                <button onClick={() => setIsEditing(false)} className="userinfo-btn userinfo-btn-secondary">
                                    취소
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleStartEdit} className="userinfo-btn userinfo-btn-dark">
                                    정보 수정
                                </button>
                                <button className="userinfo-btn userinfo-btn-secondary">비밀번호 변경</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
