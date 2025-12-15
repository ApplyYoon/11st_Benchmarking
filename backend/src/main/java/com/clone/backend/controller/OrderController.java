/**
 * 주문 컨트롤러 (/api/orders)
 * - GET: 주문 내역 조회 (MongoDB에서 조회)
 * - POST /confirm-payment: Toss 결제 승인 처리
 * - POST /demo: 데모 주문 생성 (테스트/포트폴리오용)
 * - DELETE /:orderId : 주문 내역 영구 삭제
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

        // Get current user from SecurityContext
        String email = null;
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
        // Get current user from SecurityContext
        String email = null;
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }

    private void logToDebugFile(String message) {
        try (java.io.FileWriter fw = new java.io.FileWriter("debug.log", true);
                java.io.PrintWriter pw = new java.io.PrintWriter(fw)) {
            pw.println(java.time.LocalDateTime.now() + " - " + message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable String orderId) {
        try {
            logToDebugFile("DELETE REQUEST: " + orderId);

            // Get current user from SecurityContext
            String email = null;
            Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            logToDebugFile("User identified: " + email);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            logToDebugFile("User Resolved ID: " + user.getId());

            orderRepository.delete(user, orderId);

            logToDebugFile("Delete Success");
            return ResponseEntity.ok().build();

        } catch (Exception e) {
            e.printStackTrace();
            logToDebugFile("DELETE FAILED: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
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
            Integer usedPoints = payload.get("usedPoints") != null ? ((Number) payload.get("usedPoints")).intValue() : 0;
            String orderId = "DEMO_" + System.currentTimeMillis();

            // Get current user from SecurityContext
            String email = null;
            Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 포인트 차감 처리
            if (usedPoints > 0) {
                if (user.getPoints() < usedPoints) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "보유 포인트가 부족합니다."));
                }
                if (usedPoints > amount) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "사용 포인트는 결제 금액을 초과할 수 없습니다."));
                }
                
                // 포인트 차감 및 적립 (결제 금액의 0.5%, 최대 5000P)
                int earnedPoints = Math.min((int) Math.floor(amount * 0.005), 5000);
                int newPoints = user.getPoints() - usedPoints + earnedPoints;
                user.setPoints(newPoints);
                userRepository.save(user);
            } else {
                // 포인트 미사용 시에도 적립만 처리
                int earnedPoints = Math.min((int) Math.floor(amount * 0.005), 5000);
                int newPoints = user.getPoints() + earnedPoints;
                user.setPoints(newPoints);
                userRepository.save(user);
            }

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
