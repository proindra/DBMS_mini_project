# StoreIQ Entity-Relationship Model

This ER diagram shows the core e-commerce entities and how they relate.
`CartItem` and `OrderItem` represent relationships that contain their own
attributes, such as product quantity and purchase-time price.

```mermaid
erDiagram
    User {
        int id PK
        string name
        string email UK
        string passwordHash
        enum role
        datetime createdAt
    }

    Category {
        int id PK
        string name UK
        string description
    }

    Product {
        int id PK
        int categoryId FK
        string name
        string slug UK
        string description
        string sku UK
        decimal price
        int stock
        boolean active
    }

    Cart {
        int id PK
        int userId FK
        datetime createdAt
    }

    CartItem {
        int id PK
        int cartId FK
        int productId FK
        int quantity
        datetime createdAt
    }

    Order {
        int id PK
        int userId FK
        enum status
        decimal total
        datetime createdAt
    }

    OrderItem {
        int id PK
        int orderId FK
        int productId FK
        string productName
        decimal unitPrice
        int quantity
    }

    Payment {
        int id PK
        int orderId FK
        decimal amount
        enum status
        datetime createdAt
    }

    ProductEmbedding {
        int id PK
        int productId FK
        vector_384 embedding
        string model
        datetime createdAt
    }

    User ||--o| Cart : owns
    Cart ||--o{ CartItem : contains
    Product ||--o{ CartItem : appears_in
    Category ||--o{ Product : categorizes
    User ||--o{ Order : places
    Order ||--|{ OrderItem : contains
    Product ||--o{ OrderItem : purchased_as
    Order ||--o| Payment : has
    Product ||--o| ProductEmbedding : described_by
```

## Relationship summary

- A user may have one cart and may place many orders.
- A cart contains cart items; each cart item refers to one product.
- A category can contain many products; each product belongs to one category.
- An order contains one or more order items. Order items keep a snapshot of
  product name and unit price so order history is preserved.
- An order may have one payment, and a product may have one search embedding.

`PK` means primary key, `FK` means foreign key, and `UK` means a unique key.
The unique `Cart.userId` constraint enforces the one-cart-per-user
relationship, even though the Mermaid ER notation only labels it as an `FK`.

The relational schema is defined in
[`../prisma/schema.prisma`](../prisma/schema.prisma), and the database mapping
is described in [`database-design.md`](./database-design.md).
