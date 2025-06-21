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

async def fetch_airtable_items(ctx: VectorShiftContext, access_token: str, url: str, aggregated_response: List[Dict], offset: str = None) -> None:
    """Fetch Airtable bases with pagination and aggregate results."""
    params = {"offset": offset} if offset else {}
    headers = {"Authorization": f"Bearer {access_token}"}
    async with ctx.redis_client.client.get() as session:
        async with session.get(url, headers=headers, params=params) as response:
            if response.status == 200:
                data = await response.json()
                results = data.get("bases", {})
                offset = data.get("offset")
                aggregated_response.extend(results.values())  # Extend with dictionary values
                if offset:
                    await fetch_airtable_items(ctx, access_token, url, aggregated_response, offset)
            else:
                error(f"Failed to fetch Airtable items: {response.status}")