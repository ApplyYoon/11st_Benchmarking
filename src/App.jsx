import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/shared/ScrollToTop';

// Lazy load pages for performance
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const ShockingDeal = lazy(() => import('./pages/ShockingDeal'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Cart = lazy(() => import('./pages/Cart'));
const Payment = lazy(() => import('./pages/Payment'));
const MyPage = lazy(() => import('./pages/MyPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Best = lazy(() => import('./pages/Best'));
const MyCoupons = lazy(() => import('./pages/MyCoupons'));
const UserInfo = lazy(() => import('./pages/UserInfo'));
const KakaoCallback = lazy(() => import('./pages/KakaoCallback'));

function App() {
    return (
        <>
            <ScrollToTop />
            <Layout>
                <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/shocking-deal" element={<ShockingDeal />} />
                        <Route path="/best" element={<Best />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/payment" element={<Payment />} />
                        <Route path="/mypage" element={<MyPage />} />
                        <Route path="/my-coupons" element={<MyCoupons />} />
                        <Route path="/user-info" element={<UserInfo />} />
                    </Routes>
                </Suspense>
            </Layout>
        </>
    );
}

export default App;
