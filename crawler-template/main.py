import runpy
from pathlib import Path

if __name__ == "__main__":
    print("[Main] BlackWatch 실행 시작")
    script = Path(__file__).parent / "parsers" / "telegram_crawling.py"
    runpy.run_path(str(script), run_name="__main__")
    print("[Main] 완료")

