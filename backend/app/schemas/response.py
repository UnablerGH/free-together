from typing import Annotated, Dict, Optional
from pydantic import BaseModel
from pydantic.types import NumberConstraints

class ResponseCreateModel(BaseModel):
    availability: Annotated[
        Dict[str, int],
        NumberConstraints(ge=0, le=2)
    ]
    comments: Optional[Dict[str, str]] = {}