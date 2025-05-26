from typing import Annotated, List, Optional, Dict
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
    invitees: Optional[List[str]] = []

class TimeSlotAvailabilityModel(BaseModel):
    # Time slots are represented as "day_hour" format (e.g., "monday_14" for Monday 2 PM)
    available_slots: List[str]
    user_email: str
    user_name: Optional[str] = None