# Coop Order Exchange

A campus marketplace mobile app where students with excess meal swipes (Sharers) place Coop mobile orders on behalf of students who want more meals (Requesters). Swipes are donated for free — no payment involved.

Built with **Expo** (React Native), **Supabase** (database, auth, storage, realtime), and **TanStack Query**.

## Features

- **Email OTP Authentication** — WLU students only (`@mail.wlu.edu`)
- **Post & Request System** — Sellers post available capacity, buyers request orders
- **6-Step Order Workflow** — Requested → Accepted → Ordered → Picked Up → Completed
- **Proof Uploads** — Photo proof for order placement (anti-scam)
- **In-App Chat** — Real-time messaging between buyer and seller per order
- **Ratings** — Mutual rating system after order completion
- **Disputes** — Open disputes within 24 hours, admin resolution
- **Audit Log** — All status transitions tracked server-side
- **Row Level Security** — Users can only access their own data
- **Admin Panel** — Dispute management for admin users

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **Anon Key** from Settings → API

### 2. Run Database Migrations

In the Supabase SQL Editor, run these files **in order**:

1. `supabase/migrations/001_tables.sql` — Creates all tables, indexes, and triggers
2. `supabase/migrations/002_rls_policies.sql` — Enables Row Level Security policies
3. `supabase/migrations/003_rpc_functions.sql` — Creates server-side RPC functions

### 3. Configure Supabase Auth

1. Go to Authentication → Providers
2. Enable **Email** provider
3. Enable **Confirm email** (OTP mode)
4. Set email template if desired

### 4. Create Storage Bucket

1. Go to Storage
2. Create a new bucket called `proofs`
3. Set it to **private** (signed URLs are used for access)

### 5. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 6. Install & Run

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone (iOS or Android).

## Project Structure

```
src/
├── lib/           # Supabase client, constants, utils
├── types/         # TypeScript types (database, navigation)
├── providers/     # Auth & Query providers
├── hooks/         # Custom hooks for all data operations
├── components/    # Reusable UI and domain components
├── screens/       # All app screens
└── navigation/    # React Navigation structure
```

## Order Workflow

```
Requested → Accepted → Ordered → Picked Up → Completed
    ↓          ↓
 Cancelled  Cancelled  → Disputed (from Ordered/PickedUp/Completed)
```

All status transitions are enforced server-side via Supabase RPC functions with role validation and audit logging.

## Tech Stack

- **Expo SDK 54** — Cross-platform mobile framework
- **Supabase** — PostgreSQL database, Auth, Storage, Realtime
- **TanStack Query** — Data fetching and caching
- **React Hook Form + Zod** — Form handling and validation
- **React Navigation v7** — Native stack and tab navigation
