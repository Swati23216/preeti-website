from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from pathlib import Path
from bson import ObjectId

from .booking import Booking
from .followup import FollowUp
from .transaction import Transaction


from .database import (
    bookings_collection,
    followups_collection,
    transactions_collection,
    upi_qr_sessions_collection,
    newsletter_collection 
)

import razorpay
import os
import hmac
import hashlib
from datetime import datetime
from dotenv import load_dotenv



# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")


if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    raise RuntimeError(
        "RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in .env"
    )


razorpay_client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="Preeti's Makeup Website API",
    version="1.0.0"
)

app.mount(
    "/Backend/app/images",
    StaticFiles(directory=Path(__file__).resolve().parent / "images"),
    name="website-images",
)

admin_security = HTTPBasic(auto_error=False)


async def require_admin(
    credentials: Optional[HTTPBasicCredentials] = Depends(admin_security)
):
    if not ADMIN_USERNAME or not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=503,
            detail=(
                "Admin access is not configured. Set ADMIN_USERNAME and "
                "ADMIN_PASSWORD in the backend environment, then restart it."
            )
        )

    valid_username = credentials is not None and hmac.compare_digest(
        credentials.username.encode("utf-8"),
        ADMIN_USERNAME.encode("utf-8")
    )
    valid_password = credentials is not None and hmac.compare_digest(
        credentials.password.encode("utf-8"),
        ADMIN_PASSWORD.encode("utf-8")
    )

    if not valid_username or not valid_password:
        raise HTTPException(
            status_code=401,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Basic"}
        )


FRONTEND_DIRECTORY = Path(__file__).resolve().parents[2]


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HOME
# ============================================================

@app.get("/")
async def home():
    return FileResponse(FRONTEND_DIRECTORY / "index.html")


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/api/health")
async def health_check():

    try:

        await bookings_collection.database.command("ping")

        return {
            "status": "success",
            "message": "FastAPI and MongoDB are connected"
        }

    except Exception as e:

        return {
            "status": "error",
            "message": "MongoDB connection failed",
            "error": str(e)
        }


# ============================================================
# BOOKINGS
# ============================================================

@app.post("/api/bookings")
async def create_booking(booking: Booking):

    booking_data = booking.model_dump()

    # --------------------------------------------------------
    # Check duplicate date/time
    # --------------------------------------------------------

    existing_booking = await bookings_collection.find_one(
        {
            "event_date": booking.event_date,
            "event_time": booking.event_time,
            "status": {
                "$in": ["Pending", "Confirmed"]
            }
        }
    )

    if existing_booking:

        raise HTTPException(
            status_code=409,
            detail="This date and time is already booked"
        )

    # --------------------------------------------------------
    # Generate booking ID
    # --------------------------------------------------------

    last_booking = await bookings_collection.find_one(
        {
            "booking_id": {
                "$exists": True
            }
        },
        sort=[
            ("booking_id", -1)
        ]
    )

    if last_booking:

        booking_id = last_booking["booking_id"] + 1

    else:

        booking_id = 1

    # --------------------------------------------------------
    # Initial booking status
    # --------------------------------------------------------

    booking_data["booking_id"] = booking_id

    booking_data["status"] = "Pending"

    # Payment must not be available initially
    booking_data["payment_status"] = "NOT_DUE"

    # Amount will be assigned/confirmed by admin
    booking_data["service_amount"] = None

    booking_data["created_at"] = datetime.utcnow()

    # --------------------------------------------------------
    # Insert
    # --------------------------------------------------------

    await bookings_collection.insert_one(
        booking_data
    )

    return {
        "status": "success",
        "message": "Booking received successfully",
        "booking_id": booking_id
    }


# ============================================================
# GET ALL BOOKINGS
# ============================================================

@app.get("/api/bookings", dependencies=[Depends(require_admin)])
async def get_all_bookings(
    status: Optional[str] = None
):

    allowed_statuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
    ]

    query = {}

    if status is not None:

        if status not in allowed_statuses:

            raise HTTPException(
                status_code=400,
                detail=f"Status must be one of: {allowed_statuses}"
            )

        query["status"] = status

    bookings = await bookings_collection.find(
        query
    ).sort(
        "booking_id",
        -1
    ).to_list(
        length=None
    )

    for booking in bookings:

        booking["_id"] = str(
            booking["_id"]
        )

    return {
        "status": "success",
        "count": len(bookings),
        "bookings": bookings
    }


@app.get("/api/bookings/summary", dependencies=[Depends(require_admin)])
async def booking_summary():

    total = await bookings_collection.count_documents({})

    pending = await bookings_collection.count_documents({
        "status": "Pending"
    })

    confirmed = await bookings_collection.count_documents({
        "status": "Confirmed"
    })

    completed = await bookings_collection.count_documents({
        "status": "Completed"
    })

    cancelled = await bookings_collection.count_documents({
        "status": "Cancelled"
    })

    paid = await bookings_collection.count_documents({
        "payment_status": {
            "$in": ["PAID", "Paid"]
        }
    })

    return {
        "status": "success",
        "summary": {
            "total": total,
            "pending": pending,
            "confirmed": confirmed,
            "completed": completed,
            "cancelled": cancelled,
            "paid": paid
        }
    }


# ============================================================
# GET BOOKING BY ID
# ============================================================

@app.get("/api/bookings/{booking_id}", dependencies=[Depends(require_admin)])
async def get_booking(
    booking_id: int
):

    booking = await bookings_collection.find_one(
        {
            "booking_id": booking_id
        }
    )

    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    booking["_id"] = str(
        booking["_id"]
    )

    return {
        "status": "success",
        "booking": booking
    }


# ============================================================
# BOOKING STATUS
# ============================================================

class BookingStatusUpdate(BaseModel):

    status: str


@app.patch(
    "/api/bookings/{booking_id}/status",
    dependencies=[Depends(require_admin)]
)
async def update_booking_status(
    booking_id: int,
    data: BookingStatusUpdate
):

    allowed_statuses = [
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled"
    ]

    if data.status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {allowed_statuses}"
        )

    booking = await bookings_collection.find_one(
        {
            "booking_id": booking_id
        }
    )

    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    update_data = {
        "status": data.status
    }

    # --------------------------------------------------------
    # When service is completed
    # --------------------------------------------------------

    if data.status == "Completed":

        # Payment becomes available ONLY now
        update_data["payment_status"] = "UNPAID"

    # --------------------------------------------------------
    # If booking cancelled
    # --------------------------------------------------------

    if data.status == "Cancelled":

        update_data["payment_status"] = "NOT_DUE"

    await bookings_collection.update_one(
        {
            "booking_id": booking_id
        },
        {
            "$set": update_data
        }
    )

    updated_booking = await bookings_collection.find_one(
        {
            "booking_id": booking_id
        }
    )

    updated_booking["_id"] = str(
        updated_booking["_id"]
    )

    return {
        "status": "success",
        "message": "Booking status updated successfully",
        "booking": updated_booking
    }



# ============================================================
# CHECK WHETHER PAYMENT IS AVAILABLE
# ============================================================

@app.get(
    "/api/bookings/{booking_id}/payment-status",
    dependencies=[Depends(require_admin)]
)
async def payment_status(
    booking_id: int
):

    booking = await bookings_collection.find_one(
        {
            "booking_id": booking_id
        }
    )

    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    service_completed = (
        booking.get("status") == "Completed"
    )

    amount = booking.get(
        "service_amount"
    )

    payment_status_value = booking.get(
        "payment_status",
        "NOT_DUE"
    )

    can_pay = (
        service_completed
        and amount is not None
        and amount > 0
        and payment_status_value != "PAID"
    )

    return {

        "status": "success",

        "booking_id": booking_id,

        "booking_status": booking.get(
            "status"
        ),

        "payment_status": payment_status_value,

        "service_amount": amount,

        "can_pay": can_pay
    }


# ============================================================
# UPDATE BOOKING
# ============================================================

@app.put("/api/bookings/{booking_id}", dependencies=[Depends(require_admin)])
async def update_booking(
    booking_id: int,
    booking: Booking
):

    existing_booking = await bookings_collection.find_one(
        {
            "booking_id": booking_id
        }
    )

    if not existing_booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    result = await bookings_collection.update_one(
        {
            "booking_id": booking_id
        },
        {
            "$set": booking.model_dump(
                exclude_unset=True
            )
        }
    )

    updated_booking = await bookings_collection.find_one(
        {
            "booking_id": booking_id
        }
    )

    updated_booking["_id"] = str(
        updated_booking["_id"]
    )

    return {

        "status": "success",

        "message": "Booking updated successfully",

        "booking": updated_booking
    }


# ============================================================
# DELETE BOOKING
# ============================================================

@app.delete("/api/bookings/{booking_id}", dependencies=[Depends(require_admin)])
async def delete_booking(
    booking_id: int
):

    result = await bookings_collection.delete_one(
        {
            "booking_id": booking_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    return {

        "status": "success",

        "message": "Booking deleted successfully",

        "booking_id": booking_id
    }


# ============================================================
# FOLLOW UPS
# ============================================================

@app.post("/api/followups", dependencies=[Depends(require_admin)])
async def create_followup(
    followup: FollowUp
):

    booking_exists = await bookings_collection.find_one(
        {
            "booking_id": followup.booking_id
        }
    )

    if not booking_exists:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    last_followup = await followups_collection.find_one(
        {
            "followup_id": {
                "$exists": True
            }
        },
        sort=[
            ("followup_id", -1)
        ]
    )

    if last_followup:

        followup_id = (
            last_followup["followup_id"] + 1
        )

    else:

        followup_id = 1

    followup_data = followup.model_dump()

    followup_data["followup_id"] = followup_id

    followup_data["created_at"] = datetime.utcnow()

    await followups_collection.insert_one(
        followup_data
    )

    return {

        "status": "success",

        "message": "Follow-up created successfully",

        "followup_id": followup_id
    }


@app.get("/api/followups", dependencies=[Depends(require_admin)])
async def get_all_followups(
    status: Optional[str] = None,
    booking_id: Optional[int] = None
):

    allowed_statuses = [
        "Pending",
        "Completed",
        "Cancelled"
    ]

    query = {}

    if status is not None:

        if status not in allowed_statuses:

            raise HTTPException(
                status_code=400,
                detail=f"Status must be one of: {allowed_statuses}"
            )

        query["status"] = status

    if booking_id is not None:

        query["booking_id"] = booking_id

    followups = await followups_collection.find(
        query
    ).sort(
        "followup_id",
        -1
    ).to_list(
        length=None
    )

    for followup in followups:

        followup["_id"] = str(
            followup["_id"]
        )

    return {

        "status": "success",

        "count": len(followups),

        "followups": followups
    }


@app.get("/api/followups/{followup_id}", dependencies=[Depends(require_admin)])
async def get_followup(
    followup_id: int
):

    followup = await followups_collection.find_one(
        {
            "followup_id": followup_id
        }
    )

    if not followup:

        raise HTTPException(
            status_code=404,
            detail="Follow-up not found"
        )

    followup["_id"] = str(
        followup["_id"]
    )

    return {

        "status": "success",

        "followup": followup
    }


@app.put("/api/followups/{followup_id}", dependencies=[Depends(require_admin)])
async def update_followup(
    followup_id: int,
    followup: FollowUp
):

    existing_followup = await followups_collection.find_one(
        {
            "followup_id": followup_id
        }
    )

    if not existing_followup:

        raise HTTPException(
            status_code=404,
            detail="Follow-up not found"
        )

    booking_exists = await bookings_collection.find_one(
        {
            "booking_id": followup.booking_id
        }
    )

    if not booking_exists:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    await followups_collection.update_one(
        {
            "followup_id": followup_id
        },
        {
            "$set": followup.model_dump()
        }
    )

    updated_followup = await followups_collection.find_one(
        {
            "followup_id": followup_id
        }
    )

    updated_followup["_id"] = str(
        updated_followup["_id"]
    )

    return {

        "status": "success",

        "message": "Follow-up updated successfully",

        "followup": updated_followup
    }


@app.delete("/api/followups/{followup_id}", dependencies=[Depends(require_admin)])
async def delete_followup(
    followup_id: int
):

    result = await followups_collection.delete_one(
        {
            "followup_id": followup_id
        }
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Follow-up not found"
        )

    return {

        "status": "success",

        "message": "Follow-up deleted successfully",

        "followup_id": followup_id
    }


class FollowUpStatusUpdate(BaseModel):

    status: str


@app.patch(
    "/api/followups/{followup_id}/status",
    dependencies=[Depends(require_admin)]
)
async def update_followup_status(
    followup_id: int,
    data: FollowUpStatusUpdate
):

    allowed_statuses = [
        "Pending",
        "Completed",
        "Cancelled"
    ]

    if data.status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail=f"Status must be one of: {allowed_statuses}"
        )

    result = await followups_collection.update_one(
        {
            "followup_id": followup_id
        },
        {
            "$set": {
                "status": data.status
            }
        }
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Follow-up not found"
        )

    followup = await followups_collection.find_one(
        {
            "followup_id": followup_id
        }
    )

    followup["_id"] = str(
        followup["_id"]
    )

    return {

        "status": "success",

        "message": "Follow-up status updated successfully",

        "followup": followup
    }


# ============================================================
# TRANSACTIONS
# ============================================================

@app.post("/api/transactions", dependencies=[Depends(require_admin)])
async def create_transaction(
    transaction: Transaction
):

    booking = await bookings_collection.find_one(
        {
            "booking_id": transaction.booking_id
        }
    )

    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    existing_transaction = await transactions_collection.find_one(
        {
            "booking_id": transaction.booking_id,
            "status": "PENDING"
        }
    )

    if existing_transaction:

        existing_transaction["_id"] = str(
            existing_transaction["_id"]
        )

        return {

            "status": "success",

            "message": "Pending transaction already exists",

            "transaction": existing_transaction
        }

    last_transaction = await transactions_collection.find_one(
        {
            "transaction_number": {
                "$exists": True
            }
        },
        sort=[
            ("transaction_number", -1)
        ]
    )

    if last_transaction:

        transaction_number = (
            last_transaction["transaction_number"] + 1
        )

    else:

        transaction_number = 1

    transaction_data = transaction.model_dump()

    transaction_data["transaction_number"] = transaction_number

    transaction_data["status"] = "PENDING"

    transaction_data["created_at"] = datetime.utcnow()

    await transactions_collection.insert_one(
        transaction_data
    )

    return {

        "status": "success",

        "message": "Transaction created successfully",

        "transaction_id": transaction_number
    }


@app.get("/api/transactions", dependencies=[Depends(require_admin)])
async def get_all_transactions(
    status: Optional[str] = None,
    booking_id: Optional[int] = None
):

    query = {}

    if status is not None:

        query["status"] = status

    if booking_id is not None:

        query["booking_id"] = booking_id

    transactions = await transactions_collection.find(
        query
    ).sort(
        "created_at",
        -1
    ).to_list(
        length=None
    )

    for transaction in transactions:

        transaction["_id"] = str(
            transaction["_id"]
        )

    return {

        "status": "success",

        "count": len(transactions),

        "transactions": transactions
    }


# ============================================================
# RAZORPAY PAYMENTS
# ============================================================

class PaymentCreate(BaseModel):
    booking_id: int
    amount: Optional[float] = Field(
        default=None,
        gt=0,
        allow_inf_nan=False
    )


class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_id: int


class StandalonePaymentCreate(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    amount: float = Field(gt=0, allow_inf_nan=False)


class StandalonePaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class UpiPaymentReport(BaseModel):
    customer_name: str = Field(min_length=2, max_length=100)
    amount: float = Field(gt=0, allow_inf_nan=False)


@app.get("/api/payments/upi-qr-image")
async def get_upi_payment_qr_image():
    image_path = Path(__file__).resolve().parent / "images" / "img7.png"
    if not image_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="UPI payment QR image is missing"
        )
    return FileResponse(image_path, media_type="image/png")


@app.post("/api/payments/upi-report")
async def create_upi_payment_report(report: UpiPaymentReport):
    customer_name = report.customer_name.strip()
    amount_paise = round(report.amount * 100)
    if len(customer_name) < 2 or amount_paise < 100:
        raise HTTPException(
            status_code=400,
            detail="Enter your name and a payment amount of at least ₹1"
        )

    transaction = {
        "customer_name": customer_name,
        "booking_id": None,
        "payment_type": "UPI_MANUAL",
        "payment_method": "UPI",
        "amount": amount_paise / 100,
        "currency": "INR",
        "status": "PENDING",
        "gateway_payment_id": None,
        "gateway_order_id": None,
        "created_at": datetime.utcnow(),
        "paid_at": None
    }
    result = await transactions_collection.insert_one(transaction)
    return {
        "status": "success",
        "message": "Payment report saved for manual verification",
        "transaction_id": str(result.inserted_id),
        "payment_status": "PENDING"
    }


@app.post("/api/payments/upi-qr")
async def create_upi_qr():
    try:
        qr_code = razorpay_client.qrcode.create(
            {
                "type": "upi_qr",
                "usage": "multiple_use",
                "fixed_amount": False,
                "name": "Preeti Makeup Payment",
                "description": "UPI payment to Preeti's Makeup",
                "notes": {
                    "source": "preeti_website"
                }
            }
        )

        await upi_qr_sessions_collection.insert_one(
            {
                "_id": qr_code["id"],
                "image_url": qr_code["image_url"],
                "status": "ACTIVE",
                "created_at": datetime.utcnow()
            }
        )

        return {
            "status": "success",
            "qr_code_id": qr_code["id"],
            "image_url": qr_code["image_url"]
        }
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=(
                "Unable to create a UPI QR code. Confirm UPI QR codes are "
                f"enabled for this Razorpay account. Provider error: {exc}"
            )
        ) from exc


@app.get("/api/payments/upi-qr/{qr_code_id}")
async def get_upi_qr_status(qr_code_id: str):
    session = await upi_qr_sessions_collection.find_one(
        {"_id": qr_code_id}
    )
    if not session:
        raise HTTPException(
            status_code=404,
            detail="UPI QR payment session not found"
        )

    payments = await transactions_collection.find(
        {
            "gateway_qr_code_id": qr_code_id,
            "status": "PAID"
        }
    ).to_list(length=None)
    total_amount = sum(
        float(payment.get("amount", 0) or 0)
        for payment in payments
    )

    return {
        "status": "PAID" if payments else "PENDING",
        "amount_received": total_amount,
        "payments_count": len(payments)
    }


@app.post("/api/webhooks/razorpay")
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(default=None)
):
    if not RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Razorpay webhook secret is not configured"
        )
    if not x_razorpay_signature:
        raise HTTPException(
            status_code=400,
            detail="Missing Razorpay webhook signature"
        )

    payload_bytes = await request.body()
    expected_signature = hmac.new(
        RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(
        expected_signature,
        x_razorpay_signature
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay webhook signature"
        )

    try:
        payload = await request.json()
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid Razorpay webhook payload"
        ) from exc

    if payload.get("event") != "qr_code.credited":
        return {"status": "ignored"}

    payment = (
        payload.get("payload", {})
        .get("payment", {})
        .get("entity", {})
    )
    qr_code = (
        payload.get("payload", {})
        .get("qr_code", {})
        .get("entity", {})
    )
    payment_id = payment.get("id")
    qr_code_id = qr_code.get("id")
    if (
        not payment_id
        or not qr_code_id
        or payment.get("status") != "captured"
        or payment.get("method") != "upi"
    ):
        return {"status": "ignored"}

    session = await upi_qr_sessions_collection.find_one(
        {"_id": qr_code_id}
    )
    if not session:
        return {"status": "ignored"}

    payment_amount = payment.get("amount")
    if not isinstance(payment_amount, int) or payment_amount < 100:
        raise HTTPException(
            status_code=400,
            detail="Razorpay sent an invalid UPI payment amount"
        )

    paid_at = datetime.utcnow()
    if payment.get("created_at"):
        paid_at = datetime.utcfromtimestamp(payment["created_at"])

    await transactions_collection.update_one(
        {"_id": payment_id},
        {
            "$setOnInsert": {
                "customer_name": (
                    payment.get("contact")
                    or payment.get("email")
                    or payment.get("vpa")
                    or "UPI payer"
                ),
                "payer_vpa": payment.get("vpa"),
                "payer_email": payment.get("email"),
                "payer_contact": payment.get("contact"),
                "booking_id": None,
                "payment_type": "UPI_QR",
                "amount": payment_amount / 100,
                "currency": payment.get("currency", "INR"),
                "status": "PAID",
                "payment_method": "UPI",
                "gateway_qr_code_id": qr_code_id,
                "gateway_payment_id": payment_id,
                "gateway_order_id": payment.get("order_id"),
                "created_at": paid_at,
                "paid_at": paid_at
            }
        },
        upsert=True
    )

    try:
        razorpay_client.qrcode.close(qr_code_id)
        await upi_qr_sessions_collection.update_one(
            {"_id": qr_code_id},
            {"$set": {"status": "PAID"}}
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Unable to close the paid UPI QR code: {exc}"
        ) from exc

    return {"status": "success"}


# ============================================================
# CREATE RAZORPAY ORDER
# ============================================================

async def create_payment_order(payment: PaymentCreate):

    # --------------------------------------------------------
    # Find booking
    # --------------------------------------------------------

    booking = await bookings_collection.find_one(
        {
            "booking_id": payment.booking_id
        }
    )

    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # --------------------------------------------------------
    # Payment only after service is completed
    # --------------------------------------------------------

    if booking.get("status") != "Completed":

        raise HTTPException(
            status_code=403,
            detail="Payment is available only after the service is completed"
        )

    # --------------------------------------------------------
    # Determine the amount due, accounting for earlier payments.
    # --------------------------------------------------------

    service_amount = booking.get("service_amount")
    paid_transactions = await transactions_collection.find(
        {
            "booking_id": payment.booking_id,
            "status": "PAID"
        }
    ).to_list(length=None)
    paid_amount = sum(
        float(transaction.get("amount", 0) or 0)
        for transaction in paid_transactions
    )

    if payment.amount is None and (
        service_amount is None or service_amount <= 0
    ):

        raise HTTPException(
            status_code=400,
            detail="Enter the amount agreed with the makeup artist"
        )

    if service_amount is not None:
        remaining_amount = max(
            float(service_amount) - paid_amount,
            0
        )
        if remaining_amount <= 0:
            raise HTTPException(
                status_code=400,
                detail="This booking has already been paid in full"
            )
        service_amount = remaining_amount

    amount_to_charge = (
        payment.amount
        if payment.amount is not None
        else service_amount
    )

    if amount_to_charge is None or amount_to_charge <= 0:
        raise HTTPException(
            status_code=400,
            detail="Payment amount must be greater than zero"
        )

    if service_amount is not None and amount_to_charge > service_amount:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Payment cannot exceed the remaining balance "
                f"of ₹{service_amount:.2f}"
            )
        )

    # --------------------------------------------------------
    # Convert INR to paise
    # --------------------------------------------------------

    amount_paise = int(
        round(amount_to_charge * 100)
    )

    if amount_paise < 100:
        raise HTTPException(
            status_code=400,
            detail="Razorpay payments must be at least ₹1"
        )

    try:

        # ----------------------------------------------------
        # Create Razorpay order
        # ----------------------------------------------------

        order = razorpay_client.order.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"booking_{payment.booking_id}",
                "payment_capture": 1
            }
        )

        # ----------------------------------------------------
        # Save transaction
        # ----------------------------------------------------

        transaction_data = {

            "booking_id":
                payment.booking_id,

            "amount":
                amount_paise / 100,

            "currency":
                "INR",

            "status":
                "PENDING",

            "gateway_order_id":
                order["id"],

            "gateway_payment_id":
                None,

            "payment_method":
                None,

            "created_at":
                datetime.utcnow(),

            "paid_at":
                None
        }

        result = await transactions_collection.insert_one(
            transaction_data
        )

        # ----------------------------------------------------
        # Send order details to frontend
        # ----------------------------------------------------

        return {

            "status":
                "success",

            "order_id":
                order["id"],

            "amount":
                amount_paise / 100,

            "amount_paise":
                amount_paise,

            "currency":
                "INR",

            "transaction_id":
                str(result.inserted_id),

            "razorpay_key_id":
                RAZORPAY_KEY_ID,

            "booking_id":
                payment.booking_id
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Payment order creation failed: {str(e)}"
        )


async def create_standalone_payment_order(
    payment: StandalonePaymentCreate
):
    customer_name = payment.customer_name.strip()
    if len(customer_name) < 2:
        raise HTTPException(
            status_code=400,
            detail="Enter your name"
        )

    amount_paise = int(round(payment.amount * 100))
    if amount_paise < 100:
        raise HTTPException(
            status_code=400,
            detail="Razorpay payments must be at least ₹1"
        )

    try:
        order = razorpay_client.order.create(
            {
                "amount": amount_paise,
                "currency": "INR",
                "receipt": f"direct_{int(datetime.utcnow().timestamp())}",
                "payment_capture": 1
            }
        )

        result = await transactions_collection.insert_one(
            {
                "booking_id": None,
                "customer_name": customer_name,
                "payment_type": "STANDALONE",
                "amount": amount_paise / 100,
                "currency": "INR",
                "status": "PENDING",
                "gateway_order_id": order["id"],
                "gateway_payment_id": None,
                "payment_method": None,
                "created_at": datetime.utcnow(),
                "paid_at": None
            }
        )

        return {
            "status": "success",
            "order_id": order["id"],
            "amount": amount_paise / 100,
            "amount_paise": amount_paise,
            "currency": "INR",
            "transaction_id": str(result.inserted_id),
            "razorpay_key_id": RAZORPAY_KEY_ID,
            "customer_name": customer_name
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Standalone payment order creation failed: {str(e)}"
        )


@app.post("/api/payments/verify-standalone")
async def verify_standalone_payment(
    payment: StandalonePaymentVerification
):
    transaction = await transactions_collection.find_one(
        {
            "gateway_order_id": payment.razorpay_order_id,
            "payment_type": "STANDALONE"
        }
    )
    if not transaction:
        raise HTTPException(
            status_code=404,
            detail="Standalone payment transaction not found"
        )

    signature_payload = (
        payment.razorpay_order_id
        + "|"
        + payment.razorpay_payment_id
    )
    generated_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode("utf-8"),
        signature_payload.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(
        generated_signature,
        payment.razorpay_signature
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature"
        )

    if transaction.get("status") == "PAID":
        if transaction.get("gateway_payment_id") != payment.razorpay_payment_id:
            raise HTTPException(
                status_code=409,
                detail="This order has already been verified with another payment"
            )
        return {
            "status": "success",
            "message": "Payment is already verified",
            "payment_status": "PAID",
            "customer_name": transaction.get("customer_name")
        }

    await transactions_collection.update_one(
        {
            "gateway_order_id": payment.razorpay_order_id,
            "payment_type": "STANDALONE",
            "status": "PENDING"
        },
        {
            "$set": {
                "status": "PAID",
                "gateway_payment_id": payment.razorpay_payment_id,
                "paid_at": datetime.utcnow()
            }
        }
    )

    return {
        "status": "success",
        "message": "Payment verified successfully",
        "payment_status": "PAID",
        "customer_name": transaction.get("customer_name"),
        "amount": transaction.get("amount"),
        "razorpay_order_id": payment.razorpay_order_id,
        "razorpay_payment_id": payment.razorpay_payment_id
    }


# ============================================================
# VERIFY RAZORPAY PAYMENT
# ============================================================

@app.post("/api/payments/verify")
async def verify_payment(
    payment: PaymentVerification
):

    # --------------------------------------------------------
    # Find transaction using Razorpay order ID
    # --------------------------------------------------------

    transaction = await transactions_collection.find_one(
        {
            "gateway_order_id":
                payment.razorpay_order_id
        }
    )

    if not transaction:

        raise HTTPException(
            status_code=404,
            detail="Transaction not found"
        )

    # --------------------------------------------------------
    # Check booking ID
    # --------------------------------------------------------

    if transaction.get("booking_id") != payment.booking_id:

        raise HTTPException(
            status_code=400,
            detail="Booking does not match payment transaction"
        )

    # --------------------------------------------------------
    # Find booking
    # --------------------------------------------------------

    booking = await bookings_collection.find_one(
        {
            "booking_id":
                payment.booking_id
        }
    )

    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    # --------------------------------------------------------
    # Service must be completed
    # --------------------------------------------------------

    if booking.get("status") != "Completed":

        raise HTTPException(
            status_code=403,
            detail="Payment verification is allowed only for completed services"
        )

    # --------------------------------------------------------
    # Generate expected Razorpay signature
    #
    # IMPORTANT:
    #
    # Razorpay creates the signature.
    # Frontend receives it as:
    #
    # response.razorpay_signature
    #
    # Backend calculates the expected signature using
    # RAZORPAY_KEY_SECRET and compares both.
    # --------------------------------------------------------

    signature_payload = (
        payment.razorpay_order_id
        + "|"
        + payment.razorpay_payment_id
    )

    generated_signature = hmac.new(

        RAZORPAY_KEY_SECRET.encode(
            "utf-8"
        ),

        signature_payload.encode(
            "utf-8"
        ),

        hashlib.sha256

    ).hexdigest()

    # --------------------------------------------------------
    # Compare signatures securely
    # --------------------------------------------------------

    if not hmac.compare_digest(
        generated_signature,
        payment.razorpay_signature
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid payment signature"
        )

    if transaction.get("status") == "PAID":
        if transaction.get("gateway_payment_id") != payment.razorpay_payment_id:
            raise HTTPException(
                status_code=409,
                detail="This order has already been verified with another payment"
            )
        return {
            "status": "success",
            "message": "Payment is already verified",
            "payment_status": booking.get("payment_status", "PAID"),
            "booking_id": payment.booking_id
        }

    # --------------------------------------------------------
    # Update transaction
    # --------------------------------------------------------

    await transactions_collection.update_one(

        {
            "gateway_order_id":
                payment.razorpay_order_id
        },

        {
            "$set": {

                "status":
                    "PAID",

                "gateway_payment_id":
                    payment.razorpay_payment_id,

                "paid_at":
                    datetime.utcnow()
            }
        }
    )

    # --------------------------------------------------------
    # Recalculate paid total so partial payments remain visible.
    # --------------------------------------------------------

    paid_transactions = await transactions_collection.find(
        {
            "booking_id": payment.booking_id,
            "status": "PAID"
        }
    ).to_list(length=None)
    paid_amount = sum(
        float(item.get("amount", 0) or 0)
        for item in paid_transactions
    )
    service_amount = booking.get("service_amount")
    if service_amount is not None and paid_amount >= float(service_amount):
        next_payment_status = "PAID"
    elif paid_amount > 0:
        next_payment_status = "PARTIALLY_PAID"
    else:
        next_payment_status = "UNPAID"

    await bookings_collection.update_one(

        {
            "booking_id":
                payment.booking_id
        },

        {
            "$set": {

                "payment_status":
                    next_payment_status,

                "paid_amount":
                    paid_amount,

                "paid_at":
                    datetime.utcnow(),

                "payment_id":
                    payment.razorpay_payment_id
            }
        }
    )

    # --------------------------------------------------------
    # Get updated transaction
    # --------------------------------------------------------

    updated_transaction = await transactions_collection.find_one(

        {
            "gateway_order_id":
                payment.razorpay_order_id
        }
    )

    updated_transaction["_id"] = str(
        updated_transaction["_id"]
    )

    # --------------------------------------------------------
    # Success response
    # --------------------------------------------------------

    return {

        "status":
            "success",

        "message":
            "Payment verified successfully",

        "payment_status":
            next_payment_status,

        "paid_amount":
            paid_amount,

        "booking_id":
            payment.booking_id,

        "razorpay_order_id":
            payment.razorpay_order_id,

        "razorpay_payment_id":
            payment.razorpay_payment_id,

        "transaction":
            updated_transaction
    }


# ============================================================
# GET ALL PAYMENTS
# ============================================================

@app.get("/api/payments", dependencies=[Depends(require_admin)])
async def get_all_payments():

    transactions = await transactions_collection.find().sort(
        "created_at",
        -1
    ).to_list(
        length=None
    )

    for transaction in transactions:

        transaction["_id"] = str(
            transaction["_id"]
        )

    return {

        "status":
            "success",

        "count":
            len(transactions),

        "transactions":
            transactions
    }


@app.post(
    "/api/payments/{payment_id}/confirm",
    dependencies=[Depends(require_admin)]
)
async def confirm_upi_payment(payment_id: str):
    if not ObjectId.is_valid(payment_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid payment report ID"
        )

    result = await transactions_collection.update_one(
        {
            "_id": ObjectId(payment_id),
            "payment_type": "UPI_MANUAL",
            "status": "PENDING"
        },
        {
            "$set": {
                "status": "PAID",
                "paid_at": datetime.utcnow(),
                "manually_verified": True
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(
            status_code=409,
            detail="Payment report is not pending or does not exist"
        )

    return {
        "status": "success",
        "payment_status": "PAID",
        "message": "UPI payment marked verified"
    }


# ============================================================
# GET PAYMENT BY BOOKING
# ============================================================

@app.get(
    "/api/payments/booking/{booking_id}",
    dependencies=[Depends(require_admin)]
)
async def get_booking_payment(
    booking_id: int
):

    transaction = await transactions_collection.find_one(

        {
            "booking_id":
                booking_id
        },

        sort=[
            ("created_at", -1)
        ]
    )

    if not transaction:

        return {

            "status":
                "success",

            "booking_id":
                booking_id,

            "payment":
                None
        }

    transaction["_id"] = str(
        transaction["_id"]
    )

    return {

        "status":
            "success",

        "booking_id":
            booking_id,

        "payment":
            transaction
    }

class BookingAmountUpdate(BaseModel):
    amount: float


@app.patch(
    "/api/bookings/{booking_id}/amount",
    dependencies=[Depends(require_admin)]
)
async def update_booking_amount(
    booking_id: int,
    data: BookingAmountUpdate
):

    if data.amount <= 0:

        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than 0"
        )

    booking = await bookings_collection.find_one(
        {
            "booking_id": booking_id
        }
    )

    if not booking:

        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    paid_transactions = await transactions_collection.find(
        {
            "booking_id": booking_id,
            "status": "PAID"
        }
    ).to_list(length=None)
    paid_amount = sum(
        float(transaction.get("amount", 0) or 0)
        for transaction in paid_transactions
    )
    payment_status = (
        "PAID"
        if paid_amount >= data.amount
        else "PARTIALLY_PAID"
        if paid_amount > 0
        else "UNPAID"
    )

    await bookings_collection.update_one(

        {
            "booking_id":
                booking_id
        },

        {
            "$set": {

                "service_amount":
                    data.amount,

                "payment_status":
                    payment_status,

                "paid_amount":
                    paid_amount
            }
        }
    )

    updated_booking = await bookings_collection.find_one(
        {
            "booking_id":
                booking_id
        }
    )

    updated_booking["_id"] = str(
        updated_booking["_id"]
    )

    return {

        "status":
            "success",

        "message":
            "Service amount updated successfully",

        "booking":
            updated_booking
    }


class NewsletterSubscribe(BaseModel):
    email: EmailStr


@app.post("/api/newsletter/subscribe")
async def subscribe_newsletter(data: NewsletterSubscribe):

    existing = await newsletter_collection.find_one(
        {"email": data.email}
    )

    if existing:
        return {
            "status": "success",
            "message": "Email is already subscribed"
        }

    result = await newsletter_collection.insert_one({
        "email": data.email,
        "subscribed_at": datetime.utcnow()
    })

    return {
        "status": "success",
        "message": "Subscribed successfully",
        "subscriber_id": str(result.inserted_id)
    }


@app.get(
    "/api/newsletter/subscribers",
    dependencies=[Depends(require_admin)]
)
async def get_subscribers():

    subscribers = await newsletter_collection.find().sort(
        "subscribed_at", -1
    ).to_list(length=None)

    for subscriber in subscribers:
        subscriber["_id"] = str(subscriber["_id"])

    return {
        "status": "success",
        "subscribers": subscribers
    }


@app.get("/admin.html", dependencies=[Depends(require_admin)])
async def admin_page():
    return FileResponse(FRONTEND_DIRECTORY / "admin.html")


@app.get("/{asset_name}")
async def frontend_asset(asset_name: str):
    allowed_assets = {
        "style.css",
        "script.js",
        "admin.css",
        "admin.js",
    }

    if asset_name not in allowed_assets:
        raise HTTPException(status_code=404, detail="Not found")

    return FileResponse(FRONTEND_DIRECTORY / asset_name)
