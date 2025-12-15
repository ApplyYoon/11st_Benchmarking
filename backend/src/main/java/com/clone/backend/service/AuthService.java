/**
 * 인증 서비스
 * - 회원가입: 이메일 중복 확인, 비밀번호 BCrypt 암호화
 * - 로그인: 비밀번호 검증
 * - 초기 포인트 1000으로 설정
 */
package com.clone.backend.service;

import com.clone.backend.dto.AuthDto;
import com.clone.backend.model.User;
import com.clone.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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

        return userRepository.save(user);
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
