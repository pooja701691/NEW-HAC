🌌 DIGITAL VIDHYA
🏫 Smart Campus Attendance & Digital Classroom Platform
🎓 Buddha Institute of Technology
<p align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=200&section=header&text=DIGITAL%20VIDHYA&fontSize=45&fontColor=ffffff&animation=fadeIn" /> </p>
<p align="center">












</p>
🌟 Project Vision

DIGITAL VIDHYA is a next-generation Smart Attendance & Classroom Management System designed to transform traditional college infrastructure into a secure, geo-verified digital campus.

It eliminates proxy attendance using:

📍 Geo-Location Validation

🔐 Secure JWT Authentication

📲 Time-Limited Dynamic QR Codes

👩‍🏫 Role-Based Access (Admin / Teacher / Student)

🧊 Glassmorphism Inspired Architecture
+-------------------+
|   Admin Panel     |
|  (Manage Rooms)   |
+-------------------+
          ↓
+-------------------+
| Teacher Dashboard |
|  Start Session    |
|  Generate QR      |
+-------------------+
          ↓
+-------------------+
|   QR (30 sec)     |
|  Geo-Validated    |
+-------------------+
          ↓
+-------------------+
| Student Scanner   |
|  Auto Attendance  |
+-------------------+
🚀 Core Features
👩‍💼 Admin Module

Create & manage Classrooms

Upload Geo Coordinates

Monitor session logs

👨‍🏫 Teacher Module

Start Active Session

Auto-Generate QR (30 sec TTL)

View Live Attendance Count

Close session anytime

👨‍🎓 Student Module

Secure Login

Scan QR

Auto Post Attendance

Location Verification within classroom radius

🔐 Security Layer

✔ JWT Token Authentication
✔ Rate Limiting
✔ QR Expiry (Auto Invalid after 30 sec)
✔ Geo-Fence Radius Validation
✔ Role Based Middleware

🗺️ Geo Location Flow

Admin saves classroom latitude & longitude

Teacher starts session linked to classroom

Student scans QR

Browser fetches GPS

Backend verifies distance

Attendance marked if inside radius

🛠️ Tech Stack
Layer	Technology
Frontend	React.js + TailwindCSS + ShadCN UI
Backend	Node.js + Express.js
Database	MongoDB
Authentication	JWT
QR Engine	qrcode npm package
Security	bcrypt, rate-limit, CORS
📊 Animated Workflow
<p align="center"> <img src="https://readme-typing-svg.herokuapp.com?color=00F7FF&size=22&center=true&vCenter=true&width=600&lines=Admin+Creates+Classroom;Teacher+Starts+Session;QR+Generates+(30s);Student+Scans;Geo+Verified;Attendance+Marked+Securely" /> </p>
📦 Installation Guide
1️⃣ Clone Repository
git clone https://github.com/pooja701691/NEW-HAC.git
cd NEW-HAC
2️⃣ Backend Setup
cd backend
npm install
npm start
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev
📁 Project Structure
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
🎯 Use Case

✔ Colleges
✔ Universities
✔ Coaching Institutes
✔ Hackathon Demonstrations
✔ Smart Campus Initiatives

🏆 Why This Project Stands Out

💎 Modern UI
📍 Location-Based Validation
⚡ Real-Time Session Handling
🔒 Enterprise-Ready Security
🏫 Buddha Institute Smart Campus Vision

<p align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=0:1c1c1c,100:2c5364&height=120&section=footer"/> </p>
