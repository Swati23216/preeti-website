# 💄 Preeti Janawade — Bridal & Party Makeup Website

> A full-stack business website with customer booking, admin dashboard, booking management, follow-ups, and payment tracking.

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge\&logo=github)](https://github.com/Swati23216/preeti-website)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square\&logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square\&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square\&logo=mongodb)](https://www.mongodb.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?style=flat-square\&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

---

## 📌 Overview

**Preeti Janawade — Bridal & Party Makeup Artist** is a full-stack web application developed to provide a professional online presence and streamline booking management.

The project includes a **customer-facing website** and a separate **admin dashboard** for managing business operations.

---

## ✨ Key Features

### Customer Website

* Responsive professional makeup artist website
* Bridal & party makeup service showcase
* Booking enquiry form
* WhatsApp-based customer communication
* FAQ accordion
* Contact information
* Mobile-responsive UI
* Premium wine & gold themed design

### Admin Dashboard

* Dashboard with business statistics
* Booking management
* Booking status updates
* Follow-up management
* Payment status tracking
* Transaction management
* Newsletter subscriber management
* CRUD-based booking operations

### Booking Workflow

```text
Customer Enquiry
      ↓
Booking Management
      ↓
Follow-Up
      ↓
Confirmation
      ↓
Payment Tracking
      ↓
Service Completion
```

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
```

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
