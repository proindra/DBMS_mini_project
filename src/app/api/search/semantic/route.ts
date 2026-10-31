import { NextResponse } from "next/server";
import {
  searchProductsByText,
  SemanticQueryEmbeddingError,
} from "@/lib/vector-search/service";
import { semanticSearchSchema } from "@/lib/vector-search/validation";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = semanticSearchSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a search description between 2 and 300 characters." },
      { status: 400 },
    );
  }

  let products;
  try {
    products = await searchProductsByText(
      parsed.data.query,
      parsed.data.categoryId,
    );
  } catch (error) {
    if (error instanceof SemanticQueryEmbeddingError) {
      console.error("Semantic query embedding failed:", error.originalError);
      return NextResponse.json(
        { error: "Semantic search is temporarily unavailable." },
        { status: 503 },
      );
    }
    throw error;
  }

  return NextResponse.json({ products });
}
