# Requirements and setup

## Stack

- Next.js 16 + TypeScript
- React 19 and Tailwind CSS
- Node.js 20.9 or newer + npm
- PostgreSQL 16 + pgvector
- Prisma ORM
- Docker Desktop / Compose for a local database
- Hugging Face `all-MiniLM-L6-v2` ONNX embeddings, run locally with
  Transformers.js

## Local database configuration

Use a local `.env` file with a PostgreSQL connection string like:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecommerce_order_management?schema=public"
AUTH_SECRET="replace-with-a-random-secret"
```

The database service is defined in `docker-compose.yml`.
