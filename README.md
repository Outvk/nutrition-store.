# Nutrition Store — Production Grade E-Commerce

This is an upgraded, production-ready version of the Nutrition Store MVP. It features a complete industrial design language ("Command Center" aesthetic) and a robust, senior-level backend architecture.

## 🚀 Key Improvements & Senior Features

### 1. Atomic Order Placement (Anti-Race Condition)
We replaced client-side sequential database operations with a single, atomic **PostgreSQL RPC** (`place_order`).
-   **Guaranteed Integrity**: Order insertion, item mapping, and stock decrement occur in a single transaction.
-   **Strict Stock Control**: Using the `UPDATE ... WHERE ... AND stock >= quantity` pattern to prevent negative stock during high-traffic surges.
-   **Rollback Mechanism**: Any failure at any step (e.g., product becomes unavailable) rolls back the entire transaction.

### 2. Strict Type Safety
-   **Zero `any` Codebase**: Eliminated all `any` types. Integrated custom interfaces for all database entities and complex JSONB structures.
-   **ESLint Enforcement**: Enabled `@typescript-eslint/no-explicit-any: error` in the project configuration.
-   **Centralized Domain Types**: All core models reside in `@/types/index.ts`.

### 3. Server-Side Price Validation
-   **Price Integrity**: The system completely ignores `unit_price` sent by the client.
-   **On-the-Fly Calculation**: The `POST /api/orders` route fetches the latest prices directly from Supabase, recalculates the subtotal, and verifies product availability/active status before processing.

### 4. Direct Delivery Management
-   **Dynamic Lookups**: Hardware-coded delivery fees were removed from the frontend configuration.
-   **Wilaya RPC**: Integrated a custom Supabase function `get_delivery_fee(wilaya_name)` that consults a dynamic DB table and falls back to a global store settings default.

### 5. Advanced Security & Hygiene
-   **Environment Protection**: Implemented a mandatory `src/lib/env.ts` validation layer using **Zod**. The application fails to boot if critical keys (Supabase role, Turnstile secret, etc.) are missing.
-   **Custom Error Architecture**: Replaced silent error logging with a structured `AppError` hierarchy (`ValidationError`, `StockError`, etc.), providing precise HTTP status codes and user-friendly localized messages.
-   **Anti-Spam**: Integrated Cloudflare Turnstile with server-side validation and IP-based rate limiting via Upstash Redis.

## 🛠️ Architecture

-   **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS v4.
-   **Backend**: Supabase (PostgreSQL, RLS, RPCs), Edge Functions.
-   **Storage**: Upstash Redis (Rate Limiting).
-   **Validation**: Zod (API payloads & Environment).
-   **Design**: Industrial / Cyberpunk aesthetic with high-precision glassmorphism.

## 📦 Getting Started

1.  **Clone & Install**:
    ```bash
    git clone ...
    npm install
    ```

2.  **Environment Setup**:
    Copy `.env.example` to `.env.local` and fill in:
    -   `NEXT_PUBLIC_SUPABASE_URL`
    -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    -   `SUPABASE_SERVICE_ROLE_KEY`
    -   `UPSTASH_REDIS_REST_URL` / `TOKEN`

3.  **Database Migration**:
    Run migrations in `supabase/migrations/` using the Supabase CLI or dashboard SQL editor.

4.  **Run Development**:
    ```bash
    npm run dev
    ```

## 📄 License
Privately developed for the Nutrition Store project.
