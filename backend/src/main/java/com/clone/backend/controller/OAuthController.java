package com.clone.backend.controller;

import com.clone.backend.dto.AuthDto;
import com.clone.backend.model.User;
import com.clone.backend.security.JwtTokenProvider;
import com.clone.backend.service.KakaoOAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/oauth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class OAuthController {

    private final KakaoOAuthService kakaoOAuthService;
    private final JwtTokenProvider jwtTokenProvider;

    public OAuthController(KakaoOAuthService kakaoOAuthService, JwtTokenProvider jwtTokenProvider) {
        this.kakaoOAuthService = kakaoOAuthService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/kakao")
    public ResponseEntity<?> kakaoLogin(@RequestBody Map<String, String> request, HttpServletResponse response) {
        try {
            String code = request.get("code");
            if (code == null || code.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Authorization code is required"));
            }

            // 1. Exchange code for access token
            String accessToken = kakaoOAuthService.getAccessToken(code);

            // 2. Get user info from Kakao
            Map<String, Object> kakaoUserInfo = kakaoOAuthService.getUserInfo(accessToken);

            // 3. Find or create user
            User user = kakaoOAuthService.findOrCreateUser(kakaoUserInfo);

            // 4. Generate JWT token
            String jwtToken = jwtTokenProvider.generateTokenFromEmail(user.getEmail());

            // 5. Set token in httpOnly cookie
            Cookie cookie = new Cookie("auth_token", jwtToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(false); // Set to true in production with HTTPS
            cookie.setPath("/");
            cookie.setMaxAge(7 * 24 * 60 * 60); // 7 days
            response.addCookie(cookie);

            // 6. Return user info (without password)
            AuthDto.AuthResponse authResponse = new AuthDto.AuthResponse(null, user);
            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "error", "Kakao login failed",
                    "message", e.getMessage()));
        }
    }
}
