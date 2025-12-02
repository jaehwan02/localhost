# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Localhost** - A hackathon event management platform built with Next.js and Supabase. The platform provides gamified features including team-based communication, TTS announcements, music requests, auctions, and a shop system to engage hackathon participants.

## Development Commands

### Local Development
```bash
npm run dev        # Start development server at localhost:3000
npm run build      # Build production bundle
npm start          # Start production server
npm run lint       # Run ESLint on the codebase
```

### Database Operations
- Database schema is defined in `schema.sql` and `social_features.sql`
- Execute these SQL files in your Supabase project's SQL Editor to set up tables
- Use Supabase Dashboard for direct database management and RLS policy testing

### Environment Setup
Copy `.env.example` to `.env.local` and configure:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

## Architecture

### Authentication & Authorization

**Cookie-Based Auth**: Uses `@supabase/ssr` for server-side authentication across the entire Next.js stack (Server Components, Client Components, Route Handlers, Server Actions, Middleware).

**Client Creation Pattern**:
- Server Components/Actions: Use `createClient()` from `lib/supabase/server.ts`
- NEVER store server clients in global variables (critical for Fluid compute)
- Always create new client instances per request
- Middleware uses proxy pattern via `lib/supabase/proxy.ts`

**Session Management**:
- `middleware.ts` handles session refresh and auth redirects
- Unauthenticated users are redirected to `/login` (except `/auth` routes)
- Session state maintained through `supabase.auth.getClaims()`

### App Structure

**Dual Layout System**:
- `app/(main)/` - Team user interface with Sidebar + Header layout
- `app/admin/` - Admin interface with AdminSidebar layout
- Both layouts are independent route groups with separate navigation

**Route Organization**:
```
app/
├── (main)/              # Team user routes
│   ├── community/       # Post feed, comments, likes
│   ├── shop/            # Product catalog and purchases
│   └── auction/         # Real-time auction bidding
├── admin/               # Admin-only routes
│   ├── teams/           # Team management, coin distribution
│   ├── shop/            # Product CRUD operations
│   ├── queue/           # TTS/Music queue management
│   └── auction/         # Auction creation and control
├── auth/                # Authentication flows
├── api/                 # API routes
└── player/              # Media player interface
```

### Database Architecture

**Core Tables**:
- `teams` - Hackathon team profiles with coin wallets (references auth.users)
- `posts` - Community posts with TTS/song request flags
- `comments` - Two-level comment system (comment → reply only)
- `likes` - Post reactions (unique constraint per team/post)
- `products` - Shop items with stock management
- `auctions` - Auction items with status (pending/active/completed)
- `bids` - Auction bid history
- `media_queue` - TTS and song request queue (type: 'tts'|'song', status: 'pending'|'played')
- `transactions` - Coin transaction logs

**Row Level Security (RLS)**:
- All tables have RLS enabled
- Most tables readable by everyone (`using (true)`)
- Write operations restricted to authenticated users via `auth.uid()`
- Transactions viewable only by owning team

**Stored Procedures**:
- `buy_product(p_id, t_id)` - Atomic purchase: validates stock/coins, deducts coins, decrements stock, logs transaction
- `place_bid(a_id, t_id, bid_amount)` - Auction bidding: validates auction status, checks bid > current, verifies coins, inserts bid

**Realtime Subscriptions**:
- `posts`, `bids`, `media_queue`, `likes`, `comments` tables are enabled for Supabase Realtime
- Use for live updates in community feed, auction UI, and media player

### Key Technical Patterns

**Path Aliasing**: Uses `@/*` for absolute imports (configured in tsconfig.json)

**Component Library**: Built with shadcn/ui (Radix UI primitives + Tailwind CSS)
- Configuration in `components.json`
- UI components in `components/ui/`

**Styling**:
- Tailwind CSS with custom config in `tailwind.config.ts`
- Theme switching via `next-themes` (see `components/theme-switcher.tsx`)
- Global styles in `app/globals.css`

**Type Safety**:
- TypeScript strict mode enabled
- React 19 with type definitions
- Supabase client types auto-generated

### Critical Implementation Details

**Media Queue System**:
- Posts can trigger TTS (`is_tts: true`) or song requests (`is_song: true`)
- When enabled, content/URL is inserted into `media_queue` table
- Player interface (`app/player/`) displays queue and controls playback
- Admin can reorder, skip, or panic-stop media

**Comment Depth Limitation**:
- SPEC.md requires max 2-level depth (comment → reply)
- No parent_id field exists in current schema - comments are flat
- If implementing nested comments, add `parent_id uuid references comments(id)` and enforce depth check

**Auction Concurrency**:
- `place_bid()` function uses database-level validation for race conditions
- Multiple simultaneous bids handled by Postgres transaction ordering
- Front-end should handle RPC errors gracefully (insufficient coins, auction not active, etc.)

**Coin Economy**:
- All coin modifications must log to `transactions` table
- Admin can manually grant/deduct coins via `/admin/teams`
- Purchases and auction wins automatically create transaction records

## Important Notes

- **Team Authentication**: Teams are created by admin, not via public sign-up. Pre-generated credentials distributed to participants.
- **Realtime Requirements**: Features like auction bidding and community feed depend on Supabase Realtime subscriptions being properly configured.
- **Image Uploads**: Posts support `image_url` field but upload implementation is left to developer (consider Supabase Storage).
- **Player Interface**: Designed to run on dedicated display/speakers - auto-plays TTS and music from queue.
