# AI Prompt Log: RiceShare Development

This document records the AI-assisted workflows and engineering prompts used during the development of the **RiceShare** surplus-food marketplace application.

---

## 1. Domain Modeling & Prisma Schema Design

- **Tool**: Google Antigravity Coding Agent (powered by Gemini)
- **Purpose**: Design the relational PostgreSQL database schema for users, providers, surplus listings, reservations, donation requests, and moderation reports.
- **Exact Prompt**:
  > "Design a clean PostgreSQL Prisma schema for RiceShare supporting SALE (with original & selling prices) and DONATION (free grants) listings. Include User, Provider, Listing, Reservation, DonationRequest, and Report models with status enums and relations."
- **What was Generated**:
  - `backend/prisma/schema.prisma` containing models: `User`, `Provider`, `Listing`, `Reservation`, `DonationRequest`, and `Report`.
  - Status enums: `Role`, `ListingType`, `ListingStatus`, `ReservationStatus`, `DonationStatus`, `ReportStatus`.
- **How it was Reviewed & Modified**:
  - Added indexes on `location`, `category`, and `listingType` for optimized marketplace search filtering.
  - Linked `clerkUserId` with unique constraint to map Clerk identities to database users.
- **How it was Tested**:
  - Ran `npx prisma generate` to confirm syntax validity and TypeScript client generation.

---

## 2. Resilient Storage Layer with Database Fallback

- **Tool**: Google Antigravity Coding Agent
- **Purpose**: Ensure the application never crashes during demonstration if PostgreSQL/Neon is not yet provisioned.
- **Exact Prompt**:
  > "Implement a hybrid storage manager that connects to PostgreSQL via Prisma when DATABASE_URL is available, and falls back to an in-memory transactional store initialized with realistic Sri Lankan sample data (Malabe, Colombo, Kaduwela). Ensure atomic stock reduction on reservations and donation approvals."
- **What was Generated**:
  - `backend/src/lib/store.ts` and `backend/src/data/seedData.ts`.
- **How it was Reviewed & Modified**:
  - Added atomic portion decrements to prevent negative stock.
  - Added transition to `SOLD_OUT` status when remaining quantity reaches 0.
- **How it was Tested**:
  - Verified with `Invoke-RestMethod` reservation creation and verified remaining quantity decreased from 12 to 10 portions.

---

## 3. RiceShare Food Assistant (Gemini AI Chatbot)

- **Tool**: Google Antigravity Coding Agent
- **Purpose**: Specialized, server-side chatbot answering RiceShare questions with live inventory awareness.
- **Exact Prompt**:
  > "Implement a Gemini API service using @google/generative-ai for the RiceShare Food Assistant. Strictly constrain system instructions to RiceShare, inject live available food listings as context for location questions, and provide a comprehensive fallback engine."
- **What was Generated**:
  - `backend/src/lib/gemini.ts` and route `backend/src/routes/ai.ts`.
- **How it was Reviewed & Modified**:
  - Integrated location detection for Sri Lankan hubs (Malabe, Colombo, Kaduwela, Galle, Battaramulla).
  - Ensured system prompt forbids inventing payment gateways (emphasizing "Reserve & Pay at Pickup").
- **How it was Tested**:
  - Tested `POST /api/ai/chat` with queries `"Is there food in Malabe?"` and `"How do I donate food?"`, receiving accurate inventory and policy answers.

---

## 4. Frontend Architecture & Next.js 16 Implementation

- **Tool**: Google Antigravity Coding Agent
- **Purpose**: Create modern, responsive marketplace pages with Tailwind CSS, Next.js 16 App Router, and Clerk authentication.
- **Exact Prompt**:
  > "Build the full set of frontend pages: Landing page with hero & impact metrics, Browse page with search & multi-select filters, Food Details page with Reserve & Donation modals, Provider Dashboard, Add Food form with validation, Customer Dashboard, and Admin Dashboard."
- **What was Generated**:
  - `frontend/app/page.tsx`
  - `frontend/app/browse/page.tsx`
  - `frontend/app/listings/[id]/page.tsx`
  - `frontend/app/provider/dashboard/page.tsx`
  - `frontend/app/provider/add/page.tsx`
  - `frontend/app/customer/dashboard/page.tsx`
  - `frontend/app/admin/dashboard/page.tsx`
  - `frontend/components/Navbar.tsx`, `Footer.tsx`, `FoodCard.tsx`, `ChatBot.tsx`, `ReserveModal.tsx`, `DonationModal.tsx`
- **How it was Reviewed & Modified**:
  - Updated Clerk components to support Clerk v7 standards (`proxy.ts` matcher order and `useUser()` hook checks).
  - Added `export const dynamic = 'force-dynamic'` to prevent build-time static fetch failures when the backend is offline during build.
- **How it was Tested**:
  - Executed `npm run build` in both `frontend` and `backend` (both passing with 0 errors).
  - Verified HTTP 200 responses across all application routes.

---

## 5. Food Imagery Integration & Custom Image Upload Function

- **Tool**: Google Antigravity Coding Agent
- **Purpose**: Add authentic Sri Lankan food images to existing sample listings and implement image attachment functionality (device upload, URL, and preset selection) when listing new surplus items.
- **Exact Prompt**:
  > "Add images related to the already listed items. And, add a function to add an image when listing a new food item."
- **What was Generated**:
  - Updated `backend/src/types/index.ts`, `backend/prisma/schema.prisma`, `backend/src/data/seedData.ts`, and `backend/src/routes/listings.ts` to support `imageUrl`.
  - Updated `frontend/lib/api.ts`, `frontend/components/FoodCard.tsx`, `frontend/app/listings/[id]/page.tsx`, and `frontend/app/provider/add/page.tsx`.
- **How it was Reviewed & Modified**:
  - Enabled device file upload with base64 Data URL conversion so local files work across any environment without external S3 credentials.
  - Added 7 curated Sri Lankan food preset buttons (Rice & Curry, Fried Rice, Kottu, Bakery, Short Eats, Desserts, Juice) for one-click photo selection.
  - Implemented live preview with remove photo functionality.
- **How it was Tested**:
  - Successfully created a new listing `"Egg & Seeni Sambol Pastry Pack"` with attached image.
  - Re-ran `npm run build` on both frontend and backend (both passing with exit code 0).

---

## 6. Landing Page UI Overhaul & High-Contrast Design System

- **Tool**: Google Antigravity Coding Agent
- **Purpose**: Resolve dark mode bleeding / contrast issue and modernize the landing page into a vibrant, high-converting surplus-food marketplace experience.
- **Exact Prompt**:
  > "Improve the UI of this landing page" (with screenshot showing dark background bleeding and hard-to-read text)
- **What was Generated**:
  - `frontend/app/globals.css`: Enforced explicit clean light mode theme (`--background: #ffffff`, `--foreground: #0f172a`, `color-scheme: light`), eliminating dark mode collisions.
  - `frontend/app/page.tsx`: Complete overhaul featuring:
    1. **Modern 2-Column Hero**: High-contrast headline, clear typography, warm amber glow gradients, dual primary CTA buttons with hover lift.
    2. **Interactive Live Showcase Card**: Real-time listing preview with live countdown badge, price discount chip, verified provider pill, and quick reserve trigger.
    3. **Popular City & Category Filter Strip**: Quick jump pills for Sri Lankan culinary hubs (Colombo, Malabe, Kaduwela, Galle, Battaramulla).
    4. **Four Metric Value Counters**: Meals Rescued, Free Meals Donated, Money Saved (LKR), and Verified Providers with distinct colorful iconography.
    5. **Dual Pathway Cards (Sell vs Donate)**: Clean visual distinction between commercial surplus discounting and charity/community donation grants.
    6. **3-Step How-It-Works Progression**: Intuitive step cards for both hungry customers and food business owners.
- **How it was Reviewed & Modified**:
  - Tested responsive breakpoints for desktop, tablet, and mobile displays.
  - Ensured dynamic server fetching of live available listings and real-time impact metrics from the backend.
- **How it was Tested**:
  - Executed `npm run build` (compiled cleanly via Turbopack with 0 errors).
  - Verified HTTP 200 response on `http://localhost:3000/`.
