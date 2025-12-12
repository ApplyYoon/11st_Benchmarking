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
