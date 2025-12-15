/**
 * 쿠폰 컨트롤러 (/api/coupons)
 * - GET: 사용자 보유 쿠폰 조회
 * - GET /available: 사용 가능한 쿠폰 조회 (주문 금액, 카테고리 기준)
 */
package com.clone.backend.controller;

import com.clone.backend.model.Coupon;
import com.clone.backend.model.User;
import com.clone.backend.model.UserCoupon;
import com.clone.backend.repository.UserCouponRepository;
import com.clone.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    private final UserCouponRepository userCouponRepository;
    private final UserRepository userRepository;

    public CouponController(
            UserCouponRepository userCouponRepository,
            UserRepository userRepository) {
        this.userCouponRepository = userCouponRepository;
        this.userRepository = userRepository;
    }

    /**
     * 사용자 보유 쿠폰 조회
     */
    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyCoupons(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = user.getId();

        List<UserCoupon> userCoupons = userCouponRepository.findByUserIdAndIsUsedFalse(userId);
        List<Map<String, Object>> result = userCoupons.stream()
                .map(uc -> {
                    Coupon coupon = uc.getCoupon();
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", coupon.getId());
                    map.put("name", coupon.getName());
                    map.put("type", coupon.getType().name().toLowerCase());
                    map.put("discountAmount", coupon.getDiscountAmount());
                    map.put("discountRate", coupon.getDiscountRate());
                    map.put("maxDiscountAmount", coupon.getMaxDiscountAmount());
                    map.put("minOrderAmount", coupon.getMinOrderAmount());
                    map.put("category", coupon.getCategory());
                    map.put("validUntil", coupon.getValidUntil());
                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 주문에 사용 가능한 쿠폰 조회
     */
    @GetMapping("/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailableCoupons(
            Authentication authentication,
            @RequestParam Integer amount,
            @RequestParam(required = false) String category) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Long userId = user.getId();

        List<UserCoupon> userCoupons = userCouponRepository.findByUserIdAndIsUsedFalse(userId);
        LocalDateTime now = LocalDateTime.now();

        List<Map<String, Object>> result = userCoupons.stream()
                .map(uc -> {
                    Coupon coupon = uc.getCoupon();
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", coupon.getId());
                    map.put("name", coupon.getName());
                    map.put("type", coupon.getType().name().toLowerCase());
                    map.put("discountAmount", coupon.getDiscountAmount());
                    map.put("discountRate", coupon.getDiscountRate());
                    map.put("maxDiscountAmount", coupon.getMaxDiscountAmount());
                    map.put("minOrderAmount", coupon.getMinOrderAmount());
                    map.put("category", coupon.getCategory());

                    // 사용 가능 여부 체크
                    boolean isAmountSatisfied = coupon.getMinOrderAmount() == null || coupon.getMinOrderAmount() <= amount;
                    boolean isCategorySatisfied = coupon.getCategory() == null || coupon.getCategory().equals(category);
                    boolean isValid = (coupon.getValidFrom() == null || coupon.getValidFrom().isBefore(now)) &&
                                     (coupon.getValidUntil() == null || coupon.getValidUntil().isAfter(now));

                    boolean isApplicable = isAmountSatisfied && isCategorySatisfied && isValid;

                    String reason = "";
                    if (!isAmountSatisfied) {
                        reason = "최소주문 " + coupon.getMinOrderAmount() + "원 이상";
                    } else if (!isCategorySatisfied) {
                        reason = coupon.getCategory() + " 전용";
                    } else if (!isValid) {
                        reason = "유효기간 만료";
                    }

                    map.put("isApplicable", isApplicable);
                    map.put("reason", reason);

                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}

