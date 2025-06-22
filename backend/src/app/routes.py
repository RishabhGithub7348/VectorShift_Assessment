from fastapi import APIRouter, Request, Response, Form, HTTPException
from fastapi.responses import HTMLResponse
from ..middleware.context import VectorShiftContext
from ..controllers.hubspot_controller import (
    authorize_hubspot,
    oauth2callback_hubspot,
    get_hubspot_credentials,
    get_hubspot_items,
)
from ..controllers.airtable_controller import (
    authorize_airtable,
    oauth2callback_airtable,
    get_airtable_credentials,
    get_items_airtable,
)
from ..controllers.notion_controller import (
    authorize_notion,
    oauth2callback_notion,
    get_notion_credentials,
    get_items_notion,
)
import json

router = APIRouter(prefix="/api/v1")

# HubSpot Routes
@router.post("/integrations/hubspot/authorize")
async def hubspot_authorize(user_id: str = Form(...), org_id: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get(user_id=user_id, org_id=org_id)
    return await authorize_hubspot(ctx, response)

@router.get("/integrations/hubspot/oauth2callback")
async def hubspot_oauth2callback(request: Request, response: Response = None):
    ctx = await VectorShiftContext.get(request=request)
    return await oauth2callback_hubspot(ctx, request, response)

@router.post("/integrations/hubspot/credentials")
async def hubspot_credentials(user_id: str = Form(...), org_id: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get(user_id=user_id, org_id=org_id)
    return await get_hubspot_credentials(ctx, response)

@router.post("/integrations/hubspot/items")
async def hubspot_items(credentials: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get()
    try:
        credentials_data = json.loads(credentials)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    return await get_hubspot_items(ctx, credentials_data, response)

# Airtable Routes
@router.post("/integrations/airtable/authorize")
async def airtable_authorize(user_id: str = Form(...), org_id: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get(user_id=user_id, org_id=org_id)
    return await authorize_airtable(ctx, response)

@router.get("/integrations/airtable/oauth2callback")
async def airtable_oauth2callback(request: Request, response: Response = None):
    ctx = await VectorShiftContext.get(request=request)
    return await oauth2callback_airtable(ctx, request, response)

@router.post("/integrations/airtable/credentials")
async def airtable_credentials(user_id: str = Form(...), org_id: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get(user_id=user_id, org_id=org_id)
    return await get_airtable_credentials(ctx, response)

@router.post("/integrations/airtable/items")
async def airtable_items(credentials: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get()
    try:
        credentials_data = json.loads(credentials)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    return await get_items_airtable(ctx, credentials_data, response)

# Notion Routes
@router.post("/integrations/notion/authorize")
async def notion_authorize(user_id: str = Form(...), org_id: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get(user_id=user_id, org_id=org_id)
    return await authorize_notion(ctx, response)

@router.get("/integrations/notion/oauth2callback")
async def notion_oauth2callback(request: Request, response: Response = None):
    ctx = await VectorShiftContext.get(request=request)
    return await oauth2callback_notion(ctx, request, response)

@router.post("/integrations/notion/credentials")
async def notion_credentials(user_id: str = Form(...), org_id: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get(user_id=user_id, org_id=org_id)
    return await get_notion_credentials(ctx, response)

@router.post("/integrations/notion/items")
async def notion_items(credentials: str = Form(...), response: Response = None):
    ctx = await VectorShiftContext.get()
    try:
        credentials_data = json.loads(credentials)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    return await get_items_notion(ctx, credentials_data, response)

def map_urls(app):
    """Register all routes with the FastAPI application."""
    app.include_router(router)
