# Authentication checks

Run the unit-level validation and authorization checks:

```powershell
npm run test:auth
```

For live endpoint checks, start PostgreSQL, apply migrations, and seed the
database, then run `npm run dev`.

1. Sign in as `alice@example.com` with `password123`.
2. Verify `GET /api/account`, `GET /api/cart`, and `GET /api/orders` return
   only the signed-in customer's data.
3. Verify `GET /api/admin/summary` returns 403 for the customer.
4. Sign in as `bob@example.com` with `password123`.
5. Verify the admin summary succeeds and admin order access includes all
   orders.
6. Sign out and verify protected API routes return 401 and protected pages
   redirect to `/login`.

The demo credentials are for local testing only.

## Product and order workflow checks

Run validation, authorization, and decimal-total tests:

```powershell
npm run test:workflows
```

The workflow tests also cover semantic-query validation and vector shape.
With the database migrated and seeded, open `/products`, describe a product
need in the “Search by meaning” form, and verify that matching active
products are returned. The first run downloads the embedding model; repeat
after a database reset or model/schema change with `npm run db:seed` or
`npm run db:index-embeddings`.

With the database migrated and seeded, verify:

1. Browse `/products`; check search, category filter, sort, details, and
   inactive-product exclusion.
2. Sign in as a customer, add products to the cart, update quantities, and
   remove an item. Verify the API rejects quantities greater than stock and
   cart-item IDs owned by another user.
3. Place an order. Verify the total uses database prices, product stock
   decreases, order-item names/prices are snapshots, payment status is
   `PENDING`, and the cart is cleared.
4. Attempt checkout with an empty cart or insufficient stock. Verify the
   request fails and no order, payment, stock change, or partial cart clear is
   committed.
5. Sign in as admin. Create, edit, deactivate, and adjust stock for a product;
   verify non-admin requests receive 403.
6. Advance an order through its valid statuses. Cancel a pending or processing
   order and verify quantities are restored once; reject invalid transitions
   and repeated cancellation.

Checkout uses a database transaction and conditional stock decrements to
prevent overselling under concurrent requests. Payment is simulated only.

## Phase 7 browser checkpoint

With the development server running, complete the customer journey in the
browser: register or sign in, browse/filter products, try semantic search,
open a product detail, add it to the cart, update quantity, place an order,
and open the resulting order details. Verify empty catalogue/cart/order
states, pending form feedback, validation messages, the shared retry screen
on a temporary server failure, and the not-found page for an unknown product
or order.

Sign in as the admin and verify the database-backed summary, product
create/edit/deactivate controls, and order status controls. Confirm the
layout remains usable at narrow viewport widths.

## Phase 6 database concepts

Apply migrations before checking the summary view and HNSW vector index:

```powershell
npm run db:migrate
```

With PostgreSQL's `psql` installed, run the assignment query examples using
the project's connection details (without Prisma-only URL parameters):

```powershell
psql "postgresql://<user>:<password>@<host>:<port>/<database>" -v ON_ERROR_STOP=1 -f docs/important-queries.sql
```

The examples create and remove only temporary tables with fictional rows;
the script's final query reads `AdminSalesSummary`. Verify the summary API
returns the same order count and non-cancelled sales total as the view:

```sql
SELECT "orderCount", "salesTotal" FROM "AdminSalesSummary";
```

For the index-backed query, use semantic search on `/products` and verify it
returns active matching products. Order checkout is covered by the workflow
checks above and executes atomically at serializable isolation.

## Phase 8 verification record

Automated checks run for this implementation:

```powershell
npm run lint
npm run typecheck
npm run test:auth
npm run test:workflows
npm run build
npx prisma validate
```

These checks passed in the development environment. The workflow runner
reported 16 passing tests. PostgreSQL-backed migration/query checks and
authenticated browser workflows remain manual: Docker/PostgreSQL and `psql`
were unavailable in that environment, so no database-dependent result is
claimed here. Real browser screenshots were captured for the home, login,
and registration pages, including registration at a narrow viewport. Capture
catalogue, checkout, order, and admin screenshots after completing the live
browser checkpoint above against a migrated and seeded database.