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
Copy-Item .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Checks

```powershell
npm run lint
npm run typecheck
npm run build
```

The values in `.env.example` are local placeholders. Do not put real secrets
in source control.
