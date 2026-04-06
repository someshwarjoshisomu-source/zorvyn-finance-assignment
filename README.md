# Zorvyn Finance Dashboard

A production-style full-stack financial dashboard designed to manage records, analyze financial data, and enforce structured role-based access control.

This project focuses on building a system that reflects real backend practices — clear architecture, controlled access, and reliable runtime behavior — rather than just implementing features.

---

## What this project does

Zorvyn allows users to:

- Register and authenticate securely using JWT  
- Manage financial records (income and expenses)  
- Filter, search, and paginate records efficiently  
- View financial summaries and analytics  
- Access features based on role (Viewer, Analyst, Admin)  

All records are globally visible in read-only mode, while write operations are restricted to admins.

---

## Tech Stack

### Backend
- Node.js + Express  
- MongoDB (Atlas for production)  
- Mongoose  
- JWT Authentication  
- Express Validator  
- Helmet + Rate Limiting  
- Morgan (request logging)  

### Frontend
- React (Vite)  
- Axios  
- React Router  
- Recharts (charts & analytics)  

### Testing & CI
- Jest + Supertest  
- MongoDB Memory Server  
- GitHub Actions  
- Runtime Smoke Testing  

---

## Key Features

### Authentication & Users
- JWT-based authentication  
- Secure password hashing  
- Role-based access (Viewer / Analyst / Admin)  
- Active/Inactive user handling  

### Financial Records
- Create, update, delete (Admin only)  
- Read access for all roles  
- Soft delete to preserve historical data  
- Fields: amount, category, type, date, notes  

### Filtering & Search
- Filter by type, category, and date range  
- Full-text search  
- Pagination with limits  

### Dashboard & Analytics
- Total income, expenses, balance  
- Monthly and weekly trends  
- Category breakdown  
- Recent activity  

---

## Role-Based Access

### Viewer
- Can view all records  
- Can access summary dashboard  
- No analytics access  
- No write permissions  

### Analyst
- Everything a Viewer can do  
- Access to analytics (charts, trends, categories)  
- No write permissions  

### Admin
- Full system access  
- Create, update, delete records  
- Manage users and roles  
- Access all analytics  

---

## Running Locally

### Backend

```bash
cd zorvyn-backend
npm install

Create .env:

MONGO_URI=mongodb://127.0.0.1:27017/zorvyn
JWT_SECRET=your_secret_key_min_32_characters
PORT=3000
NODE_ENV=development

Start server:

npm run dev
Frontend
cd zorvyn-backend/zorvyn-frontend
npm install
npm run dev

Frontend runs on:

http://localhost:5173
Deployment

The application is deployed using a cloud-based setup:

Backend: Render
Frontend: Vercel
Database: MongoDB Atlas
Live Application

Frontend:
https://zorvyn-finance-assignment-mu.vercel.app

Backend API:
http://zorvyn-finance-assignment-1.onrender.com/api

Health Check

http://zorvyn-finance-assignment-1.onrender.com/api/health

This endpoint confirms server status and runtime health.

Environment Variables

Create a .env file in the backend root:

PORT=3000
MONGO_URI=<your_mongodb_atlas_connection_string>
JWT_SECRET=<your_secure_secret_key>
JWT_EXPIRE=7d
NODE_ENV=development

Note:
Never commit your actual .env file or secrets (Mongo URI, JWT secret) to GitHub.
Use environment variables in your deployment platform (Render) instead.

API Overview
Base URL

Local:

http://localhost:3000/api

Production:

http://zorvyn-finance-assignment-1.onrender.com/api
Auth
POST /auth/register
POST /auth/login
Users
GET /users/me
PATCH /users/me
Admin-only user management routes
Records
GET /records
POST /records (Admin)
PATCH /records/:id (Admin)
DELETE /records/:id (Admin)
Dashboard
/dashboard/summary
/dashboard/trends
/dashboard/categories
Runtime Reliability

The backend includes runtime safeguards:

Health check endpoint (/api/health)
Version endpoint (/api/version)
Smoke test for runtime validation
Environment validation on startup

Run smoke test:

npm run smoke:runtime
CI Pipeline

GitHub Actions automatically:

Runs backend tests
Starts server and performs smoke test
Builds frontend
Enforces bundle size limit

This ensures the app is not only building, but actually running correctly.

Architecture
Client → Middleware → Controller → Service → Database
Controllers handle requests
Services handle business logic
Middleware handles authentication, validation, and errors
Design Decisions
Service Layer

Separates business logic from controllers, improving maintainability.

Soft Delete

Preserves data for analytics and prevents accidental loss.

Global Read Access

All roles can view records; only admins can modify them.

Layered RBAC

Authorization enforced at both route and service levels.

Known Limitations
No password reset
No audit logging system
Limited automated test coverage
No real-time updates
No export functionality
No multi-tenant support
Testing Status

Basic tests cover:

Authentication
RBAC enforcement
Core record flows

Test coverage is currently limited and can be expanded further.

Final Note

This project was built with a strong emphasis on backend architecture, access control, and production-like behavior rather than just UI features.

Key priorities included:

Enforcing strict role-based access control across the entire system
Maintaining a clean separation between controllers, services, and data layers
Ensuring consistent API behavior across environments (local, CI, production)
Building a system that is predictable, debuggable, and extensible

The goal was not just to complete the assignment, but to demonstrate how a real-world backend system should be structured and reasoned about.