import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, X } from 'lucide-react';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);

    const handleCartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (product.category === 'fashion') {
            setShowSizeModal(true);
            setSelectedSize(null);
        } else {
            addToCart(product);
            alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
        }
    };

    const handleAddWithSize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!selectedSize) {
            alert('사이즈를 선택해주세요.');
            return;
        }
        
        addToCart({ ...product, selectedSize });
        setShowSizeModal(false);
        setSelectedSize(null);
        alert(`${product.name} (${selectedSize})이(가) 장바구니에 추가되었습니다.`);
    };

    const handleCloseModal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowSizeModal(false);
        setSelectedSize(null);
    };

    return (
        <>
        <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ position: 'relative', width: '100%', backgroundColor: 'white' }}
            className="product-card"
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
                        onClick={handleCartClick}
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
        </Link>

        {/* Size Selection Modal */}
        {showSizeModal && (
            <div 
                onClick={handleCloseModal}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}
            >
                <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        width: '320px',
                        maxWidth: '90vw',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}
                >
                    {/* Modal Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>사이즈 선택</h3>
                        <button 
                            onClick={handleCloseModal}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                        >
                            <X size={20} color="#666" />
                        </button>
                    </div>

                    {/* Product Info */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #eee' }}>
                        <img 
                            src={product.image} 
                            alt={product.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', color: '#333', marginBottom: '4px', lineHeight: '1.3' }}>{product.name}</div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{product.price.toLocaleString()}원</div>
                        </div>
                    </div>

                    {/* Size Options */}
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>사이즈를 선택해주세요</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                                    style={{
                                        minWidth: '44px',
                                        height: '36px',
                                        padding: '0 12px',
                                        border: selectedSize === size ? '2px solid #111' : '1px solid #ddd',
                                        backgroundColor: selectedSize === size ? '#111' : '#fff',
                                        color: selectedSize === size ? '#fff' : '#333',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: selectedSize === size ? 'bold' : 'normal',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddWithSize}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: selectedSize ? '#f01a21' : '#ccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            cursor: selectedSize ? 'pointer' : 'not-allowed',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        장바구니 담기
                    </button>
                </div>
            </div>
        )}
        </>
    );
};

export default ProductCard;
