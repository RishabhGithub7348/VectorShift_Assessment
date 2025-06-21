import asyncio

from fastapi.responses import HTMLResponse
from ..middleware.context import VectorShiftContext
from ..models.integration_item import IntegrationItem
from ..repositories.hubspot_repository import store_credentials, get_credentials, fetch_hubspot_items
from typing import List, Dict
from datetime import datetime
import secrets
import base64
import hashlib
import json
from fastapi import HTTPException
import httpx
from ..oplog.oplog import info, error
from ..config.config import config
from ..constants.hubspot_constants import HUBSPOT_CONSTANTS

def create_integration_item_metadata_object(response_json: Dict, item_type: str, parent_id: str = None, parent_name: str = None) -> IntegrationItem:
    """Creates an integration metadata object from the HubSpot API response."""
    name = f"{response_json.get('properties', {}).get('firstname', '')} {response_json.get('properties', {}).get('lastname', '')}".strip() or "Unnamed Contact"
    parent_id = f"{parent_id}_Company" if parent_id else None
    
    integration_item = IntegrationItem(
        id=f"{response_json.get('id', '')}_{item_type}",
        name=name,
        type=item_type,
        parent_id=parent_id,
        parent_path_or_name=parent_name,
        creation_time=datetime.fromisoformat(response_json.get('createdAt', '1970-01-01T00:00:00Z').replace('Z', '+00:00')),
        last_modified_time=datetime.fromisoformat(response_json.get('updatedAt', '1970-01-01T00:00:00Z').replace('Z', '+00:00')),
    )
    return integration_item

async def authorize_hubspot(ctx: VectorShiftContext) -> str:
    """Authorize HubSpot OAuth flow and return the authorization URL."""
    user_id = ctx.user_id
    org_id = ctx.org_id
    
    state_data = {"state": secrets.token_urlsafe(32), "user_id": user_id, "org_id": org_id}
    encoded_state = base64.urlsafe_b64encode(json.dumps(state_data).encode("utf-8")).decode("utf-8")

    code_verifier = secrets.token_urlsafe(32)
    m = hashlib.sha256()
    m.update(code_verifier.encode("utf-8"))
    code_challenge = base64.urlsafe_b64encode(m.digest()).decode("utf-8").replace("=", "")

    auth_url = (
        f"{HUBSPOT_CONSTANTS.AUTHORIZATION_URL}"
        f"?client_id={config.HUBSPOT_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={HUBSPOT_CONSTANTS.REDIRECT_URI}"
        f"&state={encoded_state}"
        f"&code_challenge={code_challenge}"
        f"&code_challenge_method={HUBSPOT_CONSTANTS.CODE_CHALLENGE_METHOD}"
        f"&scope={HUBSPOT_CONSTANTS.SCOPE}"
    )
    
    await asyncio.gather(
        store_credentials(ctx, f"{HUBSPOT_CONSTANTS.STATE_KEY_PREFIX}:{org_id}:{user_id}", json.dumps(state_data), HUBSPOT_CONSTANTS.REDIS_EXPIRE_TIME),
        store_credentials(ctx, f"{HUBSPOT_CONSTANTS.VERIFIER_KEY_PREFIX}:{org_id}:{user_id}", code_verifier, HUBSPOT_CONSTANTS.REDIS_EXPIRE_TIME),
    )
    info(f"Generated authorization URL for user {user_id} and org {org_id}")
    return auth_url

async def oauth2callback_hubspot(ctx: VectorShiftContext, request) -> str:
    """Handle OAuth callback, exchange code for token, and store credentials."""
    try:
        code = request.query_params.get("code")
        state = request.query_params.get("state")
        
        if not code or not state:
            raise HTTPException(status_code=400, detail="Missing code or state")
        
        state_data = json.loads(base64.urlsafe_b64decode(state.encode("utf-8")).decode("utf-8"))
        saved_state = await get_credentials(ctx, f"{HUBSPOT_CONSTANTS.STATE_KEY_PREFIX}:{state_data['org_id']}:{state_data['user_id']}")
        if not saved_state or state_data["state"] != json.loads(saved_state)["state"]:
            raise HTTPException(status_code=400, detail="State does not match")

        code_verifier = await get_credentials(ctx, f"{HUBSPOT_CONSTANTS.VERIFIER_KEY_PREFIX}:{state_data['org_id']}:{state_data['user_id']}")
        if not code_verifier:
            raise HTTPException(status_code=400, detail="Code verifier not found")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                HUBSPOT_CONSTANTS.TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": HUBSPOT_CONSTANTS.REDIRECT_URI,
                    "client_id": config.HUBSPOT_CLIENT_ID,
                    "client_secret": config.HUBSPOT_CLIENT_SECRET,
                    "code_verifier": code_verifier,
                },
                headers={"Content-Type": HUBSPOT_CONSTANTS.CONTENT_TYPE},
            )
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail=f"OAuth token exchange failed: {response.text}")
            credentials = response.json()
            await store_credentials(ctx, f"{HUBSPOT_CONSTANTS.CREDENTIALS_KEY_PREFIX}:{state_data['org_id']}:{state_data['user_id']}", json.dumps(credentials))
            info(f"Successfully stored credentials for user {state_data['user_id']} and org {state_data['org_id']}")
            close_window_script = """
            <html>
               <script>
                  window.close();
               </script>
            </html>
            """
            return HTMLResponse(content=close_window_script)
    except Exception as e:
        error(f"OAuth callback failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Callback error: {str(e)}")

async def get_hubspot_credentials(ctx: VectorShiftContext) -> dict:
    """Retrieve and delete credentials from Redis."""
    user_id = ctx.user_id
    org_id = ctx.org_id
    
    credentials = await get_credentials(ctx, f"{HUBSPOT_CONSTANTS.CREDENTIALS_KEY_PREFIX}:{org_id}:{user_id}")
    if not credentials:
        raise HTTPException(status_code=400, detail="No credentials found")
    return json.loads(credentials)

async def get_hubspot_items(ctx: VectorShiftContext, credentials: dict) -> List[IntegrationItem]:
    """Fetch and transform HubSpot items into IntegrationItem objects."""
    access_token = credentials.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in credentials")
    
    items = await fetch_hubspot_items(ctx, access_token, HUBSPOT_CONSTANTS.CONTACTS_API_URL)
    integration_items = [
        create_integration_item_metadata_object(item, "Contact")
        for item in items
    ]
    info(f"Fetched {len(integration_items)} HubSpot items for user {ctx.user_id}")
    print(f"list_of_integration_item_metadata: {integration_items}")
    return integration_items