import Link from "next/link";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { SemanticProductSearch } from "@/components/products/semantic-product-search";
import { ShopNavigation } from "@/components/shop-navigation";
import { prisma } from "@/lib/db";
import { productFiltersSchema } from "@/lib/products/validation";

type SearchParams = Promise<{
  q?: string;
  categoryId?: string;
  sort?: string;
}>;

export default function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-600">Loading products...</p>}>
      <ProductListing searchParams={searchParams} />
    </Suspense>
  );
}

async function ProductListing({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const parsed = productFiltersSchema.safeParse(params);
  const filters = parsed.success ? parsed.data : { sort: "name" as const };
  const [products, categories] = await Promise.all([
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
      include: { category: { select: { name: true } } },
      orderBy:
        filters.sort === "price-asc"
          ? { price: "asc" }
          : filters.sort === "price-desc"
            ? { price: "desc" }
            : filters.sort === "newest"
              ? { createdAt: "desc" }
              : { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <ShopNavigation />
      <div className="mt-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">Catalogue</p>
          <h1 className="mt-2 text-3xl font-semibold text-zinc-950">Products</h1>
        </div>
        <form action="/products" className="grid gap-3 sm:grid-cols-3">
          <input
            name="q"
            defaultValue={filters.q}
            placeholder="Search products"
            aria-label="Search products"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950"
          />
          <select
            name="categoryId"
            defaultValue={filters.categoryId ?? ""}
            aria-label="Filter by category"
            className="rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              name="sort"
              defaultValue={filters.sort}
              aria-label="Sort products"
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950"
            >
              <option value="name">Name</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
            <button className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800">
              Apply
            </button>
          </div>
        </form>
      </div>

      <SemanticProductSearch />

      {products.length === 0 ? (
        <p className="mt-8 rounded-xl border border-zinc-200 bg-white p-8 text-zinc-700">
          No products match those filters.
        </p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{product.category.name}</p>
              <h2 className="mt-2 text-lg font-semibold text-zinc-950">
                <Link href={`/products/${product.slug}`} className="hover:text-blue-700">{product.name}</Link>
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600">{product.description}</p>
              <p className="mt-4 text-xl font-semibold text-zinc-950">${Number(product.price).toFixed(2)}</p>
              <p className="mt-1 text-sm text-zinc-600">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <AddToCartButton productId={product.id} stock={product.stock} />
                <Link href={`/products/${product.slug}`} className="text-sm font-semibold text-blue-700 hover:underline">
                  Details
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
