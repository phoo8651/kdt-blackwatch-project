# Crawler FastAPI Server

이 폴더(`FastapiServer`)는 크롤러에서 수집한 데이터를 받아 MongoDB에 저장하는 FastAPI 기반 서버입니다.

핵심 기능
- 크롤러로부터 취약점(`/data/vulnerability`) 및 유출 데이터(`/data/leaked`) 수신
- 세션 기반 인증(요청 헤더 `x-session-id` 검증)
- 요청률 제한(Rate limiting)
- Beanie + Motor 사용하여 MongoDB에 비동기 저장

파일/구성
- `main.py`: FastAPI 앱, 라이프스팬(데이터베이스 연결), 미들웨어
- `models/`: Beanie 문서 모델(`mongo_model.py`) 및 Pydantic 요청 모델(`request_model.py`)
- `router/`: 라우터 엔드포인트
- `util.py`: DB insert, rate limit 등 유틸
- `config/config.py`: `secrets.json`에서 설정을 읽어옵니다

환경 및 실행 (Windows PowerShell 예)
1. 가상환경 생성/활성화
```
cd 'c:\SOURCE\kdt\kdt-blackwatch-project\crawler-server\FastapiServer'
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```
2. 의존성 설치
```
pip install -r requirements.txt
```
3. 비밀키/설정 준비
- `config/secrets.json` 파일에 다음 키가 필요합니다:
  - `mongodb_url` : MongoDB 연결 URL (예: `mongodb://user:pass@host:27017`)
  - `mongodb_name` : 사용할 DB 이름
  - `request_per_minute` : 초당/분당 요청 제한(숫자)

4. 로컬 실행
```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

주의 사항
- MongoDB는 Motor(Motor AsyncIO)와 호환되어야 합니다. Beanie 버전과 Motor 버전 호환성을 확인하세요.
- CORS 설정은 기본적으로 모든 오리진을 허용합니다(`origins=['*']`). 운영 환경에서는 도메인 제한을 권장합니다.
- `config.get_secret`는 `secrets.json`에 키가 없으면 예외를 발생시킵니다. 운영 환경에서는 환경변수 방식으로 보완하세요.

테스트 엔드포인트
- `POST /test` (디버그용; Vulnerability 스키마를 취함)
