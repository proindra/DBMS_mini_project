"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Application route failed:", error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
        Something went wrong
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
        This page could not be loaded.
      </h1>
      <p className="mt-3 text-zinc-600">
        Please try again. If the problem continues, return to the product
        catalogue and try again later.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Try again
        </button>
        <Link
          href="/products"
          className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Browse products
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-zinc-500">
          Error reference: {error.digest}
        </p>
      )}
    </main>
  );
}
