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