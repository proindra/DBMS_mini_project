import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center gap-8 px-6 py-24 sm:px-10">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
          DBMS mini-project
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl">
          E-commerce Order Management
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-zinc-600">
          Secure customer accounts and role-based admin access are ready.
          Product browsing, carts, and order workflows are coming next.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Create customer account
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {["Products", "Orders", "Semantic search"].map((feature) => (
          <div
            key={feature}
            className="rounded-xl border border-zinc-200 bg-white p-5"
          >
            <h2 className="font-medium text-zinc-900">{feature}</h2>
            <p className="mt-2 text-sm text-zinc-600">Planned project feature</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-zinc-500">
        Built with Next.js, TypeScript, and Tailwind CSS.
      </p>
    </main>
  );
}
