from typing import Annotated, List, Optional
from pydantic import BaseModel
from pydantic.types import StringConstraints
from datetime import datetime

class EventCreateModel(BaseModel):
    name: Annotated[
        str,
        StringConstraints(min_length=1),
    ]
    type: Annotated[
        str,
        StringConstraints(pattern=r'^(once|weekly)$'),
    ]
    timezone: Annotated[
        str,
        StringConstraints(min_length=1),
    ]
    access: Annotated[
        str,
        StringConstraints(pattern=r'^(public|restricted)$'),
    ]
    end_date: Optional[datetime] = None
    invitees: Optional[List[str]] = []