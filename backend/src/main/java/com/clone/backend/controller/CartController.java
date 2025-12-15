/**
 * 장바구니 컨트롤러 (/api/cart)
 * - GET: 장바구니 조회
 * - POST: 장바구니에 상품 추가
 * - DELETE /{id}: 특정 상품 삭제
 * - DELETE: 장바구니 전체 비우기
 */
package com.clone.backend.controller;

import com.clone.backend.model.CartItem;
import com.clone.backend.model.Product;
import com.clone.backend.model.User;
import com.clone.backend.repository.CartRepository;
import com.clone.backend.repository.ProductRepository;
import com.clone.backend.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public CartController(CartRepository cartRepository, UserRepository userRepository,
            ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<CartItem> getCart() {
        // Mock user
        User user = userRepository.findAll().stream().findFirst().orElseThrow();
        return cartRepository.findByUser(user);
    }

    @PostMapping
    @Transactional
    public CartItem addToCart(@RequestBody Map<String, Long> payload) {
        // Mock user
        User user = userRepository.findAll().stream().findFirst().orElseThrow();
        Long productId = payload.get("productId");

        if (productId == null) {
            throw new IllegalArgumentException("Product ID must not be null");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem cartItem = cartRepository.findByUserAndProduct(user, product)
                .orElse(CartItem.builder()
                        .user(user)
                        .product(product)
                        .quantity(0)
                        .build());

        cartItem.setQuantity(cartItem.getQuantity() + 1);
        return cartRepository.save(cartItem);
    }

    @DeleteMapping("/{id}")
    @SuppressWarnings("null")
    public void removeFromCart(@PathVariable Long id) {
        cartRepository.deleteById(id);
    }

    @DeleteMapping
    @Transactional
    public void clearCart() {
        // Mock user
        User user = userRepository.findAll().stream().findFirst().orElseThrow();
        cartRepository.deleteByUser(user);
    }
}
