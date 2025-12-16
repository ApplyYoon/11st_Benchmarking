import React from 'react';
import '../../styles/ProductSkeleton.css';

const ProductSkeleton = () => {
    return (
        <div className="product-skeleton">
            {/* Image Placeholder */}
            <div className="product-skeleton-image" />

            {/* Text Placeholders */}
            <div className="product-skeleton-text" />
            <div className="product-skeleton-text product-skeleton-text-medium" />
            <div className="product-skeleton-text product-skeleton-text-small" />
        </div>
    );
};

export default ProductSkeleton;
