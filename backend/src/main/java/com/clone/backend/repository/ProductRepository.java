/**
 * 상품 레포지토리 (PostgreSQL - JPA)
 * - 카테고리, 이름, 타임딜, 베스트 상품 조회
 * - Spring Data JPA 자동 구현
 * - PostgreSQL similarity 검색 지원
 */
package com.clone.backend.repository;

import com.clone.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);

    List<Product> findByNameContaining(String name);

    List<Product> findByIsTimeDealTrue();

    List<Product> findByIsBestTrueOrderByRankAsc();

    /**
     * PostgreSQL similarity 함수를 사용하여 가장 유사한 상품명 키워드 찾기
     * pg_trgm 확장이 활성화되어 있어야 함
     * similarity 값이 0.3 이상인 것 중 가장 높은 값을 반환
     */
    @Query(value = """
        WITH product_keywords AS (
            SELECT DISTINCT trim(unnest(string_to_array(
                regexp_replace(
                    regexp_replace(name, '[\\[\\]()]', ' ', 'g'),
                    '[^가-힣a-zA-Z0-9\\s]', ' ', 'g'
                ), ' '
            ))) AS keyword
            FROM products
        )
        SELECT keyword
        FROM product_keywords
        WHERE length(keyword) >= 2
          AND keyword != :query
          AND NOT (keyword LIKE '%' || :query || '%')
          AND NOT (:query LIKE '%' || keyword || '%')
          AND similarity(keyword, :query) > 0.3
        ORDER BY similarity(keyword, :query) DESC
        LIMIT 1
        """, nativeQuery = true)
    String findMostSimilarKeyword(@Param("query") String query);
}
