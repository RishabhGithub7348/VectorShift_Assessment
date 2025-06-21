from fastapi import HTTPException
import httpx
from ..middleware.context import VectorShiftContext
from typing import List
from ..oplog.oplog import error

async def store_credentials(ctx: VectorShiftContext, key: str, value: str, expire: int = 600):
    await ctx.redis_client.set(key, value, expire)

async def get_credentials(ctx: VectorShiftContext, key: str) -> str:
    value = await ctx.redis_client.get(key)
    if value:
        await ctx.redis_client.delete(key)
    return value

async def fetch_hubspot_items(ctx: VectorShiftContext, access_token: str, url: str, after: str = None) -> List[dict]:
    """Fetch HubSpot items with pagination using httpx.AsyncClient."""
    params = {"after": after} if after else {}
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers, params=params)
        if response.status_code != 200:
            error(f"Failed to fetch HubSpot items: {response.status_code} - {response.text}")
            raise HTTPException(status_code=400, detail=f"Fetch failed: {response.text}")
        
        data = response.json()
        results = data.get("results", [])
        paging = data.get("paging", {}).get("next", {}).get("after")
        if paging:
            additional_results = await fetch_hubspot_items(ctx, access_token, url, paging)
            results.extend(additional_results)
        return results