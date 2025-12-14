import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Truck, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

import { findClosestMatch } from '../../api/searchUtils';

const Header = ({ onMenuClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            const corrected = findClosestMatch(searchTerm);
            if (corrected) {
                // Navigate with corrected query, but maybe keep original for UI?
                // For now, let's just search for the corrected one directly
                navigate(`/search?q=${encodeURIComponent(corrected)}&original=${encodeURIComponent(searchTerm)}`);
            } else {
                navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            }
            setIsFocused(false);
        }
    };

    return (
        <header style={{ borderBottom: '1px solid #e5e5e5', backgroundColor: 'white', zIndex: 1000, position: 'sticky', top: 0 }}>
            {/* Main Header Row */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '30px', height: '80px' }}>

                {/* Burger Menu & Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={onMenuClick}
                        style={{ border: '1px solid #ddd', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', cursor: 'pointer' }}>
                        <Menu size={24} color="#333" strokeWidth={1.5} />
                    </button>
                    <Link to="/" style={{ fontSize: '34px', fontWeight: '900', textDecoration: 'none', color: '#f01a21', letterSpacing: '-1.5px', fontFamily: 'sans-serif' }}>
                        11st
                    </Link>
                </div>

                {/* 11st Style Rounded Search Bar */}
                <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative', maxWidth: '580px', marginLeft: '20px' }}>
                    <div style={{ position: 'relative', width: '100%' }}>
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
                            style={{
                                width: '100%',
                                padding: '13px 60px 13px 25px',
                                border: '2px solid #f01a21',
                                borderRadius: (searchTerm && isFocused) ? '20px 20px 0 0' : '28px', // Change border radius when open
                                borderBottom: (searchTerm && isFocused) ? 'none' : '2px solid #f01a21',
                                fontSize: '16px',
                                outline: 'none',
                                backgroundColor: '#fff',
                                color: '#333',
                                boxSizing: 'border-box',
                                zIndex: 1002,
                                position: 'relative'
                            }}
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
                                            style={{
                                                padding: '12px 25px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#333'
                                            }}
                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                        >
                                            <span style={{ color: '#f01a21', fontWeight: 'bold' }}>{searchTerm}</span>
                                            {keyword.replace(searchTerm, '')}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        style={{
                            position: 'absolute',
                            right: '6px',
                            top: '24px', // Hardcode for alignment since input height changes visually with border
                            transform: 'translateY(-50%)',
                            background: '#f01a21',
                            border: 'none',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1003
                        }}
                    >
                        <Search color="white" size={20} strokeWidth={2.5} />
                    </button>
                </form>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginLeft: 'auto' }}>
                    {user ? (
                        <div
                            style={{ position: 'relative', cursor: 'pointer', zIndex: 1000, height: '100%', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={() => setIsUserMenuOpen(true)}
                            onMouseLeave={() => setIsUserMenuOpen(false)}
                        >
                            <Link to="/user-info" style={{ textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <User size={26} strokeWidth={1.5} color="#f01a21" />
                                <span style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>{user.name}님</span>
                            </Link>

                            {/* Hover Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: '40px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: 'white',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    padding: '10px 0',
                                    minWidth: '160px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    zIndex: 1001,
                                    whiteSpace: 'nowrap'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        top: '-6px',
                                        left: '50%',
                                        transform: 'translateX(-50%) rotate(45deg)',
                                        width: '10px',
                                        height: '10px',
                                        backgroundColor: 'white',
                                        borderLeft: '1px solid #ddd',
                                        borderTop: '1px solid #ddd',
                                        zIndex: 1002
                                    }}></div>

                                    <Link to="/my-coupons" style={{ display: 'block', padding: '10px 20px', textDecoration: 'none', color: '#333', fontSize: '13px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>
                                        나의 쿠폰
                                    </Link>
                                    <Link to="/mypage" style={{ display: 'block', padding: '10px 20px', textDecoration: 'none', color: '#333', fontSize: '13px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>
                                        주문/배송조회
                                    </Link>
                                    <Link to="/mypage" style={{ display: 'block', padding: '10px 20px', textDecoration: 'none', color: '#333', fontSize: '13px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>
                                        취소/반품/교환
                                    </Link>
                                    <div style={{ width: '100%', height: '1px', backgroundColor: '#eee', margin: '5px 0' }}></div>
                                    <Link to="/" style={{ display: 'block', padding: '10px 20px', textDecoration: 'none', color: '#333', fontSize: '13px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>
                                        고객센터
                                    </Link>
                                    <Link to="/user-info" style={{ display: 'block', padding: '10px 20px', textDecoration: 'none', color: '#333', fontSize: '13px' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>
                                        회원정보
                                    </Link>
                                    <div style={{ width: '100%', height: '1px', backgroundColor: '#eee', margin: '5px 0' }}></div>
                                    <button onClick={logout} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 20px', background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}>
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" style={{ textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <User size={26} strokeWidth={1.5} />
                            <span style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>로그인</span>
                        </Link>
                    )}

                    <Link to="/mypage" style={{ textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <LayoutGrid size={26} strokeWidth={1.5} />
                        <span style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>마이페이지</span>
                    </Link>

                    <Link to="/mypage" style={{ textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Truck size={26} strokeWidth={1.5} />
                        <span style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>주문/배송</span>
                    </Link>

                    <Link to="/cart" style={{ textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                            <ShoppingCart size={26} strokeWidth={1.5} />
                            {cart.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-6px',
                                    right: '-6px',
                                    backgroundColor: '#f01a21',
                                    color: 'white',
                                    borderRadius: '50%',
                                    minWidth: '18px',
                                    height: '18px',
                                    fontSize: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    padding: '0 4px'
                                }}>
                                    {cart.length}
                                </span>
                            )}
                        </div>
                        <span style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>장바구니</span>
                    </Link>
                </div>
            </div>

            {/* Secondary Navigation Row - Replicating top section of 11st */}
            <div style={{ borderTop: '1px solid #f0f0f0' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: '48px', gap: '25px', fontSize: '14px' }}>
                    <Link to="/best" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>베스트</Link>
                    <Link to="/shocking-deal" style={{ textDecoration: 'none', color: '#f01a21', fontWeight: 'bold' }}>쇼킹딜</Link>
                    <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>백화점/홈쇼핑</Link>
                    <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>이벤트/혜택</Link>

                    <div style={{ width: '1px', height: '14px', backgroundColor: '#e5e5e5', margin: '0 5px' }}></div>

                    <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>9900원샵</Link>
                    <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>리퍼블리</Link>
                    <Link to="/" style={{ textDecoration: 'none', color: '#333' }}>기획전</Link>
                    <Link to="/" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ backgroundColor: '#232f3e', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>a</div>
                        아마존
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
