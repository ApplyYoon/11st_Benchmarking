package com.clone.backend.service;

import com.clone.backend.model.User;
import com.clone.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class KakaoOAuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private KakaoOAuthService kakaoOAuthService;

    @BeforeEach
    void setUp() {
        // Inject values using ReflectionTestUtils since they are @Value fields
        ReflectionTestUtils.setField(kakaoOAuthService, "clientId", "test-client-id");
        ReflectionTestUtils.setField(kakaoOAuthService, "clientSecret", "test-client-secret");
        ReflectionTestUtils.setField(kakaoOAuthService, "redirectUri", "http://test-redirect-uri");

        // Since we are mocking RestTemplate which is instantiated in the constructor,
        // we need to inject the mock into the service instance or use constructor
        // injection if possible.
        // In this specific service, RestTemplate is created inside the constructor:
        // this.restTemplate = new RestTemplate();
        // So @InjectMocks might normally fail to replace it if it's not a constructor
        // arg or field injection.
        // However, since it is a private final field, we can use ReflectionTestUtils to
        // swap it.
        ReflectionTestUtils.setField(kakaoOAuthService, "restTemplate", restTemplate);
    }

    @Test
    void getAccessToken_Success() {
        // Arrange
        String code = "test-auth-code";
        String expectedAccessToken = "test-access-token";

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("access_token", expectedAccessToken);

        ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(responseBody, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://kauth.kakao.com/oauth/token"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                any(ParameterizedTypeReference.class))).thenReturn(responseEntity);

        // Act
        String accessToken = kakaoOAuthService.getAccessToken(code);

        // Assert
        assertEquals(expectedAccessToken, accessToken);
        verify(restTemplate).exchange(
                eq("https://kauth.kakao.com/oauth/token"),
                eq(HttpMethod.POST),
                any(HttpEntity.class),
                any(ParameterizedTypeReference.class));
    }

    @Test
    void getUserInfo_Success() {
        // Arrange
        String accessToken = "test-access-token";
        Map<String, Object> expectedUserInfo = new HashMap<>();
        expectedUserInfo.put("id", 123456789L);

        ResponseEntity<Map<String, Object>> responseEntity = new ResponseEntity<>(expectedUserInfo, HttpStatus.OK);

        when(restTemplate.exchange(
                eq("https://kapi.kakao.com/v2/user/me"),
                eq(HttpMethod.GET),
                any(HttpEntity.class),
                any(ParameterizedTypeReference.class))).thenReturn(responseEntity);

        // Act
        Map<String, Object> userInfo = kakaoOAuthService.getUserInfo(accessToken);

        // Assert
        assertEquals(expectedUserInfo, userInfo);
    }
}
