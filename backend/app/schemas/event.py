from typing import Annotated, List, Optional, Dict
from pydantic import BaseModel, validator
from pydantic.types import StringConstraints
from datetime import datetime, date

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
    # Date range for availability collection
    start_date: date
    end_date: date
    invitees: Optional[List[str]] = []
    
    @validator('end_date')
    def validate_date_range(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v

class TimeSlotAvailabilityModel(BaseModel):
    # Time slots are represented as "day_hour" format (e.g., "monday_14" for Monday 2 PM)
    available_slots: List[str]
    user_email: str
    user_name: Optional[str] = None