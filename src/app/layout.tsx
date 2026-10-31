import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import Link from "next/link";
import { Providers } from "@/components/providers";
import { SiteNavigation } from "@/components/site-navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StoreIQ — The Smart E-commerce Store",
  description:
    "Discover products with intelligent search and manage every order with StoreIQ.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Suspense
            fallback={
              <header className="border-b border-zinc-200 bg-white">
                <nav
                  aria-label="Main navigation"
                  className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3"
                >
                  <Link
                    href="/"
                    aria-label="StoreIQ home"
                    className="inline-flex items-center gap-2 font-bold text-zinc-950"
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-blue-700 text-xs text-white">
                      IQ
                    </span>
                    StoreIQ
                  </Link>
                  <Link
                    href="/products"
                    className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-800"
                  >
                    Products
                  </Link>
                </nav>
              </header>
            }
          >
            <SiteNavigation />
          </Suspense>
          <div className="flex flex-1 flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
