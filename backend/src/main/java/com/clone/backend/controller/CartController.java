package com.clone.backend.controller;

import com.clone.backend.model.CartItem;
import com.clone.backend.model.Product;
import com.clone.backend.model.User;
import com.clone.backend.repository.CartRepository;
import com.clone.backend.repository.ProductRepository;
import com.clone.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

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
