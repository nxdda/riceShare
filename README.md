# RiceShare 🍚
> **"Sell it. Share it. Save it."**
> Sri Lanka's Surplus-Food Marketplace

RiceShare is a full-stack platform addressing food waste and food insecurity across Sri Lanka. Restaurants, hotels, bakeries, cafes, supermarkets, and event organizers can list fresh, safe surplus food in two ways:
1. **Discount Sale**: List food at 50%–70% off retail price with zero-friction "Reserve & Pay at Pickup".
2. **Free Community Donation**: Donate excess banquet or kitchen surplus directly to charities, elder care homes, and community members in need.

Built for the **SEF Hackathon**.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Architecture](#architecture)
4. [Tech Stack](#tech-stack)
5. [Local Setup](#local-setup)
6. [Environment Variables](#environment-variables)
7. [Database Setup (Neon PostgreSQL)](#database-setup-neon-postgresql)
8. [Clerk Authentication Setup](#clerk-authentication-setup)
9. [Gemini AI Assistant](#gemini-ai-assistant)
10. [Running the Application](#running-the-application)
11. [Building for Production](#building-for-production)
12. [Deployment Guide (Vercel & Render)](#deployment-guide-vercel--render)
13. [Demo Accounts & Role Switcher](#demo-accounts--role-switcher)
14. [AI Usage Explanation](#ai-usage-explanation)

---

## Project Overview

In Sri Lanka, tons of edible, high-quality food from commercial kitchens and wedding banquets are discarded daily, contributing up to 60% of municipal solid waste in the Western Province. Simultaneously, soaring food prices make nutritious meals harder to afford.

RiceShare bridges this gap with a modern marketplace:
- **Food Providers** recover preparation costs or achieve corporate social responsibility goals with zero waste.
- **Customers & Students** access hot, hygienic meals affordably.
- **Charities & Care Homes** receive free bulk food donations with verified requests.

---

## Key Features

- **Dynamic Landing Page**: Hero section, real-time national impact metrics, "How It Works" 5-step workflow diagram, and food rescue call-to-actions.
- **Food Discovery & Filtering**: Search by keyword, filter by Sri Lankan locations (Colombo, Malabe, Kaduwela, Galle, Battaramulla, etc.), filter by category (Rice & Curry, Prepared Meals, Bakery, Snacks, Desserts, Beverages), and filter by Sale vs Donation.
- **Food Details Page**: Comprehensive nutrition and portion countdown, pickup window timers, and location pin.
- **"Reserve & Pay at Pickup"**: Seamless reservation without online credit cards. Customers receive an instant reservation code and pay at the counter.
- **Community Donation Requests**: Charities submit portion requests and beneficiary reasons. Providers review, accept, or reject requests with real-time stock deduction upon acceptance.
- **Provider Dashboard**: Real-time metrics (Active listings, portions listed, reservations received, meals rescued), listings management (add, edit, close), reservation logs, and donation approval workflow.
- **Validated Add-Food Form**: Automated price validation (selling price cannot exceed original price; donation price automatically set to Rs. 0), portion verification, and pickup time validation.
- **Customer Dashboard**: Overview of confirmed reservations, donation requests, meals received, and estimated money saved in LKR.
- **Admin Governance Dashboard**: Platform-wide metrics, user directory, active listings moderation with one-click take-down, and environmental impact analytics.
- **RiceShare Food Assistant (Gemini AI)**: Floating AI chatbot providing instant guidance on reserving, donating, listing surplus food, and answering live inventory queries like *"Is there food in Malabe?"*.

---

## Architecture

```
z:/SEF-Hackathon/
├── frontend/                     # Next.js 16 (App Router, Tailwind CSS, TypeScript)
│   ├── app/                      # Page routes (Landing, Browse, Details, Dashboards, Auth)
│   ├── components/               # Navbar, Footer, FoodCard, ChatBot, ReserveModal, DonationModal
│   ├── lib/api.ts                # Strongly-typed API client connecting to backend
│   ├── proxy.ts                  # Clerk route matcher proxy (Next.js 16 standard)
│   └── .env.example
├── backend/                      # Node.js + Express + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/               # listings, reservations, donations, admin, ai, impact, users
│   │   ├── lib/store.ts          # Resilient storage manager (Prisma + in-memory fallback)
│   │   ├── lib/gemini.ts         # Google Gemini integration with live listings context & fallback
│   │   └── index.ts              # Express server with strict CORS and health checks
│   ├── prisma/
│   │   ├── schema.prisma         # PostgreSQL schema (Users, Providers, Listings, Reservations, etc.)
│   │   └── seed.ts               # Realistic Sri Lankan sample data
│   └── .env.example
├── README.md
└── AI_PROMPT_LOG.md
```

---

## Tech Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend** | Next.js 16 + React 19 | App Router, TypeScript, Responsive Tailwind CSS |
| **Icons & UI** | Lucide React | Modern minimalistic SVG icon set |
| **Backend** | Express + TypeScript | Modular RESTful API with CORS and validation |
| **Database** | Neon PostgreSQL | Serverless PostgreSQL via Prisma ORM |
| **Authentication** | Clerk | `@clerk/nextjs` with session management and user controls |
| **AI Assistant** | Google Gemini API | Server-side `gemini-1.5-flash` with dynamic context |
| **Hosting** | Vercel & Render | Frontend on Vercel, Backend API on Render |

---

## Local Setup

### Prerequisites
- Node.js 18+ (tested on Node v22.20.0)
- npm 9+

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone <repo_url>
cd SEF-Hackathon

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)
Create a `frontend/.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Backend (`backend/.env`)
Create a `backend/.env` file:
```env
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://[user]:[password]@[neon_host]/riceshare?sslmode=require
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Refer to `frontend/.env.example` and `backend/.env.example` for templates)*.

---

## Database Setup (Neon PostgreSQL)

1. Create a free PostgreSQL database at [Neon](https://neon.tech).
2. Copy your connection string into `backend/.env` as `DATABASE_URL`.
3. Push the schema and seed the initial Sri Lankan demo data:
   ```bash
   cd backend
   npx prisma db push
   npm run prisma:seed
   ```
> **Resilience Guarantee**: If `DATABASE_URL` is omitted or temporarily unreachable, RiceShare automatically activates its in-memory transactional storage pre-seeded with Sri Lankan listings so evaluation and demonstration never break!

---

## Clerk Authentication Setup

1. Create an application on [Clerk](https://clerk.com).
2. Enable Email / Google authentication in the Clerk Dashboard.
3. Configure the `proxy.ts` matcher to secure routes while keeping public endpoints accessible:
   ```ts
   '/(api|trpc)(.*)',
   '/__clerk/:path*',
   ```
4. Clear authentication controls are visible across the navbar:
   - Signed-out visitors see **Sign In** and **Sign Up**.
   - Signed-in users see the Clerk **UserButton** with account management.

---

## Gemini AI Assistant

The **RiceShare Food Assistant** is powered server-side via Google's Gemini API:
- System instructions strictly bind the assistant to RiceShare procedures (reserving, donating, listing).
- Real-time active listings are injected into context so users can ask location-based questions (e.g. *"Is there food in Malabe?"*).
- **Graceful Fallback**: If `GEMINI_API_KEY` is not provided or rate limits occur, a built-in knowledge rule engine steps in to answer accurately.

---

## Running the Application

### Start the Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Start the Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

---

## Building for Production

Both projects build cleanly with zero type or lint errors:

```bash
# Build Backend
cd backend
npm run build

# Build Frontend
cd ../frontend
npm run build
```

---

## Deployment Guide (Vercel & Render)

### Deploying Frontend to Vercel
1. Import the `frontend` directory into [Vercel](https://vercel.com).
2. Framework Preset: **Next.js**.
3. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL on Render (e.g. `https://riceshare-api.onrender.com`).
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk Production Publishable Key.
   - `CLERK_SECRET_KEY`: Clerk Production Secret Key.
4. Deploy!

### Deploying Backend to Render
1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Root Directory: `backend`.
3. Build Command: `npm install && npm run build && npx prisma generate`.
4. Start Command: `npm run start`.
5. Set Environment Variables:
   - `DATABASE_URL`: Neon PostgreSQL pooled connection URL.
   - `FRONTEND_URL`: Your Vercel frontend domain (e.g. `https://riceshare.vercel.app`).
   - `GEMINI_API_KEY`: Google AI Studio Gemini API key.
   - `CLERK_SECRET_KEY`: Clerk Secret Key.
6. Deploy!

---

## Demo Accounts & Role Switcher

For quick hackathon judging and demonstration without juggling multiple browser sessions, an interactive **Demo View Switcher** is built directly into the navigation bar:
- **Customer View**: Access the meal search, "Reserve & Pay at Pickup" checkout, free donation requests, and Customer Dashboard (`/customer/dashboard`).
- **Provider View**: Access the Provider Dashboard (`/provider/dashboard`), Add Food form (`/provider/add`), and accept/reject donation requests.
- **Admin View**: Access the platform oversight panel (`/admin/dashboard`) to view platform analytics and moderate listings.

---

## AI Usage Explanation

See [`AI_PROMPT_LOG.md`](./AI_PROMPT_LOG.md) for full records of AI-assisted development, prompt workflows, architecture synthesis, code review, and automated verification.
