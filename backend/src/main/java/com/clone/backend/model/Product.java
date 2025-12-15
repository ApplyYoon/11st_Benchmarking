/**
 * 상품 엔티티 (PostgreSQL)
 * - 상품명, 가격, 할인율, 이미지 URL, 카테고리
 * - 타임딜/베스트 여부 및 순위 정보
 * - DataInitializer에서 초기 데이터 삽입
 */
package com.clone.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int originalPrice;
    private int discountRate;
    private String imageUrl;
    private String category;

    @JsonProperty("isTimeDeal")
    private boolean isTimeDeal;
    private LocalDateTime timeDealEndTime;

    @JsonProperty("isBest")
    private boolean isBest;
    private Integer rank;

    private int stockQuantity;

    /**
     * 할인된 가격을 계산하여 반환
     * originalPrice와 discountRate를 기반으로 할인 가격 계산
     */
    @Transient
    @JsonProperty("price")
    public int getPrice() {
        if (originalPrice <= 0) {
            return 0;
        }
        if (discountRate <= 0) {
            return originalPrice;
        }
        // 할인 가격 계산: 원래 가격 * (100 - 할인률) / 100
        return (int) Math.round(originalPrice * (100.0 - discountRate) / 100.0);
    }
}
