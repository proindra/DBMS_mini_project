import { prisma } from "@/lib/db";
import { getCachedValue, CACHE_TTL_SECONDS } from "@/lib/cache/redis";

export type ProductCatalogFilters = {
  categoryId?: number;
  q?: string;
  sort: "name" | "price-asc" | "price-desc" | "newest";
};

export function getCachedCatalogProducts(filters: ProductCatalogFilters) {
  const orderBy =
    filters.sort === "price-asc"
      ? { price: "asc" as const }
      : filters.sort === "price-desc"
        ? { price: "desc" as const }
        : filters.sort === "newest"
          ? { createdAt: "desc" as const }
          : { name: "asc" as const };

  return getCachedValue(
    "catalogue",
    `products:${JSON.stringify(filters)}`,
    CACHE_TTL_SECONDS.catalogue,
    () =>
      prisma.product.findMany({
        where: {
          active: true,
          ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
          ...(filters.q
            ? {
                OR: [
                  { name: { contains: filters.q, mode: "insensitive" } },
                  { description: { contains: filters.q, mode: "insensitive" } },
                  { sku: { contains: filters.q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: { category: { select: { id: true, name: true } } },
        orderBy,
      }),
  );
}

export function getCachedProductBySlug(slug: string) {
  return getCachedValue(
    "catalogue",
    `product:${slug}`,
    CACHE_TTL_SECONDS.product,
    () =>
      prisma.product.findFirst({
        where: { slug, active: true },
        include: { category: { select: { id: true, name: true } } },
      }),
  );
}

export function getCachedCategories() {
  return getCachedValue(
    "categories",
    "all",
    CACHE_TTL_SECONDS.categories,
    () =>
      prisma.category.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
  );
}
