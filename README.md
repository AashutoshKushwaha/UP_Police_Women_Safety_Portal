# UP Police Women Safety Portal

![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express.js](https://img.shields.io/badge/Framework-Express.js-lightgrey)
![React](https://img.shields.io/badge/Frontend-React-blue)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Security](https://img.shields.io/badge/Security-bcrypt-red)
![License](https://img.shields.io/badge/License-Not%20Specified-lightgrey)

A **Women’s Safety Portal** for Uttar Pradesh designed to manage driver verification through a secure, role-based database system.  
The portal implements **hashed authentication** for administrators, **JWT-based authorization** for multiple user roles, and **QR-code-based verification** for police officers in the field.

---

##  Project Objective

The objective of this portal is to create a secure and scalable verification system where:

- Drivers can submit their details for verification  
- Police stations and officers can verify or reject submissions  
- Admins can manage users, stations, and final approvals  
- Police officers can scan QR codes to instantly retrieve verified driver details  

---

##  Key Features

1. Guided **Driver Signup**  
2. Driver **Username & Password Registration**  
3. Driver **Login**  
4. Driver **Data Submission** with strict validation rules  
5. Driver Dashboard showing **Pending Verification**  
6. **Police Admin Login**  
7. Admin-managed **Police Officers & Police Stations**  
8. Police Station Dashboard for **Verification / Rejection** with history  
9. Police Admin Dashboard with station updates & final verification  
10. Verified User Dashboard with **QR Code** and **Verification Certificate Download**  
11. Police Officer Login (credentials issued by Admin)  
12. Police Officer **QR Scan** using camera to fetch driver details instantly  

---

## 🛠️ Tech Stack

### Backend
- Node.js  
- Express.js  
- MongoDB with Mongoose  
- JSON Web Tokens (JWT)  
- bcrypt (password hashing)  
- dotenv (environment variables)  
- CORS  
- Morgan (logging)  
- QRCode (QR generation)  

### Frontend
- React.js (Create React App)  
- HTML5  
- CSS3  
- JavaScript  
- Axios  
- Browser-based QR scanning  

### Database
- MongoDB  
- Collections for:
  - Drivers  
  - Police Officers  
  - Police Stations  
  - Admins  

---

##  Security Architecture

- **Password Hashing:** bcrypt  
- **JWT Authentication:** Token-based session handling  
- **Role-Based Access Control:**  
  - Admin  
  - Police Station  
  - Police Officer  
  - Driver  
- **Environment Variables:** Stored in `.env`  
- **Protected APIs:** JWT middleware enforcement  

---

##  Installation & Setup

###  Clone the Repository
```bash
git clone https://github.com/AashutoshKushwaha/UP_Police_Women_Safety_Portal.git
cd UP_Police_Women_Safety_Portal
```

---

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create `.env` inside `backend/`:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

Run backend:
```bash
npm start
```

Backend URL:
```
http://localhost:5000
```

---

###  Frontend Setup
```bash
cd ../frontend
npm install
npm start
```

Frontend URL:
```
http://localhost:3000
```

---

##  Application Workflow

### Driver
- Signup → Login → Submit Details  
- Status: Pending / Approved / Rejected  
- After approval: Download QR & Certificate  

### Police Station
- View assigned submissions  
- Verify or reject drivers  
- Maintain verification history  

### Police Admin
- Create police stations & officers  
- Assign verification responsibilities  
- Final approval authority  

### Police Officer
- Login using admin-issued credentials  
- Scan QR code to retrieve driver details  

---

##  Screenshots & Demo

Screenshots are available in:
```
Portal_Demo_Screenshots/
```

Includes:
- Driver Portal  
- Admin Dashboard  
- Police Station Dashboard  
- QR Verification Flow  

---

##  Deployment

- Backend: Heroku / AWS / Render  
- Frontend: Netlify / Vercel  

Frontend build:
```bash
npm run build
```

Ensure environment variables are configured on deployment.

---

##  License

No license file is currently present in the repository.  
All rights are reserved by the project author unless stated otherwise.
