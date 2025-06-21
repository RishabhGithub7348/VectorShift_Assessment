from fastapi import Request, HTTPException, Response

from ..utils.response import return_error, return_success
from ..middleware.context import VectorShiftContext
from ..services.hubspot_service import (
    authorize_hubspot as service_authorize,
    oauth2callback_hubspot as service_oauth2callback_hubspot,
    get_hubspot_credentials as service_get_hubspot_credentials, 
    get_hubspot_items as service_get_hubspot_items,
)


async def authorize_hubspot(ctx: VectorShiftContext, response: Response):
    """Initiate HubSpot OAuth authorization."""
    if not ctx.user_id or not ctx.org_id:
        return return_error(response, ["user_id and org_id are required"], 400)
    try:
        auth_url = await service_authorize(ctx)
        return return_success(response, {"auth_url": auth_url})
    except Exception as e:
        return return_error(response, [str(e)])

async def oauth2callback_hubspot(ctx: VectorShiftContext, request: Request, response: Response):
    """Handle HubSpot OAuth callback."""
    return await service_oauth2callback_hubspot(ctx, request)

async def get_hubspot_credentials(ctx: VectorShiftContext, response: Response):
    """Retrieve HubSpot credentials."""
    if not ctx.user_id or not ctx.org_id:
        return return_error(response, ["user_id and org_id are required"], 400)
    try:
        credentials = await service_get_hubspot_credentials(ctx)
        return return_success(response, credentials)
    except Exception as e:
        return return_error(response, [str(e)])

async def get_hubspot_items(ctx: VectorShiftContext, credentials: dict, response: Response):
    """Fetch HubSpot items."""
    try:
        items = await service_get_hubspot_items(ctx, credentials)
        return return_success(response, items)
    except Exception as e:
        return return_error(response, [str(e)])











