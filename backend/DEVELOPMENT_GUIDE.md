# 11st Benchmarking 개발 가이드

## 1. 개발 환경 구조 (Docker)
현재 백엔드는 Docker 컨테이너(`ubuntu_dev_env`) 안에서 실행되고 있습니다.
- **Docker Volume 설정:** 사용자의 PC(`backend/`) 폴더가 컨테이너 내부(`/app`)와 **실시간 동기화(연결)**되어 있습니다.
- **수정 반영:** 로컬 에디터(VS Code)에서 파일을 저장하면, 컨테이너 내부의 파일도 즉시 변경됩니다.

## 2. 서버 실행 및 코드 수정 반영 방법

### [최초 실행] (PC 재부팅 후 등)
터미널(PowerShell)에서 `backend` 폴더로 이동 후:
```powershell
# 1. 컨테이너 인프라(DB 등) 실행
docker-compose up -d

# 2. 백엔드 개발 컨테이너 접속
docker exec -it ubuntu_dev_env bash

# 3. (컨테이너 내부) Spring Boot 서버 실행
./gradlew clean bootRun
```

### [코드 수정 후 반영] (중요!)
자바(Java)는 컴파일 언어이기 때문에 **파일을 저장한다고 서버가 저절로 알지 못합니다.**
코드를 수정한 뒤에는 서버를 **껏다가 다시 켜야** 적용됩니다.

1. 실행 중인 터미널에서 `Ctrl + C`를 눌러 서버 종료.
2. 다시 명령어 입력:
   ```bash
   ./gradlew bootRun
   ```
   *(팁: 키보드 `위쪽 화살표(↑)` 키를 누르면 이전 명령어가 나옵니다)*

---

## 3. 자주 쓰는 명령어 요약

| 상황 | 명령어 (PowerShell / Bash) |
| :--- | :--- |
| **컨테이너 전체 시작** | `docker-compose up -d` (backend 폴더에서) |
| **개발 환경 접속** | `docker exec -it ubuntu_dev_env bash` |
| **서버 실행** | `./gradlew bootRun` (컨테이너 내부에서) |
| **빌드 오류 시** | `./gradlew clean bootRun` (컨테이너 내부에서) |
| **컨테이너 전체 종료** | `docker-compose down` |

## 4. 참고 사항 (DB 아키텍처)
`docker-compose up -d` 실행 시 다음 3개의 컨테이너가 함께 켜집니다:
1. `ubuntu_dev_env`: 백엔드 실행용 (Spring Boot)
2. `mongo-shard-a`: NoSQL 샤드 A (홀수 유저)
3. `mongo-shard-b`: NoSQL 샤드 B (짝수 유저)
