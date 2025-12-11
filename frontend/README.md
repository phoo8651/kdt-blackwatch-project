 # 프런트엔드 (Vite + React + TypeScript)

이 디렉터리는 웹 UI 애플리케이션을 포함합니다.

요약
- 빌드 도구: Vite
- 프레임워크: React + TypeScript
- 상태관리: Zustand
- 주요 위치: `frontend/src/` (컴포넌트, 페이지, API 클라이언트 등)

개발 환경 설정
1. Node.js (권장 LTS) 설치
2. PowerShell에서 프로젝트 폴더로 이동:
```powershell
cd c:\SOURCE\kdt\kdt-blackwatch-project\frontend
```
3. 의존성 설치 (pnpm 권장):
```powershell
pnpm install
```
또는 npm 사용:
```powershell
npm install
```

로컬 실행
```powershell
pnpm dev
# 또는
npm run dev
```
개발 서버 기본 주소: `http://localhost:3000` (Vite 설정에 따름)

빌드
```powershell
pnpm build
# 또는
npm run build
```

환경 변수
- 개발 중 Vite 프록시(`vite.config.ts`)가 `/api` 요청을 백엔드로 프록싱합니다. 프로덕션에서는 `VITE_API_BASE_URL`을 설정하세요.
- 요청 타임아웃: `VITE_API_TIMEOUT`
- 디버그 로그: `VITE_DEBUG=true`

참고 및 문제 해결
- 타입 검사나 린트는 `pnpm build` 또는 `tsc`로 확인하세요.
- `frontend/src/api/client.ts`는 인증 토큰을 자동으로 요청 헤더에 추가합니다.
