from fastapi.responses import HTMLResponse
from ..middleware.context import VectorShiftContext
from ..models.integration_item import IntegrationItem
from ..repositories.notion_repository import store_credentials, get_credentials, fetch_notion_items
from typing import List, Dict
from datetime import datetime
import secrets
import base64
import json
from fastapi import HTTPException, Request
import httpx
from ..oplog.oplog import info, error
from ..config.config import config
from ..constants.notion_constants import NOTION_CONSTANTS

def create_integration_item_metadata_object(response_json: Dict) -> IntegrationItem:
    """Creates an integration metadata object from the Notion API response."""
    # Extract name from properties.title or fallback methods
    name = None
    if response_json.get("properties", {}).get("title"):
        title_prop = response_json["properties"]["title"]
        if isinstance(title_prop, list) and len(title_prop) > 0:
            name = title_prop[0].get("plain_text", "")
    
    if not name:
        # Fallback to recursive search for content
        name = _recursive_dict_search(response_json.get("properties", {}), "content")
    
    if not name:
        name = f"{response_json.get('object', 'Unknown')} {response_json.get('id', '')}"
    
    # Handle parent information
    parent_info = response_json.get("parent", {})
    parent_type = parent_info.get("type")
    parent_id = None if parent_type == "workspace" else parent_info.get(parent_type)

    integration_item = IntegrationItem(
        id=response_json.get("id"),
        type=response_json.get("object"),
        name=name,
        creation_time=datetime.fromisoformat(response_json.get("created_time", "1970-01-01T00:00:00Z").replace("Z", "+00:00")),
        last_modified_time=datetime.fromisoformat(response_json.get("last_edited_time", "1970-01-01T00:00:00Z").replace("Z", "+00:00")),
        parent_id=parent_id,
    )
    return integration_item

def _recursive_dict_search(data, target_key):
    """Recursively search for a key in a dictionary of dictionaries."""
    if not isinstance(data, dict):
        return None
        
    if target_key in data:
        return data[target_key]

    for value in data.values():
        if isinstance(value, dict):
            result = _recursive_dict_search(value, target_key)
            if result is not None:
                return result
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    result = _recursive_dict_search(item, target_key)
                    if result is not None:
                        return result
    return None

async def authorize_notion(ctx: VectorShiftContext) -> str:
    """Authorize Notion OAuth flow and return the authorization URL."""
    if not ctx.user_id or not ctx.org_id:
        raise HTTPException(status_code=400, detail="user_id and org_id are required")
    
    state_data = {"state": secrets.token_urlsafe(32), "user_id": ctx.user_id, "org_id": ctx.org_id}
    encoded_state = json.dumps(state_data)

    auth_url = (
        f"{NOTION_CONSTANTS.AUTHORIZATION_URL}"
        f"?client_id={config.NOTION_CLIENT_ID}"
        f"&response_type=code"
        f"&owner=user"
        f"&redirect_uri={NOTION_CONSTANTS.REDIRECT_URI}"
        f"&state={encoded_state}"
        f"&scope={NOTION_CONSTANTS.SCOPE}"
    )
    
    await store_credentials(ctx, f"{NOTION_CONSTANTS.STATE_KEY_PREFIX}:{ctx.org_id}:{ctx.user_id}", encoded_state, NOTION_CONSTANTS.REDIS_EXPIRE_TIME)
    info(f"Generated authorization URL for user {ctx.user_id} and org {ctx.org_id}")
    return auth_url

async def oauth2callback_notion(ctx: VectorShiftContext, request: Request) -> HTMLResponse:
    """Handle Notion OAuth callback, exchange code for token, and store credentials."""
    try:
        if request.query_params.get("error"):
            raise HTTPException(status_code=400, detail=request.query_params.get("error_description", "OAuth error"))
        
        code = request.query_params.get("code")
        encoded_state = request.query_params.get("state")
        if not code or not encoded_state:
            raise HTTPException(status_code=400, detail="Missing code or state")

        state_data = json.loads(encoded_state)
        saved_state = await get_credentials(ctx, f"{NOTION_CONSTANTS.STATE_KEY_PREFIX}:{state_data['org_id']}:{state_data['user_id']}")
        
        if not saved_state or state_data["state"] != json.loads(saved_state)["state"]:
            raise HTTPException(status_code=400, detail="State does not match")

        encoded_client_id_secret = base64.b64encode(f"{config.NOTION_CLIENT_ID}:{config.NOTION_CLIENT_SECRET}".encode()).decode()
        async with httpx.AsyncClient() as client:
            response = await client.post(
                NOTION_CONSTANTS.TOKEN_URL,
                json={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": NOTION_CONSTANTS.REDIRECT_URI,
                },
                headers={
                    "Authorization": f"{NOTION_CONSTANTS.AUTH_HEADER} {encoded_client_id_secret}",
                    "Content-Type": NOTION_CONSTANTS.CONTENT_TYPE,
                    "Notion-Version": NOTION_CONSTANTS.VERSION,
                },
            )

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {response.text}")
        
        credentials = response.json()
        await store_credentials(ctx, f"{NOTION_CONSTANTS.CREDENTIALS_KEY_PREFIX}:{state_data['org_id']}:{state_data['user_id']}", json.dumps(credentials))
        info(f"Stored Notion credentials for user {state_data['user_id']} and org {state_data['org_id']}")
        
        close_window_script = """
            <html>
               <script>
                  window.close();
               </script>
            </html>
            """
        return HTMLResponse(content=close_window_script)
    except Exception as e:
        error(f"Notion OAuth callback failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Callback error: {str(e)}")

async def get_notion_credentials(ctx: VectorShiftContext) -> dict:
    """Retrieve and delete Notion credentials from Redis."""
    if not ctx.user_id or not ctx.org_id:
        raise HTTPException(status_code=400, detail="user_id and org_id are required")
    
    credentials = await get_credentials(ctx, f"{NOTION_CONSTANTS.CREDENTIALS_KEY_PREFIX}:{ctx.org_id}:{ctx.user_id}")
    if not credentials:
        raise HTTPException(status_code=400, detail="No credentials found")
    return json.loads(credentials)

async def get_items_notion(ctx: VectorShiftContext, credentials: dict) -> List[IntegrationItem]:
    """Fetch and transform Notion items into IntegrationItem objects."""
    if not ctx.user_id or not ctx.org_id:
        raise HTTPException(status_code=400, detail="user_id and org_id are required")
    
    access_token = credentials.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in credentials")
    
    items = await fetch_notion_items(ctx, access_token, NOTION_CONSTANTS.SEARCH_API_URL)
    list_of_integration_item_metadata = [create_integration_item_metadata_object(item) for item in items]
    
    info(f"Fetched {len(list_of_integration_item_metadata)} Notion items for user {ctx.user_id}")
    print(f"list_of_integration_item_metadata: {list_of_integration_item_metadata}")
    return list_of_integration_item_metadata