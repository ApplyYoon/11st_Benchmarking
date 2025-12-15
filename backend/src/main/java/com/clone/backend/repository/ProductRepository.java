/**
 * 상품 레포지토리 (PostgreSQL - JPA)
 * - 카테고리, 이름, 타임딜, 베스트 상품 조회
 * - Spring Data JPA 자동 구현
 */
package com.clone.backend.repository;

import com.clone.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);

    List<Product> findByNameContaining(String name);

    List<Product> findByIsTimeDealTrue();

    List<Product> findByIsBestTrueOrderByRankAsc();
}
