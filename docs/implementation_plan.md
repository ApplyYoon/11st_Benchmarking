# Pagination Implementation Plan

## Goal
Optimize the "MD Recommends" section to fetch products in chunks (pagination) instead of loading the entire product list at once. This will prevent browser crashes due to memory overload.

## User Review Required
None.

## Proposed Changes

### Backend Components

#### [MODIFY] [ProductController.java](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/backend/src/main/java/com/clone/backend/controller/ProductController.java)
- **Update `getProducts` endpoint**:
    - Add `@RequestParam(defaultValue = "0") int page`
    - Add `@RequestParam(defaultValue = "20") int size`
    - Use `PageRequest.of(page, size)` to fetch data from `productRepository`.

#### [MODIFY] [ProductRepository.java](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/backend/src/main/java/com/clone/backend/repository/ProductRepository.java)
- Ensure it extends `JpaRepository` or `PagingAndSortingRepository` (already likely does, but verify `findAll(Pageable)` usage).

### Frontend Components

#### [MODIFY] [productApi.js](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/src/api/productApi.js)
- **Update `getAllProducts`**: Accept `page` and `size` arguments and pass them as query parameters.

#### [MODIFY] [MDRecommends.jsx](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/src/components/home/MDRecommends.jsx)
# Pagination Implementation Plan

## Goal
Optimize the "MD Recommends" section to fetch products in chunks (pagination) instead of loading the entire product list at once. This will prevent browser crashes due to memory overload.

## User Review Required
None.

## Proposed Changes

### Backend Components

#### [MODIFY] [ProductController.java](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/backend/src/main/java/com/clone/backend/controller/ProductController.java)
- **Update `getProducts` endpoint**:
    - Add `@RequestParam(defaultValue = "0") int page`
    - Add `@RequestParam(defaultValue = "20") int size`
    - Use `PageRequest.of(page, size)` to fetch data from `productRepository`.

#### [MODIFY] [ProductRepository.java](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/backend/src/main/java/com/clone/backend/repository/ProductRepository.java)
- Ensure it extends `JpaRepository` or `PagingAndSortingRepository` (already likely does, but verify `findAll(Pageable)` usage).

### Frontend Components

#### [MODIFY] [productApi.js](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/src/api/productApi.js)
- **Update `getAllProducts`**: Accept `page` and `size` arguments and pass them as query parameters.

#### [MODIFY] [MDRecommends.jsx](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/src/components/home/MDRecommends.jsx)
- **Update Logic**:
    - Manage `page` state (start at 0).
    - On `useEffect` (initial load), fetch page 0.
    - On `loadMore`, increment page and fetch next chunk.
    - Append new items to existing list instead of filtering clientside from a massive array.

## API Separation Refactoring (Best Products)

### Backend
#### [MODIFY] [ProductRepository.java](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/backend/src/main/java/com/clone/backend/repository/ProductRepository.java)
- Add `findTop25ByIsBestTrueOrderByRankAsc()` method.

#### [MODIFY] [ProductController.java](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/backend/src/main/java/com/clone/backend/controller/ProductController.java)
- Add `@GetMapping("/best")` endpoint.
- Remove legacy "best" type handling from `getProducts`.

### Frontend
#### [MODIFY] [productApi.js](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/src/api/productApi.js)
- Update `getBestProducts` to use `/products/best`.

#### [MODIFY] [BestSwiper.jsx](file:///c:/Users/yoons/OneDrive/%EB%AC%B8%EC%84%9C/GitHub/11st_Benchmarking/src/components/home/BestSwiper.jsx)
- Remove client-side slicing and sorting.
- Use data directly from API.

## Verification Plan
### Automated Tests
- None planned for this refactor.

### Manual Verification
- Verify Home page "Best" section loads exactly 25 items.
- Verify "Load More" button on Home page still works (regression test).
- Verify Network tab calls `/api/products/best`.
- Verify Home page "MD Recommends" section loads limited items.
- Verify "Load More" on "MD Recommends" appends new items to UI.
- Verify no browser lag/crash.
