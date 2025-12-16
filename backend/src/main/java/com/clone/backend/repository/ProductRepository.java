/**
 * 상품 레포지토리 (PostgreSQL - JPA)
 * - 카테고리, 이름, 타임딜, 베스트 상품 조회
 * - Spring Data JPA 자동 구현
 * - PostgreSQL similarity 검색 지원
 */
package com.clone.backend.repository;

import com.clone.backend.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
  List<Product> findByCategory(String category);

  Page<Product> findByCategory(String category, Pageable pageable);

  List<Product> findByNameContaining(String name);

  Page<Product> findByNameContaining(String name, Pageable pageable);

  List<Product> findByNameContainingAndCategory(String name, String category);

  Page<Product> findByNameContainingAndCategory(String name, String category, Pageable pageable);

  List<Product> findByIsTimeDealTrue();

  Page<Product> findByIsTimeDealTrue(Pageable pageable);

  List<Product> findByIsBestTrueOrderByRankAsc();

  Page<Product> findByIsBestTrueOrderByRankAsc(Pageable pageable);

  /**
   * 중복되지 않는 모든 카테고리 목록 조회
   */
  @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL")
  List<String> findDistinctCategories();

  /**
   * 일반 MD 추천 상품 (TimeDeal도 아니고 Best도 아닌 상품) 페이징 조회
   */
  Page<Product> findByIsTimeDealFalseAndIsBestFalse(Pageable pageable);

  /**
   * PostgreSQL similarity 함수를 사용하여 가장 유사한 상품명 키워드 찾기
   * pg_trgm 확장이 활성화되어 있어야 함
   * similarity 값이 0.1 이상인 것 중 가장 높은 값을 반환
   * 키워드 단위 비교를 우선하고, 없으면 상품명 전체 비교
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
          WHERE name IS NOT NULL
      ),
      keyword_match AS (
          SELECT keyword, similarity(keyword, :query) AS sim
          FROM product_keywords
          WHERE length(keyword) >= 2
            AND length(keyword) <= length(:query) + 4
            AND length(keyword) >= length(:query) - 4
            AND keyword != :query
            AND NOT (keyword LIKE '%' || :query || '%')
            AND NOT (:query LIKE '%' || keyword || '%')
            AND similarity(keyword, :query) >= 0.1
          ORDER BY similarity(keyword, :query) DESC
          LIMIT 1
      ),
      full_name_match AS (
          SELECT name AS keyword, similarity(name, :query) AS sim
          FROM products
          WHERE name IS NOT NULL
            AND name != :query
            AND NOT (name LIKE '%' || :query || '%')
            AND NOT (:query LIKE '%' || name || '%')
            AND similarity(name, :query) >= 0.1
          ORDER BY similarity(name, :query) DESC
          LIMIT 1
      )
      SELECT COALESCE(
          (SELECT keyword FROM keyword_match),
          (SELECT keyword FROM full_name_match)
      ) AS keyword
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

  /**
   * 검색어에 해당하는 상품이 있는 카테고리 목록 조회
   */
  @Query("SELECT DISTINCT p.category FROM Product p WHERE p.category IS NOT NULL AND LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
  List<String> findCategoriesBySearchQuery(@Param("query") String query);
}
