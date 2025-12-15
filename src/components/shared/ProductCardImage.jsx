import React, { useState } from "react";
import { ShoppingCart } from 'lucide-react';

const ProductCardImage = ({ product, onCartClick }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <div className="product-image-container">
            <img
                src={product.imageUrl || product.image}
                alt={product.name}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`product-image ${imageLoaded ? 'loaded' : 'loading'}`}
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
