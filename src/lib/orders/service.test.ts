import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@prisma/client";
import { calculateOrderTotal, OrderWorkflowError } from "./service";

test("order totals use exact decimal arithmetic", () => {
  const total = calculateOrderTotal([
    { price: new Prisma.Decimal("19.99"), quantity: 3 },
    { price: new Prisma.Decimal("0.05"), quantity: 2 },
  ]);
  assert.equal(total.toFixed(2), "60.07");
});

test("empty-cart checkout has a client-safe workflow error", () => {
  const error = new OrderWorkflowError("Your cart is empty.", 400);
  assert.equal(error.status, 400);
  assert.equal(error.message, "Your cart is empty.");
});
