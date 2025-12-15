/**
 * 주문 레포지토리 (MongoDB - 커스텀 구현)
 * - OrderRouter를 사용하여 userId 기반 샤딩
 * - 연도별 파티셔닝 (orders_2024, orders_2025)
 * - save(): 주문 저장, findByUser(): 사용자별 주문 조회
 * - delete(): 주문 삭제 (Hard Delete, 샤드 전체 탐색)
 */
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

    @SuppressWarnings("null")
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

    @SuppressWarnings("null")
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

    public void delete(User user, String orderId) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("User is required for deleting order");
        }

        Long userId = user.getId();
        MongoTemplate template = orderRouter.getShard(userId);

        // Scan collections to find and delete
        int currentYear = java.time.LocalDate.now().getYear();
        Query query = new Query(Criteria.where("_id").is(orderId).and("userId").is(userId));

        for (int year = currentYear; year >= 2024; year--) {
            String collectionName = orderRouter.getCollectionNameForYear(year);
            System.out.println("DEBUG: Scanning collection " + collectionName + " for order " + orderId);

            if (template.collectionExists(collectionName)) {
                var result = template.remove(query, Order.class, collectionName);
                if (result.getDeletedCount() > 0) {
                    System.out.println("DEBUG: Deleted order " + orderId + " from " + collectionName);
                    return; // Deleted successfully
                }
            }
        }
    }
}
