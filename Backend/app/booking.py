from pydantic import BaseModel, EmailStr
from typing import Optional


class Booking(BaseModel):

    name: str
    phone: str
    email: Optional[EmailStr] = None

    event_type: str
    event_date: Optional[str] = None
    event_time: Optional[str] = None

    location: Optional[str] = None
    package: Optional[str] = None
    message: Optional[str] = None