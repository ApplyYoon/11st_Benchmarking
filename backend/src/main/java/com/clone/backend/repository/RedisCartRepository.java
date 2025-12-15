/**
 * Redis 장바구니 레포지토리
 * - Redis Hash 연산으로 장바구니 CRUD
 * - Key 패턴: cart:{userId}
 * - 7일 TTL 자동 적용
 */
package com.clone.backend.repository;

import com.clone.backend.model.RedisCartItem;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Repository
public class RedisCartRepository {

    private static final String CART_KEY_PREFIX = "cart:";
    private static final long CART_TTL_DAYS = 7;

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisCartRepository(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String getCartKey(Long userId) {
        return CART_KEY_PREFIX + userId;
    }

    /**
     * 장바구니에 상품 추가 (이미 있으면 수량 증가)
     */
    public RedisCartItem addItem(Long userId, RedisCartItem item) {
        String cartKey = getCartKey(userId);
        String productKey = String.valueOf(item.getProductId());

        // 기존 아이템 확인
        RedisCartItem existingItem = (RedisCartItem) redisTemplate.opsForHash().get(cartKey, productKey);

        if (existingItem != null) {
            existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
            redisTemplate.opsForHash().put(cartKey, productKey, existingItem);
        } else {
            item.setAddedAt(java.time.LocalDateTime.now());
            redisTemplate.opsForHash().put(cartKey, productKey, item);
        }

        // TTL 갱신 (7일)
        redisTemplate.expire(cartKey, CART_TTL_DAYS, TimeUnit.DAYS);

        return existingItem != null ? existingItem : item;
    }

    /**
     * 사용자의 전체 장바구니 조회
     */
    public List<RedisCartItem> getCart(Long userId) {
        String cartKey = getCartKey(userId);
        Map<Object, Object> entries = redisTemplate.opsForHash().entries(cartKey);

        List<RedisCartItem> items = new ArrayList<>();
        for (Object value : entries.values()) {
            if (value instanceof RedisCartItem) {
                items.add((RedisCartItem) value);
            }
        }

        return items;
    }

    /**
     * 특정 상품 수량 변경
     */
    public RedisCartItem updateQuantity(Long userId, Long productId, int quantity) {
        String cartKey = getCartKey(userId);
        String productKey = String.valueOf(productId);

        RedisCartItem item = (RedisCartItem) redisTemplate.opsForHash().get(cartKey, productKey);
        if (item != null) {
            item.setQuantity(quantity);
            redisTemplate.opsForHash().put(cartKey, productKey, item);
            redisTemplate.expire(cartKey, CART_TTL_DAYS, TimeUnit.DAYS);
        }

        return item;
    }

    /**
     * 특정 상품 삭제
     */
    public void removeItem(Long userId, Long productId) {
        String cartKey = getCartKey(userId);
        String productKey = String.valueOf(productId);
        redisTemplate.opsForHash().delete(cartKey, productKey);
    }

    /**
     * 장바구니 전체 비우기
     */
    public void clearCart(Long userId) {
        String cartKey = getCartKey(userId);
        redisTemplate.delete(cartKey);
    }

    /**
     * 장바구니 TTL 확인 (초 단위)
     */
    public Long getTTL(Long userId) {
        String cartKey = getCartKey(userId);
        return redisTemplate.getExpire(cartKey, TimeUnit.SECONDS);
    }
}
