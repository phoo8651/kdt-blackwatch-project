# Blackwatch Backend

보안 위협 정보 조회 및 관리 시스템의 백엔드 API

## 기술 스택

- **Java 21**
- **Spring Boot 3.4.8**
- **Spring Security**
- **Spring Data JPA**
- **MariaDB**
- **JWT**
- **Swagger/OpenAPI 3**
- **Docker & Docker Compose**

## 주요 기능

### 🔐 인증/인가
- JWT 기반 인증
- 회원가입/로그인
- MFA (다단계 인증)
- 비밀번호 초기화
- 이메일 인증

### 📊 데이터 조회
- 유출 데이터 검색 및 조회
- 취약점 데이터 검색 및 조회
- 개인정보 유출 여부 확인
- 필터링 및 페이지네이션

### 👥 계정 관리
- 내 계정 정보 조회/수정
- 다른 사용자 정보 조회

### 🤝 기여자 시스템
- 기여자 신청
- Client Secret 관리
- 세션 관리

## API 문서

애플리케이션 실행 후 다음 URL에서 Swagger UI를 확인할 수 있습니다:
- http://localhost:8080/swagger-ui/index.html

## 설치 및 실행

### 사전 요구사항
- Docker & Docker Compose
- Java 21 (로컬 개발 시)

### 환경 변수 설정

`docker-compose.yml` 파일에서 다음 환경 변수를 설정하세요:

```yaml
environment:
  JWT_SECRET: your-very-secure-jwt-secret-key-that-should-be-at-least-256-bits-long
  SPRING_MAIL_USERNAME: your-email@gmail.com
  SPRING_MAIL_PASSWORD: your-app-password
```

### Docker로 실행

1. 레포지토리 클론
```bash
git clone <repository-url>
cd blackwatchBE
```

2. Docker Compose로 실행
```bash
docker-compose up -d
```

3. 애플리케이션 확인
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui/index.html
- MariaDB: localhost:3306

### 로컬 개발 환경

1. MariaDB 실행
```bash
docker run -d \
  --name blackwatch-mariadb \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=blackwatch \
  -e MYSQL_USER=blackwatch \
  -e MYSQL_PASSWORD=blackwatchpassword \
  -p 3306:3306 \
  mariadb:11.2
```

2. 환경 변수 설정 (.env 파일 생성)
```bash
SPRING_DATASOURCE_USERNAME=blackwatch
SPRING_DATASOURCE_PASSWORD=blackwatchpassword
JWT_SECRET=your-very-secure-jwt-secret-key-that-should-be-at-least-256-bits-long
SPRING_MAIL_USERNAME=your-email@gmail.com
SPRING_MAIL_PASSWORD=your-app-password
```

3. 애플리케이션 실행
```bash
./gradlew bootRun
```

## 디렉토리 구조

```
src/main/java/me/xyzo/blackwatchBE/
├── config/          # 설정 클래스들
│   ├── JwtUtil.java
│   ├── SecurityConfig.java
│   └── SwaggerConfig.java
├── controller/      # REST 컨트롤러들
│   ├── AuthController.java
│   ├── DataController.java
│   ├── AccountController.java
│   └── ContributionController.java
├── domain/          # JPA 엔티티들
│   ├── User.java
│   ├── LeakedData.java
│   ├── VulnerabilityData.java
│   ├── ContributionApplication.java
│   └── ClientSecret.java
├── dto/             # 데이터 전송 객체들
├── exception/       # 예외 클래스들
├── repository/      # JPA 레포지토리들
├── security/        # 보안 관련 클래스들
├── service/         # 비즈니스 로직
└── BlackwatchBeApplication.java
```

## API 엔드포인트

### 인증 (`/auth`)
- `POST /auth/signup/request` - 회원가입 인증요청
- `POST /auth/signup/verify` - 회원가입 인증 확인
- `POST /auth/signin` - 로그인
- `POST /auth/mfa` - MFA 인증
- `GET /auth/mfa/resend` - MFA 코드 재전송
- `GET /auth/mfa/enable` - MFA 활성화
- `GET /auth/mfa/disable` - MFA 비활성화
- `POST /auth/reset-password/request` - 비밀번호 초기화 요청
- `POST /auth/reset-password/confirm` - 비밀번호 초기화 확인

### 데이터 조회 (`/data`)
- `GET /data/leaked` - 유출 데이터 일괄 조회
- `GET /data/leaked/{id}` - 유출 데이터 세부 조회
- `POST /data/leaked/find` - 개인정보 유출 여부 조회
- `GET /data/vulnerability` - 취약점 데이터 일괄 조회
- `GET /data/vulnerability/{id}` - 취약점 데이터 세부 조회

### 계정 관리 (`/account`, `/users`)
- `GET /account/me` - 내 계정 정보 조회
- `PATCH /account/me` - 내 계정 정보 수정
- `GET /users/{userId}` - 다른 사용자 정보 조회

### 기여자 (`/contrib`)
- `POST /contrib/applications` - 기여자 신청
- `GET /contrib/applications/me` - 기여자 신청 상태 확인
- `POST /contrib/secret` - Client Secret 발급
- `GET /contrib/me` - 기여자 정보 조회
- `GET /contrib/sessions` - 세션 조회
- `DELETE /contrib/sessions` - 세션 삭제

## 데이터베이스 스키마

### Users 테이블
- `user_id`: 사용자 ID (ULID)
- `email`: 이메일 (고유)
- `username`: 사용자명 (고유)
- `password`: 암호화된 비밀번호
- `email_verified`: 이메일 인증 여부
- `mfa_enabled`: MFA 활성화 여부
- `locale`: 언어 설정
- `timezone`: 시간대 설정
- `roles`: 사용자 역할 (USER, CONTRIBUTOR, ADMIN)

### LeakedData 테이블
- `id`: 데이터 ID
- `client_id`: 업로드한 Client ID
- `host`: 출처 도메인
- `path`: 출처 경로
- `title`: 제목
- `author`: 작성자
- `upload_date`: 게시 날짜
- `records_count`: 유출된 정보 개수
- `ioc_contains`: IOCs 데이터
- `price`: 판매가
- `article`: 본문
- `ref`: 참조자료

### VulnerabilityData 테이블
- `id`: 데이터 ID
- `client_id`: 업로드한 Client ID
- `host`: 출처 도메인
- `path`: 출처 경로
- `title`: 제목
- `author`: 작성자
- `upload_date`: 게시 날짜
- `cve_ids`: CVE 코드들
- `cvss`: CVSS 점수
- `vulnerability_class`: 취약점 유형
- `products`: 영향받는 제품들
- `exploitation_technique`: 공격기법
- `article`: 본문
- `ref`: 참조자료

## 보안 고려사항

1. **개인정보 보호**: 유출 데이터 조회 시 이메일과 이름 정보 자동 마스킹
2. **JWT 보안**: 안전한 secret key 사용 및 적절한 만료시간 설정
3. **MFA**: 기여자는 MFA 필수 활성화
4. **입력 검증**: 모든 API 입력에 대한 검증
5. **CORS**: 적절한 CORS 정책 설정