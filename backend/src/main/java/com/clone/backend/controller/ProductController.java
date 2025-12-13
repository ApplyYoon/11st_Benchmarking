package com.clone.backend.controller;

import com.clone.backend.model.Product;
import com.clone.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type) {
        if ("timedeal".equals(type)) {
            return productRepository.findByIsTimeDealTrue();
        }
        if ("best".equals(type)) {
            return productRepository.findByIsBestTrueOrderByRankAsc();
        }
        if (category != null) {
            return productRepository.findByCategory(category);
        }
        if (search != null) {
            return productRepository.findByNameContaining(search);
        }
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
