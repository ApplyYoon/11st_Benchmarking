# Stage 1: Build the application
FROM gradle:8-jdk17 AS builder
WORKDIR /app
COPY . .
# Fix for Windows line endings if the repo wasn't cloned with adequate .gitattributes
# and ensure executable permissions
RUN sed -i 's/\r$//' gradlew && chmod +x gradlew

# Skip tests to speed up the build for now, or remove -x test to run them
RUN ./gradlew clean build -x test --no-daemon

# Stage 2: Run the application
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
