import redis.asyncio as redis
import os
from ..config.config import config

class RedisClient:
    _instance = None

    def __init__(self):
        self.client = redis.Redis(
            host=config.REDIS_HOST,
            port=config.REDIS_PORT,
            db=0,
            password=config.REDIS_PASSWORD,
            username="default"
        )

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RedisClient()
        return cls._instance

    async def set(self, key: str, value: str, expire: int = None):
        await self.client.set(key, value)
        if expire:
            await self.client.expire(key, expire)

    async def get(self, key: str):
        return await self.client.get(key)

    async def delete(self, key: str):
        await self.client.delete(key)

    async def close(self):
        """Close the Redis connection (useful for cleanup)."""
        await self.client.close()

    async def ping(self):
        """Test the Redis connection."""
        return await self.client.ping()