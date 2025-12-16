/**
 * 주문 POJO (MongoDB 저장용)
 * - 주문 ID, 사용자 ID (샤딩 키), 주문명, 총액, 상태
 * - OrderItem 목록을 내장 문서로 포함
 * - userId 기준으로 Shard A/B에 분산 저장
 */
package com.clone.backend.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    private String id; // Order ID (Toss OrderId)
    private Long userId; // Sharding Key (Reference to User)

    private String orderName;
    private int totalAmount;
    private String status; // Using String for simplicity in Mongo, or can keep Enum

    private String paymentKey;
    private LocalDateTime createdAt;

    // 포인트 관련 필드 (취소 시 환급용)
    private int usedPoints; // 주문 시 사용한 포인트
    private int earnedPoints; // 주문 시 적립된 포인트

    private List<OrderItem> items; // Embedded items

    public enum OrderStatus {
        PENDING, PAID, CANCELLED
    }
}
