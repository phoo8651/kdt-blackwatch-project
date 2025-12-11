# Semi-A-Crawler-Template
# Crawler Template (파서/크롤러 템플릿)

이 폴더는 크롤러 및 파서 구현을 위한 템플릿과 예제 스크립트를 모아둔 곳입니다. 실제 크롤러를 빠르게 작성하거나 커스터마이즈할 때 참고하세요.

주요 구성
- `main.py` : 템플릿 실행 진입점 (프로젝트마다 달라질 수 있음)
- `requirements.txt` : 파이썬依存 목록
- `common/` : 공통 유틸 및 설정(`logon.py`, `payloads.py`, `settings.py`)
- `parsers/` : 사이트별 파서 예제 (`telegram_crawling.py`, `vuln_parser_requests.py`, `vuln_parser_selenium.py` 등)
- `Simple Crawler/` 및 `Telegram/` : 간단 예제 스크립트

개발/실행 가이드 (예)
1. 가상환경 준비
```
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\Activate.ps1
```
2. 의존성 설치
```
pip install -r requirements.txt
```
3. 파서 실행
- 각 파서 파일(예: `parsers/vuln_parser_requests.py`)을 직접 실행하거나 `main.py`를 통해 실행합니다.

설정
- `common/settings.py` 에서 기본 설정을 관리합니다. 크롤러별 설정(크롤링 속도, 출력 경로 등)은 파서 내부 또는 설정 파일로 분리하세요.

로그 및 출력
- 템플릿 스크립트들은 콘솔 출력과 파일 출력을 사용합니다. 배치로 돌릴 때는 로그 파일 경로를 확인하세요.

권장사항
- Selenium 기반 파서는 드라이버(ChromeDriver 등)와 호환되는 브라우저/드라이버 버전을 맞추세요.
- 네트워크/타겟 서버에 부하를 줄이기 위해 요청 속도 제한과 재시도 로직을 추가하세요.

