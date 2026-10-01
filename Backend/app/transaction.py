from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Transaction(BaseModel):
    transaction_id: Optional[str] = None

    booking_id: int

    amount: float
    currency: str = "INR"

    status: str = "PENDING"

    payment_method: Optional[str] = None

    gateway_order_id: Optional[str] = None
    gateway_payment_id: Optional[str] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = None

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str