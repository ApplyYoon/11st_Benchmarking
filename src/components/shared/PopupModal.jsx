import React from 'react';

const PopupModal = ({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)', // 배경 어둡게
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999, // 최상단
            backdropFilter: 'blur(2px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: 'white',
                width: '320px',
                borderRadius: '12px',
                padding: '30px 20px 20px 20px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                textAlign: 'center',
                transform: 'translateY(-20px)',
                animation: 'fadeIn 0.2s ease-out forwards'
            }} onClick={(e) => e.stopPropagation()}>

                {/* 아이콘 */}
                <div style={{ fontSize: '40px', marginBottom: '15px' }}>
                    {type === 'confirm' ? '🎁' : (type === 'success' ? '✅' : '⚠️')}
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#111' }}>
                    {title}
                </h3>

                <p style={{ fontSize: '14px', color: '#666', margin: '0 0 25px 0', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {type === 'confirm' ? (
                        <>
                            <button
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '12px 0',
                                    borderRadius: '8px',
                                    border: '1px solid #ddd',
                                    backgroundColor: 'white',
                                    color: '#666',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                취소
                            </button>
                            <button
                                onClick={onConfirm}
                                style={{
                                    flex: 1,
                                    padding: '12px 0',
                                    borderRadius: '8px',
                                    border: 'none',
                                    backgroundColor: '#f01a21',
                                    color: 'white',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                쿠폰 받기
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '12px 0',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: '#f01a21', // 확인 버튼은 빨간색 (11번가 스타일)
                                color: 'white',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            확인
                        </button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(0); }
                    to { opacity: 1; transform: translateY(-20px); }
                }
            `}</style>
        </div>
    );
};

export default PopupModal;
