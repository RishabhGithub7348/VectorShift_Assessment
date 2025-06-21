
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..db.connection import RedisClient
from typing import Optional

class VectorShiftContext:
    _bindings = {}

    def __init__(self):
        self.user_id: Optional[str] = None
        self.org_id: Optional[str] = None
        self.redis_client = RedisClient.get_instance()

    @classmethod
    async def get(cls, request: Request = None, user_id: Optional[str] = None, org_id: Optional[str] = None) -> 'VectorShiftContext':
        request_id = id(request) if request else None
        if request_id not in cls._bindings and request:
            cls._bindings[request_id] = VectorShiftContext()
        ctx = cls._bindings.get(request_id) if request else VectorShiftContext()
        
        # Override or set user_id and org_id
        if user_id is not None:
            ctx.user_id = user_id
        if org_id is not None:
            ctx.org_id = org_id
        
        # Update from request form data if available
        if request and request.method in ["POST", "PUT"] and request.headers.get("content-type", "").startswith("application/x-www-form-urlencoded"):
            form_data = await request.form()
            ctx.user_id = form_data.get("user_id") or ctx.user_id
            ctx.org_id = form_data.get("org_id") or ctx.org_id
        return ctx

class VectorShiftContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        ctx = await VectorShiftContext.get(request)
        response = await call_next(request)
        return response