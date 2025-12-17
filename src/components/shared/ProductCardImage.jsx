import React, { useRef, useCallback, useState } from "react";
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
        <div className="product-card-image-area">
                        <img
                            ref={imgRef}
                            src={product.imageUrl || product.image}
                            alt={product.name}
                            loading="lazy"
                            onLoad={handleImageLoad}
                            className='product-card-image'
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
                            <button onClick={onCartClick}>
                                <ShoppingCart size={18} color="#333" />
                            </button>
                        </div>
                    </div>
    )
}

export default ProductCardImage;