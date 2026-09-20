# 🛍️ Diksha Shop

A full-stack Amazon-style e-commerce platform built from scratch.

## Tech Stack

**Frontend**
- React 18 + Vite
- TanStack Query
- Zod validation
- Plain CSS (Amazon-style UI)

**Backend**
- Node.js + Express
- JWT authentication + refresh-token rotation
- bcryptjs for password hashing
- Zod request validation
- pino structured logging
- Rate limiting

**Database**
- SQLite via better-sqlite3

## Features

- Login / Register / Forgot Password
- Debounced search (400ms)
- Multi-category filtering
- Price range filter
- Customer review filter
- Sorting (Featured, Price, Rating, Newest)
- Cursor-based pagination
- Persistent cart
- Product detail page with buy-box
- Orders + returns + refunds
- User profile + saved addresses
- Responsive design

## Getting Started

### Backend
cd backend
npm install
npm start
# → http://localhost:4000

### Frontend
cd frontend
npm install
npm run dev
# → http://localhost:3000

### Demo Credentials
- Email: demo@example.com
- Password: demo1234

## Built By

Diksha Koppad
dikshakoppad2@gmail.com
+91 8088933427

---

© 2026 Diksha Shop. All rights reserved.
