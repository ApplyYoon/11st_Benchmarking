import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { COUPONS } from '../api/mockData';

const MyPage = () => {
    const { user, cancelOrder } = useAuth();
    const navigate = useNavigate();

    if (!user) {
        navigate('/login');
        return null; // Or loading
    }

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 20px', display: 'flex', gap: '30px' }}>
            {/* Left Sidebar */}
            <div style={{ width: '200px' }}>
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '20px', textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{user.name}님</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>{user.grade} 등급</div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f01a21', marginTop: '10px' }}>{(user.points || 0).toLocaleString()} P</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid #eee' }}>
                    <div style={{ padding: '15px', fontWeight: 'bold', backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>나의 쇼핑</div>
                    <div style={{ padding: '12px 15px', fontSize: '13px', cursor: 'pointer', color: '#f01a21' }}>주문/배송 조회</div>
                    <div style={{ padding: '12px 15px', fontSize: '13px', cursor: 'pointer' }}>취소/반품/교환</div>
                    <div style={{ padding: '12px 15px', fontSize: '13px', cursor: 'pointer' }}>찜한 상품</div>
                    <div style={{ padding: '12px 15px', fontSize: '13px', cursor: 'pointer' }}>최근 본 상품</div>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '60px' }}>
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
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: order.status === '취소완료' ? '#ccc' : '#333', marginBottom: '8px' }}>{order.status}</div>
                                        {order.status === '주문완료' && (
                                            <button
                                                onClick={() => cancelOrder(order.id)}
                                                style={{ fontSize: '12px', padding: '5px 10px', border: '1px solid #ddd', backgroundColor: 'white', cursor: 'pointer', borderRadius: '2px' }}
                                            >
                                                주문취소
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '50px 0', textAlign: 'center', color: '#888', borderBottom: '1px solid #eee' }}>최근 주문 내역이 없습니다.</div>
                    )}
                </div>


            </div>
        </div>
    );
};

export default MyPage;
