/**
 * 쿠폰 컨트롤러 (/api/coupons)
 * - GET: 사용자 보유 쿠폰 조회
 * - GET /available: 사용 가능한 쿠폰 조회 (주문 금액, 카테고리 기준)
 */
package com.clone.backend.controller;

import com.clone.backend.model.Coupon;
import com.clone.backend.model.User;
import com.clone.backend.model.UserCoupon;
import com.clone.backend.repository.CouponRepository;
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
    private final CouponRepository couponRepository;

    public CouponController(
            UserCouponRepository userCouponRepository,
            UserRepository userRepository,
            CouponRepository couponRepository) {
        this.userCouponRepository = userCouponRepository;
        this.userRepository = userRepository;
        this.couponRepository = couponRepository;
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
                    map.put("isUsed", uc.isUsed());
                    map.put("userCouponId", uc.getId());
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
            @RequestParam(required = false) String categories) {
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

        // 카테고리 문자열을 리스트로 변환 (콤마로 구분된 경우 처리)
        final List<String> categoryList;
        if (categories != null && !categories.isEmpty()) {
            // 콤마로 분리하고 공백 제거, 소문자로 변환하여 정규화
            categoryList = java.util.Arrays.stream(categories.split(","))
                    .map(String::trim)
                    .map(String::toLowerCase)
                    .filter(s -> !s.isEmpty())
                    .collect(java.util.stream.Collectors.toList());
        } else {
            categoryList = null;
        }

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
                    map.put("isUsed", uc.isUsed());
                    map.put("userCouponId", uc.getId());

                    // 사용 가능 여부 체크
                    boolean isAmountSatisfied = coupon.getMinOrderAmount() == null
                            || coupon.getMinOrderAmount() <= amount;
                    
                    // 카테고리 체크: 쿠폰에 카테고리 제한이 없거나, 전달된 카테고리 목록에 포함되어 있으면 만족
                    boolean isCategorySatisfied;
                    if (coupon.getCategory() == null) {
                        // 쿠폰에 카테고리 제한이 없으면 모든 상품에 적용 가능
                        isCategorySatisfied = true;
                    } else if (categoryList == null || categoryList.isEmpty()) {
                        // 주문에 카테고리 정보가 없으면 카테고리 제한이 있는 쿠폰은 적용 불가
                        isCategorySatisfied = false;
                    } else {
                        // 쿠폰의 카테고리가 주문의 카테고리 목록에 포함되어 있는지 확인
                        // 대소문자 구분 없이 비교
                        String couponCategory = coupon.getCategory() != null 
                                ? coupon.getCategory().toLowerCase().trim() 
                                : null;
                        isCategorySatisfied = couponCategory != null 
                                && categoryList.contains(couponCategory);
                    }
                    
                    boolean isValid = (coupon.getValidFrom() == null || coupon.getValidFrom().isBefore(now)) &&
                            (coupon.getValidUntil() == null || coupon.getValidUntil().isAfter(now));
                    boolean isNotUsed = !uc.isUsed();

                    boolean isApplicable = isAmountSatisfied && isCategorySatisfied && isValid && isNotUsed;

                    String reason = "";
                    if (!isAmountSatisfied) {
                        reason = "최소주문 " + coupon.getMinOrderAmount() + "원 이상";
                    } else if (!isCategorySatisfied) {
                        reason = coupon.getCategory() + " 전용";
                    } else if (!isValid) {
                        reason = "유효기간 만료";
                    } else if (!isNotUsed) {
                        reason = "이미 사용된 쿠폰";
                    }

                    map.put("isApplicable", isApplicable);
                    map.put("reason", reason);

                    return map;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * 쿠폰 발급
     */

    @PostMapping("/issue")
    public ResponseEntity<Map<String, Object>> issueCoupon(
            Authentication authentication,
            @RequestBody Map<String, Object> payload) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElse(null);
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        Object couponIdObj = payload.get("couponId");
        if (couponIdObj == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "couponId가 필요합니다.");
            return ResponseEntity.badRequest().body(error);
        }
        Long couponId = Long.valueOf(couponIdObj.toString());

        // 쿠폰 존재 확인
        Coupon coupon = couponRepository.findById(couponId)
                .orElse(null);
        if (coupon == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "쿠폰을 찾을 수 없습니다.");
            return ResponseEntity.badRequest().body(error);
        }

        // 이미 발급받은 쿠폰인지 확인 (사용 여부와 관계없이 1번만 발급 가능)
        var existingCoupon = userCouponRepository.findByUserIdAndCouponId(user.getId(), couponId);
        if (existingCoupon.isPresent()) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "이미 발급받은 쿠폰입니다.");
            return ResponseEntity.badRequest().body(error);
        }

        // UserCoupon 생성 및 저장
        UserCoupon userCoupon = UserCoupon.builder()
                .user(user)
                .coupon(coupon)
                .isUsed(false)
                .issuedAt(LocalDateTime.now())
                .build();

        userCouponRepository.save(userCoupon);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "쿠폰이 발급되었습니다.");
        return ResponseEntity.ok(response);
    }
}
