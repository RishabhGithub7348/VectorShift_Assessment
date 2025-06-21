from fastapi.responses import HTMLResponse
from ..middleware.context import VectorShiftContext
from ..models.integration_item import IntegrationItem
from ..repositories.airtable_repository import store_credentials, get_credentials, fetch_airtable_items
from typing import List, Dict
from datetime import datetime
import secrets
import base64
import hashlib
import json
from fastapi import HTTPException, Request
import asyncio
import httpx
from ..oplog.oplog import info, error
from ..config.config import config
from ..constants.airtable_constants import AIRTABLE_CONSTANTS

def create_integration_item_metadata_object(response_json: Dict, item_type: str, parent_id: str = None, parent_name: str = None) -> IntegrationItem:
    """Creates an integration metadata object from the Airtable API response."""
    parent_id = f"{parent_id}_Base" if parent_id else None
    integration_item = IntegrationItem(
        id=f"{response_json.get('id', '')}_{item_type}",
        name=response_json.get('name', 'Unnamed'),
        type=item_type,
        parent_id=parent_id,
        parent_path_or_name=parent_name,
    )
    return integration_item

async def authorize_airtable(ctx: VectorShiftContext) -> str:
    """Authorize Airtable OAuth flow and return the authorization URL."""
    if not ctx.user_id or not ctx.org_id:
        raise HTTPException(status_code=400, detail="user_id and org_id are required")
    state_data = {"state": secrets.token_urlsafe(32), "user_id": ctx.user_id, "org_id": ctx.org_id}
    encoded_state = base64.urlsafe_b64encode(json.dumps(state_data).encode("utf-8")).decode("utf-8")

    code_verifier = secrets.token_urlsafe(32)
    m = hashlib.sha256()
    m.update(code_verifier.encode("utf-8"))
    code_challenge = base64.urlsafe_b64encode(m.digest()).decode("utf-8").replace("=", "")

    auth_url = (
        f"{AIRTABLE_CONSTANTS.AUTHORIZATION_URL}"
        f"?client_id={config.AIRTABLE_CLIENT_ID}"
        f"&response_type=code"
        f"&owner=user"
        f"&redirect_uri={AIRTABLE_CONSTANTS.REDIRECT_URI}"
        f"&state={encoded_state}"
        f"&code_challenge={code_challenge}"
        f"&code_challenge_method={AIRTABLE_CONSTANTS.CODE_CHALLENGE_METHOD}"
        f"&scope={AIRTABLE_CONSTANTS.SCOPE}"
    )
    
    await asyncio.gather(
        store_credentials(ctx, f"{AIRTABLE_CONSTANTS.STATE_KEY_PREFIX}:{ctx.org_id}:{ctx.user_id}", json.dumps(state_data), AIRTABLE_CONSTANTS.REDIS_EXPIRE_TIME),
        store_credentials(ctx, f"{AIRTABLE_CONSTANTS.VERIFIER_KEY_PREFIX}:{ctx.org_id}:{ctx.user_id}", code_verifier, AIRTABLE_CONSTANTS.REDIS_EXPIRE_TIME),
    )
    info(f"Generated authorization URL for user {ctx.user_id} and org {ctx.org_id}")
    return auth_url

async def oauth2callback_airtable(ctx: VectorShiftContext, request: Request) -> str:
    """Handle Airtable OAuth callback, exchange code for token, and store credentials."""
    try:
        if request.query_params.get("error"):
            raise HTTPException(status_code=400, detail=request.query_params.get("error_description", "OAuth error"))
        
        code = request.query_params.get("code")
        encoded_state = request.query_params.get("state")
        if not code or not encoded_state:
            raise HTTPException(status_code=400, detail="Missing code or state")

        state_data = json.loads(base64.urlsafe_b64decode(encoded_state.encode("utf-8")).decode("utf-8"))
        saved_state, code_verifier = await asyncio.gather(
            get_credentials(ctx, f"{AIRTABLE_CONSTANTS.STATE_KEY_PREFIX}:{state_data['org_id']}:{state_data['user_id']}"),
            get_credentials(ctx, f"{AIRTABLE_CONSTANTS.VERIFIER_KEY_PREFIX}:{state_data['org_id']}:{state_data['user_id']}"),
        )

        if not saved_state or state_data["state"] != json.loads(saved_state)["state"]:
            raise HTTPException(status_code=400, detail="State does not match")

        encoded_client_id_secret = base64.b64encode(f"{config.AIRTABLE_CLIENT_ID}:{config.AIRTABLE_CLIENT_SECRET}".encode()).decode()
        async with httpx.AsyncClient() as client:
            response = await client.post(
                AIRTABLE_CONSTANTS.TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": AIRTABLE_CONSTANTS.REDIRECT_URI,
                    "client_id": config.AIRTABLE_CLIENT_ID,
                    "code_verifier": code_verifier, 
                },
                headers={
                    "Authorization": f"{AIRTABLE_CONSTANTS.AUTH_HEADER} {encoded_client_id_secret}",
                    "Content-Type": AIRTABLE_CONSTANTS.CONTENT_TYPE,
                },
            )

        if response.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {response.text}")
        credentials = response.json()
        await store_credentials(ctx, f"{AIRTABLE_CONSTANTS.CREDENTIALS_KEY_PREFIX}:{state_data['org_id']}:{state_data['user_id']}", json.dumps(credentials))
        info(f"Stored Airtable credentials for user {state_data['user_id']} and org {state_data['org_id']}")
        close_window_script = """
            <html>
               <script>
                  window.close();
               </script>
            </html>
            """
        return HTMLResponse(content=close_window_script)
    except Exception as e:
        error(f"Airtable OAuth callback failed: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Callback error: {str(e)}")

async def get_airtable_credentials(ctx: VectorShiftContext) -> dict:
    """Retrieve and delete Airtable credentials from Redis."""
    if not ctx.user_id or not ctx.org_id:
        raise HTTPException(status_code=400, detail="user_id and org_id are required")
    credentials = await get_credentials(ctx, f"{AIRTABLE_CONSTANTS.CREDENTIALS_KEY_PREFIX}:{ctx.org_id}:{ctx.user_id}")
    if not credentials:
        raise HTTPException(status_code=400, detail="No credentials found")
    return json.loads(credentials)

async def get_items_airtable(ctx: VectorShiftContext, credentials: dict) -> List[IntegrationItem]:
    """Fetch and transform Airtable items into IntegrationItem objects."""
    if not ctx.user_id or not ctx.org_id:
        raise HTTPException(status_code=400, detail="user_id and org_id are required")
    access_token = credentials.get("access_token")
    if not access_token:
        raise HTTPException(status_code=400, detail="No access token in credentials")
    
    list_of_responses = []
    await fetch_airtable_items(ctx, access_token, AIRTABLE_CONSTANTS.BASES_API_URL, list_of_responses)
    list_of_integration_item_metadata = []
    
    for response in list_of_responses:
        list_of_integration_item_metadata.append(
            create_integration_item_metadata_object(response, "Base")
        )
        # Fetch tables for each base
        async with httpx.AsyncClient() as client:
            tables_response = await client.get(
                f"{AIRTABLE_CONSTANTS.BASES_API_URL}/{response.get('id')}/tables",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if tables_response.status_code == 200:
                tables_data = tables_response.json()
                for table in tables_data.get("tables", []):
                    list_of_integration_item_metadata.append(
                        create_integration_item_metadata_object(
                            table,
                            "Table",
                            response.get("id"),
                            response.get("name"),
                        )
                    )
    
    info(f"Fetched {len(list_of_integration_item_metadata)} Airtable items for user {ctx.user_id}")
    print(f"list_of_integration_item_metadata: {list_of_integration_item_metadata}")
    return list_of_integration_item_metadata