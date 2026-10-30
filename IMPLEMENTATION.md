# IMPLEMENTATION.md --- E-commerce Order Management System

## Goal

Build a manageable DBMS Level 3 mini-project using **Next.js +
TypeScript, PostgreSQL + pgvector, Prisma, and Tailwind CSS**. Build and
test it phase by phase. Do not generate the whole application at once.

## 1. Mini-project scope

### Customer

-   Register/login
-   Browse and filter products
-   Search products by meaning using vector search
-   Add/remove cart items and place an order
-   View their own orders

### Admin

-   Login
-   Add/edit/deactivate products and update stock
-   View/manage orders
-   View a small dashboard with order count and sales summary

Use a **simulated payment status** only. Do not integrate real payments
or store card details.

## 2. Technology stack

-   **Frontend + API:** Next.js App Router, React, TypeScript
-   **Styling:** Tailwind CSS
-   **SQL + vector search:** PostgreSQL with pgvector
-   **Database access:** Prisma, with SQL migrations for
    pgvector-specific features
-   **Validation:** Zod
-   **Authentication:** a maintained Next.js-compatible authentication
    library
-   **Version control:** Git + GitHub
-   **Local database:** Docker Compose, if Docker is available

Confirm with the instructor that PostgreSQL + pgvector satisfies the
course's SQL + Vector Database requirement. If a separate vector service
is required, ask before changing the design.

## 3. Simple project structure

Create files as needed; do not create empty placeholder files.

``` text
ecommerce-order-management/
├── docs/
│   ├── requirements.md
│   ├── er-diagram.mmd
│   ├── database-design.md
│   ├── vector-search.md
│   ├── important-queries.sql
│   └── testing.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── scripts/
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── admin/
│   │   └── api/
│   ├── components/
│   ├── lib/
│   │   ├── db.ts
│   │   ├── auth/
│   │   └── vector-search/
│   └── server/
│       └── services/
├── tests/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
└── IMPLEMENTATION.md
```

## 4. Database design

Create an ER diagram before implementing the schema. Use these core
tables:

-   **User:** id, name, email, password hash, role
-   **Category:** id, name
-   **Product:** id, category id, name, description, SKU, price, stock,
    active status
-   **CartItem:** user id, product id, quantity
-   **Order:** id, user id, status, total, created date
-   **OrderItem:** order id, product id, product-name snapshot,
    unit-price snapshot, quantity
-   **Payment:** id, order id, amount, status
-   **ProductEmbedding:** product id, embedding vector, model
    name/version

Use primary keys, foreign keys, unique constraints, `NOT NULL`,
non-negative price/stock checks, positive quantities, and indexes where
useful. Use fixed-precision decimal types for money. Preserve
purchase-time prices in `OrderItem`. Choose safe delete behavior so
order history is not accidentally deleted.

Relationships: Category → Products; User → Orders; User → CartItems;
Order → OrderItems; Product → CartItems/OrderItems; Product →
ProductEmbedding.

## 5. Implementation phases

### Phase 0 --- Inspect

-   Inspect the existing folder, files, Node/npm versions, Git status,
    and Docker availability.
-   Report what exists and identify blockers.
-   Do not overwrite or delete existing files.

**Checkpoint:** report findings and proposed setup before coding.

### Phase 1 --- Create the app

-   Set up Next.js with TypeScript, App Router, and Tailwind CSS if the
    project does not already exist.
-   Create the minimal structure above.
-   Add `.gitignore`, `.env.example`, and a basic README.
-   Start the development server and verify the home page.

**Checkpoint:** app runs, lint/type checks work, secrets are ignored by
Git.

### Phase 2 --- Set up database

-   Configure PostgreSQL + pgvector using environment variables.
-   Add Prisma and define the tables listed in Section 4.
-   Create and apply migrations.
-   Seed a small set of fictional categories, products, and demo users.
    Hash demo passwords.

**Checkpoint:** migration and seed script work; relationships and
constraints are verified.

### Phase 3 --- Authentication and roles

-   Implement login/registration.
-   Support `CUSTOMER` and `ADMIN` roles.
-   Enforce authorization in server-side handlers/services, not just in
    the UI.
-   Customers must only access their own carts and orders.

**Checkpoint:** test customer/admin access and unauthorized requests.

**Status:** Implemented with Auth.js credentials sessions. Registration
creates customer accounts only; the database role is read again for each
protected request. Customer cart and order reads are scoped to the signed-in
user, and admin-only routes check the role on the server. Focused validation
and authorization tests are in `src/lib/auth/`.

### Phase 4 --- Product and order workflows

-   Implement product listing, details, filters, and admin product
    management.
-   Implement cart operations and order creation.
-   Calculate totals on the server.
-   Create the order, order items, and stock update in a single
    transaction.
-   Prevent stock from becoming negative or being oversold.
-   Use simulated payment status only.

**Checkpoint:** browse → add to cart → place order → view order works;
failures do not leave partial updates.

**Status:** Implemented with searchable/filterable product browsing, product
details, admin product creation/edit/deactivation and stock updates, customer
cart management, transactional checkout, simulated pending payments, customer
order history, and admin order status management. Checkout calculates totals
from current database prices, conditionally decrements stock in a serializable
transaction, snapshots purchased names/prices, creates the payment record, and
clears the cart atomically. Database checks protect non-negative stock/money
and positive quantities.

### Phase 5 --- Vector semantic search

-   Choose a local or approved embedding model and confirm its vector
    dimension.
-   Generate embeddings from product name, description, and category.
-   Store vectors in pgvector.
-   Implement a parameterized similarity query that returns active
    products.
-   Use the same embedding model for product text and search queries.
-   Document the model, dimension, similarity metric, and retrieval
    method.

**Status:** Implemented with the local ONNX export of
`sentence-transformers/all-MiniLM-L6-v2` (384 dimensions), mean pooling,
and normalized embeddings. Product embeddings include the product name,
description, and category; the catalogue has a semantic-search UI and
parameterized pgvector cosine retrieval. Seeding indexes products, and
`npm run db:index-embeddings` rebuilds vectors for an existing catalogue.
See `docs/vector-search.md`.

**Checkpoint:** semantic search returns relevant products and handles
empty queries/errors. Do not fake vector search with ordinary keyword
matching.

### Phase 6 --- Required database concepts

Implement and demonstrate at least **four** advanced concepts from the
assignment. Recommended: 1. Transactions for order placement and stock
updates. 2. Views for a sales/order summary. 3. Indexes for common
lookups. 4. Vector similarity search with pgvector. 5. Optionally add a
trigger or stored function if time permits.

Also provide runnable SQL examples demonstrating `CREATE`, `ALTER`,
`DROP`, `INSERT`, `UPDATE`, `DELETE`, `SELECT`, joins, `GROUP BY`,
`HAVING`, `ORDER BY`, aggregates, and a subquery. Use safe test data for
destructive examples.

**Status:** Implemented transactions for checkout, a database-backed
`AdminSalesSummary` view used by the dashboard and summary API, relational
B-tree indexes plus an HNSW cosine index for product embeddings, and
pgvector semantic retrieval. `docs/important-queries.sql` demonstrates all
required SQL statements and clauses using temporary tables only; its final
query reads the migrated summary view. See `docs/database-design.md` and
`docs/testing.md` for concept details and verification steps.

**Checkpoint:** every claimed feature has working SQL/code and a test or
demo.

### Phase 7 --- Build the UI

Implement only the pages needed for the agreed scope: - Login/register -
Product catalogue and product details - Semantic search - Cart and
checkout - Customer order history - Admin product/order management -
Simple admin dashboard

Use reusable components, responsive styling, form validation, and
loading/empty/error states. Dashboard figures must come from the
database.

**Status:** Implemented browser pages and reusable workflows for login and
registration, product browsing/details and semantic search, cart and
checkout, customer order history, and admin product/order management.
Forms include client/server validation and pending/error feedback; pages
provide loading and empty states, with shared retry and not-found screens.
Admin dashboard figures are read from the database, including the sales
summary view.

**Checkpoint:** core workflows work through the browser, not only
through direct API calls.

### Phase 8 --- Test and document

-   Test validation, roles, product operations, order creation,
    rollback, stock limits, and semantic search.
-   Run lint, type checks, tests, and production build.
-   Finish `README.md`, ER diagram, database design, vector-search
    explanation, important SQL queries, and testing results.
-   Capture a few real screenshots for the report.
-   Check Git status and ensure no secrets are committed.

**Status:** Project setup and functional documentation are updated, including
the ER diagram, database concepts, vector-search design, runnable safe SQL
examples, and browser/database verification steps. Lint, typecheck,
authorization/workflow tests, Prisma validation, and production build pass.
Tracked environment files were checked; `.env.example` contains placeholders,
while local `.env` files are ignored. Real browser screenshots were captured
for home, login, and registration (including a narrow viewport). Database-
backed migration/SQL tests and authenticated catalogue/checkout/admin browser
verification still require Docker/PostgreSQL.

**Checkpoint:** a new developer can follow the README and run the
project.

## 6. Security rules

-   Store credentials in `.env.local`; commit only `.env.example`
    placeholders.
-   Never store plaintext passwords or payment card details.
-   Use parameterized queries.
-   Validate inputs in the API and database.
-   Enforce roles and order ownership on the server.
-   Do not expose secrets or stack traces in API errors.
-   Never run destructive SQL against a database without checking the
    target.

## 7. Suggested API routes

Adapt these to the implementation; do not create unused routes.

  Method   Route                        Purpose
  -------- ---------------------------- -----------------------------
  GET      `/api/products`              List/filter products
  GET      `/api/products/[id]`         Product details
  POST     `/api/cart/items`            Add to cart
  DELETE   `/api/cart/items/[id]`       Remove cart item
  POST     `/api/orders`                Place order transactionally
  GET      `/api/orders`                Customer's own orders
  POST     `/api/search/semantic`       Vector semantic search
  POST     `/api/admin/products`        Admin creates product
  PATCH    `/api/admin/products/[id]`   Admin updates product
  PATCH    `/api/admin/orders/[id]`     Admin updates order status

## 8. Agent rules

-   Work on **one phase at a time**.
-   Inspect before editing and never overwrite existing work without
    approval.
-   Run relevant checks after each phase.
-   Do not claim tests passed unless they were actually run.
-   Fix errors instead of hiding them or disabling checks.
-   Keep docs synchronized with the implementation.
-   At each checkpoint, report files changed, commands run, results,
    known issues, and the next phase.
-   Ask before changing the agreed stack or adding unnecessary features.

## 9. First prompt for the VS Code AI agent

> Read `IMPLEMENTATION.md` completely. Start with **Phase 0 only**.
> Inspect the workspace, existing files, Node/npm versions, Git status,
> and Docker availability. Do not modify or delete anything yet. Report
> the current state, blockers, and proposed setup. Wait for my approval
> before Phase 1. After that, complete one phase at a time and verify
> each checkpoint before continuing.
