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
import '../styles/MyPage.css';

const MyPage = () => {
    const { user, cancelOrder, confirmPurchase } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [selectedYear, setSelectedYear] = useState('전체');

    if (!user) {
        navigate('/login');
        return null;
    }

    // [New] Extract unique years from orders
    const getAvailableYears = () => {
        if (!user.orders || user.orders.length === 0) return [];
        const years = user.orders.map(order => order.date.split('-')[0]); // "2024-12-14" -> "2024"
        return [...new Set(years)].sort((a, b) => b - a); // Unique & Descending
    };

    const availableYears = getAvailableYears();

    // [New] Filter orders based on selectedYear
    const getFilteredOrders = () => {
        if (!user.orders) return [];
        if (selectedYear === '전체') return user.orders;
        return user.orders.filter(order => order.date.startsWith(selectedYear));
    };

    const filteredOrders = getFilteredOrders();

    return (
        <div className="mypage-container">
            {/* Left Sidebar */}
            <div className="mypage-sidebar">
                <div className="mypage-user-box">
                    <div className="mypage-user-name">{user.name}님</div>
                    <div className="mypage-user-points">{(user.points || 0).toLocaleString()} P</div>
                </div>

                <div className="mypage-menu-container">
                    <div className="mypage-menu-header">나의 쇼핑</div>
                    <div onClick={() => setActiveTab('orders')} className={`mypage-menu-item ${activeTab === 'orders' ? 'mypage-menu-item-active' : ''}`}>주문/배송 조회</div>
                    <div onClick={() => setActiveTab('cancel')} className={`mypage-menu-item ${activeTab === 'cancel' ? 'mypage-menu-item-active' : ''}`}>취소/반품/교환</div>
                </div>
            </div>

            {/* Content */}
            <div className="mypage-content">
                <div className="mypage-content-section">
                    {activeTab === 'orders' && (
                        <>
                            <div className="mypage-header">
                                <h2 className="mypage-title">주문/배송 조회</h2>

                                {/* Year Filter Dropdown */}
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="mypage-year-select"
                                >
                                    <option value="전체">전체 기간</option>
                                    {availableYears.map(year => (
                                        <option key={year} value={year}>{year}년</option>
                                    ))}
                                </select>
                            </div>

                            {filteredOrders.filter(o => o.status !== 'CANCELLED' && o.status !== '취소완료').length > 0 ? (
                                filteredOrders.filter(o => o.status !== 'CANCELLED' && o.status !== '취소완료').map(order => (
                                    <div key={order.id} className="mypage-order-card">
                                        <div className="mypage-order-header">
                                            <span className="mypage-order-date">{order.date}</span>
                                            <span className="mypage-order-id">주문번호 {order.id}</span>
                                        </div>

                                        {/* 주문 상품 목록 */}
                                        {order.items && order.items.length > 0 ? (
                                            <div className="mypage-order-items">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="mypage-order-item">
                                                        {item.productImage && (
                                                            <img
                                                                src={item.productImage}
                                                                alt={item.productName || '상품 이미지'}
                                                                className="mypage-order-item-image"
                                                            />
                                                        )}
                                                        <div className="mypage-order-item-info">
                                                            <div className="mypage-order-item-name">
                                                                {item.productName || '상품명 없음'}
                                                            </div>
                                                            <div className="mypage-order-item-details">
                                                                {item.quantity}개 × {item.priceAtPurchase?.toLocaleString() || 0}원
                                                            </div>
                                                        </div>
                                                        <div className="mypage-order-item-total">
                                                            {((item.quantity || 1) * (item.priceAtPurchase || 0)).toLocaleString()}원
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mypage-order-no-items">
                                                <div className="mypage-order-no-items-name">{order.name || order.orderName}</div>
                                                <div className="mypage-order-no-items-text">상품 정보 없음</div>
                                            </div>
                                        )}

                                        <div className="mypage-order-footer">
                                            <div>
                                                <div className="mypage-order-total">
                                                    총 결제금액: {order.amount.toLocaleString()}원
                                                </div>
                                            </div>
                                            <div className="mypage-order-actions">
                                                {/* 주문완료 상태일 때 취소 가능 */}
                                                {order.status === 'PAID' && (
                                                    <>
                                                        <button
                                                            onClick={() => cancelOrder(order.id)}
                                                            className="mypage-cancel-button"
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
                                <div className="mypage-empty-state">
                                    {selectedYear === '전체' ? '주문 내역이 없습니다.' : `${selectedYear}년 주문 내역이 없습니다.`}
                                </div>
                            )}
                        </>
                    )}

                    {activeTab === 'cancel' && (
                        <>
                            <h2 className="mypage-title" style={{ paddingBottom: '15px', borderBottom: '2px solid #333' }}>취소/반품/교환 내역</h2>
                            {user.orders && user.orders.filter(o => o.status === 'CANCELLED' || o.status === '취소완료').length > 0 ? (
                                user.orders.filter(o => o.status === 'CANCELLED' || o.status === '취소완료').map(order => (
                                    <div key={order.id} className="mypage-order-card mypage-order-card-cancelled">
                                        <div className="mypage-order-header">
                                            <span className="mypage-order-date">{order.date}</span>
                                            <span className="mypage-order-id">주문번호 {order.id}</span>
                                        </div>

                                        {/* 주문 상품 목록 */}
                                        {order.items && order.items.length > 0 ? (
                                            <div className="mypage-order-items">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="mypage-order-item">
                                                        {item.productImage && (
                                                            <img
                                                                src={item.productImage}
                                                                alt={item.productName || '상품 이미지'}
                                                                className="mypage-order-item-image"
                                                            />
                                                        )}
                                                        <div className="mypage-order-item-info">
                                                            <div className="mypage-order-item-name">
                                                                {item.productName || '상품명 없음'}
                                                            </div>
                                                            <div className="mypage-order-item-details">
                                                                {item.quantity}개 × {item.priceAtPurchase?.toLocaleString() || 0}원
                                                            </div>
                                                        </div>
                                                        <div className="mypage-order-item-total">
                                                            {((item.quantity || 1) * (item.priceAtPurchase || 0)).toLocaleString()}원
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="mypage-order-no-items">
                                                <div className="mypage-order-no-items-name">{order.name || order.orderName}</div>
                                                <div className="mypage-order-no-items-text">상품 정보 없음</div>
                                            </div>
                                        )}

                                        <div className="mypage-order-footer">
                                            <div>
                                                <div className="mypage-order-total-cancelled">
                                                    총 결제금액: {order.amount.toLocaleString()}원
                                                </div>
                                            </div>
                                            <div className="mypage-order-status">취소완료</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="mypage-empty-state">취소/반품/교환 내역이 없습니다.</div>
                            )}
                        </>
                    )}

                    {activeTab === 'wishlist' && (
                        <>
                            <h2 className="mypage-title" style={{ paddingBottom: '15px', borderBottom: '2px solid #333' }}>찜한 상품</h2>
                            <div className="mypage-empty-state">
                                찜한 상품이 없습니다.
                            </div>
                        </>
                    )}

                    {activeTab === 'recent' && (
                        <>
                            <h2 className="mypage-title" style={{ paddingBottom: '15px', borderBottom: '2px solid #333' }}>최근 본 상품</h2>
                            <div className="mypage-empty-state">
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
