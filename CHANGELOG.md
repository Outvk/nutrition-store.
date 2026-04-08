# Changelog — Nutrition Store

All notable changes to this project will be documented in this file.

## [1.1.0] — 2026-04-08

### 🚀 Senior-Level Upgrade
This version represents a major quality leap focusing on architecture, security, and data integrity.

### Added
- **Atomic Order Placement**: New PostgreSQL function `place_order` for transaction safety.
- **Dynamic Delivery Manager**: Automatic fee lookup using Supabase RPC `get_delivery_fee`.
- **Environment Validation**: Strict Zod schema enforcing valid keys at startup.
- **Custom Error Library**: Implementation of `AppError`, `StockError`, and `ValidationError`.
- **Product Skeletons**: Enhanced user experience with shimmering skeleton loaders.

### Fixed
- **Order Race Conditions**: Eliminated partial order insertions and stock overlaps.
- **Price Manipulation**: Implemented server-side price recalculation (clients can no longer send custom prices).
- **Type Safety Errors**: Removed all `any` types throughout the codebase.

### Security
- **Cloudflare Turnstile**: Full integration with server-side validation.
- **Rate Limiting**: IP-based protection for the order endpoint via Upstash Redis.
- **API Lockdown**: Enhanced error feedback with precise HTTP status codes.

### Cleanup
- **Dead Code Removal**: Deleted hardcoded delivery fee configuration and temporary scrap files.
- **Git Hygiene**: Updated `.gitignore` with modern local dev exclusions.
