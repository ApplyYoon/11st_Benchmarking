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
 * - 리뷰 작성 모달: 구매 확정된 주문에 대한 리뷰 작성 UI (현재 기능 구현 중)
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
                    <div style={{ fontSize: '13px', color: '#666' }}>{user.grade} 등급</div>
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

            {/* 리뷰 작성 모달 */}
            {showReviewModal && selectedOrder && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '90%',
                        maxWidth: '500px'
                    }}>
                        {/* 모달 헤더 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>리뷰 작성</h3>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedOrder(null);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#999',
                                    lineHeight: 1
                                }}
                            >
                                ×
                            </button>
                        </div>

                        {/* 주문 상품 정보 */}
                        <div style={{
                            padding: '14px',
                            backgroundColor: '#f9f9f9',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontSize: '13px', color: '#666' }}>{selectedOrder.date}</div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', marginTop: '2px' }}>{selectedOrder.name}</div>
                            <div style={{ fontSize: '14px', color: '#f01a21', marginTop: '2px' }}>{selectedOrder.amount.toLocaleString()}원</div>
                        </div>

                        {/* 별점 선택 */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                                별점을 선택해주세요 <span style={{ color: '#f01a21' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setReviewRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: '32px',
                                            color: star <= (hoverRating || reviewRating) ? '#ffc107' : '#ddd',
                                            padding: '0'
                                        }}
                                    >
                                        ★
                                    </button>
                                ))}
                                <span style={{ marginLeft: '10px', fontSize: '16px', fontWeight: 'bold', color: '#333' }}>
                                    {reviewRating}점
                                </span>
                            </div>
                        </div>

                        {/* 리뷰 내용 */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                                리뷰 내용 <span style={{ color: '#f01a21' }}>*</span>
                            </label>
                            <textarea
                                value={reviewContent}
                                onChange={(e) => setReviewContent(e.target.value)}
                                placeholder="상품에 대한 솔직한 리뷰를 작성해주세요. (최소 10자 이상)"
                                style={{
                                    width: '100%',
                                    height: '120px',
                                    padding: '12px',
                                    fontSize: '14px',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    resize: 'none',
                                    boxSizing: 'border-box',
                                    lineHeight: '1.5'
                                }}
                            />
                            <div style={{
                                fontSize: '12px',
                                color: reviewContent.length >= 10 ? '#28a745' : '#999',
                                marginTop: '6px',
                                textAlign: 'right'
                            }}>
                                {reviewContent.length}자 {reviewContent.length < 10 && '(최소 10자)'}
                            </div>
                        </div>

                        {/* 이미지 업로드 */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                                사진 첨부 <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#999' }}>(선택, 최대 5장)</span>
                            </label>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {/* 이미지 미리보기 */}
                                {reviewImages.map((img, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            position: 'relative',
                                            width: '70px',
                                            height: '70px',
                                            borderRadius: '8px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <img
                                            src={img.url}
                                            alt={`리뷰 이미지 ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <button
                                            onClick={() => removeImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '3px',
                                                right: '3px',
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                lineHeight: 1
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}

                                {/* 이미지 추가 버튼 */}
                                {reviewImages.length < 5 && (
                                    <label style={{
                                        width: '70px',
                                        height: '70px',
                                        border: '2px dashed #ddd',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: '#fafafa'
                                    }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleImageSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <span style={{ fontSize: '22px', color: '#999' }}>+</span>
                                        <span style={{ fontSize: '10px', color: '#999' }}>사진</span>
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* 버튼 */}
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedOrder(null);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    fontSize: '15px',
                                    backgroundColor: '#fff',
                                    color: '#666',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    cursor: 'pointer'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={handleReviewSubmit}
                                style={{
                                    flex: 1,
                                    padding: '14px',
                                    fontSize: '15px',
                                    backgroundColor: '#f01a21',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                리뷰 등록
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyPage;
