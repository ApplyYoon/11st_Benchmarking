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
    private final RedisCartRepository redisCartRepository;
    private final UserRepository userRepository;
    private final UserCouponRepository userCouponRepository;

    public OrderController(OrderRepository orderRepository, RedisCartRepository redisCartRepository,
            UserRepository userRepository, UserCouponRepository userCouponRepository) {
        this.orderRepository = orderRepository;
        this.redisCartRepository = redisCartRepository;
        this.userRepository = userRepository;
        this.userCouponRepository = userCouponRepository;
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

                // Move cart items to order items (Redis에서 가져오기)
                List<RedisCartItem> cartItems = redisCartRepository.getCart(user.getId());
                List<OrderItem> orderItems = cartItems.stream().map(ci -> OrderItem.builder()
                        .productId(ci.getProductId())
                        .productName(ci.getProductName())
                        .productImage(ci.getProductImage())
                        .priceAtPurchase(ci.getPrice())
                        .quantity(ci.getQuantity())
                        .build()).collect(Collectors.toList());

                order.setItems(orderItems);
                orderRepository.save(order);

                // Clear cart (Redis에서 삭제)
                redisCartRepository.clearCart(user.getId());

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
     * 주문 취소 API
     * 주문 상태를 CANCELLED로 변경
     */
    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable String orderId) {
        try {
            System.out.println("DEBUG: Cancel order request for orderId: " + orderId);

            // Get current user from SecurityContext
            String email = null;
            Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal();
            if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
                email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            } else {
                email = principal.toString();
            }

            System.out.println("DEBUG: User email: " + email);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            System.out.println("DEBUG: User found - ID: " + user.getId());

            // 주문 찾기 및 상태 확인
            List<Order> userOrders = orderRepository.findByUserOrderByCreatedAtDesc(user);
            System.out.println("DEBUG: Found " + userOrders.size() + " orders for user");

            Order order = userOrders.stream()
                    .filter(o -> o.getId().equals(orderId))
                    .findFirst()
                    .orElseThrow(() -> {
                        System.out.println("DEBUG: Order not found in user's order list. OrderId: " + orderId);
                        System.out.println("DEBUG: Available order IDs: "
                                + userOrders.stream().map(Order::getId).collect(java.util.stream.Collectors.toList()));
                        return new RuntimeException("주문을 찾을 수 없습니다. (주문 ID: " + orderId + ")");
                    });

            System.out.println("DEBUG: Order found - Status: " + order.getStatus());

            // 이미 취소된 주문인지 확인
            if (Order.OrderStatus.CANCELLED.name().equals(order.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "이미 취소된 주문입니다."));
            }

            // ═══════════════════════════════════════════════════════════════
            // 포인트 환급/회수 처리
            // ═══════════════════════════════════════════════════════════════
            int usedPoints = order.getUsedPoints(); // 당시 사용한 포인트
            int earnedPoints = order.getEarnedPoints(); // 당시 적립된 포인트

            // 적립 포인트 회수 + 사용 포인트 환급
            int pointChange = usedPoints - earnedPoints;
            int newPoints = user.getPoints() + pointChange;
            user.setPoints(Math.max(0, newPoints)); // 음수 방지
            userRepository.save(user);

            System.out.println("DEBUG: Point refund - used: " + usedPoints + ", earned: " + earnedPoints + ", change: "
                    + pointChange);

            // 주문 취소 처리
            Order cancelledOrder = orderRepository.cancelOrder(user, orderId);

            System.out.println("DEBUG: Order cancelled successfully");
            return ResponseEntity.ok(cancelledOrder);

        } catch (RuntimeException e) {
            System.err.println("ERROR: RuntimeException in cancelOrder: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERROR: Exception in cancelOrder: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "주문 취소에 실패했습니다: " + e.getMessage()));
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
            Integer usedPoints = payload.get("usedPoints") != null ? ((Number) payload.get("usedPoints")).intValue()
                    : 0;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> itemsData = (List<Map<String, Object>>) payload.get("items");
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

            // 쿠폰 사용 처리
            Long couponId = payload.get("couponId") != null ? Long.valueOf(payload.get("couponId").toString()) : null;
            if (couponId != null) {
                var userCouponOpt = userCouponRepository.findByUserIdAndCouponId(user.getId(), couponId);
                if (userCouponOpt.isPresent()) {
                    UserCoupon userCoupon = userCouponOpt.get();
                    if (userCoupon.isUsed()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "이미 사용된 쿠폰입니다."));
                    }
                    userCoupon.setUsed(true);
                    userCoupon.setUsedAt(java.time.LocalDateTime.now());
                    userCouponRepository.save(userCoupon);
                }
            }

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

            // Create order items from payload
            List<OrderItem> orderItems = new java.util.ArrayList<>();
            if (itemsData != null && !itemsData.isEmpty()) {
                for (Map<String, Object> itemData : itemsData) {
                    OrderItem orderItem = OrderItem.builder()
                            .productId(itemData.get("id") != null ? Long.valueOf(itemData.get("id").toString()) : null)
                            .productName((String) itemData.get("name"))
                            .productImage((String) itemData.get("imageUrl") != null ? (String) itemData.get("imageUrl")
                                    : (String) itemData.get("image"))
                            .priceAtPurchase(
                                    itemData.get("price") != null ? ((Number) itemData.get("price")).intValue() : 0)
                            .quantity(itemData.get("quantity") != null ? ((Number) itemData.get("quantity")).intValue()
                                    : 1)
                            .build();
                    orderItems.add(orderItem);
                }
            }

            // 적립 포인트 계산 (0.5%, 최대 5000P)
            int earnedPoints = Math.min((int) Math.floor(amount * 0.005), 5000);

            // Create order directly without Toss verification
            Order order = Order.builder()
                    .id(orderId)
                    .userId(user.getId())
                    .orderName(orderName)
                    .totalAmount(amount)
                    .status(Order.OrderStatus.PAID.name())
                    .paymentKey("DEMO_KEY_" + System.currentTimeMillis())
                    .createdAt(java.time.LocalDateTime.now())
                    .usedPoints(usedPoints) // 사용 포인트 저장
                    .earnedPoints(earnedPoints) // 적립 포인트 저장
                    .build();

            order.setItems(orderItems);

            // Save to MongoDB
            orderRepository.save(order);

            return ResponseEntity.ok(order);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}
