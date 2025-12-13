package com.clone.backend.repository;

import com.clone.backend.model.Order;
import com.clone.backend.model.User;
import com.clone.backend.sharding.OrderRouter;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

@Repository
public class OrderRepository {

    private final OrderRouter orderRouter;

    public OrderRepository(OrderRouter orderRouter) {
        this.orderRouter = orderRouter;
    }

    public Order save(Order order) {
        if (order.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required for saving order");
        }

        // 1. Determine Shard
        MongoTemplate template = orderRouter.getShard(order.getUserId());

        // 2. Determine Collection (Partition)
        String collectionName = orderRouter.getCurrentCollectionName();

        // 3. Save
        return template.save(order, collectionName);
    }

    public List<Order> findByUserOrderByCreatedAtDesc(User user) {
        if (user == null || user.getId() == null) {
            return new ArrayList<>();
        }

        Long userId = user.getId();
        MongoTemplate template = orderRouter.getShard(userId);

        // Query Query
        Query query = new Query(Criteria.where("userId").is(userId));
        // Sort by createdAt desc if Mongo supports it, or sort in memory
        // query.with(Sort.by(Sort.Direction.DESC, "createdAt"));

        List<Order> allOrders = new ArrayList<>();

        // Scan recent years (e.g., this year and last year)
        // For production, maybe scan metadata or have a registry of years
        int currentYear = java.time.LocalDate.now().getYear();

        // Check 2024, 2025...
        for (int year = currentYear; year >= 2024; year--) {
            String collectionName = orderRouter.getCollectionNameForYear(year);
            try {
                if (template.collectionExists(collectionName)) {
                    allOrders.addAll(template.find(query, Order.class, collectionName));
                }
            } catch (Exception e) {
                // Ignore if collection issues
            }
        }

        // In-memory sort since we are merging collections
        allOrders.sort((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()));

        return allOrders;
    }
}
