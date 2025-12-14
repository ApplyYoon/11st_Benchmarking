import React from 'react';
import { Link } from 'react-router-dom';
import { X, User, ChevronRight, Home, Zap, Star, Gift } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {

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
                    <Link to="/login" className="login-link" onClick={handleLinkClick}>
                        <div className="user-icon-circle">
                            <User size={24} color="#ccc" />
                        </div>
                        <div className="login-text">
                            <strong>로그인</strong>을 해주세요
                        </div>
                        <ChevronRight size={16} color="#999" />
                    </Link>
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
                    <Link to="/" className="nav-item" onClick={handleLinkClick}>
                        <Gift size={20} />
                        <span>이벤트</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="footer-links">
                        <Link to="/" onClick={handleLinkClick}>고객센터</Link>
                        <span className="divider">|</span>
                        <Link to="/" onClick={handleLinkClick}>설정</Link>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
