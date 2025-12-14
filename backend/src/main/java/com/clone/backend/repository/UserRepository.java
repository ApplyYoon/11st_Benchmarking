/**
 * 사용자 레포지토리 (PostgreSQL - JPA)
 * - 이메일로 사용자 조회, 이메일 중복 확인
 * - Spring Data JPA 자동 구현
 */
package com.clone.backend.repository;

import com.clone.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
