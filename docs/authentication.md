# Authentication and authorization

## Sign-in and registration

- Auth.js Credentials validates email and password on the server.
- Passwords are checked with bcryptjs; registration stores only a bcrypt hash.
- Auth.js sign-out clears the session cookie.
- Email is trimmed and normalized to lowercase.
- Public registration accepts no role and always creates a `CUSTOMER`.
- Admin accounts are provisioned through the seed script.
- Auth.js uses an encrypted JWT session cookie with a seven-day lifetime.

## Server-side authorization

`src/lib/auth/current-user.ts` resolves the session user against PostgreSQL on
each protected request. This ensures role changes in the database take effect
without trusting a stale role in the session token.

- `GET /api/account` returns the signed-in user's safe profile.
- `GET /api/cart` scopes cart items to the signed-in user.
- `GET /api/orders` scopes customer orders to the signed-in user; admins may
  view all orders.
- `GET /api/admin/summary` is admin-only.
- `/account` and `/admin` repeat the authorization checks while rendering.

Shared authorization helpers in `src/lib/auth/authorization.ts` reject
unauthenticated requests with 401 and unauthorized roles/ownership with 403.
Protected order and cart reads are scoped in their database query.

## Local test accounts

After running `npm run db:seed`:

- Customer: `alice@example.com` / `password123`
- Admin: `bob@example.com` / `password123`

These are demo credentials only. Replace `AUTH_SECRET` and the demo passwords
before deploying or using the application with real users.

## Tests

Run focused validation and authorization tests with:

```powershell
npm run test:auth
```

Live sign-in and database endpoint checks require PostgreSQL to be running with
the Prisma migration applied and seed data loaded.
