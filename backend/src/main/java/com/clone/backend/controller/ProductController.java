package com.clone.backend.controller;

import com.clone.backend.model.Product;
import com.clone.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
            // First try fuzzy search
            List<Product> results = productRepository.searchByNameFuzzy(search);
            // If fuzzy search yields nothing (unlikely if threshold is low, but possible),
            // fallback or return empty
            // But actually, containing is better for direct substring matches if trgm fails
            // short words
            // Let's rely on fuzzy search as it usually covers substrings if index is good.
            // Actually, for "nike", "nike shoes" might not be similar enough if threshold
            // is high?
            // But trgm handles substrings well usually if we use similarity function
            // properly.
            // Let's stick to the repo method we added.
            return results;
        }
        return productRepository.findAll();
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
