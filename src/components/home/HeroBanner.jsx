import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import PopupModal from '../shared/PopupModal';
import '../../styles/HeroBanner.css';

const HeroBanner = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const { addCoupon } = useAuth();

    // 모달 관련 state
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        type: 'confirm',
        title: '',
        message: '',
        onConfirm: () => { }
    });

    const banners = [
        'https://11st-benchmarking-images-storage.s3.amazonaws.com/login-banner-1.png',
        'https://11st-benchmarking-images-storage.s3.amazonaws.com/login-banner-2.png',
        'https://11st-benchmarking-images-storage.s3.amazonaws.com/login-banner-3.png'
    ];

    // 7초마다 자동 슬라이드 (일시정지 상태가 아닐 때만)
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 7000);

        return () => clearInterval(interval);
    }, [isPaused]);

    const handlePrevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const handleNextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const handleBannerClick = (index) => {
        // 3번째 배너 (인덱스 2) 클릭 시에만 모달 띄움
        if (index === 2) {
            setModalConfig({
                type: 'confirm',
                title: '쿠폰 발급',
                message: '신규 회원 전용 혜택!\n의류 대상 5,000원 할인 쿠폰을 받으시겠습니까?',
                onConfirm: handleCouponIssue
            });
            setShowModal(true);
        }
    };

    const handleCouponIssue = async () => {
        const result = await addCoupon(3); // 쿠폰 ID 5

        // 결과 모달로 변경
        setModalConfig({
            type: result.success ? 'success' : 'alert',
            title: result.success ? '발급 완료' : '알림',
            message: result.message,
            onConfirm: () => setShowModal(false) // 확인 누르면 닫기
        });
        // setShowModal(true); // 이미 열려있음, 내용만 바뀜
    };

    return (
        <div className="hero-banner">
            {/* 팝업 모달 */}
            <PopupModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
                onConfirm={modalConfig.onConfirm}
            />

            {banners.map((banner, index) => (
                <div
                    key={index}
                    onClick={() => handleBannerClick(index)}
                    className={`hero-banner-slide ${currentSlide === index ? 'hero-banner-slide-active' : ''} ${index === 2 ? 'hero-banner-slide-clickable' : ''}`}
                    style={{
                        backgroundImage: `url(${banner})`
                    }}
                />
            ))}

            {/* 컨트롤 패널 - 우측 하단 */}
            <div className="hero-banner-controls">
                {/* 일시정지/재생 버튼 */}
                <button
                    onClick={togglePause}
                    className="hero-banner-control-btn"
                >
                    {isPaused ? '▶' : '❚❚'}
                </button>

                {/* 슬라이드 번호 */}
                <div className="hero-banner-slide-number">
                    {currentSlide + 1} / {banners.length}
                </div>

                {/* 이전 버튼 */}
                <button
                    onClick={handlePrevSlide}
                    className="hero-banner-control-btn hero-banner-control-btn-nav"
                >
                    ‹
                </button>

                {/* 다음 버튼 */}
                <button
                    onClick={handleNextSlide}
                    className="hero-banner-control-btn hero-banner-control-btn-nav"
                >
                    ›
                </button>
            </div>

            {/* 인디케이터 - 하단 중앙 */}
            <div className="hero-banner-indicators">
                {banners.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`hero-banner-indicator ${currentSlide === index ? 'hero-banner-indicator-active' : 'hero-banner-indicator-inactive'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroBanner;
