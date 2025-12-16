/**
 * 인증 서비스
 * - 회원가입: 이메일 중복 확인, 비밀번호 BCrypt 암호화
 * - 로그인: 비밀번호 검증
 * - 초기 포인트 1000으로 설정
 * - 회원가입 시 신규 회원 쿠폰(ID 2) 자동 발급
 */
package com.clone.backend.service;

import com.clone.backend.dto.AuthDto;
import com.clone.backend.model.Coupon;
import com.clone.backend.model.User;
import com.clone.backend.model.UserCoupon;
import com.clone.backend.repository.CouponRepository;
import com.clone.backend.repository.UserCouponRepository;
import com.clone.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       CouponRepository couponRepository, UserCouponRepository userCouponRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.couponRepository = couponRepository;
        this.userCouponRepository = userCouponRepository;
    }

    @Transactional
    @SuppressWarnings("null")
    public User signup(AuthDto.SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("이미 가입된 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .address(request.getAddress())
                .detailAddress(request.getDetailAddress())
                .zipCode(request.getZipCode())
                .points(1000)
                .build();

        User savedUser = userRepository.save(user);

        // 신규 회원에게 쿠폰 ID 2번 자동 발급
        couponRepository.findById(2L).ifPresent(coupon -> {
            UserCoupon userCoupon = UserCoupon.builder()
                    .user(savedUser)
                    .coupon(coupon)
                    .isUsed(false)
                    .issuedAt(LocalDateTime.now())
                    .build();
            userCouponRepository.save(userCoupon);
        });

        return savedUser;
    }

    public User login(AuthDto.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }

    public java.util.Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
