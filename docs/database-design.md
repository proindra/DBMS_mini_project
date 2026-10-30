# Database design

This project uses PostgreSQL with Prisma as the ORM and pgvector for semantic product search.

## Core entities

- User: stores authentication and role information.
- Category: organizes products.
- Product: stores catalog metadata, stock, and pricing.
- CartItem: cart entries for a user and product.
- Order: customer purchase record.
- OrderItem: snapshot of purchased items for historical fidelity.
- Payment: payment status for each order.
- ProductEmbedding: semantic vector for similarity search.

## Key constraints

- Email is unique.
- SKU is unique.
- Product stock is non-negative.
- Database checks require non-negative prices/totals and positive quantities;
  application validation requires product prices greater than zero.
- Order history stays intact by using safe foreign-key behavior.
- Product vectors use the pgvector extension.
- Product embedding dimension is 384.

## Database concepts demonstrated

- **Transactions:** order checkout uses a serializable transaction to
  decrement stock, create the order and payment, save item snapshots, and
  clear the cart atomically.
- **Views:** `AdminSalesSummary` reports total order count and sales excluding
  cancelled orders. The admin dashboard and summary API read this view.
- **Indexes:** B-tree indexes support category and active-product browsing,
  user cart/order lookups, and order-item relationships. An HNSW index with
  `vector_cosine_ops` accelerates product-vector similarity retrieval.
- **Vector search:** normalized 384-dimensional product/query embeddings are
  ranked by pgvector cosine distance.

The relevant indexes are defined in the Prisma schema and the SQL migrations.
`docs/important-queries.sql` contains isolated temporary-table examples for
the assignment's required SQL statements and query clauses.

## Entity relationships

The Mermaid ER diagram is maintained in [`er-diagram.mmd`](./er-diagram.mmd).
Products belong to categories; users own carts and orders; orders contain
purchase-time item snapshots and an optional payment; products may have one
embedding. Foreign keys preserve order history and remove a product's
derived embedding when that product is deleted.

## Notes

- Product prices and order amounts are denominated in Indian rupees (INR) and
  stored as `Decimal(10,2)` for consistent precision.
- Orders keep immutable snapshots of product name and price at purchase time.
- Cart items enforce one row per user-product pair.
