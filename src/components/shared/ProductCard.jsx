import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [imageLoaded, setImageLoaded] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate('/payment', {
            state: {
                amount: product.price,
                orderName: product.name,
                category: product.category // 카테고리 정보 전달
            }
        });
    };

    return (
        <div
            style={{ position: 'relative', width: '100%', backgroundColor: 'white', cursor: 'pointer' }}
            className="product-card"
            onClick={handleCardClick}
        >
            {/* Image Area */}
            <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', borderRadius: '8px', backgroundColor: '#f4f4f4', marginBottom: '12px' }}>
                <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    onLoad={() => setImageLoaded(true)}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: imageLoaded ? 1 : 0,
                        transition: 'opacity 0.4s ease-in-out'
                    }}
                />

                {/* Badges */}
                {product.isTimeDeal && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#f01a21', color: 'white', padding: '5px 10px', fontSize: '12px', fontWeight: 'bold', borderRadius: '4px', zIndex: 5 }}>
                        타임딜
                    </div>
                )}
                {product.isBest && (
                    <div style={{ position: 'absolute', top: '0', left: '12px', backgroundColor: '#333', color: 'white', width: '32px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '900', clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)', zIndex: 5 }}>
                        {product.rank}
                    </div>
                )}

                {/* Hover Action (Cart) */}
                <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addToCart(product); }}
                        style={{
                            width: '36px', height: '36px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            border: '1px solid #eee',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <ShoppingCart size={18} color="#333" />
                    </button>
                </div>
            </div>

            {/* Info Area */}
            <div>
                <h3 style={{ fontSize: '14px', color: '#111', margin: '0 0 8px', lineHeight: '1.4', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', fontWeight: 'normal' }}>
                    {product.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {product.discount > 0 && (
                        <span style={{ color: '#f01a21', fontWeight: '900', fontSize: '18px', fontFamily: 'sans-serif' }}>{product.discount}%</span>
                    )}
                    <span style={{ fontWeight: '900', fontSize: '18px', color: '#111', fontFamily: 'sans-serif' }}>{product.price.toLocaleString()}</span>
                    <span style={{ fontSize: '14px', fontWeight: 'normal' }}>원</span>
                </div>
                {product.discount > 0 && (
                    <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '13px', marginTop: '2px' }}>
                        {product.originalPrice.toLocaleString()}원
                    </div>
                )}
                <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#666', border: '1px solid #ddd', padding: '2px 4px', borderRadius: '2px' }}>무료배송</span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
