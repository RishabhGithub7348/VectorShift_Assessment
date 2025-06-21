from fastapi import Request, HTTPException, Response
from fastapi.responses import HTMLResponse
from ..utils.response import return_error, return_success
from ..middleware.context import VectorShiftContext
from ..services.airtable_service import (
    authorize_airtable as service_authorize_airtable,
    oauth2callback_airtable as service_oauth2callback_airtable,
    get_airtable_credentials as service_get_airtable_credentials,
    get_items_airtable as service_get_items_airtable,
)

async def authorize_airtable(ctx: VectorShiftContext, response: Response):
    """Initiate Airtable OAuth authorization."""
    if not ctx.user_id or not ctx.org_id:
        return return_error(response, ["user_id and org_id are required"], 400)
    try:
        auth_url = await service_authorize_airtable(ctx)
        return return_success(response, {"auth_url": auth_url})
    except Exception as e:
        return return_error(response, [str(e)])


async def oauth2callback_airtable(ctx: VectorShiftContext, request: Request, response: Response):
    """Handle Airtable OAuth callback."""
    return await service_oauth2callback_airtable(ctx, request)


async def get_airtable_credentials(ctx: VectorShiftContext, response: Response):
    """Retrieve Airtable credentials."""
    if not ctx.user_id or not ctx.org_id:
        return return_error(response, ["user_id and org_id are required"], 400)
    try:
        credentials = await service_get_airtable_credentials(ctx)
        return return_success(response, credentials)
    except Exception as e:
        return return_error(response, [str(e)])


async def get_items_airtable(ctx: VectorShiftContext, credentials: dict, response: Response):
    """Fetch Airtable items."""
    if not ctx.user_id or not ctx.org_id:
        return return_error(response, ["user_id and org_id are required"], 400)
    try:
        items = await service_get_items_airtable(ctx, credentials)
        return return_success(response, items)
    except Exception as e:
        return return_error(response, [str(e)])