import { NextResponse } from "next/server";
import { embedText } from "@/lib/vector-search/embedding";
import { searchProductsByVector } from "@/lib/vector-search/service";
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

  let embedding: number[];
  try {
    embedding = await embedText(parsed.data.query);
  } catch (error) {
    console.error("Semantic query embedding failed:", error);
    return NextResponse.json(
      { error: "Semantic search is temporarily unavailable." },
      { status: 503 },
    );
  }

  const products = await searchProductsByVector(embedding);
  return NextResponse.json({ products });
}
