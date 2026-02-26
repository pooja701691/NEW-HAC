A production-ready QR-based Digital Attendance System designed for smart campuses and modern educational institutions.

The system ensures secure, real-time attendance tracking using:

🔐 Role-based authentication

📍 GPS-based classroom verification

⏳ Time-limited dynamic QR codes

🧠 Backend-level validation for security

🚀 Overview

This platform eliminates proxy attendance by combining:

Dynamic QR session tokens

Geo-location validation (Haversine formula)

30-second QR expiration window

Secure JWT authentication

Only students physically present within the classroom radius can mark attendance.

🏗 System Architecture
👨‍💼 Admin Module

Activate attendance session

Select classroom location via interactive map

Generate dynamic QR (valid for 30 seconds)

Monitor session status (Active / Expired)

👨‍🏫 Teacher Module

Start / End classroom session

Monitor attendance records

👩‍🎓 Student Module

Scan QR code

Auto-send GPS coordinates

Backend verifies location + session validity

Attendance marked securely

🔐 Security Model

Attendance is approved only when:

Session is Active
AND QR token is valid
AND Current Time ≤ Expiration Time
AND Student Distance ≤ Allowed Radius

Security is enforced entirely at the backend level.

🧰 Technology Stack
Frontend

React (Vite)

React Router

Axios

Tailwind CSS / shadcn UI

React Leaflet (Map Integration)

QR Code Generator

Backend

Node.js

Express.js

MongoDB + Mongoose

JWT Authentication

bcrypt

Crypto / UUID (QR Token Generation)

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
⚙️ Installation Guide
1️⃣ Clone Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
2️⃣ Backend Setup
cd server
npm install
npm run dev

Create .env file:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
3️⃣ Frontend Setup
cd client
npm install
npm run dev
🌍 Classroom Geo Configuration

Each classroom stores:

Latitude

Longitude

Allowed Radius (meters)

Admin selects coordinates using an interactive map to ensure precision.

📡 API Endpoints (Sample)
Authentication
POST /api/auth/login
Admin Session
POST /api/admin/session/start
GET  /api/admin/session/active
POST /api/admin/session/end
Attendance
POST /api/attendance/mark
📊 Key Highlights

✔ Dynamic QR auto-expiry (30 sec)
✔ GPS-based proximity validation
✔ Role-based route protection
✔ Real-time session badge tracking
✔ Scalable multi-classroom support
✔ Production-ready architecture

🧪 Future Enhancements

Live attendee count dashboard

Attendance analytics & reports

Multi-campus support

Face recognition integration

Auto-refreshing QR every 30 seconds

Mobile app integration

📜 License

This project is licensed under the MIT License.

👩‍💻 Author

Developed as a Smart Campus Digital Attendance Solution
Designed for secure, scalable, and real-world deployment.
