# E-commerce Order Management

A DBMS mini-project scaffold for an e-commerce order management system.
The application uses Next.js App Router, TypeScript, and Tailwind CSS.
Database, authentication, and product/order workflows will be implemented
in later phases described in [IMPLEMENTATION.md](./IMPLEMENTATION.md).

## Requirements

- Node.js 20.9 or newer
- npm

## Setup

```powershell
npm install
Copy-Item .env.example .env

# Start PostgreSQL with pgvector if Docker is available
# Docker Desktop must be running for this step.
docker compose up -d

# Apply the Prisma schema and seed demo data
npm run db:migrate
npm run db:seed

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

After running the seed command, use these local-only demo accounts:

- Customer: `alice@example.com` / `password123`
- Admin: `bob@example.com` / `password123`

Registration always creates a `CUSTOMER`; admin accounts are provisioned by
the seed script. Replace the example `AUTH_SECRET` before deploying.

## Checks

```powershell
npm run lint
npm run typecheck
npm run test:auth
npm run build
```

The values in `.env.example` are local placeholders. Do not put real secrets
in source control.
