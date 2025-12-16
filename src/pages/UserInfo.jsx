import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import '../styles/UserInfo.css';

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
            <div className="user-info-login-required">
                <div className="user-info-login-required-content">
                    <p className="user-info-login-required-text">로그인이 필요합니다.</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="user-info-login-btn"
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
        <div className="user-info-container">
            {/* Address Modal */}
            {isAddressModalOpen && (
                <div className="user-info-address-modal">
                    <div className="user-info-address-modal-box">
                        <div className="user-info-address-modal-header">
                            <h3 className="user-info-address-modal-title">주소 찾기</h3>
                            <button onClick={() => setIsAddressModalOpen(false)} className="user-info-address-modal-close">✕</button>
                        </div>
                        <DaumPostcodeEmbed onComplete={handleComplete} style={{ height: '400px' }} />
                    </div>
                </div>
            )}

            <div className="user-info-wrapper">
                <h1 className="user-info-title">회원 정보</h1>

                <div className="user-info-card">
                    {/* Top Section */}
                    <div className="user-info-profile">
                        <div className="user-info-avatar">
                            👤
                        </div>
                        <div>
                            <div className="user-info-profile-name">{user.name} 님</div>
                            <div className="user-info-profile-email">{user.email}</div>
                        </div>
                    </div>

                    <div className="user-info-section">
                        <h3 className="user-info-section-title">기본 정보</h3>

                        <div className="user-info-info-row">
                            <div className="user-info-info-label">이름</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="user-info-edit-input"
                                />
                            ) : (
                                <div>{user.name}</div>
                            )}
                        </div>

                        <div className="user-info-info-row">
                            <div className="user-info-info-label">이메일</div>
                            <div>{user.email}</div>
                        </div>

                        <div className="user-info-info-row">
                            <div className="user-info-info-label">포인트</div>
                            <div className="user-info-info-value">{(user.points || 0).toLocaleString()}P</div>
                        </div>
                    </div>

                    <div className="user-info-section user-info-section-margin">
                        <h3 className="user-info-section-title">배송지 관리</h3>
                        <div className="user-info-address-box">
                            <div className="user-info-address-header">
                                <span className="user-info-address-title">우리집 (기본배송지)</span>
                                <button onClick={() => setIsAddressModalOpen(true)} className="user-info-address-search-btn">주소 검색</button>
                            </div>
                            <div className="user-info-address-content">
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
                                                className="user-info-address-detail-input"
                                            />
                                        ) : (
                                            user.detailAddress || ''
                                        )}
                                    </>
                                ) : (
                                    <span className="user-info-address-empty">(주소를 등록해주세요 - 위의 "주소 검색" 버튼 클릭)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="user-info-actions">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSaveEdit}
                                    className="user-info-btn user-info-btn-primary"
                                >
                                    저장하기
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="user-info-btn user-info-btn-secondary"
                                >
                                    취소
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleStartEdit}
                                    className="user-info-btn user-info-btn-dark"
                                >
                                    정보 수정
                                </button>
                                <button className="user-info-btn user-info-btn-secondary">비밀번호 변경</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
