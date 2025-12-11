import re
import os
import hashlib
import asyncio
import json
import uuid
from telethon import TelegramClient
from datetime import datetime

# Telegram API 인증 정보
api_id = 5804916
api_hash = '1ab9baa22c808ac58ecefec74e929ef5'
channel = 'DBleak'

# 저장 디렉토리
save_dir = "tele_crawling"
os.makedirs(save_dir, exist_ok=True)

# 최대 파일 크기 제한 (100MB)
MAX_FILE_SIZE = 100 * 1024 * 1024

# 이메일:이름 추출 정규식
email_name_pattern = re.compile(r'([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})\s*[:：]\s*([^\n\r]+)')

# URL 추출 정규식
url_pattern = re.compile(r'https?://[^\s]+')


# UUIDv4 client 식별자
client_id = str(uuid.uuid4())

client = TelegramClient('session_name', api_id, api_hash)

async def main():
    await client.start()

    async for message in client.iter_messages(channel):
        if message.file and message.file.name and message.file.name.lower().endswith('.txt'):
            if message.file.size and message.file.size > MAX_FILE_SIZE:
                continue  # 100MB 초과 시 skip

            file_path = os.path.join(save_dir, message.file.name)
            await message.download_media(file_path)

            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except Exception:
                continue

            # 이메일과 이름 추출
            email_name_matches = email_name_pattern.findall(content)
            emails = [email for email, _ in email_name_matches]
            names = [name.strip() for _, name in email_name_matches]

            # SHA256 해시 계산
            try:
                with open(file_path, 'rb') as f:
                    sha256_hash = hashlib.sha256(f.read()).hexdigest()
            except Exception:
                sha256_hash = ""
            
            # article 설정
            article_value = content if content else "None"

            # ref 설정 (URL 리스트)
            ref_urls = url_pattern.findall(content)
            ref_value = ref_urls if ref_urls else "None"

            # JSON 결과 저장
            result = {
                "clientId": client_id,
                "host": "t.me",
                "path": f"/{channel}/{message.id}",
                "author": channel,
                "uploadDate": message.date.isoformat(),
                "article": "None",
                "ref": ref_value,
                "leaked": [
                    {
                        "emails": emails,
                        "count": len(emails)
                    },
                    {
                        "usernames": names,
                        "count": len(names)
                    },
                    { 
                    "file_name": message.file.name,
                    "sha256": sha256_hash
                    }
                ]
            }

            json_path = os.path.splitext(file_path)[0] + ".json"
            with open(json_path, "w", encoding="utf-8") as jf:
                json.dump(result, jf, ensure_ascii=False, indent=2)

            # 저장된 JSON 파일 경로 출력
            print(json_path)

    await client.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
