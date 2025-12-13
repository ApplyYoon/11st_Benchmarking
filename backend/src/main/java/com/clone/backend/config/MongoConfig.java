package com.clone.backend.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig {

    // Shard A Connection (Odd Users)
    @org.springframework.context.annotation.Primary
    @Bean(name = "shardAMongoTemplate")
    public MongoTemplate shardAMongoTemplate() {
        // Docker container name: mongo-shard-a, Port: 27017
        return new MongoTemplate(new SimpleMongoClientDatabaseFactory(
                "mongodb://mongo-shard-a:27017/orders"));
    }

    // Shard B Connection (Even Users)
    @Bean(name = "shardBMongoTemplate")
    public MongoTemplate shardBMongoTemplate() {
        // Docker container name: mongo-shard-b, Port: 27017
        // Note: Inside Docker network, we use internal port 27017 for both, but
        // different hostnames
        return new MongoTemplate(new SimpleMongoClientDatabaseFactory(
                "mongodb://mongo-shard-b:27017/orders"));
    }
}
