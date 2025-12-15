# Spring Boot 핵심 개념 정리 (feat. 내 프로젝트 코드)

이 문서는 **현재 진행 중인 11번가 벤치마킹 프로젝트**의 실제 코드를 예시로, Spring Boot의 핵심 개념인 **DTO**, **JPA**, **Annotation**을 설명합니다.

---

## 1. DTO (Data Transfer Object)

### 개념
**DTO**는 **데이터를 나르는 택배 상자**입니다.
DB에 있는 원본 데이터(`Entity`)를 그대로 바깥(프론트엔드)으로 보내거나, 바깥에서 오는 데이터를 그대로 DB에 넣으면 보안상 위험하고 관리하기 어렵습니다. 그래서 **필요한 데이터만 딱 담아서 주고받기 위해** 만드는 객체입니다.

### 왜 쓸까요?
1.  **보안**: 비밀번호 같은 민감한 정보는 빼고 보낼 수 있습니다.
2.  **규격화**: 프론트엔드에서 회원가입할 때 보내는 형식을 딱 정해놓을 수 있습니다. (`SignupRequest`)

### 실제 코드 예시: `AuthDto.java`

```java
// AuthDto.java
public class AuthDto {

    // [요청 용도] 회원가입할 때 이 내용만 딱 담아서 보내줘!
    @Getter
    @Setter
    public static class SignupRequest {
        private String email;
        private String password; // 여기선 필요하지만,
        private String name;
        // ... (포인트, 가입일 등은 입력받지 않음 => 보안/로직 분리)
    }

    // [응답 용도] 로그인 성공하면 이 내용만 담아서 돌려줄게!
    @Getter
    @Setter
    public static class AuthResponse {
        private String accessToken;
        private User user; // 필요한 정보만 포함
    }
}
```

---

## 2. JPA (Java Persistence API)

### 개념
**JPA**는 **자바 객체와 DB 테이블을 자동으로 연결해주는 통역사**입니다.
SQL(`SELECT * FROM users...`)을 몰라도, 자바 클래스(`User`)를 다루듯이 코드를 짜면 JPA가 알아서 SQL로 바꿔서 DB에 실행해줍니다.

### 구성 요소

#### 1) Entity (엔티티) = DB 테이블 그 자체
DB의 `users` 테이블과 1:1로 매칭되는 자바 클래스입니다.

**실제 코드 예시: `User.java`**
```java
@Entity // "나, 이거 DB 테이블이야!" 라고 알려주는 표시
@Table(name = "users") // "DB에서 users라는 테이블이랑 연결해줘"
public class User {

    @Id // "이게 Primary Key(고유 식별자)야"
    @GeneratedValue(strategy = GenerationType.IDENTITY) // "번호는 DB가 알아서 1씩 증가시켜줘 (Auto Increment)"
    private Long id;

    @Column(nullable = false, unique = true) // "이 컬럼은 비어있으면 안 되고, 중복도 안 돼"
    private String email;

    // ...
}
```

#### 2) Repository (레포지토리) = DB 관리자
DB에 접속해서 데이터를 가져오거나 저장하는 '창구'입니다. 인터페이스만 선언하면 스프링이 구현체를 자동으로 만들어줍니다.

**실제 코드 예시: `UserRepository.java`**
```java
// JpaRepository<User, Long>을 상속받으면
// save(), findAll(), findById(), delete() 같은 기본 기능을 공짜로 줍니다.
public interface UserRepository extends JpaRepository<User, Long> {

    // 기본 기능 외에 내가 필요한 건 이렇게 이름만 잘 지으면 SQL을 자동으로 짜줌!
    // -> SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);
    
    // -> SELECT COUNT(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email);
}
```

---

## 3. Annotation (어노테이션)

### 개념
코드 위에 붙는 골뱅이(`@`) 표시로, **스프링에게 "이 코드는 어떤 역할이야!"라고 알려주는 포스트잇** 같은 존재입니다. 개발자가 일일이 설정 코드를 짜지 않게 도와주는 마법입니다.

### 내 코드에서 사용된 주요 어노테이션

| 어노테이션 | 설명 | 비유 |
| :--- | :--- | :--- |
| **@Entity** | JPA가 관리하는 객체임을 표시 | "이 설계도는 실제 건물(DB테이블)이 될 거야" |
| **@Table** | 매핑할 DB 테이블 이름 지정 | "이 건물 문패는 'users'로 달아줘" |
| **@Id** | Primary Key 지정 | "이게 주민등록번호야" |
| **@GeneratedValue** | PK 자동 생성 전략 | "번호표는 기계가 자동으로 뽑아줘" |
| **@Column** | 컬럼 세부 설정 (null 불가 등) | "이 칸은 필수 입력이야" |
| **@Getter / @Setter** | (Lombok) get/set 메소드 자동 생성 | "귀찮게 getter/setter 타이핑 안 해도 되게 해줘" |
| **@Service** | 비즈니스 로직을 담당하는 클래스 | "나는 요리사(실제 일하는 사람)야" |
| **@RestController** | API 요청을 받아 JSON으로 응답하는 컨트롤러 | "나는 웨이터야. 주문 받고 음식(JSON) 갖다줘" |
| **@Autowired / 생성자 주입** | 필요한 객체를 스프링이 알아서 넣어줌 | "요리 도구(Repository)는 주인이 미리 사둔 거 쓸게" |
| **@Transactional** | 작업 도중 에러나면 전체 취소(롤백) | "주문 실수하면 아예 접시 깨고 처음부터 다시 해" |
| **@JsonIgnoreProperties** | JSON 변환 시 특정 필드 무시 (에러 방지) | "포장할 때 유통기한 라벨(hibernateLazyInitializer)은 떼고 포장해" |

---

### 공부 순서 추천
1.  **DTO 흐름 파악**: `AuthDto`가 `AuthController`에서 어떻게 요청을 받고, 서비스로 넘겨지는지 확인
2.  **JPA 맛보기**: `UserRepository`에 `findByEmail` 말고 `findByName` 같은 거 하나 추가해보기 (자동으로 되는게 신기할 겁니다)
3.  **어노테이션 실험**: `User` 엔티티에서 `@Column(nullable=false)`를 빼보고 DB에 null 넣어보기 (제약조건이 풀리는지 확인)
