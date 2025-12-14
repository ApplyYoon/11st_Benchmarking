/**
 * 사용자 서비스
 * - 주소 업데이트 비즈니스 로직
 * - 이메일로 사용자 조회 후 주소 필드 갱신
 */
package com.clone.backend.service;

import com.clone.backend.dto.AddressUpdateRequest;
import com.clone.backend.model.User;
import com.clone.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public void updateAddress(String email, AddressUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setZipCode(request.getZipCode());
        user.setAddress(request.getAddress());
        user.setDetailAddress(request.getDetailAddress());
    }
}
