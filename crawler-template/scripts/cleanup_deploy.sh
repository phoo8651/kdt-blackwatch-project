#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TS="$(date +%Y%m%d_%H%M%S)"
BKDIR="$ROOT/_deploy_backup_$TS"
mkdir -p "$BKDIR"

echo "[1/6] 백업 묶는 중 → $BKDIR"
# 데이터/테스트/임시 파일 백업(있을 때만)
mkdir -p data/tele_crawling data/vulnlab_json
tar czf "$BKDIR/tele_crawling.tgz" data/tele_crawling 2>/dev/null || true
tar czf "$BKDIR/vulnlab_json.tgz" data/vulnlab_json 2>/dev/null || true
tar czf "$BKDIR/scripts_tests.tgz" scripts/test_*.py 2>/dev/null || true
tar czf "$BKDIR/misc.tgz" session_name.session server.cpython-*.pyc 2>/dev/null || true
tar czf "$BKDIR/env_extras.tgz" .env.test .env.save .env.backup* 2>/dev/null || true

echo "[2/6] 테스트/불필요 파일 삭제"
rm -f scripts/test_*.py 2>/dev/null || true
rm -f session_name.session server.cpython-*.pyc 2>/dev/null || true
rm -f .env.test .env.save 2>/dev/null || true
rm -f .env.backup* 2>/dev/null || true

echo "[3/6] 산출물 디렉토리 비우기(디렉토리는 유지)"
if [ -d data/tele_crawling ]; then rm -rf data/tele_crawling/*; touch data/tele_crawling/.gitkeep; fi
if [ -d data/vulnlab_json ]; then rm -rf data/vulnlab_json/*; touch data/vulnlab_json/.gitkeep; fi

echo "[4/6] 파이썬 캐시 정리"
find . -type d -name "__pycache__" -prune -exec rm -rf '{}' + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true

echo "[5/6] (옵션) Git 메타는 남깁니다. 패키징 시 제외 권장."
if [[ "${1:-}" == "--strip-git" ]]; then
  tar czf "$BKDIR/git_meta.tgz" .git 2>/dev/null || true
  rm -rf .git
  echo "  → .git 제거 완료"
fi

echo "[6/6] 요약:"
echo "  - 백업: $BKDIR"
echo "  - 불필요 테스트/임시/캐시 정리 완료"
echo
echo "남은 상위 트리:"
command -v tree >/dev/null 2>&1 && tree -a -L 2 || ls -la
