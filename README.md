# 🌌 DIGITAL VIDHYA  
### 🏫 Smart Campus Attendance & Digital Classroom Platform  
### 🎓 Buddha Institute of Technology  

---

![GitHub stars](https://img.shields.io/github/stars/pooja701691/NEW-HAC?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/pooja701691/NEW-HAC?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge&logo=mongodb)

---

## 🌟 Project Overview

**DIGITAL VIDHYA** is a modern **QR-based Smart Attendance System** designed to convert traditional classrooms into a secure **Geo-Verified Digital Campus**.

It prevents proxy attendance using:

- 📍 Geo-Location Validation  
- 🔐 Secure JWT Authentication  
- ⏳ 30-Second Dynamic QR Codes  
- 👩‍🏫 Role-Based Access (Admin / Teacher / Student)

---

## 🚀 Core Features

### 👩‍💼 Admin Module
- Create & manage **Classrooms**
- Store **Latitude & Longitude**
- Monitor attendance logs

### 👨‍🏫 Teacher Module
- Start **Active Session**
- Generate **QR Code (30 sec TTL)**
- View **Live Attendance Count**
- End session anytime

### 👨‍🎓 Student Module
- Secure login
- Scan QR
- Auto attendance submission
- Geo-location verification within classroom radius

---

## 🔐 Security Features

- JWT Authentication  
- Password hashing with bcrypt  
- Rate Limiting  
- CORS Protection  
- QR Expiry Validation  
- Geo-Fence Distance Verification  

---

## 🗺️ System Workflow

1. Admin creates classroom with geo-coordinates  
2. Teacher starts attendance session  
3. System generates QR (valid for 30 seconds)  
4. Student scans QR  
5. Browser captures GPS location  
6. Backend verifies distance  
7. Attendance marked if inside allowed radius  

---

## 🛠️ Tech Stack

| Layer        | Technology |
|-------------|------------|
| Frontend    | React.js + TailwindCSS + ShadCN UI |
| Backend     | Node.js + Express.js |
| Database    | MongoDB |
| Auth        | JWT |
| QR Engine   | qrcode npm package |
| Security    | bcrypt, express-rate-limit |

---

## 📦 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/pooja701691/NEW-HAC.git
cd NEW-HAC
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm start
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
NEW-HAC/
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── hooks/
│
└── README.md
```

---

## 🎯 Use Cases

- Colleges  
- Universities  
- Coaching Institutes  
- Smart Campus Initiatives  
- Hackathon Demonstrations  

---

## 🏆 Why DIGITAL VIDHYA?

- Modern UI  
- Real-Time QR Attendance  
- Geo-Based Validation  
- Enterprise-Level Security  
- Scalable Architecture  

---

## 🚀 Transforming Traditional Classrooms into Smart Digital Campuses
