/**
 * 사용자-쿠폰 관계 레포지토리 (PostgreSQL - JPA)
 */
package com.clone.backend.repository;

import com.clone.backend.model.UserCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
    List<UserCoupon> findByUserId(Long userId);
    
    List<UserCoupon> findByUserIdAndIsUsedFalse(Long userId);
    
    Optional<UserCoupon> findByUserIdAndCouponId(Long userId, Long couponId);
}

