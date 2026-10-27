import { NextResponse } from "next/server";
import { productFiltersSchema } from "@/lib/products/validation";
import { prisma } from "@/lib/db";

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

  const orderBy =
    parsed.data.sort === "price-asc"
      ? { price: "asc" as const }
      : parsed.data.sort === "price-desc"
        ? { price: "desc" as const }
        : parsed.data.sort === "newest"
          ? { createdAt: "desc" as const }
          : { name: "asc" as const };

  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(parsed.data.categoryId ? { categoryId: parsed.data.categoryId } : {}),
      ...(parsed.data.q
        ? { OR: [
          { name: { contains: parsed.data.q, mode: "insensitive" } },
          { description: { contains: parsed.data.q, mode: "insensitive" } },
          { sku: { contains: parsed.data.q, mode: "insensitive" } },
        ] }
        : {}),
    },
    include: { category: { select: { id: true, name: true } } },
    orderBy,
  });

  return NextResponse.json({ products });
}
