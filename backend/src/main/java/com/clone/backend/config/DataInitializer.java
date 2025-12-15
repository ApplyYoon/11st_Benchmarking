/**
 * 초기 데이터 설정 클래스
 * - 앱 시작 시 PostgreSQL에 샘플 상품 데이터 자동 삽입
 * - 타임딜, 베스트 상품 등 테스트용 데이터 생성
 */
package com.clone.backend.config;

import com.clone.backend.model.Product;
import com.clone.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

        @Bean
        @SuppressWarnings("null")
        public CommandLineRunner initData(ProductRepository productRepository) {
                return args -> {
                        if (productRepository.count() > 0)
                                return;

                        productRepository.saveAll(List.of(
                                        // Time Deal
                                        Product.builder()
                                                        .name("[타임딜] 제주 서귀포 조생 감귤 5kg (소과/로얄과)")
                                                        .price(12900).originalPrice(25000).discountRate(48)
                                                        .imageUrl("https://cdn.pixabay.com/photo/2017/02/26/12/27/oranges-2100108_1280.jpg")
                                                        .category("food").isTimeDeal(true)
                                                        .timeDealEndTime(LocalDateTime.now().plusDays(1))
                                                        .build(),
                                        Product.builder()
                                                        .name("[타임딜] 삼성 오디세이 게이밍 모니터 32인치 165Hz")
                                                        .price(349000).originalPrice(450000).discountRate(22)
                                                        .imageUrl("https://cdn.pixabay.com/photo/2021/08/28/02/43/gaming-pc-6579893_1280.jpg")
                                                        .category("electronics").isTimeDeal(true)
                                                        .timeDealEndTime(LocalDateTime.now().plusDays(1))
                                                        .build(),
                                        // Best Items
                                        Product.builder()
                                                        .name("맥심 모카골드 마일드 믹스 180T + 20T 증정")
                                                        .price(23500).originalPrice(28000).discountRate(16)
                                                        .imageUrl("https://cdn.pixabay.com/photo/2014/12/11/02/56/coffee-563797_1280.jpg")
                                                        .category("food").isBest(true).rank(1)
                                                        .build(),
                                        Product.builder()
                                                        .name("크리넥스 3겹 데코앤소프트 30롤 x 2팩")
                                                        .price(32900).originalPrice(45000).discountRate(27)
                                                        .imageUrl("https://cdn.pixabay.com/photo/2020/03/27/11/24/toilet-paper-4973212_1280.jpg")
                                                        .category("daily").isBest(true).rank(2)
                                                        .build()));
                };
        }
}
