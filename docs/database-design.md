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
- Quantity and price checks remain positive.
- Order history stays intact by using safe foreign-key behavior.
- Product vectors use the pgvector extension.

## Notes

- Money is stored as `Decimal(10,2)` for consistent precision.
- Orders keep immutable snapshots of product name and price at purchase time.
- Cart items enforce one row per user-product pair.
