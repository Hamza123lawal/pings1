# Pings Communications

A full-stack printing & tech retail web app for **Pings Communications**, offering printing services, tech products, and professional training.

## Stack

- **Frontend**: React 18 + Vite, Tailwind CSS, Radix UI, Framer Motion, Wouter (routing)
- **Backend**: Express.js (TypeScript, tsx)
- **Database**: PostgreSQL via Replit's managed database, accessed with Drizzle ORM + Neon serverless driver
- **Email**: Resend (optional — set `RESEND_API_KEY` to enable order/contact emails)

## How to run

The app runs on a single workflow: `Start application` → `npm run dev`  
It serves both the API and the Vite dev server on **port 5000**.

## Database

Schema is managed with Drizzle ORM. To push schema changes to the database:

```
npm run db:push
```

Tables: `categories`, `items`, `cart_items`, `orders`, `messages`

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | Auto-provided by Replit's managed PostgreSQL |
| `SESSION_SECRET` | ✅ Yes | Set as a Replit Secret |
| `RESEND_API_KEY` | Optional | Enables email on orders/contact form |

## Pages

- `/` — Home / landing page
- `/services` — Services catalogue
- `/shop` — Product shop with cart
- `/checkout` — Checkout form
- `/contact` — Contact / quote form
- `/service-management` — Admin: manage service listings
- `/shop-management` — Admin: toggle shop item visibility

## User preferences

- Keep the existing project structure and stack — do not restructure or migrate.
