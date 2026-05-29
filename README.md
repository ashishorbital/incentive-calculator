# Smart Incentive Calculator

Role-based web application for automating monthly sales incentives for vehicle Sales Officers, with configurable incentive slabs managed by administrators.

## Features

| Module | Admin | Sales Officer |
|--------|-------|---------------|
| Dashboard & analytics | Yes | Yes |
| Manage cars, slabs, users | Yes | No |
| Monthly sales entry | No | Yes |
| Real-time incentive calculator | No | Yes |
| Incentive history | Limited | Own data |
| Reports & CSV export | Yes | No |
| In-app notifications | Yes | Yes |

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Recharts
- **Backend:** Express.js, Node.js, JWT, bcrypt
- **Database:** Supabase (PostgreSQL)

## Quick Start

### 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Copy **Project URL** and **service_role** key (Settings → API).

### 2. Environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env`:

```env
PORT=5000
JWT_SECRET=change-me-to-a-long-random-string
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
CORS_ORIGIN=http://localhost:5173
```

### 3. Install & seed

```bash
npm run install:all
cd server && node scripts/seed.js
```

### 4. Run

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000/api/health  

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@incentive.com | Admin@123 |
| Sales Officer | officer@incentive.com | Officer@123 |

## Incentive formula

For a given month, total units sold (all models) determine the slab:

```
Total Incentive = Total Cars Sold × Incentive Per Car (from matched slab)
```

Example: 6 cars → slab 4–7 @ ₹2,000/car → **₹12,000**

Default seed slabs: 1–3 @ ₹1,000 | 4–7 @ ₹2,000 | 8+ @ ₹3,500

## API overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/login` | Login (JWT) |
| `GET /api/cars` | Admin car CRUD |
| `GET /api/cars/active` | Active models (officers) |
| `GET/POST /api/slabs` | Slab management |
| `GET/POST /api/sales` | Sales entries & submit |
| `GET /api/sales/preview` | Real-time calculation |
| `GET /api/incentives/history` | History |
| `GET /api/dashboard` | Admin analytics |
| `GET /api/reports/*` | Reports & CSV export |

## Deployment

- **Frontend:** Vercel (`client`, build `npm run build`, output `dist`)
- **Backend:** Render (root `server`, start `npm start`)
- **Database:** Supabase (managed PostgreSQL)

Set `VITE_API_URL` to your deployed API URL in production.

## Project structure

```
incentive-web-app/
├── client/          # React frontend
├── server/          # Express API
├── supabase/        # SQL schema
└── README.md
```
