import React from 'react';
import '../../styles.css';

const ProductSkeleton = () => {
    return (
        <div className="product-skeleton">
            {/* Image Placeholder */}
            <div className="product-skeleton-image" />

            {/* Text Placeholders */}
            <div className="product-skeleton-text" />
            <div className="product-skeleton-text-60" />
            <div className="product-skeleton-text-40" />
        </div>
    );
};

export default ProductSkeleton;
