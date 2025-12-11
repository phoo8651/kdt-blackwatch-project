# KDT Blackwatch 프로젝트

이 저장소는 보안 관련 데이터(유출 레코드 및 취약점 리포트)를 수집·저장·제공하는 서비스 모음인 Blackwatch 프로젝트를 포함합니다. 구성 요소는 크게 다음과 같습니다: Spring Boot 백엔드 API, 크롤러 수집용 FastAPI 서버, 크롤러 템플릿(파서), 그리고 React + Vite 기반 프런트엔드.

## 저장소 구조

- `backend/blackwatchBE` — Spring Boot 백엔드(Java 21). 인증·인가, API 엔드포인트 및 데이터 서빙을 담당합니다.
- `crawler-server/FastapiServer` — 크롤러로부터 전송된 페이로드를 받아 MongoDB에 저장하는 FastAPI 서비스(Beanie + Motor 사용).
- `crawler-template` — 파이썬으로 작성된 크롤러/파서 예제 모음입니다. 실제 크롤러를 빠르게 만들 때 참고하세요.
- `frontend` — Vite + React + TypeScript 기반의 사용자 인터페이스 앱입니다.

## 빠른 시작 (개발 환경)

### 필수사항
- Node.js (프런트엔드)
- Java 21 + Gradle (백엔드) 또는 Docker
- Python 3.10+ (크롤러 템플릿 및 FastAPI)
- MongoDB (`crawler-server`용), MariaDB/Postgres (백엔드 설정에 따라 다름)

### 1) 프런트엔드 (로컬 개발)

```powershell
cd frontend
pnpm install   # 또는 npm install
pnpm dev       # 또는 npm run dev
```

브라우저: `http://localhost:3000` (Vite 설정에 따름)

### 2) FastAPI 크롤러 서버

```powershell
cd "crawler-server/FastapiServer"
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

`crawler-server/FastapiServer/config/secrets.json`에 `mongodb_url`과 `mongodb_name`이 설정되어 있는지 확인하세요(또는 운영 환경에서는 환경변수 사용 권장).

### 3) 백엔드 (Spring Boot)

```powershell
cd backend/blackwatchBE
.\gradlew.bat bootRun
```

또는 프로젝트에 제공된 Docker 구성이 있다면 Docker로 실행할 수 있습니다.

### 4) 크롤러 템플릿 실행

```powershell
cd crawler-template
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# 예: 파서 실행
python parsers/vuln_parser_requests.py
```

## 주의사항 및 권장사항

- FastAPI 서버는 Motor(AsyncIO)와 Beanie를 사용합니다. 패키지 버전 호환성을 확인하세요.
- 프런트엔드는 개발 시 Vite 프록시(`/api`)를 사용합니다. 프로덕션 빌드에서는 `VITE_API_BASE_URL`을 설정하세요.
- JWT 비밀키, DB 자격증명 등 민감한 정보는 레포에 커밋하지 마시고 환경변수 또는 시크릿 관리 시스템을 사용하세요.

## 기여

이슈나 풀 리퀘스트를 통해 기여해 주세요. 큰 변경은 우선 이슈로 설계/호환성 논의를 권장합니다.

## 라이선스

저장소의 `LICENSE` 파일을 확인하세요.
