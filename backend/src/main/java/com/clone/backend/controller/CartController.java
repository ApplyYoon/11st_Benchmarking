/**
 * 장바구니 컨트롤러 (/api/cart)
 * - GET: 장바구니 조회 (Redis)
 * - POST: 장바구니에 상품 추가
 * - PUT /{productId}: 수량 변경
 * - DELETE /{productId}: 특정 상품 삭제
 * - DELETE: 장바구니 전체 비우기
 * - 7일 보관 (Redis TTL)
 */
package com.clone.backend.controller;

import com.clone.backend.model.Product;
import com.clone.backend.model.RedisCartItem;
import com.clone.backend.model.User;
import com.clone.backend.repository.ProductRepository;
import com.clone.backend.repository.RedisCartRepository;
import com.clone.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final RedisCartRepository redisCartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartController(RedisCartRepository redisCartRepository, UserRepository userRepository,
            ProductRepository productRepository) {
        this.redisCartRepository = redisCartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    private User getCurrentUser() {
        String email = null;
        Object principal = org.springframework.security.core.context.SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<RedisCartItem> getCart() {
        User user = getCurrentUser();
        return redisCartRepository.getCart(user.getId());
    }

    @PostMapping
    public RedisCartItem addToCart(@RequestBody Map<String, Object> payload) {
        User user = getCurrentUser();
        Long productId = Long.valueOf(payload.get("productId").toString());
        int quantity = payload.containsKey("quantity") ? Integer.parseInt(payload.get("quantity").toString()) : 1;

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        RedisCartItem item = RedisCartItem.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productImage(product.getImageUrl())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .discountRate(product.getDiscountRate())
                .category(product.getCategory())
                .quantity(quantity)
                .build();

        return redisCartRepository.addItem(user.getId(), item);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<RedisCartItem> updateQuantity(
            @PathVariable Long productId,
            @RequestBody Map<String, Integer> payload) {
        User user = getCurrentUser();
        int quantity = payload.get("quantity");

        if (quantity <= 0) {
            redisCartRepository.removeItem(user.getId(), productId);
            return ResponseEntity.noContent().build();
        }

        RedisCartItem updated = redisCartRepository.updateQuantity(user.getId(), productId, quantity);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable Long productId) {
        User user = getCurrentUser();
        redisCartRepository.removeItem(user.getId(), productId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        User user = getCurrentUser();
        redisCartRepository.clearCart(user.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/ttl")
    public ResponseEntity<Map<String, Object>> getCartTTL() {
        User user = getCurrentUser();
        Long ttlSeconds = redisCartRepository.getTTL(user.getId());
        long ttlDays = ttlSeconds != null && ttlSeconds > 0 ? ttlSeconds / 86400 : 0;
        return ResponseEntity.ok(Map.of(
                "ttlSeconds", ttlSeconds != null ? ttlSeconds : 0,
                "ttlDays", ttlDays));
    }
}
