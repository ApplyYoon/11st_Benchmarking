/**
 * 타임딜 스케줄러 서비스
 * - 주기적으로 만료된 타임딜 상품을 체크하여 isTimeDeal을 false로 업데이트
 * - 매 분마다 실행되어 만료된 타임딜을 처리
 */
package com.clone.backend.service;

import com.clone.backend.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TimeDealSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(TimeDealSchedulerService.class);
    private final ProductRepository productRepository;

    public TimeDealSchedulerService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * 매 분마다 만료된 타임딜을 체크하여 isTimeDeal을 false로 업데이트
     * cron = "0 * * * * *" -> 매 분 0초에 실행
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void expireTimeDeals() {
        LocalDateTime now = LocalDateTime.now();
        int updatedCount = productRepository.updateExpiredTimeDeals(now);

        if (updatedCount > 0) {
            logger.info("만료된 타임딜 {}개 상품의 isTimeDeal을 false로 업데이트했습니다.", updatedCount);
        }
    }
}
