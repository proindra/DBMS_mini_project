import assert from "node:assert/strict";
import test from "node:test";
import {
  cartItemInputSchema,
  cartQuantitySchema,
  productFiltersSchema,
  productInputSchema,
} from "./validation";

const validProduct = {
  name: "Sample keyboard",
  slug: "sample-keyboard",
  description: "A reliable mechanical keyboard for everyday work.",
  sku: "KEY-123",
  categoryId: 1,
  price: 99.95,
  stock: 7,
};

test("product validation normalizes slug and SKU and defaults active", () => {
  const parsed = productInputSchema.safeParse({
    ...validProduct,
    slug: " Sample-Keyboard ",
    sku: "key-123",
  });
  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.slug, "sample-keyboard");
    assert.equal(parsed.data.sku, "KEY-123");
    assert.equal(parsed.data.active, true);
  }
});

test("product validation rejects negative price and stock", () => {
  assert.equal(productInputSchema.safeParse({ ...validProduct, price: -1 }).success, false);
  assert.equal(productInputSchema.safeParse({ ...validProduct, stock: -1 }).success, false);
});

test("cart quantities must be positive integers", () => {
  assert.equal(cartItemInputSchema.safeParse({ productId: 1, quantity: 2 }).success, true);
  assert.equal(cartQuantitySchema.safeParse({ quantity: 0 }).success, false);
  assert.equal(cartQuantitySchema.safeParse({ quantity: 1.5 }).success, false);
});

test("catalog filters validate categories and supported sort orders", () => {
  assert.equal(productFiltersSchema.safeParse({ categoryId: "2", sort: "price-desc" }).success, true);
  assert.equal(productFiltersSchema.safeParse({ categoryId: "-1" }).success, false);
  assert.equal(productFiltersSchema.safeParse({ sort: "random" }).success, false);
});
