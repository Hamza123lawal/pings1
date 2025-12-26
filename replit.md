# Pings Communications

## Overview

Pings Communications is a full-stack e-commerce and service platform for a business offering printing services, graphic design, computer accessories, and training programs. The application features a customer-facing storefront with shopping cart functionality, a services catalog, contact form with email integration, and admin management pages for controlling shop inventory and service listings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for page transitions and component animations
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Build Tool**: Custom build script using esbuild for server and Vite for client
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe request/response validation

### Data Storage
- **Database**: PostgreSQL via Neon Serverless (@neondatabase/serverless)
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: categories, items, messages, cartItems

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Drizzle table definitions and Zod insert schemas
- `routes.ts`: API route definitions with path patterns and response schemas

### Build and Development
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Static files served from `dist/public`, server bundled to `dist/index.cjs`
- **Database Migrations**: Drizzle Kit with `db:push` command

### Session Management
- Cart functionality uses client-side session IDs stored in localStorage
- No user authentication currently implemented

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database, connection via `DATABASE_URL` environment variable

### Email Service
- **Resend**: Email delivery service for contact form submissions and order confirmations. Requires `RESEND_API_KEY` environment variable.
  - Contact form notifications are sent to `lawalhamzah2@gmail.com`.
  - Order confirmations are sent to both the admin (`lawalhamzah2@gmail.com`) and the customer.
  - Note: Customer emails are currently sent using the `onboarding@resend.dev` address due to Resend sandbox limitations.

### Third-Party UI Libraries
- **Radix UI**: Headless component primitives for accessible UI components
- **shadcn/ui**: Pre-styled component library built on Radix primitives
- **Embla Carousel**: Carousel/slider functionality
- **CMDK**: Command palette component
- **Vaul**: Drawer component

### Development Tools
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment integration