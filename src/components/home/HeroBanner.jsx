import React, { useState, useEffect } from 'react';



import { useAuth } from '../../context/AuthContext';
import PopupModal from '../shared/PopupModal'; // 모달 import

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

    const handleCouponIssue = () => {
        const result = addCoupon(5); // 쿠폰 ID 5

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
        <div style={{
            width: '100%',
            maxWidth: '1280px',
            height: '400px',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '60px',
            margin: '0 auto 60px auto'
        }}>
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
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: currentSlide === index ? 1 : 0,
                        transition: 'opacity 1s ease-in-out',
                        backgroundImage: `url(${banner})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        zIndex: currentSlide === index ? 1 : 0, // 현재 슬라이드만 클릭 가능하도록 위로 올림
                        cursor: index === 2 ? 'pointer' : 'default' // 3번째 배너만 포인터 커서
                    }}
                />
            ))}

            {/* 컨트롤 패널 - 우측 하단 */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                zIndex: 10
            }}>
                {/* 일시정지/재생 버튼 */}
                <button
                    onClick={togglePause}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(4px)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.7)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    {isPaused ? '▶' : '❚❚'}
                </button>

                {/* 슬라이드 번호 */}
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '8px 14px',
                    borderRadius: '18px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    {currentSlide + 1} / {banners.length}
                </div>

                {/* 이전 버튼 */}
                <button
                    onClick={handlePrevSlide}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(4px)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.7)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    ‹
                </button>

                {/* 다음 버튼 */}
                <button
                    onClick={handleNextSlide}
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        transition: 'all 0.2s',
                        backdropFilter: 'blur(4px)'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.7)';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'rgba(0,0,0,0.5)';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    ›
                </button>
            </div>

            {/* 인디케이터 - 하단 중앙 */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 10
            }}>
                {banners.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        style={{
                            width: currentSlide === index ? '28px' : '8px',
                            height: '8px',
                            borderRadius: '4px',
                            backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroBanner;
