import React from 'react';
import Header from './Header';
import Sidebar from '../Sidebar';
import { useState } from 'react';
import '../../styles.css';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="layout-wrapper">
            <Header onMenuClick={toggleSidebar} />
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            {/* Width constraint is handled by pages themselves to allow full-width banners */}
            <main className="layout-main">
                {children}
            </main>
            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-links">
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
                    <p className="footer-copyright">Copyright © 11st Corp. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
