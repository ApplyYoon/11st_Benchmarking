# 백엔드 아키텍처 및 DB 설계 심층 분석

현재 프로젝트의 백엔드 구조는 **"대규모 트래픽을 견딜 수 있는 이커머스 시스템"**을 목표로 설계되었습니다. 학교 과제 수준을 넘어, 실제 서비스 기업들이 고민하는 확장성(Scalability) 포인트들이 잘 녹아있습니다.

---

## 1. DB 설계: 왜 이렇게 3개를 썼을까? (Polyglot Persistence)

가장 인상적인 점은 **DB를 하나만 쓰지 않고, 용도에 따라 3가지를 섞어 썼다(Polyglot Persistence)**는 점입니다.

| 데이터 종류 | 사용하는 DB | 설계 이유 (Why?) |
| :--- | :--- | :--- |
| **상품, 회원** | **PostgreSQL** (RDB) | **"데이터의 무결성"**이 생명입니다. 결제된 상품 정보가 깨지거나, 회원 정보가 중복되면 큰일납니다. 복잡한 관계(조인)와 트랜잭션을 확실하게 보장하는 전통적인 RDB가 최적입니다. |
| **주문 정보** | **MongoDB** (NoSQL) | **"엄청난 데이터 양"** 때문입니다. 상품은 기껏해야 수십만 개지만, 주문 내역은 수천만 건이 쌓입니다. RDB는 데이터가 너무 많아지면 느려지는데, MongoDB는 데이터를 여러 서버에 나눠 담기(Sharding) 편해서 "찢어서 저장하기" 전략을 썼습니다. |
| **장바구니** | **Redis** (In-Memory) | **"속도"** 때문입니다. 장바구니는 사용자가 페이지를 이동할 때마다 수시로 확인하고 수정합니다. 디스크(HDD/SSD)에서 읽는 다른 DB보다, 메모리(RAM)에서 꺼내는 Redis가 압도적으로 빠릅니다. |

---

## 2. 폴더 구조: 왜 이렇게 쪼개놨을까? (Layered Architecture)

소스 코드를 보면 폴더(패키지)가 역할별로 딱딱 나뉘어 있습니다. 이를 **계층형 아키텍처(Layered Architecture)**라고 합니다.

### 🏢 비유: "레스토랑" 운영 시스템

1.  **Controller (`/controller`) - 웨이터**
    *   **역할**: 손님(프론트엔드)의 주문(API 요청)을 받고, 완성된 요리(JSON 응답)를 서빙합니다.
    *   **특징**: 요리는 직접 안 합니다. "주방장(Service)님, 파스타 하나요!"라고 전달만 합니다.
    *   **예시**: `ProductController.java` (상품 목록 줘!), `AuthController.java` (로그인 해줘!)

2.  **Service (`/service`) - 주방장**
    *   **역할**: 실제로 요리(비즈니스 로직)를 합니다. 재료를 볶고, 간을 맞춥니다.
    *   **특징**: "로그인" 주문이 들어오면 -> "비밀번호가 맞나?" -> "맞으면 토큰 발급해!" 같은 판단을 여기서 합니다.
    *   **예시**: `AuthService.java` (비번 검사, 회원가입 처리), `ProductService.java`

3.  **Repository (`/repository`) - 재료 창고 담당자**
    *   **역할**: 냉장고(DB)에서 재료(데이터)를 꺼내오거나, 남은 재료를 다시 넣습니다.
    *   **특징**: SQL 쿼리를 여기서 날립니다. 주방장(Service)은 냉장고 위치를 몰라도 "고기 줘" 하면 얘가 꺼내줍니다.
    *   **예시**: `UserRepository.java` (DB에서 User 찾아줘), `RedisCartRepository.java` (Redis에서 장바구니 꺼내줘)

4.  **Model (`/model` & `/dto`) - 접시와 재료**
    *   **Model**: 재료 그 자체입니다. (DB 테이블과 똑같이 생긴 자바 객체)
    *   **DTO**: 서빙 나가는 접시입니다. (비밀번호 같은 건 빼고 예쁘게 담은 객체)

5.  **Config (`/config`) - 레스토랑 규칙**
    *   **역할**: 가게 오픈 준비, 보안 설정, 기계 세팅 등을 담당합니다.
    *   **예시**: `SecurityConfig.java` (출입증(JWT) 없으면 주방 출입 금지!), `RedisConfig.java` (Redis 연결 세팅)

---

## 3. 상세 파일별 기능 명세 (Backend Spec)

프로젝트에 포함된 모든 자바 파일들의 상세 역할입니다.

### ⚙️ Config (설정)
서버가 시작될 때 "이렇게 동작해라"라고 약속을 정하는 곳입니다.
*   **`SecurityConfig`**: 문지기 역할. 어떤 URL이 로그인 없이 접근 가능한지, CORS(외부 접속 허용)는 어떻게 할지 정합니다.
*   **`MongoConfig`**: MongoDB 연결 설정. 몽고디비 서버 주소와 샤딩 관련 설정을 담당합니다.
*   **`RedisConfig`**: Redis 연결 설정. 자바 객체(CartItem)를 JSON으로 바꿔서 Redis에 저장하는 변환기(Serializer) 설정을 포함합니다.

### 🎮 Controller (요청 처리)
프론트엔드의 요청을 가장 먼저 받는 최전방 데스크입니다.
*   **`AuthController`**: 회원가입, 로그인, 로그아웃 요청을 처리합니다.
*   **`OAuthController`**: 카카오, 네이버 같은 소셜 로그인 요청을 처리합니다.
*   **`ProductController`**: 상품 목록조회, 검색, 베스트 상품 필터링, 타임딜 조회 API를 제공합니다.
*   **`CartController`**: 장바구니에 상품 담기, 빼기, 수량 변경 요청을 받습니다. (Redis와 통신)
*   **`OrderController`**: 주문 생성, 내 주문 내역 조회, 주문 취소 요청을 받습니다. (MongoDB와 통신)
*   **`UserController`**: 마이페이지 정보 조회, 주소지 수정 기능을 제공합니다.
*   **`CouponController`**: 쿠폰 발급 및 조회 기능을 담당합니다.

### 👨‍🍳 Service (비즈니스 로직)
실제 업무 처리를 담당하는 핵심 로직입니다.
*   **`AuthService`**: 회원가입 시 비밀번호 암호화(BCrypt), 중복 이메일 체크 등을 수행합니다.
*   **`CustomUserDetailsService`**: 스프링 시큐리티가 로그인 시 DB에서 사용자 정보를 가져오는 로직을 연결합니다.
*   **`KakaoOAuthService`**: 카카오 인증 서버에서 액세스 토큰을 받고, 사용자 정보를 가져옵니다. (RestTemplate 사용)
*   **`ProductService`**: 상품 검색 시 오타 보정 로직이나 복잡한 필터링을 수행합니다.
*   **`UserService`**: 사용자 정보 업데이트 로직을 수행합니다.

### 📦 Repository (데이터 접근)
DB에 직접 접속하는 친구들입니다.
*   **`UserRepository`** (JPA): PostgreSQL `users` 테이블 담당. 이메일로 유저 찾기 등.
*   **`ProductRepository`** (JPA): PostgreSQL `products` 테이블 담당. 카테고리별 상품 검색 등.
*   **`OrderRepository` (Custom)**: **(핵심)** MongoDB 담당. `OrderRouter`를 써서 샤드(A/B)를 결정하고 데이터를 저장/조회합니다.
*   **`RedisCartRepository`**: Redis 담당. 장바구니 데이터를 메모리에 저장하고 가져옵니다.
*   **`CouponRepository`**, **`UserCouponRepository`**: 쿠폰 관련 데이터 담당.

### 🔒 Security (보안)
*   **`JwtTokenProvider`**: JWT 토큰을 생성하고, 토큰이 유효한지 검사하는 기계입니다.
*   **`JwtAuthenticationFilter`**: 모든 요청마다 출입증(토큰)을 검사하는 검색대입니다. 유효하면 통과, 아니면 차단합니다.

### 🧩 Sharding (분산 처리)
*   **`OrderRouter`**: **(핵심)** "이 유저는 홀수니까 A서버!" "올해는 2025년이니까 `orders_2025` 통에 넣어!"라고 교통정리를 해주는 네비게이션입니다.

### 📄 DTO & Model
*   **`dto/*.java`**: `LoginRequest`, `AuthResponse` 등 프론트와 주고받는 메시지 양식입니다.
*   **`model/*.java`**: `User`, `Product`, `Order` 등 DB 테이블/문서와 매핑되는 원본 데이터 구조입니다.

## 4. 총평: 설계를 보고 느낀 점

1.  **확장성 고려가 훌륭합니다**: 처음부터 주문 데이터 폭증을 대비해 MongoDB Sharding을 도입한 것은 실무 아키텍트 수준의 설계입니다.
2.  **역할 분리가 명확합니다**: Controller에 로직을 섞지 않고 Service로 잘 뺐습니다. 덕분에 나중에 유지보수하기가 아주 편합니다.
3.  **적재적소의 기술 선택**: 장바구니에 무거운 RDB 대신 가벼운 Redis를 쓴 것은 "사용자 경험(속도)"을 중요하게 생각했다는 증거입니다.

이 구조는 현업에서 **"MSA(마이크로서비스)로 가기 직전의 아주 잘 짜여진 모놀리식 구조"**라고 볼 수 있습니다. 이대로 포트폴리오에 쓰셔도 손색없는 훌륭한 아키텍처입니다. 👍
