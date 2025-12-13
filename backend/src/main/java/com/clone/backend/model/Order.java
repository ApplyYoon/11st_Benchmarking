package com.clone.backend.model;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    private String id; // Order ID (Toss OrderId)
    private Long userId; // Sharding Key (Reference to User)

    private String orderName;
    private int totalAmount;
    private String status; // Using String for simplicity in Mongo, or can keep Enum

    private String paymentKey;
    private LocalDateTime createdAt;

    private List<OrderItem> items; // Embedded items

    public enum OrderStatus {
        PENDING, PAID, CANCELLED
    }
}
