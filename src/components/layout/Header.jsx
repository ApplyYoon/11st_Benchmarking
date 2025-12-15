import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Truck, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productApi } from '../../api/productApi';
import '../../styles.css';

const Header = ({ onMenuClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSearch = async (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            try {
                const correctionResult = await productApi.correctSearchQuery(searchTerm);
                if (correctionResult.corrected) {
                    navigate(`/search?q=${encodeURIComponent(correctionResult.corrected)}&original=${encodeURIComponent(searchTerm)}`);
                } else {
                    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                }
            } catch (error) {
                console.error('검색 오타수정 실패:', error);
                navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            }
            setIsFocused(false);
        }
    };

    return (
        <header className="header">
            {/* Main Header Row */}
            <div className="header-main">

                {/* Burger Menu & Logo */}
                <div className="header-left">
                    <button onClick={onMenuClick} className="menu-btn">
                        <Menu size={24} color="#333" strokeWidth={1.5} />
                    </button>
                    <Link to="/" className="logo">
                        11st
                    </Link>
                </div>

                {/* 11st Style Rounded Search Bar */}
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="통합검색"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                            onFocus={() => {
                                setIsFocused(true);
                                if (searchTerm) setIsUserMenuOpen(false); // Close other menus
                            }}
                            onBlur={() => {
                                setTimeout(() => setIsFocused(false), 200);
                            }}
                            className={`search-input ${searchTerm && isFocused ? 'dropdown-open' : ''}`}
                        />

                        {/* Search Suggestions Dropdown */}
                        {searchTerm && isFocused && (
                            <div className="search-dropdown">
                                {['노트북', '삼성전자', 'LG전자', '아이폰', '갤럭시', '나이키', '아디다스', '생수', '라면', '커피', '마스크', '영양제', '게이밍 노트북', '기계식 키보드']
                                    .filter(keyword => keyword.includes(searchTerm))
                                    .slice(0, 8)
                                    .map(keyword => (
                                        <div
                                            key={keyword}
                                            onClick={() => {
                                                setSearchTerm(keyword);
                                                navigate(`/search?q=${encodeURIComponent(keyword)}`);
                                            }}
                                            className="search-suggestion"
                                        >
                                            <span className="search-highlight">{searchTerm}</span>
                                            {keyword.replace(searchTerm, '')}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="search-btn">
                        <Search color="white" size={20} strokeWidth={2.5} />
                    </button>
                </form>

                {/* Right Actions */}
                <div className="header-actions">
                    {user ? (
                        <div
                            className="user-menu-container"
                            onMouseEnter={() => setIsUserMenuOpen(true)}
                            onMouseLeave={() => setIsUserMenuOpen(false)}
                        >
                            <Link to="/user-info" className="header-action-link">
                                <User size={26} strokeWidth={1.5} color="#f01a21" />
                                <span className="header-action-label">{user.name}님</span>
                            </Link>

                            {/* Hover Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div className="user-menu-dropdown">
                                    <div className="user-menu-arrow"></div>

                                    <Link to="/my-coupons" className="user-menu-item">
                                        나의 쿠폰
                                    </Link>
                                    <Link to="/mypage" className="user-menu-item">
                                        주문/배송조회
                                    </Link>
                                    <Link to="/mypage" className="user-menu-item">
                                        취소/반품/교환
                                    </Link>
                                    <div className="user-menu-divider"></div>
                                    <Link to="/" className="user-menu-item">
                                        고객센터
                                    </Link>
                                    <Link to="/user-info" className="user-menu-item">
                                        회원정보
                                    </Link>
                                    <div className="user-menu-divider"></div>
                                    <button onClick={logout} className="user-menu-logout">
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="header-action-link">
                            <User size={26} strokeWidth={1.5} />
                            <span className="header-action-label">로그인</span>
                        </Link>
                    )}

                    <Link to="/mypage" className="header-action-link">
                        <LayoutGrid size={26} strokeWidth={1.5} />
                        <span className="header-action-label">마이페이지</span>
                    </Link>

                    <Link to="/cart" className="header-action-link" style={{ position: 'relative' }}>
                        <div className="cart-icon-container">
                            <ShoppingCart size={26} strokeWidth={1.5} />
                            {cart.length > 0 && (
                                <span className="cart-badge">
                                    {cart.length}
                                </span>
                            )}
                        </div>
                        <span className="header-action-label">장바구니</span>
                    </Link>
                </div>
            </div>

            {/* Secondary Navigation Row - Replicating top section of 11st */}
            <div className="secondary-nav">
                <div className="secondary-nav-inner">
                    <Link 
                        to="/" 
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        홈
                    </Link>
                    <Link 
                        to="/best" 
                        className={`nav-link ${location.pathname === '/best' ? 'active' : ''}`}
                    >
                        베스트
                    </Link>
                    <Link 
                        to="/shocking-deal" 
                        className={`nav-link ${location.pathname === '/shocking-deal' ? 'active' : ''} highlight`}
                    >
                        쇼킹딜
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
