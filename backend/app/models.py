from pydantic import BaseModel, EmailStr
from typing import List, Dict, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str

class EventCreate(BaseModel):
    name: str
    type: str  # "once" or "weekly"
    timezone: str
    access: str  # "public" or "restricted"
    end_date: Optional[datetime] = None
    invitees: List[str] = []

class ResponseCreate(BaseModel):
    availability: Dict[str, int]  # slotId -> availability level (0,1,2)
    comments: Optional[Dict[str, str]] = None

class EventResponse(BaseModel):
    eventId: str
    name: str
    type: str
    timezone: str
    access: str
    invitees: List[str]
    createdBy: str
    createdAt: datetime
    closed: bool
    isOwner: bool

class UserResponse(BaseModel):
    uid: str
    email: str
    username: str 