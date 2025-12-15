/**
 * 쿠폰 레포지토리 (PostgreSQL - JPA)
 */
package com.clone.backend.repository;

import com.clone.backend.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    List<Coupon> findAll();
}

