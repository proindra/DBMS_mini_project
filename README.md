<div align="center">

# E-commerce Order Management

### Browse products. Search by meaning. Check out with confidence.

<p>
  <img alt="Full-stack React framework: Next.js 16" src="https://img.shields.io/badge/Full--Stack_React_Framework-Next.js_16-111827?style=for-the-badge&labelColor=6D28D9&logo=next.js&logoColor=white" />
</p>
<p>
  <img alt="CSS: Tailwind CSS" src="https://img.shields.io/badge/CSS-Tailwind_CSS-0E7490?style=for-the-badge&labelColor=164E63&logo=tailwindcss&logoColor=white" />
  <img alt="Database: PostgreSQL 16 with pgvector" src="https://img.shields.io/badge/Database-PostgreSQL_16_%2B_pgvector-2563EB?style=for-the-badge&labelColor=1E3A8A&logo=postgresql&logoColor=white" />
  <img alt="ORM: Prisma" src="https://img.shields.io/badge/ORM-Prisma-334155?style=for-the-badge&labelColor=9A3412&logo=prisma&logoColor=white" />
</p>
<p>
  <img alt="Container: Docker" src="https://img.shields.io/badge/Container-Docker-0284C7?style=for-the-badge&labelColor=075985&logo=docker&logoColor=white" />
  <img alt="Embeddings: Hugging Face" src="https://img.shields.io/badge/Embeddings-Hugging_Face-FACC15?style=for-the-badge&labelColor=6B21A8&logo=huggingface&logoColor=white" />
</p>

<p><strong>A full-stack DBMS mini-project for product discovery, secure checkout, and order management.</strong></p>
<p>Semantic search runs locally with Hugging Face embeddings and PostgreSQL pgvector.</p>

</div>

## Requirements

- Node.js 20.9 or newer
- npm
- Docker Desktop for the local PostgreSQL/pgvector service

## Setup

```powershell
npm install
Copy-Item .env.example .env

# Start PostgreSQL with pgvector. Docker Desktop must be running.
docker compose up -d

# Apply database migrations and load demo accounts/products.
npm run db:migrate
npm run db:seed

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The checked-in `.env.example` contains local-only values. For deployment,
provide a strong unique `AUTH_SECRET` and a production `DATABASE_URL` using
your hosting provider's secret manager; never commit them.

The first seed/index or semantic-search run downloads the local embedding
model from Hugging Face and caches it locally. Product/query text is
embedded in the Node.js server and is not sent to a hosted embedding API.
To rebuild product vectors later, run `npm run db:index-embeddings`.

## Prisma Studio

Start the local database and configure `DATABASE_URL` in `.env`, then run:

```powershell
npm run db:studio
```

Prisma Studio opens a local browser interface for viewing and editing database
records. It connects to the database specified by `DATABASE_URL`; changes made
in Studio directly affect that database. Use a development database, and avoid
exposing Studio or using it to edit production data.

## Demo accounts

After running the seed command, use these local-only demo accounts:

- Customer: `alice@example.com` / `password123`
- Admin: `bob@example.com` / `password123`

Registration always creates a `CUSTOMER`; admin accounts are provisioned by
the seed script. Replace the example `AUTH_SECRET` before deploying.

## Store workflows

- Use the shared navigation to reach the catalogue and, when signed in,
  customer orders/cart or admin tools.
- Browse and filter active products at `/products`.
- Search the catalogue by describing a product's purpose or features;
  embeddings run locally and use PostgreSQL/pgvector for similarity.
- Add products to your cart and place an order. Checkout computes totals from
  current database prices in Indian rupees (INR); payment remains simulated.
- View your own orders at `/orders`.
- Admins can add/edit/deactivate products, update stock, and manage order
  statuses at `/admin`.

## Checks

```powershell
npm run lint
npm run typecheck
npm run test:auth
npm run test:workflows
npm run build
```

For the browser workflow, database/view checks, and safe SQL examples, follow
[`docs/testing.md`](./docs/testing.md). To stop the local database, run
`docker compose down`; add `-v` only if you intend to delete its stored data.

The project demonstrates serializable checkout transactions, relational and
vector indexes, an `AdminSalesSummary` PostgreSQL view, and pgvector cosine
search. Safe SQL examples for the database assignment are in
[`docs/important-queries.sql`](./docs/important-queries.sql); database
verification steps are in [`docs/testing.md`](./docs/testing.md).

## Architecture

```mermaid
flowchart LR
    Browser[Customer / Admin] --> App[Next.js full-stack app]
    App --> Services[Auth, products, cart, orders]
    Services --> ORM[Prisma]
    ORM --> Database[(PostgreSQL + pgvector)]
    App -. Semantic search .-> Embeddings[Hugging Face embeddings]
    Embeddings --> Database
```

Next.js serves the UI and API. Prisma connects the app services to PostgreSQL;
local Hugging Face embeddings power product semantic search.

## Project structure

```text
.
├── docs/                 # Requirements, database design, SQL examples, tests
├── prisma/
│   ├── schema.prisma     # Relational schema and models
│   └── migrations/       # PostgreSQL and pgvector migrations
├── public/               # Static assets
├── scripts/              # Seed data and product embedding indexing
├── src/
│   ├── app/              # Next.js pages, layouts, and API route handlers
│   ├── components/       # Reusable UI for auth, products, cart, and admin
│   ├── lib/              # Database, auth, workflow, and search services
│   └── types/            # Shared TypeScript declarations
├── docker-compose.yml    # Local PostgreSQL + pgvector service
├── prisma.config.ts      # Prisma CLI configuration
└── package.json          # Scripts and project dependencies
```

Project scope and implementation status are tracked in
[`IMPLEMENTATION.md`](./IMPLEMENTATION.md).
The schema overview and requirements are in
[`docs/er-diagram.mmd`](./docs/er-diagram.mmd) and
[`docs/requirements.md`](./docs/requirements.md).
