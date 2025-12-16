import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, X } from 'lucide-react';
import '../../styles/ProductCard.css';

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
import { useNavigate } from 'react-router-dom';

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
            <Link to={`/product/${product.id}`} className="product-card-link">
                <div style={{ position: 'relative', width: '100%', backgroundColor: 'white' }}
                    className="product-card"
                >
                    {/* Image Area */}
                    <div className="product-card-image-area">
                        <img
                            src={product.imageUrl || product.image}
                            alt={product.name}
                            loading="lazy"
                            onLoad={() => setImageLoaded(true)}
                            className={`product-card-image ${imageLoaded ? 'product-card-image-loaded' : 'product-card-image-loading'}`}
                        />

                        {/* Badges */}
                        {(product.isTimeDeal || product.timeDeal) && (
                            <div className="product-card-badge">
                                [타임딜]
                            </div>
                        )}
                        {(product.isBest || product.best) && (
                            <div className="product-card-rank">
                                {product.rank}
                            </div>
                        )}

                        {/* Hover Action (Cart) */}
                        <div className="product-card-cart-btn">
                            <button onClick={handleCartClick}>
                                <ShoppingCart size={18} color="#333" />
                            </button>
                        </div>
                    </div>

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
                            <span className="product-card-price-unit">원</span>
                        </div>
                        {(product.discountRate || product.discount) > 0 && (
                            <div className="product-card-original-price">
                                {product.originalPrice.toLocaleString()}원
                            </div>
                        )}
                        <div className="product-card-shipping">
                            <span className="product-card-shipping-badge">무료배송</span>
                        </div>
                    </div>
                </div>
            </Link>

            {/* Size Selection Modal */}
            {showSizeModal && (
                <div
                    onClick={handleCloseModal}
                    className="product-card-size-modal"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="product-card-size-modal-box"
                    >
                        {/* Modal Header */}
                        <div className="product-card-size-modal-header">
                            <h3 className="product-card-size-modal-title">사이즈 선택</h3>
                            <button
                                onClick={handleCloseModal}
                                className="product-card-size-modal-close"
                            >
                                <X size={20} color="#666" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="product-card-size-modal-product">
                            <img
                                src={product.imageUrl || product.image}
                                alt={product.name}
                                className="product-card-size-modal-product-image"
                            />
                            <div className="product-card-size-modal-product-info">
                                <div className="product-card-size-modal-product-name">
                                    {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                                </div>
                                <div className="product-card-size-modal-product-price">{product.price.toLocaleString()}원</div>
                            </div>
                        </div>

                        {/* Size Options */}
                        <div className="product-card-size-modal-options">
                            <div className="product-card-size-modal-label">사이즈를 선택해주세요</div>
                            <div className="product-card-size-modal-buttons">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={(e) => { e.stopPropagation(); setSelectedSize(size); }}
                                        className={`product-card-size-btn ${selectedSize === size ? 'product-card-size-btn-selected' : 'product-card-size-btn-unselected'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddWithSize}
                            className={`product-card-size-modal-add-btn ${selectedSize ? 'product-card-size-modal-add-btn-enabled' : 'product-card-size-modal-add-btn-disabled'}`}
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
