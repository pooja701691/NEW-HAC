🚀 Smart Campus QR Attendance System
<p align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,100:2c5364&height=200&section=header&text=Smart%20QR%20Attendance%20System&fontSize=35&fontColor=ffffff&animation=fadeIn" /> </p> <p align="center"> <img src="https://img.shields.io/github/stars/your-username/your-repo?style=for-the-badge" /> <img src="https://img.shields.io/github/forks/your-username/your-repo?style=for-the-badge" /> <img src="https://img.shields.io/github/license/your-username/your-repo?style=for-the-badge" /> <img src="https://img.shields.io/github/issues/your-username/your-repo?style=for-the-badge" /> </p> <p align="center"> <img src="https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/> <img src="https://img.shields.io/badge/Framework-Express-black?style=for-the-badge&logo=express&logoColor=white"/> <img src="https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/> <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black"/> <img src="https://img.shields.io/badge/Auth-JWT-blue?style=for-the-badge"/> </p>
📌 About The Project

A production-ready QR-Based Smart Attendance System designed for modern campuses.

It ensures:

📍 GPS-based classroom verification

🔐 Secure JWT authentication

⏳ 30-second dynamic QR expiry

🚫 Proxy attendance prevention

🧠 Backend validation enforcement

🏗 System Workflow
✨ Key Features
👨‍💼 Admin Panel

Map-based classroom location selection

Session activation

Live session badge (Active / Expired)

Secure QR generation

👩‍🎓 Student Module

QR scan interface

Auto GPS capture

Real-time attendance submission

🔐 Security Highlights

Role-based route protection

Time-limited QR token

Haversine distance calculation

Backend-only validation logic

📂 Project Structure
client/
 ├── components/
 ├── pages/
 ├── context/
 ├── routes/

server/
 ├── models/
 ├── controllers/
 ├── routes/
 ├── middleware/
 ├── utils/
⚙️ Installation
1️⃣ Clone Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
2️⃣ Backend Setup
cd server
npm install
npm run dev

Create .env file:

PORT=5000
MONGO_URI=your_mongo_connection
JWT_SECRET=your_secret_key
3️⃣ Frontend Setup
cd client
npm install
npm run dev
🧠 Security Logic

Attendance is approved only if:

Session Active
AND QR Not Expired
AND Distance ≤ Allowed Radius

All validations happen on backend.

📊 Tech Stack
Layer	Technology
Frontend	React, Tailwind, React Router
Backend	Node.js, Express
Database	MongoDB
Auth	JWT + bcrypt
Maps	React Leaflet
QR	Dynamic Token Based
🌍 Classroom Geo Verification

Each classroom stores:

Latitude

Longitude

Allowed radius (meters)

Students must be physically inside the defined GPS radius.

🏆 Future Roadmap

📈 Live attendee counter

📊 Attendance analytics dashboard

📱 Mobile application

🔄 Auto QR refresh every 30 sec

🎭 Face recognition integration

📸 Screenshots (Add Your UI Here)
Add screenshots inside /screenshots folder
Then use:

![Dashboard](./screenshots/dashboard.png)
![QR Screen](./screenshots/qr.png)
📜 License

MIT License © 2026

<p align="center"> <img src="https://capsule-render.vercel.app/api?type=waving&color=0:2c5364,100:0f2027&height=120&section=footer"/> </p>
