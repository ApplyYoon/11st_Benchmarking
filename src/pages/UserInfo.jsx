import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserInfo = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    if (!user) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>로그인이 필요합니다.</div>;
    }

    return (
        <div style={{ backgroundColor: '#f8f8f8', minHeight: '100vh', padding: '40px 0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px' }}>회원 정보</h1>

                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
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
                            <div>{user.id}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ color: '#666' }}>이름</div>
                            <div>{user.name}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ color: '#666' }}>이메일</div>
                            <div>{user.email}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ color: '#666' }}>휴대폰</div>
                            <div>010-1234-5678 <span style={{ fontSize: '12px', color: '#999', marginLeft: '5px' }}>(본인인증 완료)</span></div>
                        </div>
                    </div>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '30px', marginTop: '30px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>배송지 관리</h3>
                        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 'bold' }}>우리집 (기본배송지)</span>
                                <button style={{ border: '1px solid #ddd', backgroundColor: 'white', padding: '2px 8px', fontSize: '12px', borderRadius: '4px', cursor: 'pointer' }}>수정</button>
                            </div>
                            <div style={{ color: '#555', fontSize: '14px', lineHeight: '1.5' }}>
                                {user.name}<br />
                                010-1234-5678<br />
                                (06234) 서울 강남구 테헤란로 123 11번가 빌딩 9층
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <button style={{ padding: '12px 30px', backgroundColor: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>정보 수정</button>
                        <button style={{ padding: '12px 30px', backgroundColor: 'white', color: '#666', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>비밀번호 변경</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserInfo;
