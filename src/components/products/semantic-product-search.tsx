"use client";

import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { AddToCartButton } from "@/components/products/add-to-cart-button";
import { formatCurrency } from "@/lib/currency";

type SearchProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  categoryName: string;
  similarity: number;
};

export function SemanticProductSearch({
  categoryId,
}: {
  categoryId?: number;
}) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const searchRequestId = useRef(0);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const requestId = ++searchRequestId.current;
    setPending(true);
    setError(null);
    setProducts([]);
    setSearched(false);

    try {
      const response = await fetch("/api/search/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, categoryId }),
      });
      const result = (await response.json()) as {
        error?: string;
        products?: SearchProduct[];
      };
      if (requestId !== searchRequestId.current) return;

      if (!response.ok) {
        setError(result.error ?? "Semantic search failed.");
        return;
      }

      setProducts(result.products ?? []);
      setSearched(true);
    } catch {
      if (requestId === searchRequestId.current) {
        setError("Could not reach the server. Please try again.");
      }
    } finally {
      if (requestId === searchRequestId.current) {
        setPending(false);
      }
    }
  }

  function updateQuery(value: string) {
    searchRequestId.current += 1;
    setQuery(value);
    setProducts([]);
    setSearched(false);
    setError(null);
    setPending(false);
  }

  return (
    <section className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
      <h2 className="text-lg font-semibold text-zinc-950">Search by meaning</h2>
      <p className="mt-1 text-sm text-zinc-700">
        Describe what you need, such as “comfortable audio for a long trip.”
      </p>
      <form onSubmit={search} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          minLength={2}
          maxLength={300}
          required
          aria-label="Describe the product you are looking for"
          placeholder="Describe the product you are looking for"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-950"
        />
        <button
          type="submit"
          disabled={pending || query.trim().length < 2}
          className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Searching..." : "Search by meaning"}
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-700">
          {error}
        </p>
      )}
      {searched && products.length === 0 && (
        <p role="status" className="mt-4 text-sm text-zinc-700">
          No semantic matches found. Try describing a different need.
        </p>
      )}
      {products.length > 0 && (
        <div aria-live="polite" className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col rounded-xl border border-zinc-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                  {product.categoryName}
                </p>
                <p
                  aria-label={`Similarity score: ${Math.round(product.similarity * 100)} percent`}
                  className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800"
                >
                  Similarity: {Math.round(product.similarity * 100)}%
                </p>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                <Link
                  href={`/products/${product.slug}`}
                  className="hover:text-blue-700"
                >
                  {product.name}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-sm leading-6 text-zinc-600">
                {product.description}
              </p>
              <p className="mt-4 text-xl font-semibold text-zinc-950">
                {formatCurrency(product.price)}
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : "Out of stock"}
              </p>
              <div className="mt-4">
                <AddToCartButton
                  productId={product.id}
                  stock={product.stock}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
