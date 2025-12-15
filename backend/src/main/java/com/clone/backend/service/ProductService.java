/**
 * 상품 서비스
 * - 검색 오타수정 기능 (PostgreSQL similarity 검색)
 * - DB의 실제 상품명을 기반으로 오타를 자동 수정
 * - pg_trgm 확장을 사용한 유사성 검색
 */
package com.clone.backend.service;

import com.clone.backend.model.Product;
import com.clone.backend.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * 애플리케이션 시작 시 pg_trgm 확장 활성화
     */
    @PostConstruct
    @Transactional
    public void init() {
        try {
            entityManager.createNativeQuery("CREATE EXTENSION IF NOT EXISTS pg_trgm").executeUpdate();
        } catch (Exception e) {
            // 확장이 이미 존재하거나 권한이 없을 수 있음 (무시)
            System.out.println("pg_trgm extension check: " + e.getMessage());
        }
    }

    /**
     * PostgreSQL similarity 함수를 사용하여 검색어 오타를 수정
     * 검색 결과가 없을 때만 오타수정을 수행
     * @param query 검색어
     * @return 수정된 검색어 (오타가 없거나 검색 결과가 있으면 null)
     */
    public String findClosestMatch(String query) {
        if (query == null || query.length() < 2) {
            return null;
        }

        // 먼저 검색 결과가 있는지 확인
        List<Product> searchResults = productRepository.findByNameContaining(query);
        if (!searchResults.isEmpty()) {
            // 검색 결과가 있으면 오타수정 불필요
            return null;
        }

        // 검색 결과가 없을 때만 오타수정 수행
        // PostgreSQL similarity 함수 사용
        try {
            String bestMatch = productRepository.findMostSimilarKeyword(query);
            return bestMatch;
        } catch (Exception e) {
            // pg_trgm 확장이 없거나 오류 발생 시 null 반환
            System.out.println("Similarity search failed: " + e.getMessage());
            return null;
        }
    }
}

