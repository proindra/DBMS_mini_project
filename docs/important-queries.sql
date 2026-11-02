-- Safe, self-contained examples for the required SQL concepts.
-- All sample rows are inserted into temporary tables and are removed when
-- this transaction ends. No application data is changed.
BEGIN;

CREATE TEMPORARY TABLE "Phase6DemoCategory" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMPORARY TABLE "Phase6DemoCustomer" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMPORARY TABLE "Phase6DemoOrder" (
    "id" INTEGER PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES "Phase6DemoCustomer" ("id"),
    "status" TEXT NOT NULL
) ON COMMIT DROP;

CREATE TEMPORARY TABLE "Phase6DemoProduct" (
    "id" INTEGER PRIMARY KEY,
    "categoryId" INTEGER NOT NULL REFERENCES "Phase6DemoCategory" ("id"),
    "name" TEXT NOT NULL,
    "price" NUMERIC(10, 2) NOT NULL CHECK ("price" >= 0),
    "stock" INTEGER NOT NULL CHECK ("stock" >= 0)
) ON COMMIT DROP;

CREATE TEMPORARY TABLE "Phase6DemoOrderLine" (
    "id" INTEGER PRIMARY KEY,
    "productId" INTEGER NOT NULL REFERENCES "Phase6DemoProduct" ("id"),
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0)
) ON COMMIT DROP;

-- ALTER
ALTER TABLE "Phase6DemoProduct"
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX "Phase6DemoProduct_categoryId_idx"
ON "Phase6DemoProduct" ("categoryId");

-- INSERT
INSERT INTO "Phase6DemoCategory" ("id", "name") VALUES
    (1, 'Audio'),
    (2, 'Home Office');

INSERT INTO "Phase6DemoCustomer" ("id", "name", "email") VALUES
    (1, 'Asha Rao', 'asha@example.test'),
    (2, 'Dev Shah', 'dev@example.test'),
    (3, 'Temporary customer', 'temporary@example.test');

INSERT INTO "Phase6DemoOrder" ("id", "userId", "status") VALUES
    (1, 1, 'PENDING'),
    (2, 1, 'PROCESSING'),
    (3, 3, 'PENDING');

INSERT INTO "Phase6DemoProduct" ("id", "categoryId", "name", "price", "stock") VALUES
    (1, 1, 'Travel headphones', 160.00, 12),
    (2, 1, 'Mini speaker', 48.75, 30),
    (3, 2, 'Desk lamp', 64.00, 8),
    (4, 2, 'Temporary delete example', 1.00, 1);

INSERT INTO "Phase6DemoOrderLine" ("id", "productId", "quantity") VALUES
    (1, 1, 2),
    (2, 2, 3),
    (3, 3, 1);

-- UPDATE
UPDATE "Phase6DemoProduct"
SET "price" = 52.00, "stock" = 28, "featured" = TRUE
WHERE "id" = 2;

-- Update a demo order's status.
UPDATE "Phase6DemoOrder"
SET "status" = 'PROCESSING'
WHERE "id" = 1;

-- Update a demo customer.
UPDATE "Phase6DemoCustomer"
SET "name" = 'Asha R.'
WHERE "id" = 1;

-- DELETE only the explicitly marked demo row.
DELETE FROM "Phase6DemoProduct"
WHERE "id" = 4
  AND "name" = 'Temporary delete example';

DELETE FROM "Phase6DemoOrder"
WHERE "id" = 3
  AND "status" = 'PENDING';

DELETE FROM "Phase6DemoCustomer"
WHERE "id" = 3
  AND "email" = 'temporary@example.test';

-- Simple retrieval: products, orders, and customers.
SELECT "name", "price", "stock"
FROM "Phase6DemoProduct"
ORDER BY "name";

SELECT o."id", c."name" AS "customer", o."status"
FROM "Phase6DemoOrder" o
JOIN "Phase6DemoCustomer" c ON c."id" = o."userId"
ORDER BY o."id";

-- Nested query: customers who have placed at least one demo order.
SELECT c."id", c."name"
FROM "Phase6DemoCustomer" c
WHERE c."id" IN (
    SELECT o."userId"
    FROM "Phase6DemoOrder" o
)
ORDER BY c."id";

-- Correlated query: products priced above their own category average.
SELECT p."name", p."price", p."categoryId"
FROM "Phase6DemoProduct" p
WHERE p."price" > (
    SELECT AVG(category_product."price")
    FROM "Phase6DemoProduct" category_product
    WHERE category_product."categoryId" = p."categoryId"
)
ORDER BY p."categoryId", p."price" DESC;

-- SELECT, JOIN, GROUP BY, HAVING, ORDER BY, and aggregate functions.
SELECT
    c."name" AS "category",
    COUNT(DISTINCT p."id") AS "products",
    SUM(ol."quantity") AS "unitsSold",
    SUM(p."price" * ol."quantity") AS "demoRevenue",
    AVG(p."price") AS "averageProductPrice"
FROM "Phase6DemoCategory" c
JOIN "Phase6DemoProduct" p ON p."categoryId" = c."id"
JOIN "Phase6DemoOrderLine" ol ON ol."productId" = p."id"
GROUP BY c."id", c."name"
HAVING SUM(ol."quantity") >= 1
ORDER BY "demoRevenue" DESC;

-- Subquery: demo products priced above the demo-catalogue average.
SELECT "name", "price"
FROM "Phase6DemoProduct"
WHERE "price" > (
    SELECT AVG("price")
    FROM "Phase6DemoProduct"
)
ORDER BY "price" DESC;

-- DROP
DROP TABLE "Phase6DemoOrderLine";
DROP TABLE "Phase6DemoProduct";
DROP TABLE "Phase6DemoOrder";
DROP TABLE "Phase6DemoCustomer";
DROP TABLE "Phase6DemoCategory";

COMMIT;

-- The Phase 6 migration creates this live summary view.
SELECT "orderCount", "salesTotal"
FROM "AdminSalesSummary";

-- CTE: summarize order counts and non-cancelled sales per customer.
WITH customer_order_summary AS (
    SELECT
        o."userId",
        COUNT(*) AS "orderCount",
        COALESCE(
            SUM(o."total") FILTER (WHERE o."status" <> 'CANCELLED'),
            0
        ) AS "salesTotal"
    FROM "Order" o
    GROUP BY o."userId"
)
SELECT
    u."name",
    u."email",
    summary."orderCount",
    summary."salesTotal"
FROM customer_order_summary summary
JOIN "User" u ON u."id" = summary."userId"
ORDER BY summary."salesTotal" DESC, u."name";

-- The stored procedure and function operate on the real application tables:
-- SELECT "CalculateOrderTotal"(1);
-- CALL "AdminUpdateOrderStatus"(1, 'PROCESSING');
-- The procedure enforces the application status transitions. Cancelling an
-- order restores its stock and marks a pending payment failed.
-- Product and Order inserts, updates, and deletes are recorded in AuditLog.
