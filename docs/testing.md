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