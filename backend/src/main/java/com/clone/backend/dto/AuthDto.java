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
