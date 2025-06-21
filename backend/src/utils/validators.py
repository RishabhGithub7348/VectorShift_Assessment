from pydantic import BaseModel, ValidationError
from typing import Any

def validate_data(data: Any, model: type[BaseModel]) -> Any:
    try:
        return model(**data).dict()
    except ValidationError as e:
        raise ValueError(str(e))