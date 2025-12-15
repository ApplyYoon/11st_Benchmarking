/**
 * Spring Boot 애플리케이션의 진입점 (Entry Point)
 * - 앱 시작 시 main() 메소드가 호출됨
 * - @SpringBootApplication으로 자동 설정 및 컴포넌트 스캔 수행
 * - 내장 Tomcat 서버를 8080 포트에서 실행
 */
package com.clone.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
