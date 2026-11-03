-- CreateSchema
-- Enable pgvector so product descriptions can be stored as 384-dimensional
-- embeddings and searched by vector similarity.
CREATE EXTENSION IF NOT EXISTS vector;

-- Prisma's models are created in PostgreSQL's standard application schema.
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
-- Roles control which application features a user may access.
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
-- Allowed stages in an order's lifecycle.
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
-- Allowed payment outcomes for an order.
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- Core account and catalogue tables. SERIAL columns generate integer IDs.
-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Product categories are referenced by Product.categoryId.
-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- Products hold the current price and stock; order items separately preserve
-- the name and price that applied when an order was placed.
-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stock" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- A cart belongs to one user; CartItem rows contain the products and quantities.
-- CreateTable
CREATE TABLE "Cart" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- An order is the purchase header. Its items and optional payment are stored
-- separately so each can be related to the order by a foreign key.
-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "total" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- OrderItem is a historical snapshot: productName and unitPrice are retained
-- even if the corresponding product is later renamed or repriced.
-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- Each order can have at most one payment record (enforced by a unique index).
-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- Stores one vector embedding per product for semantic similarity search.
-- CreateTable
CREATE TABLE "ProductEmbedding" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "embedding" vector(384) NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductEmbedding_pkey" PRIMARY KEY ("id")
);

-- Keeps before/after row data for changes to audited tables.
-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "oldData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Unique indexes enforce business identifiers and prevent duplicate records.
-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_active_name_idx" ON "Product"("active", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Cart_userId_key" ON "Cart"("userId");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");

-- CreateIndex
CREATE INDEX "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductEmbedding_productId_key" ON "ProductEmbedding"("productId");

-- Supports finding an entity's audit history in chronological order.
-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

-- Foreign keys enforce valid relationships between rows.
-- Deleting a user removes their cart and cart items, but does not remove orders.
-- RESTRICT protects referenced products and orders from accidental deletion;
-- deleting a product removes its embedding because it cannot exist on its own.
-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductEmbedding" ADD CONSTRAINT "ProductEmbedding_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CHECK constraints reject invalid values even when data is written outside
-- the application. They are defined in SQL because Prisma does not represent
-- these PostgreSQL checks in the schema model.
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_price_nonnegative_check" CHECK ("price" >= 0),
  ADD CONSTRAINT "Product_stock_nonnegative_check" CHECK ("stock" >= 0);

ALTER TABLE "CartItem"
  ADD CONSTRAINT "CartItem_quantity_positive_check" CHECK ("quantity" > 0);

ALTER TABLE "Order"
  ADD CONSTRAINT "Order_total_nonnegative_check" CHECK ("total" >= 0);

ALTER TABLE "OrderItem"
  ADD CONSTRAINT "OrderItem_unitPrice_nonnegative_check" CHECK ("unitPrice" >= 0),
  ADD CONSTRAINT "OrderItem_quantity_positive_check" CHECK ("quantity" > 0);

ALTER TABLE "Payment"
  ADD CONSTRAINT "Payment_amount_nonnegative_check" CHECK ("amount" >= 0);

-- Dashboard summary: orderCount includes every order, while salesTotal excludes
-- cancelled orders. COALESCE returns zero when there are no qualifying orders.
CREATE OR REPLACE VIEW "AdminSalesSummary" AS
SELECT
    COUNT(*)::INTEGER AS "orderCount",
    COALESCE(
        SUM("total") FILTER (WHERE "status" <> 'CANCELLED'),
        0
    )::TEXT AS "salesTotal"
FROM "Order";

-- HNSW is a vector index that accelerates approximate nearest-neighbour
-- searches using cosine distance.
CREATE INDEX "ProductEmbedding_embedding_cosine_idx"
ON "ProductEmbedding"
USING hnsw ("embedding" vector_cosine_ops);

-- Recalculates an order's total from its stored line-item prices and quantities.
-- The result is zero if the order has no items.
CREATE OR REPLACE FUNCTION "CalculateOrderTotal"(p_order_id INTEGER)
RETURNS NUMERIC(10, 2)
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(SUM("unitPrice" * "quantity"), 0)::NUMERIC(10, 2)
    FROM "OrderItem"
    WHERE "orderId" = p_order_id;
$$;

-- Applies an allowed order-status transition inside the caller's transaction.
-- FOR UPDATE locks the order row so concurrent status changes cannot both
-- proceed based on the same old status.
-- This procedure is for the admin order-management workflow; customers do not
-- cancel orders through the application's current API.
-- Cancellation is a compensating update, not a rollback of the original
-- checkout: it restores stock and marks a still-pending payment as failed.
-- It does not issue a refund if a payment has already been paid.
CREATE OR REPLACE PROCEDURE "AdminUpdateOrderStatus"(
    p_order_id INTEGER,
    p_new_status "OrderStatus"
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_status "OrderStatus";
BEGIN
    SELECT "status"
    INTO v_current_status
    FROM "Order"
    WHERE "id" = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % was not found.', p_order_id
            USING ERRCODE = 'P0002';
    END IF;

    IF NOT (
        (v_current_status = 'PENDING' AND p_new_status IN ('PROCESSING', 'CANCELLED'))
        OR (v_current_status = 'PROCESSING' AND p_new_status IN ('SHIPPED', 'CANCELLED'))
        OR (v_current_status = 'SHIPPED' AND p_new_status = 'DELIVERED')
    ) THEN
        RAISE EXCEPTION 'Order cannot transition from % to %.',
            v_current_status, p_new_status
            USING ERRCODE = 'P0001';
    END IF;

    IF p_new_status = 'CANCELLED' THEN
        -- Add the ordered quantities back to inventory; checkout itself remains
        -- recorded as an order and is not undone.
        UPDATE "Product" p
        SET "stock" = p."stock" + cancelled_items."quantity"
        FROM (
            SELECT "productId", SUM("quantity")::INTEGER AS "quantity"
            FROM "OrderItem"
            WHERE "orderId" = p_order_id
            GROUP BY "productId"
        ) AS cancelled_items
        WHERE p."id" = cancelled_items."productId";

        UPDATE "Payment"
        SET "status" = 'FAILED'
        WHERE "orderId" = p_order_id
          AND "status" = 'PENDING';
    END IF;

    -- If a prior validation raised an exception, PostgreSQL rolls back these
    -- updates together with the rest of the caller's transaction.
    UPDATE "Order"
    SET "status" = p_new_status
    WHERE "id" = p_order_id;
END;
$$;

-- Shared row-level audit trigger function. It stores the complete row as JSONB:
-- INSERT records NEW, UPDATE records both OLD and NEW, and DELETE records OLD.
-- The trigger's action and table name come from PostgreSQL's TG_OP and
-- TG_TABLE_NAME variables. The audit insert is part of the same transaction as
-- the data change, so it is rolled back if that change fails.
CREATE OR REPLACE FUNCTION "AuditRowChange"()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_entity_id INTEGER;
BEGIN
    IF TG_OP = 'INSERT' THEN
        v_new_data := to_jsonb(NEW);
        v_entity_id := (v_new_data ->> 'id')::INTEGER;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
        v_entity_id := (v_new_data ->> 'id')::INTEGER;
    ELSE
        v_old_data := to_jsonb(OLD);
        v_entity_id := (v_old_data ->> 'id')::INTEGER;
    END IF;

    INSERT INTO "AuditLog" ("entityType", "entityId", "action", "oldData", "newData")
    VALUES (TG_TABLE_NAME, v_entity_id, TG_OP, v_old_data, v_new_data);

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$;

-- Record every inserted, updated, or deleted product after each row changes.
CREATE TRIGGER "Product_audit_changes"
AFTER INSERT OR UPDATE OR DELETE ON "Product"
FOR EACH ROW
EXECUTE FUNCTION "AuditRowChange"();

-- Record every inserted, updated, or deleted order after each row changes.
CREATE TRIGGER "Order_audit_changes"
AFTER INSERT OR UPDATE OR DELETE ON "Order"
FOR EACH ROW
EXECUTE FUNCTION "AuditRowChange"();
