# 🚀 API Key Management Portal – Setup & Run Guide

### 📦 Prerequisites
Make sure you have the following installed:
- Node.js (v18 or later)
- npm
- PostgreSQL 

---

## 🧩 Backend Setup

### 1️⃣ Navigate to backend folder
```bash
cd backend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Configure environment variables  
Create a `.env` file inside the `backend` folder:
```env
PORT=5000
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://neondb_owner:npg_YP5vAhfJIrs9@ep-curly-rain-a4javrlt-pooler.us-east-1.aws.neon.tech/api_key_portal?sslmode=require&channel_binding=require

```

### 4️⃣ Run backend server
```bash
npm run dev
```
Backend runs at 👉 **http://localhost:5000**

---

## 💻 Frontend Setup

### 1️⃣ Navigate to frontend folder
```bash
cd frontend
```

### 2️⃣ Install dependencies
```bash
npm install
```

### 3️⃣ Update backend API URL  
In `src/api/config.ts`, set:
```ts
export const API_BASE_URL = "http://localhost:5000";
```

### 4️⃣ Run frontend app
```bash
npm start
```
Frontend runs at 👉 **http://localhost:3000**

---

## 🗃️ Database Setup
Run the following SQL (or ORM migration) to create tables:
```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  organization VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES clients(id),
  key_hash TEXT NOT NULL,
  key_prefix VARCHAR(10) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',
  start_date TIMESTAMP NOT NULL,
  expiry_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🧪 Testing
- Admin Login → `/api/auth/login`
- Client Management → `/api/clients`
- Dashboard → `/api/dashboard/metrics`
- Public API → `/api/client/details`

Use the included **Postman collection** in `/docs` to test all routes.

---

## ✅ Default Ports
Backend API - http://localhost:5000 
Frontend App - http://localhost:3000 

---

**Developed by:** Tinesh Warake  
**Stack:** React · Node.js · Express · PostgreSQL · JWT · bcrypt
