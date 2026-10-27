import assert from "node:assert/strict";
import test from "node:test";
import {
  assertOwnerOrAdmin,
  AuthAccessError,
  requirePrincipal,
  requireRole,
} from "./authorization";

const customer = { id: 12, role: "CUSTOMER" as const };
const admin = { id: 1, role: "ADMIN" as const };

test("unauthenticated requests are rejected", () => {
  assert.throws(
    () => requirePrincipal(null),
    (error: unknown) =>
      error instanceof AuthAccessError && error.status === 401,
  );
});

test("only admins pass the admin role check", () => {
  assert.equal(requireRole(admin, "ADMIN"), admin);
  assert.throws(
    () => requireRole(customer, "ADMIN"),
    (error: unknown) =>
      error instanceof AuthAccessError && error.status === 403,
  );
});

test("customers can access only their own records; admins may access any owner", () => {
  assert.equal(assertOwnerOrAdmin(customer, customer.id), customer);
  assert.throws(
    () => assertOwnerOrAdmin(customer, 13),
    (error: unknown) =>
      error instanceof AuthAccessError && error.status === 403,
  );
  assert.equal(assertOwnerOrAdmin(admin, customer.id), admin);
});
