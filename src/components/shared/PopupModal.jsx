import React from 'react';
import '../../styles.css';

const PopupModal = ({ isOpen, onClose, onConfirm, title, message, type = 'confirm' }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-modal-overlay" onClick={onClose}>
            <div className="popup-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* 아이콘 */}
                <div className="popup-modal-icon">
                    {type === 'confirm' ? '🎁' : (type === 'success' ? '✅' : '⚠️')}
                </div>

                <h3 className="popup-modal-title">
                    {title}
                </h3>

                <p className="popup-modal-message">
                    {message}
                </p>

                <div className="popup-modal-buttons">
                    {type === 'confirm' ? (
                        <>
                            <button onClick={onClose} className="popup-modal-btn popup-modal-btn-cancel">
                                취소
                            </button>
                            <button onClick={onConfirm} className="popup-modal-btn popup-modal-btn-confirm">
                                쿠폰 받기
                            </button>
                        </>
                    ) : (
                        <button onClick={onClose} className="popup-modal-btn popup-modal-btn-confirm">
                            확인
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopupModal;
