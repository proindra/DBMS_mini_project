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
          The Next.js foundation is ready. Product browsing, customer orders,
          admin tools, PostgreSQL, and semantic search will be added phase by
          phase.
        </p>
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
