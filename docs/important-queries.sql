-- Safe, self-contained examples for the required SQL concepts.
-- All sample rows are inserted into temporary tables and are removed when
-- this transaction ends. No application data is changed.
BEGIN;

CREATE TEMPORARY TABLE "Phase6DemoCategory" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMPORARY TABLE "Phase6DemoProduct" (
    "id" INTEGER PRIMARY KEY,
    "categoryId" INTEGER NOT NULL REFERENCES "Phase6DemoCategory" ("id"),
    "name" TEXT NOT NULL,
    "price" NUMERIC(10, 2) NOT NULL CHECK ("price" >= 0)
) ON COMMIT DROP;

CREATE TEMPORARY TABLE "Phase6DemoOrderLine" (
    "id" INTEGER PRIMARY KEY,
    "productId" INTEGER NOT NULL REFERENCES "Phase6DemoProduct" ("id"),
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0)
) ON COMMIT DROP;

-- ALTER
ALTER TABLE "Phase6DemoProduct"
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT FALSE;

-- INSERT
INSERT INTO "Phase6DemoCategory" ("id", "name") VALUES
    (1, 'Audio'),
    (2, 'Home Office');

INSERT INTO "Phase6DemoProduct" ("id", "categoryId", "name", "price") VALUES
    (1, 1, 'Travel headphones', 160.00),
    (2, 1, 'Mini speaker', 48.75),
    (3, 2, 'Desk lamp', 64.00),
    (4, 2, 'Temporary delete example', 1.00);

INSERT INTO "Phase6DemoOrderLine" ("id", "productId", "quantity") VALUES
    (1, 1, 2),
    (2, 2, 3),
    (3, 3, 1);

-- UPDATE
UPDATE "Phase6DemoProduct"
SET "price" = 52.00, "featured" = TRUE
WHERE "id" = 2;

-- DELETE only the explicitly marked demo row.
DELETE FROM "Phase6DemoProduct"
WHERE "id" = 4
  AND "name" = 'Temporary delete example';

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
DROP TABLE "Phase6DemoCategory";

COMMIT;

-- The Phase 6 migration creates this live summary view.
SELECT "orderCount", "salesTotal"
FROM "AdminSalesSummary";
