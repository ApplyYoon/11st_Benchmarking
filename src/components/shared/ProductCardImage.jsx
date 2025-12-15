import React, { useRef, useCallback } from "react";
import { ShoppingCart } from 'lucide-react';

const ProductCardImage = ({ product, onCartClick }) => {
    const imgRef = useRef(null);

    // useCallback으로 안정적인 참조 유지, DOM 직접 조작으로 리렌더링 방지
    const handleImageLoad = useCallback(() => {
        if (imgRef.current) {
            imgRef.current.classList.remove('loading');
            imgRef.current.classList.add('loaded');
        }
    }, []);

    return (
        <div className="product-image-container">
            <img
                ref={imgRef}
                src={product.imageUrl || product.image}
                alt={product.name}
                loading="lazy"
                onLoad={handleImageLoad}
                className="product-image loading"
            />

            {/* Badges */}
            {(product.isTimeDeal || product.timeDeal) && (
                <div className="badge-timedeal">[타임딜]</div>
            )}
            {(product.isBest || product.best) && (
                <div className="badge-best">{product.rank}</div>
            )}

            {/* Hover Action (Cart) */}
            <div className="cart-btn-container">
                <button onClick={onCartClick} className="cart-btn">
                    <ShoppingCart size={18} color="#333" />
                </button>
            </div>
        </div>
    );
};

export default ProductCardImage;
