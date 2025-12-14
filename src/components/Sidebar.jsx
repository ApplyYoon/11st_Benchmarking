import React from 'react';
import { X, User, ChevronRight, Home, Zap, Star, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();

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
                        <a href="/mypage" className="login-link">
                            <div className="user-icon-circle" style={{ background: '#f01a21' }}>
                                <User size={24} color="#fff" />
                            </div>
                            <div className="login-text">
                                <strong>{user.name || user.email}</strong>님 반갑습니다
                            </div>
                            <ChevronRight size={16} color="#999" />
                        </a>
                    ) : (
                        <a href="/login" className="login-link">
                            <div className="user-icon-circle">
                                <User size={24} color="#ccc" />
                            </div>
                            <div className="login-text">
                                <strong>로그인</strong>을 해주세요
                            </div>
                            <ChevronRight size={16} color="#999" />
                        </a>
                    )}
                    <div className="user-action-buttons">
                        <a href="/mypage" className="action-btn">주문배송</a>
                        <a href="/cart" className="action-btn">장바구니</a>
                        <a href="/my-coupons" className="action-btn">쿠폰</a>
                    </div>
                </div>

                <div className="sidebar-divider"></div>

                <nav className="sidebar-nav">
                    <div className="nav-title">쇼핑 서비스</div>
                    <a href="/" className="nav-item">
                        <Home size={20} />
                        <span>홈</span>
                    </a>
                    <a href="/best" className="nav-item">
                        <Star size={20} />
                        <span>베스트</span>
                    </a>
                    <a href="/shocking-deal" className="nav-item">
                        <Zap size={20} />
                        <span>쇼킹딜</span>
                    </a>
                    <a href="#" className="nav-item">
                        <Gift size={20} />
                        <span>이벤트</span>
                    </a>
                </nav>

                <div className="sidebar-footer">
                    <div className="footer-links">
                        <a href="#">고객센터</a>
                        <span className="divider">|</span>
                        <a href="#">설정</a>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
