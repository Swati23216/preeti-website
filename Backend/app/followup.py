from pydantic import BaseModel
from typing import Optional


class FollowUp(BaseModel):
    booking_id: int
    followup_date: str
    followup_time: Optional[str] = None
    remarks: Optional[str] = None
    status: str = "Pending"