/**
 * Sidebar.jsx
 * 
 * [역할]
 * - 모바일/버거 메뉴 형태의 사이드바 네비게이션
 * - 사용자 로그인 상태에 따라 다른 UI 표시 (로그인 정보 / 로그인 유도)
 * - 주요 페이지(장바구니, 마이페이지 등)로의 링크 제공
 * 
 * [주요 기능]
 * - useAuth()를 통한 로그인 상태 감지
 * - 조건부 렌더링: 로그인 시 프로필/로그아웃 버튼, 비로그인 시 로그인 링크 노출
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { X, User, ChevronRight, Home, Zap, Star, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();

    // 링크 클릭 시 사이드바 닫기
    const handleLinkClick = () => {
        onClose();
    };

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-area">
                        <span style={{ color: '#f01a21', fontWeight: '900', fontSize: '24px' }}>11st</span>
                    </div>
                    <button className="close-btn" onClick={onClose} aria-label="Close menu">
                        <X size={24} color="#333" />
                    </button>
                </div>

                <div className="user-status">
                    {user ? (
                        <div className="logged-in-profile">
                            <div className="user-info-row" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div className="user-icon-circle" style={{ backgroundColor: '#f01a2120' }}>
                                    <User size={24} color="#f01a21" />
                                </div>
                                <div className="user-text">
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{user.name}님</div>
                                    <div style={{ fontSize: '12px', color: '#666' }}>{user.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => { logout(); handleLinkClick(); }}
                                style={{ background: 'none', border: '1px solid #ddd', borderRadius: '4px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', width: '100%' }}
                            >
                                로그아웃
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="login-link" onClick={handleLinkClick}>
                            <div className="user-icon-circle">
                                <User size={24} color="#ccc" />
                            </div>
                            <div className="login-text">
                                <strong>로그인</strong>을 해주세요
                            </div>
                            <ChevronRight size={16} color="#999" />
                        </Link>
                    )}
                    <div className="user-action-buttons">
                        <Link to="/mypage" className="action-btn" onClick={handleLinkClick}>주문배송</Link>
                        <Link to="/cart" className="action-btn" onClick={handleLinkClick}>장바구니</Link>
                        <Link to="/my-coupons" className="action-btn" onClick={handleLinkClick}>쿠폰</Link>
                    </div>
                </div>

                <div className="sidebar-divider"></div>

                <nav className="sidebar-nav">
                    <div className="nav-title">쇼핑 서비스</div>
                    <Link to="/" className="nav-item" onClick={handleLinkClick}>
                        <Home size={20} />
                        <span>홈</span>
                    </Link>
                    <Link to="/best" className="nav-item" onClick={handleLinkClick}>
                        <Star size={20} />
                        <span>베스트</span>
                    </Link>
                    <Link to="/shocking-deal" className="nav-item" onClick={handleLinkClick}>
                        <Zap size={20} />
                        <span>쇼킹딜</span>
                    </Link>
                </nav>

                
            </aside>
        </>
    );
};

export default Sidebar;
