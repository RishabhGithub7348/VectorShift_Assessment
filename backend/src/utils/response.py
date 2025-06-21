from fastapi import Response
from pydantic import BaseModel
from typing import Any, List, Optional

class MSResponse(BaseModel):
    success: bool
    data: Any
    errors: List[str]

def return_success(response: Response, data: Any, status_code: int = 200) -> dict:
    success_response = MSResponse(
        success=True,
        data=data,
        errors=[]
    )
    response.status_code = status_code
    return success_response.model_dump()

def return_error(response: Response, errors: List[str], status_code: int = 400) -> dict:
    error_response = MSResponse(
        success=False,
        data=None,
        errors=errors
    )
    response.status_code = status_code
    return error_response.model_dump()