import assert from "node:assert/strict";
import test from "node:test";
import { credentialsSchema, registrationSchema } from "./validation";

test("registration normalizes email and creates only valid customer input", () => {
  const parsed = registrationSchema.safeParse({
    name: "  Alex Customer ",
    email: "  ALEX@example.com ",
    password: "password123",
    role: "ADMIN",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.deepEqual(parsed.data, {
      name: "Alex Customer",
      email: "alex@example.com",
      password: "password123",
    });
  }
});

test("registration rejects short and overlong passwords", () => {
  assert.equal(
    registrationSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "short",
    }).success,
    false,
  );
  assert.equal(
    registrationSchema.safeParse({
      name: "Alex",
      email: "alex@example.com",
      password: "a".repeat(73),
    }).success,
    false,
  );
});

test("credentials validation rejects malformed email and empty password", () => {
  assert.equal(
    credentialsSchema.safeParse({ email: "not-an-email", password: "pass" }).success,
    false,
  );
});
