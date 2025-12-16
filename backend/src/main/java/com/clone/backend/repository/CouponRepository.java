/**
 * 쿠폰 레포지토리 (PostgreSQL - JPA)
 */
package com.clone.backend.repository;

import com.clone.backend.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CouponRepository extends JpaRepository<Coupon, Long> {
    // JpaRepository가 findAll()을 이미 제공함
}
