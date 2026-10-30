import assert from "node:assert/strict";
import test from "node:test";
import {
  EMBEDDING_DIMENSIONS,
  productEmbeddingText,
  toPgVector,
} from "./embedding";
import { semanticSearchSchema } from "./validation";

test("semantic search accepts a trimmed description within the query limit", () => {
  assert.deepEqual(semanticSearchSchema.parse({ query: "  quiet travel headphones  " }), {
    query: "quiet travel headphones",
  });
});

test("semantic search rejects empty, short, or oversized descriptions", () => {
  assert.equal(semanticSearchSchema.safeParse({ query: " " }).success, false);
  assert.equal(semanticSearchSchema.safeParse({ query: "x" }).success, false);
  assert.equal(
    semanticSearchSchema.safeParse({ query: "a".repeat(301) }).success,
    false,
  );
});

test("product vectors include the name, description, and category", () => {
  assert.equal(
    productEmbeddingText({
      name: "Travel headphones",
      description: "Noise reduction and a long battery life.",
      category: { name: "Audio" },
    }),
    "Travel headphones. Noise reduction and a long battery life. Category: Audio",
  );
});

test("pgvector serialization requires 384 finite dimensions", () => {
  const embedding = Array.from({ length: EMBEDDING_DIMENSIONS }, (_, i) => i / 384);
  assert.equal(toPgVector(embedding).startsWith("[0,0.002604"), true);
  assert.throws(() => toPgVector([1, 2, 3]), /384-dimensional/);
  assert.throws(
    () => toPgVector([...embedding.slice(0, -1), Number.NaN]),
    /384-dimensional/,
  );
});
