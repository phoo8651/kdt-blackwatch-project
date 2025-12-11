import logging
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure
from config import config

# 로거 설정
logger = logging.getLogger("main")


class MongoDB:
    mongo_url = config.MONGO_URL
    mongo_db = config.MONGO_DB_NAME

    client: AsyncIOMotorClient | None = None
    db = None

    @classmethod
    async def connect(cls):
        logger.info("Connecting to MongoDB...")
        try:
            cls.client = AsyncIOMotorClient(cls.mongo_url)
            # 서버 정보 요청을 통해 실제 연결을 확인
            await cls.client.admin.command("ping")
            cls.db = cls.client[cls.mongo_db]
            logger.info("Successfully connected to MongoDB.")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise e

    @classmethod
    async def close(cls):
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")


# 애플리케이션 전역에서 사용할 인스턴스
mongodb = MongoDB()
