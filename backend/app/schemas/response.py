from typing import Dict, Optional
from pydantic import BaseModel

class ResponseCreateModel(BaseModel):
    availability: Dict[str, int]  # should be 0, 1, or 2
    comments: Optional[Dict[str, str]] = {}
