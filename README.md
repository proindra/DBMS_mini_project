<div align="center">

# StoreIQ — The Smart E-commerce Store

### Browse products. Search by meaning. Check out with confidence.

<p>
  <img alt="Full-stack React framework: Next.js 16" src="https://img.shields.io/badge/Full--Stack_React_Framework-Next.js_16-111827?style=for-the-badge&labelColor=6D28D9&logo=next.js&logoColor=white" />
  <img alt="CSS: Tailwind CSS" src="https://img.shields.io/badge/CSS-Tailwind_CSS-0E7490?style=for-the-badge&labelColor=164E63&logo=tailwindcss&logoColor=white" />
</p>
<p>
  <img alt="Database: PostgreSQL 16 with pgvector" src="https://img.shields.io/badge/Database-PostgreSQL_16_%2B_pgvector-2563EB?style=for-the-badge&labelColor=1E3A8A&logo=postgresql&logoColor=white" />
  <img alt="In-memory database: Redis Stack" src="https://img.shields.io/badge/In--Memory_Database-Redis_Stack-DC382D?style=for-the-badge&labelColor=7F1D1D&logo=redis&logoColor=white" />
</p>
<p>
  <img alt="ORM: Prisma" src="https://img.shields.io/badge/ORM-Prisma-334155?style=for-the-badge&labelColor=9A3412&logo=prisma&logoColor=white" />
  <img alt="Container: Docker" src="https://img.shields.io/badge/Container-Docker-0284C7?style=for-the-badge&labelColor=075985&logo=docker&logoColor=white" />
  <img alt="Embeddings: Hugging Face" src="https://img.shields.io/badge/Embeddings-Hugging_Face-FACC15?style=for-the-badge&labelColor=6B21A8&logo=huggingface&logoColor=white" />
</p>

<p><strong>StoreIQ makes product discovery, secure checkout, and order management smarter and simpler.</strong></p>
<p>Semantic search runs locally with Hugging Face embeddings and PostgreSQL pgvector.</p>

</div>

## Requirements

- Node.js 20.9 or newer
- npm
- Docker Desktop for local PostgreSQL/pgvector and Redis services

## Setup

```powershell
npm install
Copy-Item .env.example .env

# Start PostgreSQL with pgvector and the local Redis cache.
docker compose up -d

# Apply database migrations and load demo accounts/products.
npm run db:migrate
npm run db:seed

npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local services and ports

| Service | Runs with | Port / URL | Purpose and data |
| --- | --- | --- | --- |
| PostgreSQL 16 + pgvector | Docker | `5432` | Primary database; data persists in the `postgres_data` Docker volume. |
| pgAdmin | Docker | [http://localhost:5050](http://localhost:5050) | PostgreSQL web GUI; sign in with `admin@local.dev` / `admin` and connect to the preconfigured `StoreIQ local PostgreSQL` server using `postgres` as the database password. |
| Redis Stack | Docker | `6379` | In-memory cache and temporary data; cache is disposable. |
| RedisInsight | Included with Redis Stack | [http://localhost:8001](http://localhost:8001) | Browser GUI for viewing Redis keys and cache data. |
| Prisma Studio | `npm run db:studio` | [http://localhost:51212](http://localhost:51212) | Browser GUI for viewing and editing PostgreSQL records; the port may vary. |

pgAdmin is available after `docker compose up -d`. Its local-development
credentials and database connection are configured in `docker-compose.yml` and
[`pgadmin/servers.json`](./pgadmin/servers.json). The pgAdmin port is bound to
localhost, and its settings persist in the `pgadmin_data` Docker volume. Do not
use the sample login credentials outside local development.

### Open pgAdmin

1. Start the local services with `docker compose up -d`.
2. Open [http://localhost:5050](http://localhost:5050).
3. Sign in to pgAdmin with **Email Address / Username** `admin@local.dev`
   and **Password** `admin`.
4. In the browser tree, open **Servers → StoreIQ local PostgreSQL**. If asked
   for the database password, enter `postgres`.

If pgAdmin asks you to register a server manually, use these connection
settings:

| Field | Value |
| --- | --- |
| Server name | `StoreIQ local PostgreSQL` |
| Host name/address | `db` |
| Port | `5432` |
| Maintenance database | `ecommerce_order_management` |
| Username | `postgres` |
| Password | `postgres` |
| Role and Service | Leave blank |

Use `db` as the host when connecting from the pgAdmin container in this
project's Docker Compose network. If pgAdmin is installed directly on your
computer instead, use `localhost` as the host.

The pgAdmin website password (`admin`) is separate from the PostgreSQL server
password (`postgres`). Both are local-development credentials.

The checked-in `.env.example` contains local-only values. For deployment,
provide a strong unique `AUTH_SECRET`, a production `DATABASE_URL`, and a
Redis `REDIS_URL` using your hosting provider's secret manager; never commit
them.

The first seed/index or semantic-search run downloads the local embedding
model from Hugging Face and caches it locally. Product/query text is
embedded in the Node.js server and is not sent to a hosted embedding API.
To rebuild product vectors later, run `npm run db:index-embeddings`.

## Redis cache

The local `docker compose up -d` command starts Redis Stack alongside
PostgreSQL. Its RedisInsight GUI is available at
[http://localhost:8001](http://localhost:8001); Redis itself remains available
to the app at `redis://localhost:6379`.
Set `REDIS_URL="redis://localhost:6379"` in `.env` (add it manually if `.env`
already existed before Redis was added). Cache entries expire after these
time-to-live (TTL) durations:

| Cached data | TTL |
| --- | --- |
| Product catalogue and filtered catalogue queries | 5 minutes |
| Individual product details | 5 minutes |
| Product categories | 30 minutes |
| Semantic-search results | 2 minutes |

Product changes made through the app invalidate the catalogue and
semantic-search caches. Changes made directly through Prisma Studio or SQL
become visible when their cache entries expire.

Redis is only a disposable cache; PostgreSQL remains the source of truth. If
Redis is unavailable, the app logs a warning and reads from PostgreSQL without
caching. Both Redis and RedisInsight ports are bound to this computer. Use the
GUI only with the local development database; the cache is not persistent
across container recreation.

## Prisma Studio

Start the local database and configure `DATABASE_URL` in `.env`, then run:

```powershell
npm run db:studio
```

Open [http://localhost:51212/](http://localhost:51212/) to access the running
Prisma Studio instance. The port may differ when Studio is restarted; use the
URL printed in the terminal in that case.

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

## Database assignment coverage

The database model includes `User`, `Category`, `Product`, `Cart`,
`CartItem`, `Order`, and `OrderItem` (as well as `Payment` and
`ProductEmbedding` for application features). The ER diagram and its
relational mapping are documented in
[`docs/er-diagram.mmd`](./docs/er-diagram.mmd) and
[`docs/database-design.md`](./docs/database-design.md). The consolidated
PostgreSQL baseline migration creates the tables, foreign-key and check
constraints, unique constraints, indexes, and database routines.

The project also demonstrates:

- DDL and DML, including `CREATE`, `ALTER`, `INSERT`, `UPDATE`, and `DELETE`.
- Simple product, customer, and order retrieval queries.
- Nested queries to find customers who placed orders.
- A correlated query to find products priced above their category average.
- A PostgreSQL CTE used by the admin dashboard to summarize each customer's
  order count and non-cancelled sales.
- The `AdminUpdateOrderStatus` stored procedure for validated administrative
  status changes, including stock restoration when an order is cancelled.
- The `CalculateOrderTotal` function for totals based on order-item snapshots.
- Product and order audit triggers that record row changes in `AuditLog`.
- Serializable checkout transactions, the `AdminSalesSummary` view, and
  pgvector cosine search.

The CTE is an application query executed by the admin dashboard when it loads;
it is not a persistent database object and therefore does not belong in a
migration. Its implementation is in
[`src/lib/admin/summary.ts`](./src/lib/admin/summary.ts). In contrast, the
stored procedure, function, audit table, and triggers are persistent
PostgreSQL objects, so the baseline migration creates them when the database
is set up.

Safe, self-contained query examples are in
[`docs/important-queries.sql`](./docs/important-queries.sql). The stored
procedure, function, audit table, and triggers are installed by the PostgreSQL
baseline migration. Database verification steps are in
[`docs/testing.md`](./docs/testing.md).

For a copy-ready pgAdmin walkthrough to use during a project review, see
[`docs/database-review-demo.md`](./docs/database-review-demo.md).

## Architecture

```mermaid
flowchart LR
    Browser[Customer / Admin] --> App[Next.js full-stack app]
    App --> Services[Auth, products, cart, orders]
    Services --> ORM[Prisma]
    ORM --> Database[(PostgreSQL + pgvector)]
    Services --> Cache[Redis cache]
    Cache -. Cache miss .-> ORM
    App -. Semantic search .-> Embeddings[Hugging Face embeddings]
    Embeddings --> Database
```

Next.js serves the UI and API. Prisma connects the app services to PostgreSQL;
local Hugging Face embeddings power product semantic search, and Redis speeds
up repeated catalogue and semantic-search reads.

## Project structure

```text
.
├── docs/                 # Requirements, database design, SQL examples, tests
├── prisma/
│   ├── schema.prisma     # Relational schema and models
│   └── migrations/       # Consolidated PostgreSQL + pgvector baseline
├── public/               # Static assets
├── scripts/              # Seed data and product embedding indexing
├── src/
│   ├── app/              # Next.js pages, layouts, and API route handlers
│   ├── components/       # Reusable UI for auth, products, cart, and admin
│   ├── lib/              # Database, Redis cache, auth, workflow, and search
│   └── types/            # Shared TypeScript declarations
├── docker-compose.yml    # Local PostgreSQL + pgvector service
├── prisma.config.ts      # Prisma CLI configuration
└── package.json          # Scripts and project dependencies
```

The schema overview and requirements are in
[`docs/er-diagram.mmd`](./docs/er-diagram.mmd) and
[`docs/requirements.md`](./docs/requirements.md).
