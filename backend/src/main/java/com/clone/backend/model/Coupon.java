/**
 * 쿠폰 엔티티 (PostgreSQL)
 * - 쿠폰명, 할인 타입(금액/비율), 할인 금액/비율, 최소 주문 금액
 * - 카테고리 제한, 최대 할인 금액, 유효기간
 */
package com.clone.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @jakarta.persistence.Enumerated(jakarta.persistence.EnumType.STRING)
    private CouponType type;

    // 금액 할인 쿠폰의 경우
    private Integer discountAmount;

    // 비율 할인 쿠폰의 경우
    private Integer discountRate;
    private Integer maxDiscountAmount; // 비율 할인 시 최대 할인 금액

    private Integer minOrderAmount; // 최소 주문 금액

    private String category; // 카테고리 제한 (null이면 전체 상품)

    private LocalDateTime validFrom; // 유효 시작일
    private LocalDateTime validUntil; // 유효 종료일

    public enum CouponType {
        AMOUNT,  // 금액 할인
        PERCENT  // 비율 할인
    }
}

