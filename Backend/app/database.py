import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient


load_dotenv()


MONGODB_URL = os.getenv("MONGODB_URL")

DATABASE_NAME = os.getenv(
    "DATABASE_NAME",
    "preeti_makeup"
)


if not MONGODB_URL:
    raise ValueError(
        "MONGODB_URL is not set in the .env file"
    )


client = AsyncIOMotorClient(MONGODB_URL)

database = client[DATABASE_NAME]

bookings_collection = database["bookings"]

followups_collection = database["followups"]

transactions_collection = database["transactions"]

upi_qr_sessions_collection = database["upi_qr_sessions"]

newsletter_collection = database["newsletter_subscribers"]