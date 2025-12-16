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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class ProductService {

    private static final Logger logger = LoggerFactory.getLogger(ProductService.class);
    
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
            logger.info("pg_trgm extension initialized successfully");
        } catch (Exception e) {
            // 확장이 이미 존재하거나 권한이 없을 수 있음
            logger.warn("pg_trgm extension check failed (may already exist or insufficient permissions): {}", e.getMessage());
        }
    }

    /**
     * PostgreSQL similarity 함수를 사용하여 검색어 오타를 수정
     * 검색 결과가 없을 때만 오타수정을 수행
     * @param query 검색어
     * @return 수정된 검색어 (오타가 없거나 검색 결과가 있으면 null)
     */
    public String findClosestMatch(String query) {
        if (query == null || query.trim().isEmpty() || query.trim().length() < 2) {
            logger.debug("Query too short for correction: {}", query);
            return null;
        }

        String trimmedQuery = query.trim();
        logger.debug("Attempting to find closest match for query: {}", trimmedQuery);

        // 먼저 정확한 검색 결과가 있는지 확인 (대소문자 구분 없이)
        try {
            List<Product> searchResults = productRepository.findByNameContaining(trimmedQuery);
            if (!searchResults.isEmpty()) {
                // 정확히 일치하는 결과가 있으면 오타수정 불필요
                logger.debug("Exact search results found for '{}', no correction needed", trimmedQuery);
                return null;
            }
        } catch (Exception e) {
            logger.error("Error checking search results for query '{}': {}", trimmedQuery, e.getMessage());
            // 검색 결과 확인 실패 시에도 오타수정 시도
        }

        // 검색 결과가 없을 때 오타수정 수행
        // PostgreSQL similarity 함수 사용
        try {
            String bestMatch = productRepository.findMostSimilarKeyword(trimmedQuery);
            if (bestMatch != null && !bestMatch.isEmpty() && !bestMatch.equals(trimmedQuery)) {
                // 수정된 검색어로 다시 검색해서 결과가 있는지 확인
                List<Product> correctedResults = productRepository.findByNameContaining(bestMatch);
                if (!correctedResults.isEmpty()) {
                    logger.info("Corrected query '{}' to '{}' (found {} results)", trimmedQuery, bestMatch, correctedResults.size());
                    return bestMatch;
                } else {
                    logger.debug("Corrected keyword '{}' also has no results, returning null", bestMatch);
                    return null;
                }
            } else {
                logger.debug("No similar keyword found for query: {}", trimmedQuery);
                return null;
            }
        } catch (Exception e) {
            // pg_trgm 확장이 없거나 오류 발생 시 null 반환
            logger.error("Similarity search failed for query '{}': {}", trimmedQuery, e.getMessage(), e);
            return null;
        }
    }
}

