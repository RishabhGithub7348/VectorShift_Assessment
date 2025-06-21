from fastapi import FastAPI
from .routes import map_urls
from ..middleware.context import VectorShiftContextMiddleware

app = FastAPI()

# Optional: Add a root route
@app.get("/")
async def read_root():
    return {"message": "Welcome to VectorShift Backend API. Use /api/v1/integrations/... for endpoints."}

# Register middleware
app.add_middleware(VectorShiftContextMiddleware)  

# Register routes
map_urls(app)