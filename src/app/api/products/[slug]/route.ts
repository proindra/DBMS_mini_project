import { NextResponse } from "next/server";
import { getCachedProductBySlug } from "@/lib/products/cache";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({ product });
}
