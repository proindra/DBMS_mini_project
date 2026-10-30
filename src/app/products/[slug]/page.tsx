import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { formatCurrency } from "@/lib/currency";
import { prisma } from "@/lib/db";

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-600">Loading product...</p>}>
      <ProductDetails params={params} />
    </Suspense>
  );
}

async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connection();

  const product = await prisma.product.findFirst({
    where: { slug, active: true },
    include: { category: { select: { name: true } } },
  });
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <article className="rounded-2xl border border-zinc-200 bg-white p-7 sm:p-10">
        <Link href="/products" className="text-sm font-semibold text-blue-700 hover:underline">
          ← All products
        </Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-wide text-blue-700">{product.category.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">{product.name}</h1>
        <p className="mt-5 max-w-2xl leading-7 text-zinc-700">{product.description}</p>
        <p className="mt-6 text-2xl font-semibold text-zinc-950">{formatCurrency(product.price.toString())}</p>
        <p className="mt-1 text-sm text-zinc-600">
          SKU {product.sku} · {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
        </p>
        <div className="mt-6">
          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>
      </article>
    </main>
  );
}
