import Link from "next/link";

const features = [
  {
    number: "01",
    title: "Find your next favorite",
    description:
      "Explore the catalogue or search naturally for what you need.",
    href: "/products",
    link: "Explore products",
  },
  {
    number: "02",
    title: "Checkout with confidence",
    description:
      "Keep your picks together and place an order in just a few steps.",
    href: "/cart",
    link: "View your cart",
  },
  {
    number: "03",
    title: "Everything in one place",
    description:
      "Sign in to keep track of your orders and account details.",
    href: "/login",
    link: "Your account",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-8 sm:py-14">
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-10 shadow-sm sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-28 -z-10 size-96 rounded-full bg-blue-200/30 blur-3xl"
        />
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-800">
              <span className="size-2 rounded-full bg-blue-600" />
              A smarter way to shop
            </p>
            <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Find what you need.{" "}
              <span className="text-blue-700">Love what you find.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-zinc-600 sm:text-lg sm:leading-8">
              Discover useful products, search by meaning, and manage every
              order in one simple place.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Browse products
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4"
                >
                  <path
                    d="M4.167 10h11.666m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-zinc-200 bg-white/80 px-5 py-3 text-sm font-semibold text-zinc-800 transition hover:border-zinc-300 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
              >
                Create an account
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-600">
              <span className="inline-flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 text-blue-700"
                >
                  <path
                    d="m5 10 3.2 3.2L15.5 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Meaning-based search
              </span>
              <span className="hidden size-1 rounded-full bg-zinc-300 sm:block" />
              <span className="inline-flex items-center gap-2">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 text-blue-700"
                >
                  <path
                    d="M3.5 6.5h13v9h-13v-9Zm3-3h7v3h-7v-3Zm1.5 6h4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Simple order tracking
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-blue-200/50 to-indigo-200/40 blur-2xl"
            />
            <div className="relative rounded-3xl border border-white/80 bg-white/90 p-5 shadow-xl shadow-blue-900/10 backdrop-blur sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                    Search by meaning
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-zinc-950">
                    Tell us what you need
                  </h2>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="size-5"
                  >
                    <path
                      d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm5 12 4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11 8v6m-3-3h6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </div>
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4 shrink-0 text-zinc-400"
                >
                  <circle
                    cx="8.75"
                    cy="8.75"
                    r="5.75"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="m13 13 4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-sm text-zinc-500">
                  comfortable audio for a long trip
                </span>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">
                  Good matches
                </p>
                <span className="text-xs text-zinc-500">Ranked by relevance</span>
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                    ♪
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      Echo Mini Speaker
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Portable sound for the journey
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-blue-800">
                    92%
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-white p-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-xl">
                    ◉
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900">
                      Travel Sound Buds
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      A compact audio companion
                    </p>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">
                    84%
                  </span>
                </div>
              </div>
              <Link
                href="/products"
                className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Try semantic search
              </Link>
            </div>
            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-zinc-100 bg-white px-4 py-3 shadow-lg shadow-zinc-900/5 sm:flex">
              <span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-4"
                >
                  <path
                    d="m5 10 3.2 3.2L15.5 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium text-zinc-800">
                Your next great find
              </span>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="What you can do" className="py-12 sm:py-16">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-700">
              Made for easy shopping
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 sm:text-3xl">
              Everything you need, all in one place.
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            View the catalogue <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.number}
              className="group rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 sm:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-blue-700">
                  {feature.number}
                </span>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="size-5 text-zinc-400 transition group-hover:translate-x-1 group-hover:text-blue-700"
                >
                  <path
                    d="M4.167 10h11.666m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-zinc-950">
                {feature.title}
              </h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-600">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="mt-4 inline-block text-sm font-semibold text-blue-700 hover:text-blue-900"
              >
                {feature.link} <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
