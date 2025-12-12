import React from 'react';

const ProductSkeleton = () => {
    return (
        <div style={{ width: '100%', backgroundColor: 'white' }}>
            {/* Image Placeholder */}
            <div style={{ paddingTop: '100%', backgroundColor: '#eee', borderRadius: '8px', marginBottom: '12px' }} />

            {/* Text Placeholders */}
            <div style={{ height: '20px', backgroundColor: '#eee', marginBottom: '8px', borderRadius: '4px' }} />
            <div style={{ height: '20px', width: '60%', backgroundColor: '#eee', marginBottom: '8px', borderRadius: '4px' }} />
            <div style={{ height: '16px', width: '40%', backgroundColor: '#eee', borderRadius: '4px' }} />
        </div>
    );
};

export default ProductSkeleton;
