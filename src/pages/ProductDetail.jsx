import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { REVIEWS, QNA } from '../api/mockData';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Heart, Share2, ChevronLeft, Truck, Shield, RotateCcw } from 'lucide-react';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isWished, setIsWished] = useState(false);
    const [selectedSize, setSelectedSize] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [activeTab, setActiveTab] = useState('detail');

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const tabs = [
        { id: 'detail', label: '상품상세정보' },
        { id: 'review', label: '리뷰' },
        { id: 'qna', label: 'Q&A' }
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await client.get(`/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                console.error("Failed to fetch product detail", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
    };

    // 해당 상품의 리뷰와 Q&A 필터링 (Mock 데이터 유지)
    const productReviews = REVIEWS.filter(r => r.productId === Number(id));
    const productQna = QNA.filter(q => q.productId === Number(id));

    // 리뷰 평점 계산
    const averageRating = productReviews.length > 0
        ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
        : 0;

    // 별점별 개수 계산
    const ratingCounts = [5, 4, 3, 2, 1].map(rating =>
        productReviews.filter(r => r.rating === rating).length
    );

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

    if (!product) {
        return (
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '24px', color: '#333', marginBottom: '20px' }}>상품을 찾을 수 없습니다</h2>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#f01a21',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px'
                    }}
                >
                    홈으로 돌아가기
                </button>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.category === 'fashion' && !selectedSize) {
            alert('사이즈를 선택해주세요.');
            return;
        }
        for (let i = 0; i < quantity; i++) {
            addToCart({ ...product, selectedSize });
        }
        alert(`${product.name}이(가) 장바구니에 추가되었습니다.`);
    };

    const handleBuyNow = () => {
        if (product.category === 'fashion' && !selectedSize) {
            alert('사이즈를 선택해주세요.');
            return;
        }

        // 바로구매 클릭 시 결제 페이지로 이동
        const totalAmount = product.price * quantity;
        const orderName = product.name + (quantity > 1 ? ` (${quantity}개)` : '');

        navigate('/payment', {
            state: {
                amount: totalAmount,
                orderName,
                category: product.category
            }
        });
    };

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px' }}>
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: '14px',
                    marginBottom: '20px',
                    padding: '8px 0'
                }}
            >
                <ChevronLeft size={20} />
                뒤로가기
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px' }}>
                {/* Product Image */}
                <div style={{ position: 'relative' }}>
                    <div
                        style={{
                            position: 'relative',
                            paddingTop: '100%',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: '#f4f4f4',
                            cursor: 'crosshair'
                        }}
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        onMouseMove={handleMouseMove}
                    >
                        <img
                            src={product.image}
                            alt={product.name}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />

                        {/* Hover Indicator Box */}
                        {isHovering && (
                            <div
                                style={{
                                    position: 'absolute',
                                    width: '120px',
                                    height: '120px',
                                    border: '2px solid rgb(0, 0, 0)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.32)',
                                    pointerEvents: 'none',
                                    left: `calc(${mousePosition.x}% - 60px)`,
                                    top: `calc(${mousePosition.y}% - 60px)`,
                                    zIndex: 5
                                }}
                            />
                        )}

                        {product.isTimeDeal && (
                            <div style={{
                                position: 'absolute',
                                top: '16px',
                                left: '16px',
                                backgroundColor: '#f01a21',
                                color: 'white',
                                padding: '8px 16px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                borderRadius: '6px',
                                zIndex: 6
                            }}>
                                타임딜
                            </div>
                        )}
                        {product.isBest && (
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                left: '16px',
                                backgroundColor: '#333',
                                color: 'white',
                                width: '40px',
                                height: '48px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '22px',
                                fontWeight: '900',
                                clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)',
                                zIndex: 6
                            }}>
                                {product.rank}
                            </div>
                        )}
                    </div>

                    {/* Zoom Preview - Shows on the right side */}
                    {isHovering && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 'calc(100% + 20px)',
                                width: '400px',
                                height: '400px',
                                border: '1px solid #ddd',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                backgroundColor: '#fff',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                zIndex: 100,
                                backgroundImage: `url(${product.image})`,
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '300%',
                                backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`
                            }}
                        />
                    )}
                </div>

                {/* Product Info */}
                <div>
                    {/* Category */}
                    <div style={{ fontSize: '14px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                        {product.category}
                    </div>

                    {/* Title */}
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#111', marginBottom: '20px', lineHeight: '1.4' }}>
                        {product.name}
                    </h1>

                    {/* Price */}
                    <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #eee' }}>
                        {product.discount > 0 && (
                            <div style={{ textDecoration: 'line-through', color: '#999', fontSize: '16px', marginBottom: '4px' }}>
                                {product.originalPrice.toLocaleString()}원
                            </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {product.discount > 0 && (
                                <span style={{ color: '#f01a21', fontWeight: '900', fontSize: '32px' }}>
                                    {product.discount}%
                                </span>
                            )}
                            <span style={{ fontWeight: '900', fontSize: '32px', color: '#111' }}>
                                {product.price.toLocaleString()}
                            </span>
                            <span style={{ fontSize: '20px', color: '#111' }}>원</span>
                        </div>
                    </div>

                    {/* Delivery Info */}
                    <div style={{ marginBottom: '24px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Truck size={20} color="#666" />
                            <span style={{ fontSize: '14px', color: '#333' }}>
                                <strong>무료배송</strong> · 내일 도착 예정
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Shield size={20} color="#666" />
                            <span style={{ fontSize: '14px', color: '#333' }}>
                                11번가 안전거래 보장
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <RotateCcw size={20} color="#666" />
                            <span style={{ fontSize: '14px', color: '#333' }}>
                                7일 이내 무료 반품
                            </span>
                        </div>
                    </div>

                    {/* Size Selection - Only for fashion category */}
                    {product.category === 'fashion' && (
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                                사이즈 <span style={{ color: '#f01a21' }}>*</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        style={{
                                            minWidth: '48px',
                                            height: '40px',
                                            padding: '0 16px',
                                            border: selectedSize === size ? '2px solid #111' : '1px solid #ddd',
                                            backgroundColor: selectedSize === size ? '#111' : '#fff',
                                            color: selectedSize === size ? '#fff' : '#333',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: selectedSize === size ? 'bold' : 'normal',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {!selectedSize && (
                                <div style={{ fontSize: '12px', color: '#f01a21', marginTop: '8px' }}>
                                    사이즈를 선택해주세요
                                </div>
                            )}
                        </div>
                    )}

                    {/* Quantity */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>수량</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    borderRadius: '4px 0 0 4px'
                                }}
                            >
                                -
                            </button>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{
                                    width: '60px',
                                    height: '40px',
                                    border: '1px solid #ddd',
                                    borderLeft: 'none',
                                    borderRight: 'none',
                                    textAlign: 'center',
                                    fontSize: '16px',
                                    backgroundColor: '#fff',
                                    MozAppearance: 'textfield',
                                    WebkitAppearance: 'none',
                                    appearance: 'textfield'
                                }}
                            />
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    borderRadius: '0 4px 4px 0'
                                }}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Total Price */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '20px 0',
                        borderTop: '1px solid #eee',
                        marginBottom: '24px'
                    }}>
                        <span style={{ fontSize: '16px', color: '#666' }}>총 상품금액</span>
                        <span style={{ fontSize: '28px', fontWeight: '900', color: '#f01a21' }}>
                            {(product.price * quantity).toLocaleString()}원
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setIsWished(!isWished)}
                            style={{
                                width: '56px',
                                height: '56px',
                                border: '1px solid #ddd',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Heart size={24} color={isWished ? '#f01a21' : '#666'} fill={isWished ? '#f01a21' : 'none'} />
                        </button>
                        <button
                            onClick={handleAddToCart}
                            style={{
                                flex: 1,
                                height: '56px',
                                border: '1px solid #333',
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}
                        >
                            <ShoppingCart size={20} />
                            장바구니
                        </button>
                        <button
                            onClick={handleBuyNow}
                            style={{
                                flex: 1,
                                height: '56px',
                                border: 'none',
                                backgroundColor: '#f01a21',
                                color: 'white',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            바로구매
                        </button>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{ marginTop: '60px', borderTop: '1px solid #eee' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '20px',
                                fontSize: '16px',
                                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                                color: activeTab === tab.id ? '#f01a21' : '#666',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab.id ? '3px solid #f01a21' : '3px solid transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                            {tab.id === 'review' && <span style={{ marginLeft: '4px', color: '#999' }}>({productReviews.length})</span>}
                            {tab.id === 'qna' && <span style={{ marginLeft: '4px', color: '#999' }}>({productQna.length})</span>}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ paddingTop: '40px' }}>
                    {/* 상품상세정보 탭 */}
                    {activeTab === 'detail' && (
                        <div>
                            <div style={{ padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '12px', textAlign: 'center' }}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '20px' }}
                                />
                                <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.8' }}>
                                    {product.name}의 상세 설명입니다.<br />
                                    고품질의 상품으로 고객님의 만족을 보장합니다.<br />
                                    11번가에서만 만나볼 수 있는 특별한 가격!
                                </p>
                            </div>

                            {/* 상품 스펙 */}
                            <div style={{ marginTop: '40px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>상품 정보</h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        <tr style={{ borderTop: '1px solid #eee' }}>
                                            <td style={{ padding: '16px', backgroundColor: '#f9f9f9', width: '150px', fontSize: '14px', color: '#666' }}>상품명</td>
                                            <td style={{ padding: '16px', fontSize: '14px' }}>{product.name}</td>
                                        </tr>
                                        <tr style={{ borderTop: '1px solid #eee' }}>
                                            <td style={{ padding: '16px', backgroundColor: '#f9f9f9', fontSize: '14px', color: '#666' }}>카테고리</td>
                                            <td style={{ padding: '16px', fontSize: '14px', textTransform: 'capitalize' }}>{product.category}</td>
                                        </tr>
                                        <tr style={{ borderTop: '1px solid #eee' }}>
                                            <td style={{ padding: '16px', backgroundColor: '#f9f9f9', fontSize: '14px', color: '#666' }}>판매가</td>
                                            <td style={{ padding: '16px', fontSize: '14px' }}>{product.price.toLocaleString()}원</td>
                                        </tr>
                                        <tr style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '16px', backgroundColor: '#f9f9f9', fontSize: '14px', color: '#666' }}>배송비</td>
                                            <td style={{ padding: '16px', fontSize: '14px' }}>무료배송</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 리뷰 탭 */}
                    {activeTab === 'review' && (
                        <div>
                            {productReviews.length > 0 ? (
                                <>
                                    {/* 리뷰 요약 */}
                                    <div style={{ display: 'flex', gap: '40px', padding: '30px', backgroundColor: '#f9f9f9', borderRadius: '12px', marginBottom: '30px' }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '48px', fontWeight: '900', color: '#f01a21' }}>{averageRating}</div>
                                            <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', marginTop: '8px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <span key={star} style={{ color: star <= Math.round(averageRating) ? '#ffc107' : '#ddd', fontSize: '20px' }}>★</span>
                                                ))}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>{productReviews.length}개 리뷰</div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            {[5, 4, 3, 2, 1].map((rating, index) => (
                                                <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                    <span style={{ fontSize: '13px', color: '#666', width: '20px' }}>{rating}점</span>
                                                    <div style={{ flex: 1, height: '8px', backgroundColor: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: productReviews.length > 0 ? `${(ratingCounts[index] / productReviews.length) * 100}%` : '0%',
                                                            height: '100%',
                                                            backgroundColor: '#ffc107'
                                                        }} />
                                                    </div>
                                                    <span style={{ fontSize: '13px', color: '#999', width: '30px' }}>
                                                        {ratingCounts[index]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 리뷰 목록 */}
                                    {productReviews.map(review => (
                                        <div key={review.id} style={{ padding: '24px 0', borderBottom: '1px solid #eee' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '2px' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <span key={star} style={{ color: star <= review.rating ? '#ffc107' : '#ddd', fontSize: '14px' }}>★</span>
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{review.user}</span>
                                                </div>
                                                <span style={{ fontSize: '13px', color: '#999' }}>{review.date}</span>
                                            </div>
                                            <p style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '0 0 12px' }}>{review.content}</p>
                                            <button style={{
                                                fontSize: '13px',
                                                color: '#666',
                                                backgroundColor: '#f5f5f5',
                                                border: 'none',
                                                padding: '6px 12px',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}>
                                                👍 도움돼요 ({review.helpful})
                                            </button>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                                    <p style={{ fontSize: '16px' }}>아직 작성된 리뷰가 없습니다.</p>
                                    <p style={{ fontSize: '14px' }}>첫 번째 리뷰를 작성해 주세요!</p>
                                </div>
                            )}

                            {/* 더보기 버튼 */}
                            {productReviews.length > 0 && (
                                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                    <button style={{
                                        padding: '14px 60px',
                                        fontSize: '14px',
                                        border: '1px solid #ddd',
                                        backgroundColor: '#fff',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}>
                                        리뷰 더보기
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Q&A 탭 */}
                    {activeTab === 'qna' && (
                        <div>
                            {/* Q&A 작성 버튼 */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ fontSize: '14px', color: '#666' }}>총 <strong>{productQna.length}</strong>개의 문의가 있습니다.</div>
                                <button style={{
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    backgroundColor: '#333',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}>
                                    문의하기
                                </button>
                            </div>

                            {productQna.length > 0 ? (
                                <>
                                    {/* Q&A 목록 */}
                                    {productQna.map(qna => (
                                        <div key={qna.id} style={{ borderBottom: '1px solid #eee' }}>
                                            {/* 질문 */}
                                            <div style={{ padding: '20px 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        padding: '4px 8px',
                                                        fontSize: '12px',
                                                        fontWeight: 'bold',
                                                        backgroundColor: qna.isAnswered ? '#e8f5e9' : '#fff3e0',
                                                        color: qna.isAnswered ? '#2e7d32' : '#ef6c00',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {qna.isAnswered ? '답변완료' : '답변대기'}
                                                    </span>
                                                    <span style={{ fontSize: '13px', color: '#666' }}>{qna.user}</span>
                                                    <span style={{ fontSize: '13px', color: '#999' }}>{qna.date}</span>
                                                </div>
                                                <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>
                                                    <strong style={{ color: '#f01a21', marginRight: '8px' }}>Q.</strong>
                                                    {qna.question}
                                                </p>
                                            </div>

                                            {/* 답변 */}
                                            {qna.answer && (
                                                <div style={{ padding: '20px', backgroundColor: '#f9f9f9', marginBottom: '20px', borderRadius: '8px' }}>
                                                    <p style={{ fontSize: '14px', color: '#333', margin: 0 }}>
                                                        <strong style={{ color: '#333', marginRight: '8px' }}>A.</strong>
                                                        {qna.answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* 더보기 버튼 */}
                                    <div style={{ textAlign: 'center', marginTop: '30px' }}>
                                        <button style={{
                                            padding: '14px 60px',
                                            fontSize: '14px',
                                            border: '1px solid #ddd',
                                            backgroundColor: '#fff',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}>
                                            문의 더보기
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                                    <p style={{ fontSize: '16px' }}>아직 등록된 문의가 없습니다.</p>
                                    <p style={{ fontSize: '14px' }}>궁금한 점이 있으시면 문의해 주세요!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;

