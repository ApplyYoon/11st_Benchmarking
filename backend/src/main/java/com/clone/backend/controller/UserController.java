/**
 * 사용자 정보 컨트롤러 (/api/users)
 * - PUT /me/address: 배송지 주소 업데이트
 * - PUT /me/profile: 프로필 정보 (이름) 업데이트
 * - JWT 쿠키로 현재 사용자 인증
 */
package com.clone.backend.controller;

import com.clone.backend.model.User;
import com.clone.backend.repository.UserRepository;
import com.clone.backend.security.JwtTokenProvider;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public UserController(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private Optional<User> getCurrentUser(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("auth_token".equals(cookie.getName())) {
                    String token = cookie.getValue();
                    if (jwtTokenProvider.validateToken(token)) {
                        String email = jwtTokenProvider.getUserEmailFromToken(token);
                        return userRepository.findByEmail(email);
                    }
                }
            }
        }
        return Optional.empty();
    }

    @PutMapping("/me/address")
    public ResponseEntity<?> updateAddress(@RequestBody Map<String, Object> addressData, HttpServletRequest request) {
        Optional<User> userOpt = getCurrentUser(request);

        // Fallback: If cookie auth fails, try using userId from request body
        if (userOpt.isEmpty() && addressData.containsKey("userId")) {
            long userId = Long.parseLong(addressData.get("userId").toString());
            userOpt = userRepository.findById(userId);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        User user = userOpt.get();
        user.setZipCode((String) addressData.get("zipCode"));
        user.setAddress((String) addressData.get("address"));
        user.setDetailAddress((String) addressData.get("detailAddress"));

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @SuppressWarnings("null")
    @PutMapping("/me/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> profileData, HttpServletRequest request) {
        Optional<User> userOpt = getCurrentUser(request);

        // Fallback: If cookie auth fails, try using userId from request body
        if (userOpt.isEmpty() && profileData.containsKey("userId")) {
            long userId = Long.parseLong(profileData.get("userId").toString());
            userOpt = userRepository.findById(userId);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        User user = userOpt.get();

        // Update name if provided
        if (profileData.containsKey("name") && profileData.get("name") != null) {
            user.setName((String) profileData.get("name"));
        }

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }
}
