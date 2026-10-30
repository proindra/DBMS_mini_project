import {
  pipeline,
  type FeatureExtractionPipeline,
} from "@huggingface/transformers";

export const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";
export const EMBEDDING_DIMENSIONS = 384;

let extractorPromise: Promise<FeatureExtractionPipeline> | undefined;

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline(
      "feature-extraction",
      EMBEDDING_MODEL,
    ).catch((error: unknown) => {
      extractorPromise = undefined;
      throw error;
    });
  }
  return extractorPromise;
}

export function productEmbeddingText(product: {
  name: string;
  description: string;
  category: { name: string };
}) {
  return `${product.name}. ${product.description} Category: ${product.category.name}`;
}

export async function embedText(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  const embedding = Array.from(output.data, Number);

  if (
    embedding.length !== EMBEDDING_DIMENSIONS ||
    embedding.some((value) => !Number.isFinite(value))
  ) {
    throw new Error(
      `Embedding model returned an invalid vector; expected ${EMBEDDING_DIMENSIONS} finite values.`,
    );
  }

  return embedding;
}

export function toPgVector(embedding: number[]) {
  if (
    embedding.length !== EMBEDDING_DIMENSIONS ||
    embedding.some((value) => !Number.isFinite(value))
  ) {
    throw new Error(
      `Expected a ${EMBEDDING_DIMENSIONS}-dimensional finite embedding.`,
    );
  }

  return `[${embedding.join(",")}]`;
}
