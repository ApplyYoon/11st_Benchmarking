/**
 * 상품 서비스
 * - 검색 오타수정 기능 (Levenshtein distance 알고리즘)
 * - DB의 실제 상품명을 기반으로 오타를 자동 수정
 */
package com.clone.backend.service;

import com.clone.backend.model.Product;
import com.clone.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Levenshtein distance 알고리즘을 사용하여 검색어 오타를 수정
     * 검색 결과가 없을 때만 오타수정을 수행
     * @param query 검색어
     * @return 수정된 검색어 (오타가 없거나 검색 결과가 있으면 null)
     */
    public String findClosestMatch(String query) {
        if (query == null || query.length() < 2) {
            return null;
        }

        // 먼저 검색 결과가 있는지 확인
        List<Product> searchResults = productRepository.findByNameContaining(query);
        if (!searchResults.isEmpty()) {
            // 검색 결과가 있으면 오타수정 불필요
            return null;
        }

        // 검색 결과가 없을 때만 오타수정 수행
        // DB에서 모든 상품명 가져오기
        List<Product> allProducts = productRepository.findAll();

        String bestMatch = null;
        int minDistance = Integer.MAX_VALUE;

        for (Product product : allProducts) {
            String productName = product.getName();
            
            // 상품명에서 키워드 추출 (공백, 특수문자로 분리)
            String[] keywords = productName
                    .replaceAll("[\\[\\]()]", " ")  // 대괄호, 괄호 제거
                    .replaceAll("[^가-힣a-zA-Z0-9\\s]", " ")  // 특수문자 제거
                    .split("\\s+");  // 공백으로 분리

            for (String keyword : keywords) {
                if (keyword.length() < 2) continue;  // 너무 짧은 키워드는 스킵
                
                // 정확한 일치나 부분 일치가 있으면 스킵
                if (keyword.contains(query) || query.contains(keyword)) {
                    continue;
                }

                int distance = getLevenshteinDistance(query, keyword);

                // 임계값: 검색어 길이에 따라 조정
                int threshold;
                if (query.length() <= 3) {
                    threshold = 1;  // 짧은 검색어는 1자 오타만 허용
                } else if (query.length() <= 5) {
                    threshold = 2;  // 중간 길이는 2자 오타 허용
                } else {
                    threshold = 3;  // 긴 검색어는 3자 오타 허용
                }

                if (distance <= threshold && distance < minDistance && distance > 0) {
                    minDistance = distance;
                    bestMatch = keyword;  // 키워드를 반환
                }
            }
        }

        return bestMatch;
    }

    /**
     * Levenshtein distance 계산
     */
    private int getLevenshteinDistance(String a, String b) {
        if (a.length() == 0) return b.length();
        if (b.length() == 0) return a.length();

        int[][] matrix = new int[b.length() + 1][a.length() + 1];

        // 첫 번째 행 초기화
        for (int j = 0; j <= a.length(); j++) {
            matrix[0][j] = j;
        }

        // 첫 번째 열 초기화
        for (int i = 0; i <= b.length(); i++) {
            matrix[i][0] = i;
        }

        // 행렬 채우기
        for (int i = 1; i <= b.length(); i++) {
            for (int j = 1; j <= a.length(); j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(
                            matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1  // deletion
                        )
                    );
                }
            }
        }

        return matrix[b.length()][a.length()];
    }
}

