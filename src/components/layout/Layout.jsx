import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'sans-serif' }}>
            <Header />
            {/* Width constraint is handled by pages themselves to allow full-width banners */}
            <main style={{ flex: 1, width: '100%', backgroundColor: 'white' }}>
                {children}
            </main>
            <footer style={{ backgroundColor: '#f9f9f9', padding: '50px 20px', borderTop: '1px solid #e5e5e5', color: '#666', fontSize: '12px' }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', fontWeight: 'bold', color: '#333' }}>
                        <span>이용약관</span>
                        <span>개인정보처리방침</span>
                        <span>청소년보호정책</span>
                        <span>분쟁해결기준</span>
                        <span>판매회원약관</span>
                    </div>
                    <p>11번가(주) | 대표이사: 박토스</p>
                    <p>사업자등록번호: 230-00-12345 | 통신판매업신고: 2024-서울강남-00000</p>
                    <p>주소: 서울특별시 강남구 테헤란로 152 강남파이낸스센터</p>
                    <p>고객센터: 1599-0110 | 팩스: 02-1234-5678 | 이메일: customerservice@11st.co.kr</p>
                    <p style={{ marginTop: '15px' }}>Copyright © 11st Corp. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
