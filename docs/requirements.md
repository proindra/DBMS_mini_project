# Requirements and setup

## Stack

- Next.js 16 + TypeScript
- PostgreSQL 16 + pgvector
- Prisma ORM
- Docker Compose for a local database

## Local database configuration

Use a local `.env` file with a PostgreSQL connection string like:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_order_management?schema=public"
AUTH_SECRET="replace-with-a-random-secret"
```

The database service is defined in `docker-compose.yml`.
