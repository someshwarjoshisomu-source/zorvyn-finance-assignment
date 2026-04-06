Zorvyn Finance Dashboard

A production-style full-stack financial dashboard designed to manage records, analyze financial data, and enforce structured role-based access control.

This project focuses on building a system that reflects real backend practices — clear architecture, controlled access, and reliable runtime behavior — rather than just implementing features.

What this project does

Zorvyn allows users to:

Register and authenticate securely using JWT
Manage financial records (income and expenses)
Filter, search, and paginate records efficiently
View financial summaries and analytics
Access features based on role (Viewer, Analyst, Admin)

All records are globally visible in read-only mode, while write operations are restricted to admins.

Tech Stack
Backend
Node.js + Express
MongoDB (Atlas for production)
Mongoose
JWT Authentication
Express Validator
Helmet + Rate Limiting
Morgan (request logging)
Frontend
React (Vite)
Axios
React Router
Recharts (charts & analytics)
Testing & CI
Jest + Supertest
MongoDB Memory Server
GitHub Actions
Runtime Smoke Testing
Key Features
Authentication & Users
JWT-based authentication
Secure password hashing
Role-based access (Viewer / Analyst / Admin)
Active/Inactive user handling
Financial Records
Create, update, delete (Admin only)
Read access for all roles
Soft delete to preserve historical data
Fields: amount, category, type, date, notes
Filtering & Search
Filter by type, category, and date range
Full-text search
Pagination with limits
Dashboard & Analytics
Total income, expenses, balance
Monthly and weekly trends
Category breakdown
Recent activity
Role-Based Access
Viewer
Can view all records
Can access summary dashboard
No analytics access
No write permissions
Analyst
Everything a Viewer can do
Access to analytics (charts, trends, categories)
No write permissions
Admin
Full system access
Create, update, delete records
Manage users and roles
Access all analytics
Running Locally
Backend
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
Database: MongoDB Atlas
Live API
https://your-render-app-url/api

Replace with your actual deployed URL

Health Check
https://your-render-app-url/api/health

This endpoint confirms server status and runtime health.

Production Environment Variables

Configured securely in Render:

MONGO_URI=<MongoDB Atlas connection string>
JWT_SECRET=<secure production secret>
PORT=10000
NODE_ENV=production
Notes
MongoDB Atlas is used for persistent cloud storage
No credentials are hardcoded
Environment variables are used across environments
The same codebase runs locally and in production
API Overview

Base URL:

http://localhost:3000/api
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

This project prioritizes system design and backend structure over surface-level features.

The focus was to build something that behaves predictably, enforces access correctly, and can scale with additional features — closer to a real-world system than a tutorial project.