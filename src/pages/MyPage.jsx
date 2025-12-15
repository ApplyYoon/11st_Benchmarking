/**
 * MyPage.jsx
 * 
 * [역할]
 * - 사용자의 개인 페이지 대시보드
 * - 주문 내역 조회, 주문 취소, 리뷰 작성 등의 사용자 활동 중심지
 * 
 * [주요 기능]
 * - 탭 기반 UI: 주문/배송, 취소/반품, 찜한 상품, 최근 본 상품
 * - 주문 목록 렌더링: MongoDB에서 가져온 주문 데이터를 리스트로 표시
 * - 주문 취소 버튼: 'PAID' 상태인 주문에 대해 취소 버튼 노출 및 핸들러 연결
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
    const { user, cancelOrder, confirmPurchase } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');


    if (!user) {
        navigate('/login');
        return null;
    }

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '30px' }}>
            {/* Left Sidebar */}
            <div style={{ width: '200px' }}>
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{user.name}님</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f01a21', marginTop: '10px' }}>{(user.points || 0).toLocaleString()} P</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
                    <div style={{ padding: '15px', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>나의 쇼핑</div>
                    <div onClick={() => setActiveTab('orders')} style={{ padding: '12px 15px', fontSize: '13px', cursor: 'pointer', color: activeTab === 'orders' ? '#f01a21' : '#333', fontWeight: activeTab === 'orders' ? 'bold' : 'normal' }}>주문/배송 조회</div>
                    <div onClick={() => setActiveTab('cancel')} style={{ padding: '12px 15px', fontSize: '13px', cursor: 'pointer', color: activeTab === 'cancel' ? '#f01a21' : '#333', fontWeight: activeTab === 'cancel' ? 'bold' : 'normal' }}>취소/반품/교환</div>
                    <div onClick={() => setActiveTab('wishlist')} style={{ padding: '12px 15px', fontSize: '13px', cursor: 'pointer', color: activeTab === 'wishlist' ? '#f01a21' : '#333', fontWeight: activeTab === 'wishlist' ? 'bold' : 'normal' }}>찜한 상품</div>
                    <div onClick={() => setActiveTab('recent')} style={{ padding: '12px 15px', fontSize: '13px', cursor: 'pointer', color: activeTab === 'recent' ? '#f01a21' : '#333', fontWeight: activeTab === 'recent' ? 'bold' : 'normal' }}>최근 본 상품</div>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '60px' }}>
                    {activeTab === 'orders' && (
                        <>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: '15px', borderBottom: '2px solid #333' }}>주문/배송 조회</h2>
                            {user.orders && user.orders.length > 0 ? (
                                user.orders.map(order => (
                                    <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '20px', marginTop: '15px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{order.date}</span>
                                            <span style={{ fontSize: '12px', color: '#888' }}>주문번호 {order.id}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{order.name}</div>
                                                <div style={{ fontSize: '14px' }}>{order.amount.toLocaleString()}원</div>
                                            </div>
                                            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                                {/* <div style={{ fontSize: '16px', fontWeight: 'bold', color: order.status === '취소완료' ? '#ccc' : '#333', marginBottom: '8px' }}>{order.status}</div> */}

                                                {/* 주문완료 상태일 때 취소 가능 */}
                                                {order.status === 'PAID' && (
                                                    <>
                                                        <button
                                                            onClick={() => cancelOrder(order.id)}
                                                            style={{ fontSize: '12px', padding: '5px 10px', border: '1px solid #f01a21', backgroundColor: '#f01a21', color: 'white', cursor: 'pointer', borderRadius: '2px' }}
                                                        >
                                                            주문취소
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '50px 0', textAlign: 'center', color: '#888', borderBottom: '1px solid #eee' }}>최근 주문 내역이 없습니다.</div>
                            )}
                        </>
                    )}

                    {activeTab === 'cancel' && (
                        <>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: '15px', borderBottom: '2px solid #333' }}>취소/반품/교환 내역</h2>
                            {user.orders && user.orders.filter(o => o.status === '취소완료').length > 0 ? (
                                user.orders.filter(o => o.status === '취소완료').map(order => (
                                    <div key={order.id} style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '20px', marginTop: '15px', opacity: 0.7 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{order.date}</span>
                                            <span style={{ fontSize: '12px', color: '#888' }}>주문번호 {order.id}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '5px' }}>{order.name}</div>
                                                <div style={{ fontSize: '14px' }}>{order.amount.toLocaleString()}원</div>
                                            </div>
                                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#888' }}>취소완료</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '50px 0', textAlign: 'center', color: '#888', borderBottom: '1px solid #eee' }}>취소/반품/교환 내역이 없습니다.</div>
                            )}
                        </>
                    )}

                    {activeTab === 'wishlist' && (
                        <>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: '15px', borderBottom: '2px solid #333' }}>찜한 상품</h2>
                            <div style={{ padding: '50px 0', textAlign: 'center', color: '#888', borderBottom: '1px solid #eee' }}>
                                찜한 상품이 없습니다.
                            </div>
                        </>
                    )}

                    {activeTab === 'recent' && (
                        <>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold', paddingBottom: '15px', borderBottom: '2px solid #333' }}>최근 본 상품</h2>
                            <div style={{ padding: '50px 0', textAlign: 'center', color: '#888', borderBottom: '1px solid #eee' }}>
                                최근 본 상품 내역이 없습니다.
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default MyPage;
