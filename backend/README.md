# Backend (blackwatchBE)

이 폴더는 Blackwatch 백엔드 서비스의 상위 디렉터리입니다. 실제 애플리케이션 코드는 `blackwatchBE/` 하위 폴더에 있습니다.

간단 요약
- 기술 스택: Java 21, Spring Boot, Spring Security, JWT, MariaDB
- 주요 책임: 인증/인가, 데이터 조회(유출/취약점), 기여자 관리, 계정 관리

핵심 위치
- 애플리케이션 코드: `backend/blackwatchBE/src/main/java/me/xyzo/blackwatchBE/`
- 설정: `backend/blackwatchBE/src/main/resources/application.properties`
- 빌드: Gradle wrapper `backend/blackwatchBE/gradlew(.bat)`

빠른 시작 (개발)
1. `cd backend/blackwatchBE`
2. 로컬 MariaDB 준비(도커 권장)
3. 환경변수 또는 `application.properties`에 DB 및 JWT 관련 설정 추가
4. PowerShell에서 실행:
```
./gradlew.bat bootRun
```

Docker / 프로덕션
- `blackwatchBE/README.md`에 Docker 및 배포 관련 상세 명세가 있습니다. 먼저 해당 파일을 확인하세요.

문제 해결 팁
- 빌드 오류가 날 경우 Java 버전(21)과 Gradle Plugin 호환성을 확인하세요.
- DB 연결 오류 시 `application.properties`의 datasource URL/credentials 확인.

참고: 더 상세한 운영/설치 방법은 `backend/blackwatchBE/README.md`를 참고하세요.
