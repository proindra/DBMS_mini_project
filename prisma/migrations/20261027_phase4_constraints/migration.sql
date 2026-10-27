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
