-- CreateSchema
CREATE EXTENSION IF NOT EXISTS vector;

CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

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

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductEmbedding" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "embedding" vector(384) NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductEmbedding_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_createdAt_idx" ON "AuditLog"("entityType", "entityId", "createdAt");

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

-- Check constraints maintained in SQL because Prisma schema syntax does not
-- currently represent PostgreSQL CHECK constraints.
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

CREATE OR REPLACE VIEW "AdminSalesSummary" AS
SELECT
    COUNT(*)::INTEGER AS "orderCount",
    COALESCE(
        SUM("total") FILTER (WHERE "status" <> 'CANCELLED'),
        0
    )::TEXT AS "salesTotal"
FROM "Order";

CREATE INDEX "ProductEmbedding_embedding_cosine_idx"
ON "ProductEmbedding"
USING hnsw ("embedding" vector_cosine_ops);

CREATE OR REPLACE FUNCTION "CalculateOrderTotal"(p_order_id INTEGER)
RETURNS NUMERIC(10, 2)
LANGUAGE SQL
STABLE
AS $$
    SELECT COALESCE(SUM("unitPrice" * "quantity"), 0)::NUMERIC(10, 2)
    FROM "OrderItem"
    WHERE "orderId" = p_order_id;
$$;

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

    UPDATE "Order"
    SET "status" = p_new_status
    WHERE "id" = p_order_id;
END;
$$;

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

CREATE TRIGGER "Product_audit_changes"
AFTER INSERT OR UPDATE OR DELETE ON "Product"
FOR EACH ROW
EXECUTE FUNCTION "AuditRowChange"();

CREATE TRIGGER "Order_audit_changes"
AFTER INSERT OR UPDATE OR DELETE ON "Order"
FOR EACH ROW
EXECUTE FUNCTION "AuditRowChange"();
