/**
 * 장바구니 레포지토리 (PostgreSQL - JPA)
 * - 사용자별 장바구니 조회, 상품 추가/삭제
 * - Spring Data JPA 자동 구현
 */
package com.clone.backend.repository;

import com.clone.backend.model.CartItem;
import com.clone.backend.model.User;
import com.clone.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);

    Optional<CartItem> findByUserAndProduct(User user, Product product);

    void deleteByUser(User user);
}
