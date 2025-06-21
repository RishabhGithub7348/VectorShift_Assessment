from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IntegrationItem(BaseModel):
    id: Optional[str] = None
    type: Optional[str] = None
    directory: bool = False
    parent_path_or_name: Optional[str] = None
    parent_id: Optional[str] = None
    name: Optional[str] = None
    creation_time: Optional[datetime] = None
    last_modified_time: Optional[datetime] = None
    url: Optional[str] = None
    children: Optional[list[str]] = None
    mime_type: Optional[str] = None
    delta: Optional[str] = None
    drive_id: Optional[str] = None
    visibility: Optional[bool] = True

    class Config:
        arbitrary_types_allowed = True