/**
 * 상품 컨트롤러 (/api/products)
 * - GET: 상품 목록 조회 (카테고리, 타임딜, 베스트 필터링)
 * - GET /{id}: 상품 상세 조회
 * - GET /search/correct: 검색어 오타수정
 * - GET /timedeal/endtime: 타임딜 종료 시간 조회
 * - PostgreSQL에서 상품 데이터 조회
 */
package com.clone.backend.controller;

import com.clone.backend.model.Product;
import com.clone.backend.repository.ProductRepository;
import com.clone.backend.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductService productService;

    public ProductController(ProductRepository productRepository, ProductService productService) {
        this.productRepository = productRepository;
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String priceRange) {
        if ("timedeal".equals(type)) {
            return productRepository.findByIsTimeDealTrue();
        }
        if ("best".equals(type)) {
            return productRepository.findByIsBestTrueOrderByRankAsc();
        }
        if (category != null && !category.equals("all")) {
            List<Product> products = productRepository.findByCategory(category);
            if (priceRange != null && !priceRange.equals("all")) {
                return filterByPriceRange(products, priceRange);
            }
            return products;
        }
        if (search != null) {
            List<Product> products = productRepository.findByNameContaining(search);
            if (priceRange != null && !priceRange.equals("all")) {
                return filterByPriceRange(products, priceRange);
            }
            return products;
        }
        List<Product> products = productRepository.findAll();
        if (priceRange != null && !priceRange.equals("all")) {
            return filterByPriceRange(products, priceRange);
        }
        return products;
    }

    @GetMapping("/{id}")
    public Product getProduct(@PathVariable long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    /**
     * 검색어 오타수정 API
     */
    @GetMapping("/search/correct")
    public ResponseEntity<Map<String, Object>> correctSearchQuery(@RequestParam String query) {
        String corrected = productService.findClosestMatch(query);
        Map<String, Object> response = new HashMap<>();
        if (corrected != null) {
            response.put("corrected", corrected);
            response.put("original", query);
        } else {
            response.put("corrected", null);
            response.put("original", query);
        }
        return ResponseEntity.ok(response);
    }

    /**
     * 타임딜 종료 시간 조회 API
     * 가장 빠른 타임딜 종료 시간을 반환
     */
    @GetMapping("/timedeal/endtime")
    public ResponseEntity<Map<String, Object>> getTimeDealEndTime() {
        List<Product> timeDealProducts = productRepository.findByIsTimeDealTrue();
        if (timeDealProducts.isEmpty()) {
            Map<String, Object> response = new HashMap<>();
            response.put("endTime", null);
            return ResponseEntity.ok(response);
        }

        LocalDateTime earliestEndTime = timeDealProducts.stream()
                .filter(p -> p.getTimeDealEndTime() != null)
                .map(Product::getTimeDealEndTime)
                .min(LocalDateTime::compareTo)
                .orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("endTime", earliestEndTime);
        return ResponseEntity.ok(response);
    }

    /**
     * 가격 범위로 필터링
     */
    private List<Product> filterByPriceRange(List<Product> products, String priceRange) {
        return products.stream()
                .filter(p -> {
                    switch (priceRange) {
                        case "under10k":
                            return p.getPrice() < 10000;
                        case "10k-50k":
                            return p.getPrice() >= 10000 && p.getPrice() <= 50000;
                        case "over50k":
                            return p.getPrice() > 50000;
                        default:
                            return true;
                    }
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
