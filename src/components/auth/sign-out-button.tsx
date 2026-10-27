"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

export function SignOutButton() {
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setError(false);
    setPending(true);

    try {
      const result = await signOut({ callbackUrl: "/", redirect: false });
      window.location.assign(result.url);
    } catch {
      setError(true);
      setPending(false);
    }
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-60"
      >
        {pending ? "Signing out..." : "Sign out"}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          Could not sign out. Please try again.
        </p>
      )}
    </div>
  );
}
