import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productApi } from '../../api/productApi';
import '../../styles/Header.css';

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

    const timeoutId = setTimeout(fetchRelatedKeywords, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      try {
        const correctionResult = await productApi.correctSearchQuery(searchTerm);
        if (correctionResult.corrected) {
          navigate(
            `/search?q=${encodeURIComponent(
              correctionResult.corrected
            )}&original=${encodeURIComponent(searchTerm)}`
          );
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

  const isSearchOpen = Boolean(searchTerm) && isFocused;

  return (
    <header className="header">
      {/* Main Header Row */}
      <div className="header__inner">
        {/* Burger Menu & Logo */}
        <div className="header__left">
          <button className="header__menuBtn" onClick={onMenuClick} type="button">
            <Menu size={24} color="#333" strokeWidth={1.5} />
          </button>

          <Link to="/" className="header__logo">
            11st
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="searchForm">
          <div className="searchForm__wrap">
            <input
              type="text"
              placeholder="통합검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                if (searchTerm) setIsUserMenuOpen(false);
              }}
              onBlur={() => {
                setTimeout(() => setIsFocused(false), 200);
              }}
              className={`searchInput ${isSearchOpen ? 'searchInput--open' : ''}`}
            />

            {/* Suggestions Dropdown */}
            {isSearchOpen && (
              <div className="suggestions">
                {loadingKeywords ? (
                  <div className="suggestions__empty">검색 중...</div>
                ) : relatedKeywords.length > 0 ? (
                  relatedKeywords.map((keyword) => {
                    const searchLower = searchTerm.toLowerCase();
                    const keywordLower = keyword.toLowerCase();
                    const index = keywordLower.indexOf(searchLower);

                    return (
                      <div
                        key={keyword}
                        className="suggestions__item"
                        onClick={() => {
                          setSearchTerm(keyword);
                          navigate(`/search?q=${encodeURIComponent(keyword)}`);
                          setIsFocused(false);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setSearchTerm(keyword);
                            navigate(`/search?q=${encodeURIComponent(keyword)}`);
                            setIsFocused(false);
                          }
                        }}
                      >
                        {index >= 0 ? (
                          <>
                            {keyword.substring(0, index)}
                            <span className="suggestions__highlight">
                              {keyword.substring(index, index + searchTerm.length)}
                            </span>
                            {keyword.substring(index + searchTerm.length)}
                          </>
                        ) : (
                          keyword
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="suggestions__empty">연관 검색어가 없습니다</div>
                )}
              </div>
            )}
          </div>

          <button type="submit" className="searchBtn">
            <Search color="white" size={20} strokeWidth={2.5} />
          </button>
        </form>

        {/* Right Actions */}
        <div className="actions">
          {user ? (
            <div
              className="userMenu"
              onMouseEnter={() => setIsUserMenuOpen(true)}
              onMouseLeave={() => setIsUserMenuOpen(false)}
            >
              <Link to="/user-info" className="actionLink actionLink--user">
                <User size={26} strokeWidth={1.5} color="#f01a21" />
                <span className="actionLabel">{user.name}님</span>
              </Link>

              {isUserMenuOpen && (
                <div className="userDropdown">
                  <div className="userDropdown__arrow" />

                  <Link to="/my-coupons" className="userDropdown__item">
                    나의 쿠폰
                  </Link>
                  <Link to="/mypage" className="userDropdown__item">
                    주문/배송조회
                  </Link>
                  <Link to="/mypage" className="userDropdown__item">
                    취소/반품/교환
                  </Link>

                  <div className="userDropdown__divider" />

                  <Link to="/" className="userDropdown__item">
                    고객센터
                  </Link>
                  <Link to="/user-info" className="userDropdown__item">
                    회원정보
                  </Link>

                  <div className="userDropdown__divider" />

                  <button type="button" onClick={logout} className="userDropdown__logout">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="actionLink">
              <User size={26} strokeWidth={1.5} />
              <span className="actionLabel">로그인</span>
            </Link>
          )}

          <Link to="/mypage" className="actionLink">
            <LayoutGrid size={26} strokeWidth={1.5} />
            <span className="actionLabel">마이페이지</span>
          </Link>

          <Link to="/cart" className="actionLink actionLink--cart">
            <div className="cartIconWrap">
              <ShoppingCart size={26} strokeWidth={1.5} />
              {cart.length > 0 && <span className="cartBadge">{cart.length}</span>}
            </div>
            <span className="actionLabel">장바구니</span>
          </Link>
        </div>
      </div>

      {/* Secondary Navigation Row */}
      <div className="subnav">
        <div className="subnav__inner">
          <Link
            to="/"
            className={`subnav__link ${location.pathname === '/' ? 'subnav__link--active' : ''}`}
          >
            홈
          </Link>
          <Link
            to="/best"
            className={`subnav__link ${location.pathname === '/best' ? 'subnav__link--active' : ''}`}
          >
            베스트
          </Link>
          <Link
            to="/shocking-deal"
            className={`subnav__link ${
              location.pathname === '/shocking-deal' ? 'subnav__link--active subnav__link--red' : 'subnav__link--red'
            }`}
          >
            쇼킹딜
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;