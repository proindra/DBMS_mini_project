import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
        404
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-zinc-950">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-3 text-zinc-600">
        It may have moved, or the product or order may no longer be available.
      </p>
      <Link
        href="/products"
        className="mt-6 inline-flex w-fit rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
      >
        Browse products
      </Link>
    </main>
  );
}
