# ShopMERN — Full-Stack E-commerce Platform

A complete MERN-stack (MongoDB, Express, React, Node.js) e-commerce platform built as a portfolio/internship submission project.

---

## Architecture Overview

```
e-commerce/
├── backend/          # Express REST API
│   ├── models/       # Mongoose models (User, Product, Cart, Order)
│   ├── routes/       # Express route handlers
│   ├── middleware/   # auth, error handler, validator
│   ├── server.js     # App entry point
│   └── seed.js       # Database seeder
└── frontend/         # React (Vite) SPA
    └── src/
        ├── context/  # AuthContext, CartContext
        ├── services/ # Axios API client
        ├── pages/    # All page components
        └── components/ # Header, ProtectedRoute, AdminRoute
```

**Data flow:** React pages → Axios service → Express routes → Mongoose → MongoDB Atlas

---

## Features

| Area | Details |
|---|---|
| Auth | JWT register / login, bcrypt-hashed passwords, 7-day token |
| Products | Public listing with search (text index), category filter, pagination |
| Cart | Server-side per-user cart — add, update quantity, remove, clear |
| Orders | Checkout creates order from cart, decrements stock, clears cart |
| Admin | Product CRUD (add/edit/delete), order status management |
| UI | Responsive CSS, loading/error/empty states on every page |

The checkout uses a mock payment state (`unpaid`) because no payment provider is
configured. Inventory is reserved with conditional MongoDB updates so concurrent
checkouts cannot decrement stock below zero.

## Production Security Notes

### Frontend → Vercel

1. In [Vercel](https://vercel.com), import the same repository.
2. Set the project **Root Directory** to `frontend`.
3. Set `VITE_API_URL` to `https://<your-render-backend>.onrender.com/api`.
4. Use **Build command** `npm run build` and **Output directory** `dist`.
5. Deploy, copy the Vercel URL into Render's `CLIENT_URL`, then redeploy the backend.

The frontend `vercel.json` preserves React Router routes on refresh. MongoDB Atlas must allow the Render service to connect through its network access policy.

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce   # or your Atlas URI
JWT_SECRET=replace_with_a_long_random_secret
NODE_ENV=development
CLIENT_URL=http://localhost:5173                 # frontend origin for CORS
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally **or** a MongoDB Atlas cluster

### 1. Clone & install

```bash
# Backend
cd backend
npm install
cp .env.example .env       # then edit MONGO_URI and JWT_SECRET

# Frontend
cd ../frontend
npm install
cp .env.example .env       # VITE_API_URL already set for local dev
```

### 2. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- **Admin user** → `admin@shop.com` / `admin123`
- **Regular user** → `jane@example.com` / `password123`
- **8 sample products** across Electronics, Footwear, Accessories, Home & Kitchen, Sports & Fitness

### 3. Run both apps

```bash
# Terminal 1 — backend (http://localhost:5000)
cd backend
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## API Routes (brief test notes)

You can test all backend routes with **Postman** or **curl** after `npm run dev`:

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Returns JWT |
| GET | `/api/auth/me` | Bearer | Current user |
| GET | `/api/products` | — | List (supports `?search=&category=&page=`) |
| GET | `/api/products/categories` | — | Distinct categories |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/cart` | Bearer | Get cart |
| POST | `/api/cart` | Bearer | Add/set item `{productId, quantity}` |
| PUT | `/api/cart/:productId` | Bearer | Update item quantity |
| DELETE | `/api/cart/:productId` | Bearer | Remove item |
| DELETE | `/api/cart` | Bearer | Clear cart |
| POST | `/api/orders` | Bearer | Place order from cart |
| GET | `/api/orders/myorders` | Bearer | User's orders |
| GET | `/api/orders/:id` | Bearer/Admin | Single order |
| GET | `/api/orders` | Admin | All orders |
| PUT | `/api/orders/:id/status` | Admin | Update status |

**Quick smoke test with curl:**
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Login → copy the token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shop.com","password":"admin123"}'

# List products
curl http://localhost:5000/api/products
```

---

## Deployment

### Backend → Render

1. Push this repository to GitHub.
2. In Render, choose **New → Blueprint** and select the repository. The root `render.yaml` configures the backend service, or create a Web Service manually with `backend` as the root directory.
3. Set these environment variables in Render:
   ```
   MONGO_URI     = <your Atlas connection string>
   JWT_SECRET    = <long random string>
   CLIENT_URL    = https://<your-vercel-project>.vercel.app
   NODE_ENV      = production
   ```
4. Deploy and verify `https://<your-render-service>.onrender.com/api/health` returns `status: ok`.

### Frontend → Vercel

1. In [Vercel](https://vercel.com), import the same repository.
2. Set the project **Root Directory** to `frontend`.
3. Set `VITE_API_URL` to `https://<your-render-backend>.onrender.com/api`.
4. Use **Build command** `npm run build` and **Output directory** `dist`.
5. Deploy, copy the Vercel URL into Render's `CLIENT_URL`, then redeploy the backend.

The frontend `vercel.json` preserves React Router routes on refresh. MongoDB Atlas must allow the Render service to connect through its network access policy.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Database | MongoDB + Mongoose |
| Backend | Node.js, Express, bcryptjs, jsonwebtoken, express-validator |
| Frontend | React 18, Vite, React Router v6, Axios |
| Styling | Plain CSS (custom design system, no framework dependency) |
| Auth | JWT — stored in `localStorage`, attached via Axios interceptor |
| Deployment | Backend: Render · Frontend: Vercel |
