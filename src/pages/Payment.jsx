import React, { useEffect, useState } from 'react';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import client from '../api/client';

const clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('ready'); // ready, processing, success, fail
    const [errorMsg, setErrorMsg] = useState('');

    const { amount, orderName } = location.state || {};

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const paymentKey = urlParams.get('paymentKey');
        const orderId = urlParams.get('orderId');
        const amountVal = urlParams.get('amount');

        if (paymentKey && orderId && amountVal) {
            confirmPayment(paymentKey, orderId, parseInt(amountVal));
        }
    }, []);

    const confirmPayment = async (paymentKey, orderId, amount) => {
        try {
            setStatus('processing');
            await client.post('/orders/confirm-payment', {
                paymentKey,
                orderId,
                amount
            });
            setStatus('success');
            clearCart();
        } catch (error) {
            console.error(error);
            setStatus('fail');
            setErrorMsg('결제 승인에 실패했습니다.');
        }
    };

    const handleTossPayment = async () => {
        try {
            const tossPayments = await loadTossPayments(clientKey);
            // Use UUID or timestamp for orderId
            const orderId = `ORDER_${Date.now()}`;

            await tossPayments.requestPayment('카드', {
                amount: amount,
                orderId: orderId,
                orderName: orderName,
                customerName: '고객', // Should replace with real user name from context if available
                successUrl: window.location.origin + '/payment',
                failUrl: window.location.origin + '/payment',
            });
        } catch (err) {
            console.error(err);
        }
    };

    if (status === 'processing') {
        return <div style={{ textAlign: 'center', padding: '100px' }}>결제 승인 중입니다...</div>;
    }

    if (status === 'fail') {
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <h2>결제 실패</h2>
                <p>{errorMsg}</p>
                <button onClick={() => navigate('/cart')}>장바구니로 돌아가기</button>
            </div>
        );
    }

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
