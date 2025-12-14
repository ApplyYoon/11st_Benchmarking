/**
 * 주문 상품 항목 POJO (MongoDB 내장 문서)
 * - Order 문서 안에 배열로 포함됨
 * - 상품 ID, 이름, 이미지, 구매 시점 가격, 수량 저장
 */
package com.clone.backend.model;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    private Long productId;
    private String productName;
    private String productImage;

    // We don't need Order reference since it's embedded in Order document

    private int quantity;
    private int priceAtPurchase;
}
