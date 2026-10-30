import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/current-user";

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-zinc-600">Loading account...</p>}>
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-16">
      <h1 className="text-3xl font-semibold text-zinc-950">Your account</h1>
      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-lg font-medium text-zinc-900">{user.name}</p>
        <p className="mt-1 text-sm text-zinc-600">{user.email}</p>
        <p className="mt-4 text-sm text-zinc-600">
          Account role: <span className="font-semibold">{user.role}</span>
        </p>
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="mt-5 inline-block rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
          >
            Open admin area
          </Link>
        )}
      </section>
    </main>
  );
}
