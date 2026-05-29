# Smart Incentive Calculator

> A role-based web application that automates monthly sales incentive calculations for vehicle Sales Officers — with configurable slabs, real-time previews, and admin reporting.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [How Incentives Work](#how-incentives-work)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Deployment](#deployment)

---

## Overview

Smart Incentive Calculator eliminates manual spreadsheet tracking for automotive sales teams. Admins define car models and incentive slabs; Sales Officers log monthly sales and instantly see their projected payout. All data is stored in Supabase (PostgreSQL), served via a JWT-secured Express API, and displayed through a React frontend.

---

## Features

| Capability | Admin | Sales Officer |
|---|:---:|:---:|
| Dashboard & analytics | ✓ | ✓ |
| In-app notifications | ✓ | ✓ |
| Manage car models | ✓ | — |
| Manage incentive slabs | ✓ | — |
| Manage users | ✓ | — |
| Reports & CSV export | ✓ | — |
| Monthly sales entry | — | ✓ |
| Real-time incentive preview | — | ✓ |
| Incentive history | All officers | Own data only |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Recharts |
| Backend | Node.js, Express.js, JWT, bcryptjs |
| Database | Supabase (PostgreSQL) |
| Deployment | Vercel (client) · Render (server) · Supabase (DB) |

---

## How Incentives Work

Total units sold across all car models in a month determine which incentive slab applies:

```
Total Incentive = Total Cars Sold × Incentive Per Car (from matched slab)
```

**Example:** 6 cars sold → matches slab 4–7 → ₹2,000/car → **₹12,000 payout**

Slabs are **date-effective** — the slab active at the first of the month is applied, allowing admins to schedule future rate changes without disrupting historical records.

**Default seed slabs:**

| Units Sold | Incentive Per Car |
|---|---|
| 1 – 3 | ₹1,000 |
| 4 – 7 | ₹2,000 |
| 8 + | ₹3,500 |

---

## Project Structure

```
incentive-calculator/
├── client/                        # React frontend (Vite)
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/             # Dashboard, Cars, Slabs, Users, Reports
│   │   │   └── officer/           # Dashboard, Sales Entry, Calculator, History
│   │   ├── components/            # Layout, shared UI primitives
│   │   ├── context/AuthContext.jsx
│   │   └── lib/api.js             # Axios API client
│   ├── .env.example
│   └── vercel.json
│
├── server/                        # Express REST API
│   ├── src/
│   │   ├── routes/                # auth, cars, slabs, sales, incentives, reports…
│   │   ├── services/
│   │   │   ├── incentive.js       # Slab matching & payout calculation
│   │   │   └── slabValidation.js
│   │   ├── middleware/            # JWT auth, RBAC, audit logging
│   │   └── index.js
│   ├── scripts/seed.js            # Seeds demo users & default slabs
│   └── .env.example
│
├── supabase/
│   └── schema.sql                 # Full PostgreSQL schema
│
└── package.json                   # Root dev scripts
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier is sufficient)

---

### 1. Database Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run the full contents of `supabase/schema.sql`.
3. From **Settings → API**, copy your **Project URL** and **service_role** key.

---

### 2. Environment Variables

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env`**

```env
PORT=5000
JWT_SECRET=your-long-random-secret
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
CORS_ORIGIN=http://localhost:5173
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3. Install & Seed

```bash
# Install all dependencies (root, client, server)
npm run install:all

# Seed demo accounts and default incentive slabs
cd server && node scripts/seed.js
```

---

### 4. Run in Development

```bash
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| API health check | http://localhost:5000/api/health |

---

### Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@incentive.com | Admin@123 |
| Sales Officer | officer@incentive.com | Officer@123 |

---

## API Reference

All protected routes require the header:

```
Authorization: Bearer <token>
```

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Authenticate and receive a JWT |
| GET / POST / PUT / DELETE | `/api/cars` | Admin | Car model CRUD |
| GET | `/api/cars/active` | Officer | List active car models |
| GET / POST / PUT / DELETE | `/api/slabs` | Admin | Incentive slab CRUD |
| GET / POST | `/api/sales` | Officer | Create and list sales entries |
| GET | `/api/sales/preview` | Officer | Real-time incentive preview (includes drafts) |
| GET | `/api/incentives/history` | Auth | Persisted monthly incentive records |
| GET | `/api/dashboard` | Admin | Analytics and summary data |
| GET | `/api/reports/*` | Admin | Report views and CSV export |
| GET / PATCH | `/api/notifications` | Auth | In-app notifications |
| GET / PUT | `/api/profile` | Auth | View and update own profile |

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Admins and Sales Officers with role enum |
| `car_models` | Vehicle models (name, suffix, variant, active/inactive) |
| `incentive_slabs` | Unit-range → per-car payout mapping with effective date |
| `sales_records` | Per-officer, per-model monthly sales (draft / submitted) |
| `incentive_calculations` | Persisted monthly payout per officer — upserted on submission |
| `notifications` | In-app alerts targeted to individual users |
| `audit_logs` | Full action trail with JSONB detail payload |

---

## Deployment

### Frontend → Vercel

1. Import the `client` directory as the Vercel project root.
2. Set build command to `npm run build` and output directory to `dist`.
3. Add `VITE_API_URL` as an environment variable pointing to your production API.

### Backend → Render

1. Create a new **Web Service** with root set to the `server` directory.
2. Set start command to `npm start`.
3. Add all `server/.env` variables as Render environment variables.

### Database → Supabase

No additional deployment steps — Supabase manages the PostgreSQL instance. Ensure your production `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` match the target project.

---

## License

MIT
