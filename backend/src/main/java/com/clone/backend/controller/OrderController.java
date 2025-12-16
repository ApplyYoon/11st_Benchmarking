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

            // 실제 주문 금액 계산 (items에서)
            int actualTotalAmount = 0;
            if (itemsData != null && !itemsData.isEmpty()) {
                for (Map<String, Object> itemData : itemsData) {
                    int itemPrice = itemData.get("price") != null ? ((Number) itemData.get("price")).intValue() : 0;
                    int itemQuantity = itemData.get("quantity") != null ? ((Number) itemData.get("quantity")).intValue() : 1;
                    actualTotalAmount += itemPrice * itemQuantity;
                }
            }

            // 쿠폰 할인 금액 계산 및 검증
            Long couponId = payload.get("couponId") != null ? Long.valueOf(payload.get("couponId").toString()) : null;
            int calculatedDiscount = 0;
            
            if (couponId != null) {
                var userCouponOpt = userCouponRepository.findByUserIdAndCouponId(user.getId(), couponId);
                if (userCouponOpt.isPresent()) {
                    UserCoupon userCoupon = userCouponOpt.get();
                    Coupon coupon = userCoupon.getCoupon();
                    
                    if (userCoupon.isUsed()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "이미 사용된 쿠폰입니다."));
                    }
                    
                    // 쿠폰 유효성 검증
                    java.time.LocalDateTime now = java.time.LocalDateTime.now();
                    if (coupon.getValidFrom() != null && coupon.getValidFrom().isAfter(now)) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "쿠폰 유효기간이 시작되지 않았습니다."));
                    }
                    if (coupon.getValidUntil() != null && coupon.getValidUntil().isBefore(now)) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "쿠폰 유효기간이 만료되었습니다."));
                    }
                    if (coupon.getMinOrderAmount() != null && actualTotalAmount < coupon.getMinOrderAmount()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body(Map.of("message", "최소 주문 금액을 만족하지 않습니다."));
                    }
                    
                    // 카테고리 제한 쿠폰인 경우 해당 카테고리 상품 금액만 계산
                    int applicableAmount = actualTotalAmount;
                    if (coupon.getCategory() != null && itemsData != null && !itemsData.isEmpty()) {
                        applicableAmount = 0;
                        for (Map<String, Object> itemData : itemsData) {
                            String itemCategory = (String) itemData.get("category");
                            if (coupon.getCategory().equalsIgnoreCase(itemCategory)) {
                                int itemPrice = itemData.get("price") != null ? ((Number) itemData.get("price")).intValue() : 0;
                                int itemQuantity = itemData.get("quantity") != null ? ((Number) itemData.get("quantity")).intValue() : 1;
                                applicableAmount += itemPrice * itemQuantity;
                            }
                        }
                        
                        // 카테고리 제한 쿠폰인데 해당 카테고리 상품이 없으면 에러
                        if (applicableAmount == 0) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                    .body(Map.of("message", "이 쿠폰은 " + coupon.getCategory() + " 카테고리 상품에만 적용 가능합니다."));
                        }
                    }
                    
                    // 할인 금액 계산
                    if (coupon.getType() == Coupon.CouponType.AMOUNT) {
                        calculatedDiscount = Math.min(coupon.getDiscountAmount(), applicableAmount);
                    } else if (coupon.getType() == Coupon.CouponType.PERCENT) {
                        calculatedDiscount = (int) Math.floor(applicableAmount * (coupon.getDiscountRate() / 100.0));
                        if (coupon.getMaxDiscountAmount() != null) {
                            calculatedDiscount = Math.min(calculatedDiscount, coupon.getMaxDiscountAmount());
                        }
                        calculatedDiscount = Math.min(calculatedDiscount, applicableAmount);
                    }
                    
                    // 쿠폰 사용 처리
                    userCoupon.setUsed(true);
                    userCoupon.setUsedAt(now);
                    userCouponRepository.save(userCoupon);
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "쿠폰을 찾을 수 없습니다."));
                }
            }
            
            // 최종 결제 금액 계산 및 검증
            int finalAmount = actualTotalAmount - calculatedDiscount - usedPoints;
            if (finalAmount < 0) {
                finalAmount = 0;
            }
            
            // 프론트엔드에서 보낸 amount와 비교하여 검증 (100원 이내 오차 허용)
            if (Math.abs(amount - finalAmount) > 100) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "결제 금액이 일치하지 않습니다. 계산된 금액: " + finalAmount + "원"));
            }

            // 포인트 차감 처리
            if (usedPoints > 0) {
                if (user.getPoints() < usedPoints) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "보유 포인트가 부족합니다."));
                }
                if (usedPoints > finalAmount) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("message", "사용 포인트는 결제 금액을 초과할 수 없습니다."));
                }

                // 포인트 차감 및 적립 (결제 금액의 0.5%, 최대 5000P)
                int earnedPoints = Math.min((int) Math.floor(finalAmount * 0.005), 5000);
                int newPoints = user.getPoints() - usedPoints + earnedPoints;
                user.setPoints(newPoints);
                userRepository.save(user);
            } else {
                // 포인트 미사용 시에도 적립만 처리
                int earnedPoints = Math.min((int) Math.floor(finalAmount * 0.005), 5000);
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

            // Create order directly without Toss verification
            Order order = Order.builder()
                    .id(orderId)
                    .userId(user.getId())
                    .orderName(orderName)
                    .totalAmount(finalAmount) // 검증된 최종 금액 사용
                    .status(Order.OrderStatus.PAID.name())
                    .paymentKey("DEMO_KEY_" + System.currentTimeMillis())
                    .createdAt(java.time.LocalDateTime.now())
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
