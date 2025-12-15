/**
 * MongoDB 주문 샤딩 라우터
 * - getShard(): userId 기반 샤드 선택 (홀수→A, 짝수→B)
 * - getCurrentCollectionName(): 연도별 컬렉션명 (orders_2025)
 * - 수평 확장을 위한 데이터 분산 처리
 */
package com.clone.backend.sharding;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class OrderRouter {

    private final MongoTemplate shardA;
    private final MongoTemplate shardB;

    public OrderRouter(
            @Qualifier("shardAMongoTemplate") MongoTemplate shardA,
            @Qualifier("shardBMongoTemplate") MongoTemplate shardB) {
        this.shardA = shardA;
        this.shardB = shardB;
    }

    /**
     * Determines which database shard to use based on User ID.
     * Logic: Odd IDs -> Shard A, Even IDs -> Shard B
     */
    public MongoTemplate getShard(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null for sharding");
        }
        return (userId % 2 != 0) ? shardA : shardB;
    }

    /**
     * Generates a dynamic collection name based on the current year.
     * Example: "orders_2025"
     */
    public String getCurrentCollectionName() {
        int year = LocalDate.now().getYear();
        return "orders_" + year;
    }

    /**
     * Generates a collection name for a specific year.
     */
    public String getCollectionNameForYear(int year) {
        return "orders_" + year;
    }
}
