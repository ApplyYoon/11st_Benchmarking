import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../api/productApi';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, ChevronLeft, Truck, Shield, RotateCcw } from 'lucide-react';
import { getCategoryName } from '../utils/categoryUtils';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isWished, setIsWished] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const data = await productApi.getProduct(id);
                setProduct(data);
            } catch (error) {
                console.error('상품 로딩 실패:', error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
    };

    if (loading) {
        return (
            <div className="product-detail-loading">
                <div className="product-detail-spinner" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-error">
                <h2 className="product-detail-error-title">상품을 찾을 수 없습니다</h2>
                <button
                    onClick={() => navigate('/')}
                    className="product-detail-error-btn"
                >
                    홈으로 돌아가기
                </button>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.category === 'fashion' && !selectedSize) {
            alert('사이즈를 선택해주세요.');
            return;
        }
        for (let i = 0; i < quantity; i++) {
            addToCart({ ...product, selectedSize });
        }
        alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
    };

    const handleBuyNow = () => {
        if (product.category === 'fashion' && !selectedSize) {
            alert('사이즈를 선택해주세요.');
            return;
        }

        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        const totalAmount = product.price * quantity;
        const orderName = product.name + (quantity > 1 ? ` (${quantity}개)` : '');

        navigate('/payment', {
            state: {
                amount: totalAmount,
                orderName,
                category: product.category,
                items: [{ ...product, quantity, selectedSize }]
            }
        });
    };

    return (
        <div className="product-detail-container">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="product-detail-back-btn"
            >
                <ChevronLeft size={20} />
                뒤로가기
            </button>

            <div className="product-detail-grid">
                {/* Product Image */}
                <div className="product-detail-image-wrapper">
                    <div
                        className="product-detail-image-container"
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        onMouseMove={handleMouseMove}
                    >
                        <img
                            src={product.imageUrl || product.image}
                            alt={product.name}
                            className="product-detail-image"
                        />

                        {/* Hover Indicator Box */}
                        {isHovering && (
                            <div
                                className="product-detail-hover-box"
                                style={{
                                    left: `calc(${mousePosition.x}% - 60px)`,
                                    top: `calc(${mousePosition.y}% - 60px)`
                                }}
                            />
                        )}

                        {(product.isTimeDeal || product.timeDeal) && (
                            <div className="product-detail-badge-timedeal">
                                [타임딜]
                            </div>
                        )}
                        {product.isBest && (
                            <div className="product-detail-badge-best">
                                {product.rank}
                            </div>
                        )}
                    </div>

                    {/* Zoom Preview - Shows on the right side */}
                    {isHovering && (
                        <div
                            className="product-detail-zoom-preview"
                            style={{
                                backgroundImage: `url(${product.imageUrl || product.image})`,
                                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`
                            }}
                        />
                    )}
                </div>

                {/* Product Info */}
                <div>
                    {/* Category */}
                    <div className="product-detail-category">
                        {getCategoryName(product.category)}
                    </div>

                    {/* Title */}
                    <h1 className="product-detail-title">
                        {(product.isTimeDeal || product.timeDeal) ? `[타임딜] ${product.name}` : product.name}
                    </h1>

                    {/* Price */}
                    <div className="product-detail-price-section">
                        {(product.discountRate || product.discount) > 0 && (
                            <div className="product-detail-original-price">
                                {product.originalPrice.toLocaleString()}원
                            </div>
                        )}
                        <div className="product-detail-price-row">
                            {(product.discountRate || product.discount) > 0 && (
                                <span className="product-detail-discount">
                                    {product.discountRate || product.discount}%
                                </span>
                            )}
                            <span className="product-detail-price">
                                {product.price.toLocaleString()}
                            </span>
                            <span className="product-detail-currency">원</span>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="product-detail-delivery">
                        <div className="product-detail-delivery-item">
                            <Truck size={20} color="#666" />
                            <span className="product-detail-delivery-text">
                                <strong>무료배송</strong> · 내일 도착 예정
                            </span>
                        </div>
                        <div className="product-detail-delivery-item">
                            <Shield size={20} color="#666" />
                            <span className="product-detail-delivery-text">
                                11번가 안전거래 보장
                            </span>
                        </div>
                        <div className="product-detail-delivery-item">
                            <RotateCcw size={20} color="#666" />
                            <span className="product-detail-delivery-text">
                                7일 이내 무료 반품
                            </span>
                        </div>
                    </div>

                    {/* Size Selection - Only for fashion category */}
                    {product.category === 'fashion' && (
                        <div className="product-detail-size-section">
                            <div className="product-detail-size-label">
                                사이즈 <span className="product-detail-size-label-required">*</span>
                            </div>
                            <div className="product-detail-size-buttons">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`product-detail-size-btn ${selectedSize === size ? 'product-detail-size-btn-selected' : ''}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {!selectedSize && (
                                <div className="product-detail-size-warning">
                                    사이즈를 선택해주세요
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="product-detail-quantity-section">
                        <div className="product-detail-quantity-label">수량</div>
                        <div className="product-detail-quantity-controls">
                            <button
                                onClick={() => setQuantity(Math.max(0, quantity - 1))}
                                className="product-detail-quantity-btn product-detail-quantity-btn-decrease"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === '') {
                                        setQuantity('');
                                    } else {
                                        setQuantity(Math.max(0, parseInt(value) || 0));
                                    }
                                }}
                                onBlur={() => {
                                    if (quantity === '') setQuantity(1);
                                }}
                                className="product-detail-quantity-input"
                            />
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="product-detail-quantity-btn product-detail-quantity-btn-increase"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Total Price */}
                    <div className="product-detail-total">
                        <span className="product-detail-total-label">총 상품금액</span>
                        <span className="product-detail-total-amount">
                            {(product.price * quantity).toLocaleString()}원
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="product-detail-actions">
                        <button
                            onClick={() => setIsWished(!isWished)}
                            className="product-detail-wish-btn"
                        >
                            <Heart size={24} color={isWished ? '#f01a21' : '#666'} fill={isWished ? '#f01a21' : 'none'} />
                        </button>
                        <button
                            onClick={handleAddToCart}
                            className="product-detail-cart-btn"
                        >
                            <ShoppingCart size={20} />
                            장바구니
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="product-detail-buy-btn"
                        >
                            바로구매
                        </button>
                    </div>
                </div>
            </div>

            {/* 상품상세정보 */}
            <div className="product-detail-details-section">
                <div className="product-detail-description">
                    <img
                        src={product.imageUrl || product.image}
                        alt={product.name}
                        className="product-detail-description-image"
                    />
                    <p className="product-detail-description-text">
                        {product.name}의 상세 설명입니다.<br />
                        고품질의 상품으로 고객님의 만족을 보장합니다.<br />
                        11번가에서만 만나볼 수 있는 특별한 가격!
                    </p>
                </div>

                {/* 상품 스펙 */}
                <div className="product-detail-spec-section">
                    <h3 className="product-detail-spec-title">상품 정보</h3>
                    <table className="product-detail-spec-table">
                        <tbody>
                            <tr className="product-detail-spec-row">
                                <td className="product-detail-spec-label">상품명</td>
                                <td className="product-detail-spec-value">{product.name}</td>
                            </tr>
                            <tr className="product-detail-spec-row">
                                <td className="product-detail-spec-label">카테고리</td>
                                <td className="product-detail-spec-value">{getCategoryName(product.category)}</td>
                            </tr>
                            <tr className="product-detail-spec-row">
                                <td className="product-detail-spec-label">판매가</td>
                                <td className="product-detail-spec-value">{product.price.toLocaleString()}원</td>
                            </tr>
                            <tr className="product-detail-spec-row">
                                <td className="product-detail-spec-label">배송비</td>
                                <td className="product-detail-spec-value">무료배송</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
