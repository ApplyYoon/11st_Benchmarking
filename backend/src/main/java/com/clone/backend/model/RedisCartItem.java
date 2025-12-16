/**
 * Redis 장바구니 아이템 DTO
 * - Redis Hash에 저장되는 장바구니 항목
 * - 상품 정보 스냅샷 저장 (가격 변동 시에도 담은 시점 가격 유지)
 */
package com.clone.backend.model;

import lombok.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedisCartItem implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long productId;
    private String productName;
    private String productImage;
    private int price;
    private int originalPrice;
    private int discountRate;
    private int quantity;
    private String category; // 상품 카테고리
    private LocalDateTime addedAt;
}
