import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { PRODUCTS } from '../../api/mockData';
import ProductCard from '../shared/ProductCard';

const BestSwiper = () => {
    const bestItems = PRODUCTS.filter(p => p.isBest).sort((a, b) => a.rank - b.rank);

    return (
        <div style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: '900', margin: 0, color: '#111' }}>11번가 베스트</h2>
                <span style={{ fontSize: '14px', color: '#666', cursor: 'pointer' }}>더보기 &gt;</span>
            </div>

            <Swiper
                modules={[Navigation]}
                spaceBetween={20}
                slidesPerView={4}
                navigation
                style={{ padding: '5px' }} // Padding for shadows/hover effects
            >
                {bestItems.map(product => (
                    <SwiperSlide key={product.id}>
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default BestSwiper;
