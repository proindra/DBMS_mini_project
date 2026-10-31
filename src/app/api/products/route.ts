import { NextResponse } from "next/server";
import { productFiltersSchema } from "@/lib/products/validation";
import { getCachedCatalogProducts } from "@/lib/products/cache";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const parsed = productFiltersSchema.safeParse({
    categoryId: searchParams.get("categoryId") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product filters.", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const products = await getCachedCatalogProducts(parsed.data);
  return NextResponse.json({ products });
}
