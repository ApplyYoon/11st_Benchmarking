import React, { useState } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import TimeDeal from '../components/home/TimeDeal';
import BestSwiper from '../components/home/BestSwiper';
import MDRecommends from '../components/home/MDRecommends';
import '../styles/Home.css';

const Home = () => {
    const [isBestLoaded, setIsBestLoaded] = useState(false);

    return (
        <div>
            <HeroBanner />
            <div className="home-container">
                <TimeDeal />
                <BestSwiper onLoadComplete={() => setIsBestLoaded(true)} />
                {isBestLoaded && <MDRecommends />}
            </div>
        </div>
    );
};

export default Home;
