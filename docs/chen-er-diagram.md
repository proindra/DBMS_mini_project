# StoreIQ Chen-Style ER Diagram

This Chen-style ER diagram uses rectangles for entities, ovals for attributes,
and diamonds for relationships. `CartItem` and `OrderItem` are associative
entities: they resolve many-to-many relationships and store attributes of
those relationships.

```mermaid
flowchart LR
    User[User]
    U_id([id PK])
    U_name([name])
    U_email([email UK])
    U_role([role])
    U_password([passwordHash])
    U_created([createdAt])
    User --- U_id
    User --- U_name
    User --- U_email
    User --- U_role
    User --- U_password
    User --- U_created

    Category[Category]
    Cat_id([id PK])
    Cat_name([name UK])
    Cat_description([description])
    Category --- Cat_id
    Category --- Cat_name
    Category --- Cat_description

    Product[Product]
    P_id([id PK])
    P_name([name])
    P_slug([slug UK])
    P_sku([sku UK])
    P_description([description])
    P_price([price])
    P_stock([stock])
    P_active([active])
    Product --- P_id
    Product --- P_name
    Product --- P_slug
    Product --- P_sku
    Product --- P_description
    Product --- P_price
    Product --- P_stock
    Product --- P_active

    Cart[Cart]
    Cart_id([id PK])
    Cart_user_id([userId FK UK])
    Cart_created([createdAt])
    Cart --- Cart_id
    Cart --- Cart_user_id
    Cart --- Cart_created

    CartItem[CartItem]
    CI_id([id PK])
    CI_quantity([quantity])
    CartItem --- CI_id
    CartItem --- CI_quantity

    Order[Order]
    O_id([id PK])
    O_status([status])
    O_total([total])
    O_created([createdAt])
    Order --- O_id
    Order --- O_status
    Order --- O_total
    Order --- O_created

    OrderItem[OrderItem]
    OI_id([id PK])
    OI_product_name([productName snapshot])
    OI_unit_price([unitPrice snapshot])
    OI_quantity([quantity])
    OrderItem --- OI_id
    OrderItem --- OI_product_name
    OrderItem --- OI_unit_price
    OrderItem --- OI_quantity

    Payment[Payment]
    Pay_id([id PK])
    Pay_amount([amount])
    Pay_status([status])
    Payment --- Pay_id
    Payment --- Pay_amount
    Payment --- Pay_status

    Embedding[ProductEmbedding]
    E_id([id PK])
    E_vector([embedding vector 384])
    E_model([model])
    Embedding --- E_id
    Embedding --- E_vector
    Embedding --- E_model

    OwnsCart{owns}
    ContainsCartItem{contains}
    InCart{includes product}
    Categorizes{categorizes}
    PlacesOrder{places}
    ContainsOrderItem{contains}
    ReferencesProduct{references product}
    HasPayment{has}
    HasEmbedding{described by}

    User ---|1| OwnsCart
    OwnsCart ---|0..1| Cart
    Cart ---|1| ContainsCartItem
    ContainsCartItem ---|0..*| CartItem
    CartItem ---|0..*| InCart
    InCart ---|1| Product
    Category ---|1| Categorizes
    Categorizes ---|0..*| Product
    User ---|1| PlacesOrder
    PlacesOrder ---|0..*| Order
    Order ---|1| ContainsOrderItem
    ContainsOrderItem ---|1..*| OrderItem
    OrderItem ---|0..*| ReferencesProduct
    ReferencesProduct ---|1| Product
    Order ---|1| HasPayment
    HasPayment ---|0..1| Payment
    Product ---|1| HasEmbedding
    HasEmbedding ---|0..1| Embedding
```

## Relationship summary

- A user may have zero or one cart and may place many orders. Each cart belongs
  to exactly one user.
- A cart contains cart items; each cart item refers to one product. The unique
  cart-product pair prevents duplicate product rows in a cart.
- A category can contain many products; each product belongs to one category.
- An order contains one or more order items. Each order item refers to one
  product and keeps its name and unit-price snapshots to preserve order history.
- An order may have one payment, and a product may have one search embedding.

`PK` means primary key, `FK` means foreign key, and `UK` means a unique key.
The unique `Cart.userId` constraint enforces the one-cart-per-user
relationship in the relational schema.

The relational schema is defined in
[`../prisma/schema.prisma`](../prisma/schema.prisma), and the database mapping
is described in [`database-design.md`](./database-design.md).
