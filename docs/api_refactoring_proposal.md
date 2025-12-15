# API Refactoring Proposal: Separating Best Products Endpoint

## 1. 개요 (Overview)
현재 **단일 엔드포인트**(`GET /api/products`)에서 파라미터(`type=best`)로 분기 처리하던 로직을, **전용 엔드포인트**(`GET /api/products/best`)로 분리하는 제안에 대한 검토 보고서입니다.

## 2. 기존 방식 (AS-IS)
*   **API**: `GET /api/products?type=best`
*   **동작**: 컨트롤러 하나에서 `search`, `category`, `best`, `timedeal` 모든 조건을 `if-else`로 처리.
*   **문제점**:
    *   **로직 혼재**: 단순 필터링과 '베스트 상품 선정'이라는 비즈니스 로직이 섞여 있음.
    *   **Frontend 부담**: 백엔드는 모든 베스트 상품을 다 내려주고, Frontend(`BestSwiper`)가 25개를 자르는(slice) 작업을 수행 중. (불필요한 데이터 전송)
    *   **유지보수**: '베스트 상품' 관련된 로직만 수정하고 싶어도 전체 검색 API를 건드려야 함.

## 3. 제안 방식 (TO-BE)
*   **API**: `GET /api/products/best` (신규 생성)
*   **동작**:
    *   백엔드에서 DB 조회 시 **Top 25개**만 딱 잘라서 가져오도록 최적화.
    *   Frontend는 별도 가공 없이 받아온 데이터를 그대로 뿌리기만 하면 됨.
    
## 4. 장점 (Pros)
1.  **성능 최적화 (Performance)**: 
    *   DB에서 25개만 가져오므로 쿼리가 훨씬 가벼워짐 (`LIMIT 25`).
    *   네트워크로 전송되는 데이터 양 감소.
2.  **명확한 역할 분리 (Separation of Concerns)**:
    *   홈/검색 API는 "검색 및 페이징"에 집중.
    *   베스트 API는 "순위권 상품 제공"에 집중.
3.  **Frontend 단순화**:
    *   `BestSwiper.jsx`에서 `slice(0, 25)` 하던 코드를 삭제해도 됨.
    *   백엔드가 주는 대로 보여주면 되므로 버그 발생 가능성 감소.
4.  **캐싱 (Caching) 용이**:
    *   베스트 상품은 자주 변하지 않으므로, `/products/best`만 따로 Redis 등에 캐싱하기가 훨씬 수월함.

## 5. 구현 계획 (Implementation Steps)

### Backend (`ProductController.java`)
*   기존 `getProducts` 메서드 내의 `if ("best".equals(type))` 블록 제거.
*   새로운 메서드 추가:
    ```java
    @GetMapping("/best")
    public List<Product> getBestProducts() {
        // Repository에서 Top 25만 가져오는 메서드 호출
        return productRepository.findTop25ByIsBestTrueOrderByRankAsc();
    }
    ```

### Backend (`ProductRepository.java`)
*   쿼리 메서드 최적화:
    ```java
    List<Product> findTop25ByIsBestTrueOrderByRankAsc();
    ```

### Frontend (`productApi.js`)
*   API 경로 변경:
    ```javascript
    getBestProducts: async () => {
        const response = await client.get('/products/best'); // 파라미터 불필요
        return response.data;
    }
    ```

### Frontend (`BestSwiper.jsx`)
*   `sorted.slice(0, 25)` 로직 삭제. API가 주는 25개를 그대로 사용.

## 6. 결론 (Conclusion)
**적극 권장합니다.**
현재 구조에서도 동작은 하지만, API를 분리하는 것이 **데이터 효율성, 코드 가독성, 유지보수성** 모든 면에서 훨씬 유리합니다. 특히 "25개만 가져온다"는 규칙을 백엔드에서 강제할 수 있어 Frontend의 부담을 덜어주는 것이 가장 큰 장점입니다.
