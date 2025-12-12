package com.clone.backend.repository;

import com.clone.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);

    List<Product> findByNameContaining(String name);

    List<Product> findByIsTimeDealTrue();

    List<Product> findByIsBestTrueOrderByRankAsc();

    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM products WHERE name % :keyword ORDER BY similarity(name, :keyword) DESC", nativeQuery = true)
    List<Product> searchByNameFuzzy(@org.springframework.data.repository.query.Param("keyword") String keyword);
}
