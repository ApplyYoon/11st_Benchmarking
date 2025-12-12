import React, { useEffect, useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { addOrder } = useAuth();
    const [status, setStatus] = useState('ready'); // ready, processing, success, fail

    const { amount, orderName } = location.state || {};

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amountVal = urlParams.get('amount');

        if (paymentKey && orderId && amountVal) {
            // Confirm payment logic here (usually backend)
            // For now, assume success
            setStatus('success');
            clearCart();
            // Simulate adding order
            addOrder({
                id: orderId,
                name: '상품 결제', // Should pass real name via state or fetch
                amount: parseInt(amountVal),
                date: new Date().toISOString().split('T')[0],
                status: '주문완료'
            });
        }
    }, []);

    const handleTossPayment = async () => {
        const tossPayments = await loadTossPayments(clientKey);
        const orderId = `ORDER_${Date.now()}`;

        await tossPayments.requestPayment('카드', {
            amount: amount,
            orderId: orderId,
            orderName: orderName,
            customerName: '유지원',
            successUrl: window.location.origin + '/payment',
            failUrl: window.location.origin + '/payment',
        });
    };

    if (status === 'success') {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>결제가 완료되었습니다!</h2>
                <div style={{ color: '#666', marginBottom: '40px' }}>주문해주셔서 감사합니다.</div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => navigate('/mypage')} style={{ padding: '12px 30px', border: '1px solid #ddd', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>주문내역 보기</button>
                    <button onClick={() => navigate('/')} style={{ padding: '12px 30px', backgroundColor: '#f01a21', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>쇼핑 계속하기</button>
                </div>
            </div>
        );
    }

    if (!amount) {
        // Direct access fallback
        return <div>잘못된 접근입니다.</div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '60px auto', padding: '40px', border: '1px solid #eee', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' }}>결제하기</h2>

            <div style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <span style={{ color: '#666' }}>주문 상품</span>
                    <span style={{ fontWeight: 'bold' }}>{orderName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px' }}>
                    <span style={{ color: '#333' }}>결제 금액</span>
                    <span style={{ fontWeight: '900', color: '#f01a21' }}>{amount.toLocaleString()}원</span>
                </div>
            </div>

            <button
                onClick={handleTossPayment}
                style={{ width: '100%', padding: '18px', backgroundColor: '#0064FF', color: 'white', border: 'none', borderRadius: '6px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <span>토스페이먼츠로 결제하기</span>
            </button>
        </div>
    );
};

export default Payment;
