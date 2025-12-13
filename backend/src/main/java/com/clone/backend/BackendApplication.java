package com.clone.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadEnvFile();
		SpringApplication.run(BackendApplication.class, args);
	}

	private static void loadEnvFile() {
		Path envPath = Paths.get(System.getProperty("user.dir"), ".env");
		
		// backend 디렉토리에서 실행되는 경우
		File envFile = envPath.toFile();
		
		// 프로젝트 루트에서 실행되는 경우를 대비해 backend/.env도 확인
		if (!envFile.exists()) {
			envPath = Paths.get(System.getProperty("user.dir"), "backend", ".env");
			envFile = envPath.toFile();
		}

		if (!envFile.exists()) {
			System.out.println(".env file not found at: " + envPath.toAbsolutePath());
			return;
		}

		try {
			Files.lines(envPath).forEach(line -> {
				// 주석과 빈 줄 제외
				line = line.trim();
				if (line.isEmpty() || line.startsWith("#")) {
					return;
				}
				
				// KEY=VALUE 형식 파싱
				int equalsIndex = line.indexOf('=');
				if (equalsIndex > 0) {
					String key = line.substring(0, equalsIndex).trim();
					String value = line.substring(equalsIndex + 1).trim();
					
					// 따옴표 제거 (있는 경우)
					if ((value.startsWith("\"") && value.endsWith("\"")) ||
					    (value.startsWith("'") && value.endsWith("'"))) {
						value = value.substring(1, value.length() - 1);
					}
					
					// 환경 변수나 시스템 프로퍼티로 설정되지 않은 경우에만 .env 값 사용
					if (System.getProperty(key) == null && System.getenv(key) == null) {
						System.setProperty(key, value);
						
						// Spring Boot 프로퍼티로도 매핑
						if (key.equals("JWT_SECRET")) {
							System.setProperty("jwt.secret", value);
						} else if (key.equals("DATASOURCE_URL")) {
							System.setProperty("spring.datasource.url", value);
						} else if (key.equals("DATASOURCE_USERNAME")) {
							System.setProperty("spring.datasource.username", value);
						} else if (key.equals("DATASOURCE_PASSWORD")) {
							System.setProperty("spring.datasource.password", value);
						} else if (key.equals("TOSS_CLIENT_KEY")) {
							System.setProperty("toss.client-key", value);
						} else if (key.equals("TOSS_SECRET_KEY")) {
							System.setProperty("toss.secret-key", value);
						}
					}
				}
			});
			
			System.out.println("Loaded .env file from: " + envFile.getAbsolutePath());
		} catch (IOException e) {
			System.err.println("Error loading .env file: " + e.getMessage());
		}
	}

}
