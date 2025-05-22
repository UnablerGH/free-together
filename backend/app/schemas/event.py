from typing import Annotated
from pydantic import BaseModel
from pydantic.types import StringConstraints
from datetime import datetime

class EventCreateModel(BaseModel):
    name: Annotated[
        str,
        StringConstraints(min_length=1),
    ]
    end_date: datetime
