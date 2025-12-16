/**
 * MongoDB 샤딩 설정 클래스
 * - Shard A (홀수 userId): mongo-shard-a:27017
 * - Shard B (짝수 userId): mongo-shard-b:27017
 * - 주문 데이터를 2개의 샤드에 분산 저장
 */
package com.clone.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig {

    // Shard A Connection (Odd Users)
    @Primary
    @Bean(name = "shardAMongoTemplate")
    public MongoTemplate shardAMongoTemplate() {
        // Docker container name: mongo_shard_a, Port: 27017
        return new MongoTemplate(new SimpleMongoClientDatabaseFactory(
                "mongodb://mongo_shard_a:27017/orders"));
    }

    // Shard B Connection (Even Users)
    @Bean(name = "shardBMongoTemplate")
    public MongoTemplate shardBMongoTemplate() {
        // Docker container name: mongo_shard_b, Port: 27017
        // Note: Inside Docker network, we use internal port 27017 for both, but
        // different hostnames
        return new MongoTemplate(new SimpleMongoClientDatabaseFactory(
                "mongodb://mongo_shard_b:27017/orders"));
    }
}
