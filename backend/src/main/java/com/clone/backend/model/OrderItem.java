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
