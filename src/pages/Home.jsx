import React, { useState } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import TimeDeal from '../components/home/TimeDeal';
import BestSwiper from '../components/home/BestSwiper';
import MDRecommends from '../components/home/MDRecommends';


const Home = () => {
    const [isBestLoaded, setIsBestLoaded] = useState(false);

    return (
        <div>
            <HeroBanner />
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 60px' }}>

                <TimeDeal />
                <BestSwiper onLoadComplete={() => setIsBestLoaded(true)} />
                {isBestLoaded && <MDRecommends />}
            </div>
        </div>
    );
};

export default Home;
