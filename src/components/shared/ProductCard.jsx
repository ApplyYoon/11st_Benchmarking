import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X } from 'lucide-react';
import ProductCardImage from './ProductCardImage';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
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
            <Link to={`/product/${product.id}`} className="product-card-link">
                <div className="product-card">
                    {/* Image Area */}
                    <ProductCardImage product={product} onCartClick={handleCartClick} />

                    {/* Info Area */}
                    <div>
                        <h3 className="product-card-name">
                            {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                        </h3>
                        <div className="product-card-price-row">
                            {(product.discountRate || product.discount) > 0 && (
                                <span className="product-card-discount">{product.discountRate || product.discount}%</span>
                            )}
                            <span className="product-card-price">{product.price.toLocaleString()}</span>
                            <span className="product-card-currency">원</span>
                        </div>
                        {(product.discountRate || product.discount) > 0 && (
                            <div className="product-card-original-price">
                                {product.originalPrice.toLocaleString()}원
                            </div>
                        )}
                        <div className="product-card-badge-container">
                            <span className="product-card-shipping-badge">무료배송</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Size Selection Modal */}
            {showSizeModal && (
                <div onClick={handleCloseModal} className="modal-overlay">
                    <div onClick={(e) => e.stopPropagation()} className="modal-content">
                        {/* Modal Header */}
                        <div className="modal-header">
                            <h3 className="modal-title">사이즈 선택</h3>
                            <button onClick={handleCloseModal} className="modal-close-btn">
                                <X size={20} color="#666" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="modal-product-info">
                            <img
                                src={product.imageUrl || product.image}
                                alt={product.name}
                                className="modal-product-image"
                            />
                            <div className="modal-product-details">
                                <div className="modal-product-name">
                                    {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                                </div>
                                <div className="modal-product-price">{product.price.toLocaleString()}원</div>
                            </div>
                        </div>

                        {/* Size Options */}
                        <div className="size-options-container">
                            <div className="size-options-label">사이즈를 선택해주세요</div>
                            <div className="size-options">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                                        className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddWithSize}
                            className={`add-cart-btn ${selectedSize ? 'active' : ''}`}
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
