/**
 * 상품 컨트롤러 (/api/products)
 * - GET: 상품 목록 조회 (카테고리, 타임딜, 베스트 필터링)
 * - GET /{id}: 상품 상세 조회
 * - PostgreSQL에서 상품 데이터 조회
 */
package com.clone.backend.controller;

import com.clone.backend.model.Product;
import com.clone.backend.repository.ProductRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

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
    public Product getProduct(@PathVariable long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
