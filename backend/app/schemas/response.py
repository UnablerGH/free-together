from typing import Dict, Optional
from pydantic import BaseModel, validator

class ResponseCreateModel(BaseModel):
    # Legacy availability system (for backward compatibility)
    availability: Optional[Dict[str, int]] = {}
    comments: Optional[Dict[str, str]] = {}
    
    # New RSVP system
    rsvpStatus: Optional[str] = None
    comment: Optional[str] = None
    
    @validator('rsvpStatus')
    def validate_rsvp_status(cls, v):
        if v is not None and v not in ['yes', 'no', 'maybe']:
            raise ValueError('rsvpStatus must be one of: yes, no, maybe')
        return v
