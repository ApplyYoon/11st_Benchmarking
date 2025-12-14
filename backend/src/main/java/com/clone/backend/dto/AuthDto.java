/**
 * 인증 관련 DTO 모음
 * - SignupRequest: 회원가입 요청 데이터
 * - LoginRequest: 로그인 요청 데이터
 * - AuthResponse: 로그인 응답 (JWT + 사용자 정보)
 */
package com.clone.backend.dto;

import lombok.Getter;
import lombok.Setter;

public class AuthDto {

    @Getter
    @Setter
    public static class SignupRequest {
        private String email;
        private String password;
        private String name;
        private String address;
        private String detailAddress;
        private String zipCode;
    }

    @Getter
    @Setter
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Getter
    @Setter
    public static class AuthResponse {
        private String accessToken;
        private String tokenType = "Bearer";
        private com.clone.backend.model.User user;

        public AuthResponse(String accessToken, com.clone.backend.model.User user) {
            this.accessToken = accessToken;
            this.user = user;
        }
    }
}
