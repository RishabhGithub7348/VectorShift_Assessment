from fastapi import Request, HTTPException, Form, Response
from fastapi.responses import HTMLResponse
from ..utils.response import return_error, return_success
from ..middleware.context import VectorShiftContext
from ..services.notion_service import (
    authorize_notion as service_authorize_notion,
    oauth2callback_notion as service_oauth2callback_notion,
    get_notion_credentials as service_get_notion_credentials,
    get_items_notion as service_get_items_notion,
)


async def authorize_notion(ctx: VectorShiftContext, response: Response):
    """Initiate Notion OAuth authorization."""
    if not ctx.user_id or not ctx.org_id:
        return return_error(response, ["user_id and org_id are required"], 400)
    try:
        auth_url = await service_authorize_notion(ctx)
        return return_success(response, {"auth_url": auth_url})
    except Exception as e:
        return return_error(response, [str(e)])


async def oauth2callback_notion(ctx: VectorShiftContext, request: Request, response: Response):
    """Handle Notion OAuth callback."""
    return await service_oauth2callback_notion(ctx, request)


async def get_notion_credentials(ctx: VectorShiftContext, response: Response):
    """Retrieve Notion credentials."""
    if not ctx.user_id or not ctx.org_id:
        return return_error(response, ["user_id and org_id are required"], 400)
    try:
        credentials = await service_get_notion_credentials(ctx)
        return return_success(response, credentials)
    except Exception as e:
        return return_error(response, [str(e)])


async def get_items_notion(ctx: VectorShiftContext, credentials: dict, response: Response):
    """Fetch Notion items."""
    if not ctx.user_id or not ctx.org_id:
        return return_error(response, ["user_id and org_id are required"], 400)
    try:
        items = await service_get_items_notion(ctx, credentials)
        return return_success(response, items)
    except Exception as e:
        return return_error(response, [str(e)])