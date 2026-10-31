import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { CACHE_TTL_SECONDS, getCachedValue } from "@/lib/cache/redis";
import {
  EMBEDDING_MODEL,
  embedText,
  productEmbeddingText,
  toPgVector,
} from "./embedding";

export const SEMANTIC_SEARCH_LIMIT = 12;

export type ProductForEmbedding = {
  name: string;
  description: string;
  category: { name: string };
};

export type SemanticProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  categoryName: string;
  similarity: number;
};

export class SemanticQueryEmbeddingError extends Error {
  constructor(readonly originalError: unknown) {
    super("Could not create an embedding for the semantic query.");
    this.name = "SemanticQueryEmbeddingError";
  }
}

export async function createProductVector(product: ProductForEmbedding) {
  return embedText(productEmbeddingText(product));
}

export async function storeProductVector(
  tx: Prisma.TransactionClient,
  productId: number,
  embedding: number[],
) {
  const vector = toPgVector(embedding);
  await tx.$executeRaw`
    INSERT INTO "ProductEmbedding" ("productId", "embedding", "model", "createdAt")
    VALUES (${productId}, ${vector}::vector, ${EMBEDDING_MODEL}, NOW())
    ON CONFLICT ("productId") DO UPDATE
    SET "embedding" = EXCLUDED."embedding",
        "model" = EXCLUDED."model",
        "createdAt" = NOW()
  `;
}

export async function searchProductsByVector(
  embedding: number[],
  categoryId?: number,
) {
  const vector = toPgVector(embedding);
  const categoryFilter =
    categoryId === undefined
      ? Prisma.empty
      : Prisma.sql`AND p."categoryId" = ${categoryId}`;
  return prisma.$queryRaw<SemanticProduct[]>`
    SELECT
      p."id",
      p."name",
      p."slug",
      p."description",
      p."price"::text AS "price",
      p."stock",
      c."name" AS "categoryName",
      (1 - (pe."embedding" <=> ${vector}::vector)) AS "similarity"
    FROM "ProductEmbedding" pe
    JOIN "Product" p ON p."id" = pe."productId"
    JOIN "Category" c ON c."id" = p."categoryId"
    WHERE p."active" = true
      AND pe."model" = ${EMBEDDING_MODEL}
      ${categoryFilter}
    ORDER BY pe."embedding" <=> ${vector}::vector
    LIMIT ${SEMANTIC_SEARCH_LIMIT}
  `;
}

export function searchProductsByText(query: string, categoryId?: number) {
  const normalizedQuery = query.trim().toLowerCase();
  return getCachedValue(
    "catalogue",
    `semantic:${categoryId ?? "all"}:${normalizedQuery}`,
    CACHE_TTL_SECONDS.semanticSearch,
    async () => {
      let embedding: number[];
      try {
        embedding = await embedText(query);
      } catch (error) {
        throw new SemanticQueryEmbeddingError(error);
      }

      return searchProductsByVector(embedding, categoryId);
    },
  );
}

export async function indexProductEmbeddings() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      category: { select: { name: true } },
    },
    orderBy: { id: "asc" },
  });

  for (const product of products) {
    const embedding = await createProductVector(product);
    await prisma.$transaction((tx) =>
      storeProductVector(tx, product.id, embedding),
    );
  }

  return products.length;
}
