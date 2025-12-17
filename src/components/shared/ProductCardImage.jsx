import React, { useRef, useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import '../../styles/ProductCard.css';

const ProductCardImage = ({ product, onCartClick }) => {
  const imgRef = useRef(null);

  const handleImageLoad = useCallback(() => {
    const el = imgRef.current;
    if (!el) return;

    el.classList.remove("product-card-image-loading");
    el.classList.add("product-card-image-loaded");
  }, []);

  return (
    <div className="product-card-image-area">
        <img
            ref={imgRef}
            src={product.imageUrl || product.image}
            alt={product.name}
            loading="lazy"
            onLoad={handleImageLoad}
            className="product-card-image product-card-image-loading"
        />

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

      <div className="product-card-cart-btn">
        <button onClick={onCartClick}>
          <ShoppingCart size={18} color="#333" />
        </button>
      </div>
    </div>
  );
};

export default ProductCardImage;