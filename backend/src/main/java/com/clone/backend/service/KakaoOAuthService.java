package com.clone.backend.service;

import com.clone.backend.model.User;
import com.clone.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
public class KakaoOAuthService {

    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Value("${kakao.client-id:df51448645c334cdd1f85b5521edfe51}")
    private String clientId;

    @Value("${kakao.client-secret:Q368vjeRqOJ3vfFHjczZHvToFjPJm9kB}")
    private String clientSecret;

    @Value("${kakao.redirect-uri:http://localhost:5173/oauth/kakao/callback}")
    private String redirectUri;

    public KakaoOAuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.restTemplate = new RestTemplate();
    }

    /**
     * Exchange authorization code for access token
     */
    public String getAccessToken(String code) {
        String tokenUrl = "https://kauth.kakao.com/oauth/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("access_token")) {
                return (String) body.get("access_token");
            }
            throw new RuntimeException("Failed to get access token from Kakao");
        } catch (Exception e) {
            throw new RuntimeException("Kakao token exchange failed: " + e.getMessage(), e);
        }
    }

    /**
     * Get user info from Kakao using access token
     */
    public Map<String, Object> getUserInfo(String accessToken) {
        String userInfoUrl = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    userInfoUrl,
                    HttpMethod.GET,
                    request,
                    Map.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get user info from Kakao: " + e.getMessage(), e);
        }
    }

    /**
     * Find or create user based on Kakao user info
     */
    public User findOrCreateUser(Map<String, Object> kakaoUserInfo) {
        Long kakaoId = ((Number) kakaoUserInfo.get("id")).longValue();

        // Extract email and nickname from kakao_account
        Map<String, Object> kakaoAccount = (Map<String, Object>) kakaoUserInfo.get("kakao_account");
        Map<String, Object> profile = kakaoAccount != null ? (Map<String, Object>) kakaoAccount.get("profile") : null;

        String email = kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
        String nickname = profile != null ? (String) profile.get("nickname") : null;

        // If email is not provided, use kakao ID as email
        if (email == null || email.isEmpty()) {
            email = "kakao_" + kakaoId + "@kakao.user";
        }

        // If nickname is not provided, use default
        if (nickname == null || nickname.isEmpty()) {
            nickname = "카카오회원";
        }

        // Check if user already exists
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // Create new user
        User newUser = User.builder()
                .email(email)
                .password("KAKAO_OAUTH_USER_" + kakaoId) // OAuth users don't need a real password
                .name(nickname)
                .grade(User.Grade.FAMILY)
                .points(1000) // Welcome points
                .address("")
                .detailAddress("")
                .zipCode("")
                .build();

        return userRepository.save(newUser);
    }
}
