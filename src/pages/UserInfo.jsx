import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DaumPostcodeEmbed from 'react-daum-postcode';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

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
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f8f8' }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '20px', color: '#666' }}>로그인이 필요합니다.</p>
                    <button
                        onClick={() => navigate('/login')}
                        style={{ padding: '10px 20px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', padding: '40px 0' }}>
            {/* Address Modal */}
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

            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>회원 정보</h1>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    {/* Top Section */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#eee',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '30px',
                            marginRight: '20px'
                        }}>
                            👤
                        </div>
                        <div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>{user.name} 님</div>
                            <div style={{ color: '#666' }}>{user.email}</div>
                            <div style={{
                                marginTop: '10px',
                                display: 'inline-block',
                                padding: '4px 12px',
                                backgroundColor: '#f01a21',
                                color: 'white',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                {user.grade || 'FAMILY'} 등급
                            </div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '30px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>기본 정보</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ color: '#666' }}>아이디</div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px' }}
                                />
                            ) : (
                                <div>{user.name}</div>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ color: '#666' }}>이메일</div>
                            <div>{user.email}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ color: '#666' }}>휴대폰</div>
                            <div>010-1234-5678 <span style={{ fontSize: '12px', color: '#999', marginLeft: '5px' }}>(본인인증 완료)</span></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ color: '#666' }}>포인트</div>
                            <div style={{ color: '#f01a21', fontWeight: 'bold' }}>{(user.points || 0).toLocaleString()}P</div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '30px', marginTop: '30px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>배송지 관리</h3>
                        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>우리집 (기본배송지)</span>
                                <button onClick={() => setIsAddressModalOpen(true)} style={{ border: '1px solid #ddd', backgroundColor: 'white', padding: '2px 8px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer' }}>주소 검색</button>
                            </div>
                            <div style={{ color: '#555', fontSize: '14px', lineHeight: '1.8' }}>
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
                                                style={{ marginTop: '5px', padding: '8px 12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', width: '100%' }}
                                            />
                                        ) : (
                                            user.detailAddress || ''
                                        )}
                                    </>
                                ) : (
                                    <span style={{ color: '#999' }}>(주소를 등록해주세요 - 위의 "주소 검색" 버튼 클릭)</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSaveEdit}
                                    style={{ padding: '12px 30px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                                >
                                    저장하기
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    style={{ padding: '12px 30px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                                >
                                    취소
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={handleStartEdit}
                                    style={{ padding: '12px 30px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                                >
                                    정보 수정
                                </button>
                                <button style={{ padding: '12px 30px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>비밀번호 변경</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
