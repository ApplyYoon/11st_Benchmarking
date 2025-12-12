package com.clone.backend.controller;

import com.clone.backend.model.*;
import com.clone.backend.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

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
                        .user(user)
                        .orderName(orderName)
                        .totalAmount(amount)
                        .status(Order.OrderStatus.PAID)
                        .paymentKey(paymentKey)
                        .build();

                // Move cart items to order items
                List<CartItem> cartItems = cartRepository.findByUser(user);
                List<OrderItem> orderItems = cartItems.stream().map(ci -> OrderItem.builder()
                        .order(order)
                        .product(ci.getProduct())
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
}
