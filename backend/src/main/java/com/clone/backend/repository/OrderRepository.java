package com.clone.backend.repository;

import com.clone.backend.model.Order;
import com.clone.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
}
