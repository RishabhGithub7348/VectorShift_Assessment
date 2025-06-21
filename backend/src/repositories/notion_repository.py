from ..middleware.context import VectorShiftContext
from typing import List, Dict
from ..oplog.oplog import error
import httpx

async def store_credentials(ctx: VectorShiftContext, key: str, value: str, expire: int = 600):
    """Store a value in Redis with an optional expiration time."""
    await ctx.redis_client.set(key, value, expire)

async def get_credentials(ctx: VectorShiftContext, key: str) -> str:
    """Retrieve and delete a value from Redis."""
    value = await ctx.redis_client.get(key)
    if value:
        await ctx.redis_client.delete(key)
    return value

async def fetch_notion_items(ctx: VectorShiftContext, access_token: str, url: str) -> List[Dict]:
    """Fetch Notion items via the search API."""
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }
    async with ctx.redis_client.client.get() as session:
        async with session.post(url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                return data.get("results", [])
            else:
                error(f"Failed to fetch Notion items: {response.status}")
                return []