# API Practice Lab

A small TanStack Start + Lovable Cloud (Supabase) app that exposes a realistic REST API for practicing manual and automated API testing. It ships with users, auth, contacts CRUD, and an optional "Buggy Mode" that injects defects so testers can write tests that catch them.

## Features

- JWT-based auth (signup, login, logout, delete account)
- Full CRUD for per-user contacts with RLS isolation
- In-app **API Docs** page (`/docs`) and **Testing Guide** (`/guide`)
- **Buggy Mode** toggle in Settings to intentionally break selected endpoints
- Built-in dashboard, login, signup, and contact management UI

## Tech Stack

- [TanStack Start](https://tanstack.com/start) (React 19, Vite 7, file-based routing)
- Tailwind CSS v4 + shadcn/ui
- Lovable Cloud (Supabase Postgres + Auth) with RLS
- Deployed to Cloudflare Workers (edge)

## Getting Started

```bash
bun install
bun run dev
```

Open <http://localhost:5173>.

Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, etc.) are managed automatically by Lovable Cloud — no manual `.env` setup needed when working in Lovable.

## API Overview

Base URL: your deployment origin (e.g. `https://api-bug-buddy.lovable.app`).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/public/users` | – | Create user |
| POST | `/api/public/users/login` | – | Login, returns JWT |
| POST | `/api/public/users/logout` | ✓ | Logout |
| GET | `/api/public/users/me` | ✓ | Get current user |
| PATCH | `/api/public/users/me` | ✓ | Update profile |
| DELETE | `/api/public/users/me` | ✓ | Delete account |
| GET | `/api/public/contacts` | ✓ | List contacts |
| POST | `/api/public/contacts` | ✓ | Create contact |
| GET | `/api/public/contacts/:id` | ✓ | Get one contact |
| PUT | `/api/public/contacts/:id` | ✓ | Replace contact |
| PATCH | `/api/public/contacts/:id` | ✓ | Update contact |
| DELETE | `/api/public/contacts/:id` | ✓ | Delete contact |

Full request/response schemas live at `/docs` in the running app.

### Quick test

```bash
BASE=https://api-bug-buddy.lovable.app

# Signup
curl -X POST $BASE/api/public/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","password":"secret123"}'

# Login
TOKEN=$(curl -s -X POST $BASE/api/public/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}' | jq -r .token)

# Authenticated call
curl $BASE/api/public/contacts -H "Authorization: Bearer $TOKEN"
```

## Database

Three tables, all RLS-protected (each user sees only their own rows):

- `profiles` — user profile info (name, email)
- `contacts` — address-book entries per user
- `user_settings` — per-user prefs (e.g. `buggy_mode`)

## Project Structure

```
src/
├── routes/                # File-based routes (pages + API)
│   ├── api/public/        # Public REST endpoints
│   ├── index.tsx          # Home
│   ├── docs.tsx           # API reference
│   └── guide.tsx          # Testing guide
├── components/            # UI components
├── integrations/supabase/ # Auto-generated Supabase clients
└── lib/                   # Helpers, auth, api utils
supabase/migrations/       # SQL migrations
```

## Development in Lovable

This project is built and maintained with [Lovable](https://lovable.dev). Changes pushed to GitHub sync back to the Lovable editor automatically and vice versa.

- Edit in Lovable: open the project in the Lovable editor
- Edit locally: clone the repo, edit, push — changes appear in Lovable

## License

MIT
