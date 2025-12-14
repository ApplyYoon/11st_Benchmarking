/**
 * 주문 컨트롤러 (/api/orders)
 * - GET: 주문 내역 조회 (MongoDB에서 조회)
 * - POST /confirm-payment: Toss 결제 승인 처리
 * - POST /demo: 데모 주문 생성 (테스트/포트폴리오용)
 * - 주문 데이터는 MongoDB에 샤딩하여 저장
 */
package com.clone.backend.controller;

import com.clone.backend.model.*;
import com.clone.backend.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public OrderController(OrderRepository orderRepository, CartRepository cartRepository,
            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    @Value("${toss.secret-key}")
    private String tossSecretKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/confirm-payment")
    @Transactional
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, Object> payload) {
        String paymentKey = (String) payload.get("paymentKey");
        String orderId = (String) payload.get("orderId");
        Integer amount = (Integer) payload.get("amount");

        // In a real app, identify user from security context
        // For now, let's assume a default user or pass user info
        User user = userRepository.findAll().stream().findFirst().orElseThrow();

        // 1. Verify payment with Toss
        try {
            String secretKeyDetails = tossSecretKey + ":";
            String authorization = "Basic "
                    + Base64.getEncoder().encodeToString(secretKeyDetails.getBytes(StandardCharsets.UTF_8));

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authorization);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> tossRequestBody = Map.of(
                    "paymentKey", paymentKey,
                    "orderId", orderId,
                    "amount", amount);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(tossRequestBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.tosspayments.com/v1/payments/confirm",
                    request,
                    String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                // Payment success, create order
                JsonNode paymentData = objectMapper.readTree(response.getBody());
                String orderName = paymentData.get("orderName").asText();

                Order order = Order.builder()
                        .id(orderId)
                        .userId(user.getId())
                        .orderName(orderName)
                        .totalAmount(amount)
                        .status(Order.OrderStatus.PAID.name())
                        .paymentKey(paymentKey)
                        // .createdAt will be null if not set manually or by DB (Mongo won't auto-gen
                        // @CreationTimestamp from Hibernate)
                        .createdAt(java.time.LocalDateTime.now())
                        .build();

                // Move cart items to order items
                List<CartItem> cartItems = cartRepository.findByUser(user);
                List<OrderItem> orderItems = cartItems.stream().map(ci -> OrderItem.builder()
                        .productId(ci.getProduct().getId())
                        .productName(ci.getProduct().getName())
                        .productImage(ci.getProduct().getImageUrl())
                        .priceAtPurchase(ci.getProduct().getPrice())
                        .quantity(ci.getQuantity())
                        .build()).collect(Collectors.toList());

                order.setItems(orderItems);
                orderRepository.save(order);

                // Clear cart
                cartRepository.deleteAll(cartItems);

                return ResponseEntity.ok(order);
            } else {
                return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @GetMapping
    public List<Order> getOrders() {
        // Mock user for now
        User user = userRepository.findAll().stream().findFirst().orElseThrow();
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    /**
     * 데모용 주문 생성 엔드포인트 (토스 인증 없이 바로 주문 생성)
     * 포트폴리오/시연 목적으로 사용
     */
    @PostMapping("/demo")
    @Transactional
    public ResponseEntity<?> createDemoOrder(@RequestBody Map<String, Object> payload) {
        try {
            String orderName = (String) payload.get("orderName");
            Integer amount = (Integer) payload.get("amount");
            String orderId = "DEMO_" + System.currentTimeMillis();

            // Get current user (simplified - in production, use security context)
            User user = userRepository.findAll().stream().findFirst().orElseThrow();

            // Create order directly without Toss verification
            Order order = Order.builder()
                    .id(orderId)
                    .userId(user.getId())
                    .orderName(orderName)
                    .totalAmount(amount)
                    .status(Order.OrderStatus.PAID.name())
                    .paymentKey("DEMO_KEY_" + System.currentTimeMillis())
                    .createdAt(java.time.LocalDateTime.now())
                    .build();

            // For demo, we don't have cart items - just create empty order items list
            order.setItems(java.util.Collections.emptyList());

            // Save to MongoDB
            orderRepository.save(order);

            return ResponseEntity.ok(order);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
