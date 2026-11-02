# StoreIQ DBMS Project — Review Demo

## Project introduction

> StoreIQ is an e-commerce order-management project built with PostgreSQL and
> Prisma. It demonstrates relational database design, SQL queries, transactions,
> and PostgreSQL routines alongside the web application.

## ER model and relational mapping

> The main entities are User, Category, Product, Cart, Order, and OrderItem.
> CartItem connects a cart to products and stores quantities. OrderItem connects
> orders to products while preserving the product name and price at purchase
> time.

The ER diagram is in [`er-diagram.mmd`](./er-diagram.mmd), and the relational
mapping is documented in [`database-design.md`](./database-design.md).

## DDL and DML demo

Run this complete block in pgAdmin's Query Tool. It creates temporary tables,
demonstrates table creation, alteration, constraints, an index, inserts,
updates, deletes, and simple retrieval, then rolls everything back. It does
not change the application's permanent tables or data.

```sql
BEGIN;

CREATE TEMPORARY TABLE "ReviewDemoCategory" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMPORARY TABLE "ReviewDemoProduct" (
    "id" INTEGER PRIMARY KEY,
    "categoryId" INTEGER NOT NULL
        REFERENCES "ReviewDemoCategory" ("id"),
    "name" TEXT NOT NULL,
    "price" NUMERIC(10, 2) NOT NULL CHECK ("price" >= 0),
    "stock" INTEGER NOT NULL CHECK ("stock" >= 0)
) ON COMMIT DROP;

ALTER TABLE "ReviewDemoProduct"
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX "ReviewDemoProduct_categoryId_idx"
ON "ReviewDemoProduct" ("categoryId");

INSERT INTO "ReviewDemoCategory" ("id", "name") VALUES
    (1, 'Audio'),
    (2, 'Home Office');

INSERT INTO "ReviewDemoProduct"
    ("id", "categoryId", "name", "price", "stock")
VALUES
    (1, 1, 'Travel headphones', 160.00, 12),
    (2, 1, 'Mini speaker', 48.75, 30),
    (3, 2, 'Desk lamp', 64.00, 8);

UPDATE "ReviewDemoProduct"
SET "price" = 52.00, "stock" = 28, "featured" = TRUE
WHERE "id" = 2;

DELETE FROM "ReviewDemoProduct"
WHERE "id" = 3;

SELECT
    p."name",
    c."name" AS "category",
    p."price",
    p."stock",
    p."featured"
FROM "ReviewDemoProduct" p
JOIN "ReviewDemoCategory" c ON c."id" = p."categoryId"
ORDER BY p."id";

ROLLBACK;
```

## Simple query: retrieve products

```sql
SELECT
    p."name",
    c."name" AS "category",
    p."price",
    p."stock"
FROM "Product" p
JOIN "Category" c ON c."id" = p."categoryId"
WHERE p."active" = TRUE
ORDER BY c."name", p."name"
LIMIT 10;
```

## Simple query: retrieve customers and orders

```sql
SELECT
    o."id" AS "orderId",
    u."name" AS "customer",
    u."email",
    o."status",
    o."total",
    o."createdAt"
FROM "Order" o
JOIN "User" u ON u."id" = o."userId"
ORDER BY o."createdAt" DESC
LIMIT 10;
```

## Nested query: customers who placed orders

```sql
SELECT u."id", u."name", u."email"
FROM "User" u
WHERE u."id" IN (
    SELECT o."userId"
    FROM "Order" o
)
ORDER BY u."name";
```

## Correlated query: products above their category average

```sql
SELECT
    p."name",
    c."name" AS "category",
    p."price"
FROM "Product" p
JOIN "Category" c ON c."id" = p."categoryId"
WHERE p."price" > (
    SELECT AVG(other_product."price")
    FROM "Product" other_product
    WHERE other_product."categoryId" = p."categoryId"
)
ORDER BY c."name", p."price" DESC;
```

## Function: calculate an order total

```sql
SELECT
    o."id" AS "orderId",
    o."total" AS "storedTotal",
    "CalculateOrderTotal"(o."id") AS "calculatedFromItems"
FROM "Order" o
ORDER BY o."id"
LIMIT 10;
```

## View: sales summary

```sql
SELECT * FROM "AdminSalesSummary";
```

## Trigger: demonstrate audit logging safely

This performs a no-value-change update to a product to fire the audit trigger.
The surrounding transaction is rolled back, so neither the update nor its
audit record is retained.

```sql
BEGIN;

UPDATE "Product"
SET "price" = "price"
WHERE "id" = (SELECT MIN("id") FROM "Product");

SELECT "entityType", "entityId", "action", "createdAt"
FROM "AuditLog"
WHERE "entityType" = 'Product'
ORDER BY "id" DESC
LIMIT 5;

ROLLBACK;
```

## Stored procedure: demonstrate an order status change safely

This finds one order in a status that has a valid next transition, calls the
administrative procedure, and rolls the transaction back. If there are no
eligible orders, it reports that and makes no change.

```sql
BEGIN;

DO $$
DECLARE
    v_order_id INTEGER;
    v_current_status "OrderStatus";
    v_next_status "OrderStatus";
BEGIN
    SELECT "id", "status"
    INTO v_order_id, v_current_status
    FROM "Order"
    WHERE "status" IN ('PENDING', 'PROCESSING', 'SHIPPED')
    ORDER BY "id"
    LIMIT 1
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE NOTICE 'No eligible order is available for the procedure demo.';
        RETURN;
    END IF;

    CASE v_current_status
        WHEN 'PENDING' THEN v_next_status := 'PROCESSING';
        WHEN 'PROCESSING' THEN v_next_status := 'SHIPPED';
        WHEN 'SHIPPED' THEN v_next_status := 'DELIVERED';
    END CASE;

    CALL "AdminUpdateOrderStatus"(v_order_id, v_next_status);
    RAISE NOTICE 'Order % changed from % to % inside this transaction.',
        v_order_id, v_current_status, v_next_status;
END;
$$;

ROLLBACK;
```

## Closing

> This project brings the ER model through PostgreSQL implementation: tables,
> relationships, constraints, queries, updates, a stored procedure, a
> function, and audit triggers. The application also uses transactions to
> protect checkout and order data.

For the full set of self-contained SQL examples, see
[`important-queries.sql`](./important-queries.sql).
