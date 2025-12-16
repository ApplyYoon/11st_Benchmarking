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

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
  List<Product> findByCategory(String category);

  List<Product> findByNameContaining(String name);

  List<Product> findByIsTimeDealTrue();

  /**
   * 타임딜 상품 페이징 조회
   */
  Page<Product> findByIsTimeDealTrue(Pageable pageable);

  List<Product> findByIsBestTrueOrderByRankAsc();

  /**
   * 베스트 상품 페이징 조회
   */
  Page<Product> findByIsBestTrueOrderByRankAsc(Pageable pageable);

  /**
   * 일반 MD 추천 상품 (TimeDeal도 아니고 Best도 아닌 상품) 페이징 조회
   */
  Page<Product> findByIsTimeDealFalseAndIsBestFalse(Pageable pageable);

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

  /**
   * 검색어를 포함하는 연관 검색어 목록 조회
   * 상품명에서 검색어를 포함하는 키워드들을 반환
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
        AND keyword ILIKE '%' || :query || '%'
        AND keyword != :query
      ORDER BY
        CASE
          WHEN keyword LIKE :query || '%' THEN 1
          WHEN keyword LIKE '%' || :query THEN 2
          ELSE 3
        END,
        length(keyword),
        keyword
      LIMIT 10
      """, nativeQuery = true)
  List<String> findRelatedKeywords(@Param("query") String query);
}
