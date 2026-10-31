"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

const linkClass =
  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-800";

export function SiteNavigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const user = session?.user;
  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    ...(user?.role === "CUSTOMER"
      ? [
          { href: "/cart", label: "Cart" },
          { href: "/orders", label: "My orders" },
        ]
      : []),
    ...(user?.role === "ADMIN" ? [{ href: "/admin", label: "Admin" }] : []),
    ...(user ? [{ href: "/account", label: "Account" }] : []),
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3"
      >
        <Link
          href="/"
          aria-label="StoreIQ home"
          className="mr-auto inline-flex items-center gap-2.5 text-zinc-950"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold tracking-tight text-white shadow-sm">
            IQ
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">StoreIQ</span>
            <span className="mt-0.5 text-[10px] font-medium tracking-wide text-zinc-500">
              SMARTER SHOPPING
            </span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          {links.map(({ href, label }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(`${href}/`));

            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${linkClass} ${
                  active ? "bg-blue-100 text-blue-800" : "text-zinc-700"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {status === "unauthenticated" && (
            <>
              <Link
                href="/login"
                className={`${linkClass} text-zinc-700`}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Create account
              </Link>
            </>
          )}
          {user && (
            <>
              <span className="hidden max-w-40 truncate text-sm text-zinc-600 sm:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className={`${linkClass} text-zinc-700`}
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
