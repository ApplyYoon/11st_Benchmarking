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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
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
            @RequestParam(required = false) String priceRange,
            @RequestParam(required = false, defaultValue = "0") Integer offset,
            @RequestParam(required = false) Integer limit) {

        // Use DB pagination if no complex in-memory filtering (like priceRange) is
        // needed
        if ((priceRange == null || "all".equals(priceRange)) && limit != null && limit > 0) {
            int page = offset / limit;
            Pageable pageable = PageRequest.of(page, limit);
            Page<Product> productPage;

            if ("timedeal".equals(type)) {
                productPage = productRepository.findByIsTimeDealTrue(pageable);
            } else if ("best".equals(type)) {
                productPage = productRepository.findByIsBestTrueOrderByRankAsc(pageable);
            } else if (category != null && !category.equals("all")) {
                productPage = productRepository.findByCategory(category, pageable);
            } else if (search != null) {
                productPage = productRepository.findByNameContaining(search, pageable);
            } else {
                productPage = productRepository.findAll(pageable);
            }
            return productPage.getContent();
        }

        // Fallback to in-memory pagination for priceRange filtering or other cases
        List<Product> products;

        if ("timedeal".equals(type)) {
            products = productRepository.findByIsTimeDealTrue();
        } else if ("best".equals(type)) {
            products = productRepository.findByIsBestTrueOrderByRankAsc();
        } else if (category != null && !category.equals("all")) {
            products = productRepository.findByCategory(category);
        } else if (search != null) {
            products = productRepository.findByNameContaining(search);
        } else {
            products = productRepository.findAll();
        }

        if (priceRange != null && !priceRange.equals("all")) {
            products = filterByPriceRange(products, priceRange);
        }

        // offset과 limit 적용
        int start = Math.min(offset, products.size());
        int end = (limit != null && limit > 0)
                ? Math.min(start + limit, products.size())
                : products.size();

        return products.subList(start, end);
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
     * 연관 검색어 조회 API
     * 검색어를 포함하는 상품명 키워드들을 반환
     */
    @GetMapping("/search/related")
    public ResponseEntity<List<String>> getRelatedKeywords(@RequestParam String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<String> relatedKeywords = productRepository.findRelatedKeywords(query.trim());
        return ResponseEntity.ok(relatedKeywords);
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
     * 카테고리 목록 조회 API
     */
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = productRepository.findDistinctCategories();
        return ResponseEntity.ok(categories);
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
