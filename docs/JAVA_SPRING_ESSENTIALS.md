# Spring Boot 개발을 위한 필수 Java 문법 & Spring 핵심 기능

이 문서는 **11번가 벤치마킹 프로젝트 코드(`ProductController`, `UserRepository`)**를 통해, 실무에서 가장 많이 쓰이는 Java 문법과 Spring 기능을 설명합니다.

---

## 1. 필수 Java 문법 (Modern Java)

### 1) Stream API (`.stream()`)
**"for문 대신 쓰는 데이터 처리 파이프라인"**
데이터 리스트를 수도관(Stream)에 흘려보내면서, 필요한 것만 거르거나(Filter) 모양을 바꿔서(Map) 요리하는 방식입니다.

**실제 코드 예시: `ProductController.java`**
```java
// 가격 범위로 상품 거르기
private List<Product> filterByPriceRange(List<Product> products, String priceRange) {
    return products.stream() // 1. 리스트를 스트림으로 변환 (수도꼭지 틀기)
            .filter(p -> {   // 2. 조건에 맞는 것만 통과시키기 (거름망)
                switch (priceRange) {
                    case "under10k": return p.getPrice() < 10000;
                    case "over50k": return p.getPrice() > 50000;
                    default: return true;
                }
            })
            .collect(Collectors.toList()); // 3. 다시 리스트로 묶기 (접시에 담기)
}
```
*   **장점**: 코드가 간결해지고, 데이터 처리 흐름이 한눈에 보입니다.

### 2) Lambda Expression (`->`)
**"이름 없는 함수"**
위의 `filter(p -> p.getPrice() < 10000)` 처럼, 메소드를 따로 만들지 않고 즉석에서 로직을 짜 넣을 때 씁니다.
*   `p` : 입력값 (Product p)
*   `->` : "이 입력값을 가지고..."
*   Expression : "이런 결과를 내라"

### 3) Optional (`Optional<User>`)
**"Null 일 수도 있는 값을 감싸는 상자"**
`NullPointerException` (자바 개발자의 주적)을 방지하기 위해 씁니다.

**실제 코드 예시: `UserRepository.java` & `ProductController.java`**
```java
// UserRepository.java
Optional<User> findByEmail(String email); // 결과가 없을 수도 있으니 Optional로 리턴

// ProductController.java
return productRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found")); 
        // 1. 값이 있으면 꺼내고
        // 2. 없으면(null이면) 에러를 던져라!
```
*   **활용**: `.orElse(default값)`, `.ifPresent(...)` 등으로 안전하게 처리 가능합니다.

### 4) Builder Pattern (`.builder().build()`)
**"생성자 대신 쓰는 객체 조립 공장"**
`new User("email", "pw", ...)` 처럼 순서를 외울 필요 없이, 이름표를 붙여서 객체를 만듭니다.

**실제 코드 예시: `AuthService.java`**
```java
User user = User.builder()
        .email(request.getEmail())
        .password(encodedPassword)
        .name(request.getName())
        .points(1000)
        .build(); // 마지막에 조립 완료!
```

---

## 2. Spring Framework 핵심 기능

### 1) DI (Dependency Injection, 의존성 주입)
**"객체지향의 핵심: 'new' 금지령"**
개발자가 직접 `ProductService service = new ProductService();` 하지 않습니다.
대신, **"나 이거 필요해!"** 라고 선언만 하면, Spring이 미리 만들어둔 객체를 쓱 넣어줍니다.

**실제 코드 예시: `ProductController.java`**
```java
@RestController
public class ProductController {

    private final ProductRepository productRepository; // 변수만 선언 (아직 null)

    // 생성자 주입 (권장 방식)
    public ProductController(ProductRepository productRepository) {
        // 스프링이 실행될 때, 미리 만들어둔 productRepository(구현체)를 여기에 넣어줌!
        this.productRepository = productRepository;
    }
}
```
*   **왜?**: 부품(Service/Repository)을 갈아끼우기 쉽고, 테스트하기 편합니다.

### 2) IoC (Inversion of Control, 제어의 역전)
**"제어권이 나(개발자)에게서 프레임워크(Spring)로 넘어갔다"**
예전에는 `main()` 메소드에서 개발자가 프로그램 순서를 다 짰지만,
지금은 **Spring 컨테이너**가 알아서 `@Service`, `@Controller` 붙은 애들을 생성하고, 관리하고, 필요할 때 실행시킵니다. 우린 그 틀(Frame) 안에서 일(Work)만 하면 됩니다.

### 3) Bean (빈)
**"스프링이 관리하는 객체"**
`@Controller`, `@Service`, `@Repository`, `@Component` 가 붙은 클래스는 스프링이 실행될 때 딱 1개(Singleton)만 생성해서 관리합니다. 이렇게 관리되는 객체를 **Bean**이라고 부릅니다.

### 4) AOP (Aspect Oriented Programming, 관점 지향 프로그래밍)
**"공통 업무는 따로 모아서 관리하자"**
핵심 비즈니스 로직(물건 팔기) 외에, 모든 곳에 공통적으로 들어가는 기능(로그 남기기, 트랜잭션 처리, 보안 검사)을 따로 뗴어내는 기술입니다.

**실제 코드 예시: `@Transactional`**
```java
@Transactional
public User signup(...) {
    // 여기서 에러 빵 터지면 -> 저장했던거 다 없던 일로! (Rollback)
    userRepository.save(user);
}
```
개발자는 `@Transactional`만 붙이면, "트랜잭션 시작 -> 실행 -> 에러시 롤백" 과정을 스프링이 알아서 감싸줍니다.

---

### 요약: 이것만 알면 절반은 안다!
1.  **Stream/Lambda**: 리스트 처리할 때 for문 대신 쓴다.
2.  **Optional**: Null 에러 피하려고 쓴다.
3.  **DI/@Autowired**: `new` 안 쓰고 스프링한테 "내놔" 하는 거다.
4.  **Bean**: 스프링이 키우는 객체다.
