FROM ubuntu:22.04

# Install basic tools and Java 17
RUN apt-get update && apt-get install -y \
    curl \
    git \
    openjdk-17-jdk \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy files
COPY . .

# Fix line endings for Windows and grant execution permissions
RUN dos2unix gradlew && chmod +x gradlew

# Keep container running
ENTRYPOINT ["tail", "-f", "/dev/null"]
