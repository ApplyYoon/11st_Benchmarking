import React, { useState, useEffect } from 'react';
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
    const [relatedKeywords, setRelatedKeywords] = useState([]);
    const [loadingKeywords, setLoadingKeywords] = useState(false);
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    // 연관 검색어 로드
    useEffect(() => {
        const fetchRelatedKeywords = async () => {
            if (!searchTerm || searchTerm.trim().length < 1) {
                setRelatedKeywords([]);
                return;
            }

            setLoadingKeywords(true);
            try {
                const keywords = await productApi.getRelatedKeywords(searchTerm.trim());
                setRelatedKeywords(keywords);
            } catch (error) {
                console.error('연관 검색어 로딩 실패:', error);
                setRelatedKeywords([]);
            } finally {
                setLoadingKeywords(false);
            }
        };

        // 디바운싱: 300ms 후에 요청
        const timeoutId = setTimeout(fetchRelatedKeywords, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

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
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                width: '100%',
                                backgroundColor: 'white',
                                border: '2px solid #f01a21',
                                borderTop: 'none',
                                borderRadius: '0 0 20px 20px',
                                zIndex: 1001,
                                overflow: 'hidden',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}>
                                {loadingKeywords ? (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                                        검색 중...
                                    </div>
                                ) : relatedKeywords.length > 0 ? (
                                    relatedKeywords.map(keyword => {
                                        const searchLower = searchTerm.toLowerCase();
                                        const keywordLower = keyword.toLowerCase();
                                        const index = keywordLower.indexOf(searchLower);
                                        
                                        return (
                                            <div
                                                key={keyword}
                                                onClick={() => {
                                                    setSearchTerm(keyword);
                                                    navigate(`/search?q=${encodeURIComponent(keyword)}`);
                                                    setIsFocused(false);
                                                }}
                                                style={{
                                                    padding: '12px 25px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    color: '#333'
                                                }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                            >
                                                {index >= 0 ? (
                                                    <>
                                                        {keyword.substring(0, index)}
                                                        <span style={{ color: '#f01a21', fontWeight: 'bold' }}>{keyword.substring(index, index + searchTerm.length)}</span>
                                                        {keyword.substring(index + searchTerm.length)}
                                                    </>
                                                ) : (
                                                    keyword
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                                        연관 검색어가 없습니다
                                    </div>
                                )}
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
