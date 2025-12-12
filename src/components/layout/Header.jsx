import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    return (
        <header style={{ borderBottom: '1px solid #e5e5e5', backgroundColor: 'white', zIndex: 100, position: 'sticky', top: 0 }}>
            {/* Main Header Row */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '30px', height: '80px' }}>

                {/* Burger Menu & Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button style={{ border: '1px solid #ddd', borderRadius: '50%', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', cursor: 'pointer' }}>
                        <Menu size={24} color="#333" strokeWidth={1.5} />
                    </button>
                    <Link to="/" style={{ fontSize: '34px', fontWeight: '900', textDecoration: 'none', color: '#f01a21', letterSpacing: '-1.5px', fontFamily: 'sans-serif' }}>
                        11st
                    </Link>
                </div>

                {/* 11st Style Rounded Search Bar */}
                <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative', maxWidth: '580px', marginLeft: '20px' }}>
                    <input
                        type="text"
                        placeholder="통합검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '13px 60px 13px 25px',
                            border: '2px solid #f01a21',
                            borderRadius: '28px',
                            fontSize: '16px',
                            outline: 'none',
                            backgroundColor: '#fff',
                            color: '#333'
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            position: 'absolute',
                            right: '6px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#f01a21',
                            border: 'none',
                            borderRadius: '50%',
                            width: '38px',
                            height: '38px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Search color="white" size={20} strokeWidth={2.5} />
                    </button>
                </form>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '25px', marginLeft: 'auto' }}>
                    {user ? (
                        <>
                            <div style={{ fontSize: '13px', textAlign: 'center' }}>
                                <span style={{ fontWeight: 'bold' }}>{user.name}</span>님 <br />
                                <button onClick={logout} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#888', fontSize: '11px' }}>로그아웃</button>
                            </div>
                        </>
                    ) : (
                        <Link to="/login" style={{ textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <User size={26} strokeWidth={1.5} />
                            <span style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>로그인</span>
                        </Link>
                    )}

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
                    <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>베스트</Link>
                    <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>타임딜</Link>
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
