package com.clone.backend.service;

import com.clone.backend.dto.AuthDto;
import com.clone.backend.model.User;
import com.clone.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public User signup(AuthDto.SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .address(request.getAddress())
                .detailAddress(request.getDetailAddress())
                .zipCode(request.getZipCode())
                .grade(User.Grade.FAMILY)
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
