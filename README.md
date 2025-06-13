# Ali Shop – Full-Stack E-commerce Platform

A production-ready, high-performance e-commerce application built with Next.js 15, TypeScript and MongoDB. It ships with server-side rendering (SSR), role-based authentication, an admin dashboard, and seamless integrations for Tranzila payments and AliExpress product sourcing.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Integrations](#integrations)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)
- [Status](#status)

## Features
- 🔒 **Role-based auth** – NextAuth.js with JWT sessions (admin / user)
- 🛒 **Shopping cart** with persistent storage
- 📦 **Order & inventory management** via admin dashboard
- 🔍 **Product catalog** with search, filter & pagination
- ☁️ **SSR & SSG** for blazing-fast performance and SEO
- 💳 **Secure payments** through Tranzila
- 🤝 **AliExpress sourcing** – import price, URL & auto-markup
- 📈 **Analytics ready** – easily connect your favourite tools

## Tech Stack
### Front-end
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- React Query
- Framer Motion

### Back-end
- Next.js API Routes
- MongoDB + Mongoose ODM
- JSON Web Tokens (JWT)
- Docker

### Infrastructure
- VPS (Ubuntu)
- Nginx reverse proxy
- GitHub Actions + webhooks for CI/CD

## Folder Structure
```
src/
├─ app/            # Next.js pages & layouts
├─ components/     # Reusable UI components
├─ controllers/    # API route handlers (MVC style)
├─ lib/            # Shared lib code (DB, auth)
├─ models/         # Mongoose schemas & types
├─ services/       # External service wrappers
├─ utils/          # Helpers & custom hooks
└─ styles/         # Global & scoped styles
```

## Architecture Overview
1. **Client** requests page ➜ served by **Next.js** (SSR/SSG).
2. **API routes** (under `src/pages/api`) act as the BFF layer.
3. Handlers delegate to **controllers** which consume **models** (MongoDB).
4. Auth guarded via **middleware.ts** (JWT validation & role checks).
5. Static assets live in `public/` and are served via **Nginx** in production.

## Getting Started
### Prerequisites
- Node 18.17+
- pnpm or npm
- MongoDB instance (local or Atlas)

### Installation
```bash
pnpm install # or npm install
```

### Environment Variables
Copy `.env.example` to `.env` and fill in the values (see [Environment Variables](#environment-variables)).

### Development Server
```bash
pnpm dev
```
The app runs on `http://localhost:3000` by default (Next.js) but proxies to `4000` in production.

### Production Build
```bash
pnpm build && pnpm start
```

## Available Scripts
| Command            | Description                      |
|--------------------|----------------------------------|
| `pnpm dev`         | Start dev server with Turbopack  |
| `pnpm build`       | Compile for production           |
| `pnpm start`       | Serve built app on `:4000`       |
| `pnpm lint`        | ESLint + TypeScript checks       |
| `pnpm test`        | Jest unit tests                  |

## Environment Variables
| Key                             | Description                                     |
|---------------------------------|-------------------------------------------------|
| `MONGODB_URI`                   | MongoDB connection string                       |
| `NEXTAUTH_URL`                  | Base URL for NextAuth                           |
| `NEXTAUTH_SECRET`               | Session encryption key                          |
| `JWT_SECRET`                    | JWT signing secret                              |
| `NEXT_PUBLIC_API_URL`           | Public URL for client API calls                 |
| `TRANZILA_TERMINAL_NAME`        | Tranzila terminal ID                            |
| `TRANZILA_TERMINAL_PASSWORD`    | Tranzila terminal password                      |
| `NEXT_PUBLIC_TRANZILA_TERMINAL_NAME` | Same as above, exposed to client          |
| `ALIEXPRESS_APP_KEY`            | AliExpress app key                              |
| `ALIEXPRESS_APP_SECRET`         | AliExpress app secret                           |
| `ALIEXPRESS_ACCESS_TOKEN`       | AliExpress OAuth access token                   |
| `ALIEXPRESS_REFRESH_TOKEN`      | AliExpress refresh token                        |
| `ALIEXPRESS_TOKEN_EXPIRY`       | ISO expiry date                                 |
| `ALIEXPRESS_MARKUP_PERCENTAGE`  | Auto-markup percentage for import prices        |
| `DEBUG`                         | Enable verbose logging                          |

## Integrations
### Tranzila (Payments)
`src/services/tranzilaService.ts` wraps the Tranzila REST API. Credentials come from env vars. In production ensure your domain is whitelisted in the Tranzila back-office.

### AliExpress (Supplier)
`src/services/aliExpressService.ts` interfaces with the AliExpress Open Platform to fetch product data. A markup percentage is applied before persisting the product.

## Deployment
This repo is optimised for a simple **Docker + Nginx** stack:
```bash
docker build -t ali-shop .
docker run -d --env-file .env --name ali-shop -p 4000:4000 ali-shop
```
Use the provided `nginx.conf` (example in `infra/`) to reverse-proxy `https://your-domain.com` ➜ `http://localhost:4000`.

CI/CD can be achieved with the included GitHub webhook that triggers a pull & redeploy script on the server.

## Testing
Unit tests reside alongside modules and are executed with:
```bash
pnpm test
```

## Contributing
1. Fork project
2. Create feature branch `git checkout -b feature/awesome`
3. Commit changes & open PR

> Ensure ESLint passes (`pnpm lint`) before submitting.

## License
Distributed under the MIT License. See `LICENSE` for details.

## Status
🚧 **Active development** – suitable for personal & experimental use.
