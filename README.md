# 💄 Preeti Janawade — Bridal & Party Makeup Website

> A full-stack business website with customer booking, admin dashboard, booking management, follow-ups, payment integration, transaction tracking, and production deployment.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Swati23216/preeti-website)
[![Live Demo](https://img.shields.io/badge/Live-Demo-000000?style=for-the-badge&logo=vercel)](https://preeti-website-eight.vercel.app/)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 🌐 Live Deployment

### 🔗 Live Website
**[Visit Preeti Janawade — Bridal & Party Makeup Website](https://preeti-website-eight.vercel.app/)**

### 🔗 Backend API
**[FastAPI Backend](https://preeti-website-1.onrender.com)**

### 📚 API Documentation
**[Swagger API Documentation](https://preeti-website-1.onrender.com/docs)**

### 💻 Source Code
**[GitHub Repository](https://github.com/Swati23216/preeti-website)**

---

## 📌 Overview

**Preeti Janawade — Bridal & Party Makeup Artist** is a full-stack web application developed to provide a professional online presence and streamline customer booking and business management.

The application consists of a **customer-facing website** and a dedicated **admin dashboard** for managing bookings, follow-ups, payments, transactions, and customer-related operations.

The project is deployed using a production architecture with:

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas
- **Payment Gateway:** Razorpay

---

## ✨ Key Features

### 👩‍💼 Customer Website

- Responsive professional makeup artist website
- Bridal and party makeup service showcase
- Booking enquiry form
- WhatsApp-based customer communication
- FAQ accordion
- Contact information
- Mobile-responsive UI
- Premium wine and gold themed design
- Customer booking workflow
- Razorpay payment integration

### 🔐 Admin Dashboard

- Dashboard with business statistics
- Booking management
- Booking status updates
- Follow-up management
- Payment status tracking
- Transaction management
- Newsletter subscriber management
- CRUD-based booking operations
- Customer booking confirmation
- Booking completion tracking

### 💳 Payment Management

- Razorpay payment gateway integration
- Payment tracking
- Transaction management
- Booking payment status updates
- Admin-side payment workflow

---

## 🔄 Booking Workflow

The application follows a complete customer-to-service workflow:

```text
Customer Visits Website
        ↓
Booking Enquiry
        ↓
Admin Reviews Booking
        ↓
Follow-Up
        ↓
Admin Confirms Booking
        ↓
Service Completion
        ↓
Customer payment by booking reference or agreed direct payment
        ↓
Razorpay payment verification
        ↓
Payment / transaction tracking
```

After an admin marks the service completed, the customer can pay using their booking reference and enter the amount agreed with the makeup artist. If the admin has set a final booking amount, the backend prevents payment above the remaining balance. Successful payments are recorded against the booking; partial payments are tracked and the booking is only marked fully paid once its configured total has been covered.

If the customer does not have a booking reference and Preeti has agreed to accept a direct payment, they can use the separate name-and-amount Razorpay option. This creates a standalone transaction (not attached to a booking); once Razorpay verification succeeds, the customer's name, amount, and paid status appear in the admin Payments and Transactions lists.

---

## 🛠️ Tech Stack

| Category   | Technologies            |
| ---------- | ----------------------- |
| Frontend   | HTML5, CSS3, JavaScript |
| Backend    | Python, FastAPI         |
| Database   | MongoDB                 |
| API        | REST API, Fetch API     |
| Server     | Uvicorn                 |
| Validation | Pydantic                |

---

## 🏗️ Architecture

```text
Frontend
HTML + CSS + JavaScript
        │
        │ REST API
        ▼
FastAPI Backend
        │
        │
        ▼
MongoDB
```

---

## 📁 Project Structure

```text
Preeti's website/
│
├── index.html
├── style.css
├── script.js
│
├── admin.html
├── admin.css
├── admin.js
│
├── Backend/
│   └── ...
│
├── followup-desktop.png
├── newFile.js
├── .gitignore
└── README.md
```

---

## 🚀 Run Locally

### 1. Clone

```bash
git clone https://github.com/Swati23216/preeti-website.git
cd preeti-website
```

### 2. Backend

```powershell
cd Backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure Environment

Create a `.env` file with your MongoDB configuration.

```env
MONGO_URI=your_mongodb_connection_string
DATABASE_NAME=preeti_makeup
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
ADMIN_USERNAME=choose_a_private_username
ADMIN_PASSWORD=choose_a_long_unique_password
```

Set the same environment variables in the Render Web Service settings. Do not commit credentials to the repository. After deployment, the customer site is served at `/` and the password-protected admin dashboard is at `/admin.html`. Admin API requests require the same HTTP Basic username and password.

### 4. Start API

```powershell
uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### 5. Start Frontend

Open the project using **VS Code Live Server**.

```text
index.html
```

---

## 🔌 API

Main API areas include:

```text
GET    /api/health
GET    /api/bookings
POST   /api/bookings
PUT    /api/bookings/{id}
DELETE /api/bookings/{id}
```

> Refer to the FastAPI Swagger documentation at `/docs` for the current API implementation.

---

## 💡 Technical Highlights

* Designed and developed a complete full-stack application
* Built REST APIs using **FastAPI**
* Integrated **MongoDB** for persistent data storage
* Implemented frontend-to-backend communication using JavaScript Fetch API
* Developed CRUD operations for booking management
* Created a dedicated admin dashboard
* Implemented booking, follow-up, payment, and transaction workflows
* Designed a responsive and reusable frontend interface
* Separated customer-facing and administrative functionality

---

## 👩‍💻 Developer

### Swati Janawade

**MCA Graduate | Python Developer | Full-Stack Developer**

GitHub: [github.com/Swati23216](https://github.com/Swati23216)

---

## 📂 Repository

**GitHub:**
https://github.com/Swati23216/preeti-website

---

<div align="center">

**Built with Python • FastAPI • MongoDB • HTML • CSS • JavaScript**

</div>
>>>>>>> dcd253c (Add standalone Razorpay payment flow)
