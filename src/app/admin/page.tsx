import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/auth/current-user";

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-zinc-600">Loading admin area...</p>}>
      <AdminContent />
    </Suspense>
  );
}

async function AdminContent() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/account");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 py-16">
      <Link href="/account" className="text-sm font-semibold text-blue-700">
        Back to account
      </Link>
      <h1 className="mt-8 text-3xl font-semibold text-zinc-950">Admin area</h1>
      <p className="mt-3 text-zinc-600">
        Signed in as {user.name}. Admin-only operations must also check this role
        in their server-side handlers.
      </p>
      <SignOutButton />
    </main>
  );
}
