import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="text-sm font-semibold text-blue-700">
        E-commerce Order Management
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-zinc-950">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        Use your customer or admin account to continue.
      </p>
      <LoginForm />
      <p className="mt-6 text-sm text-zinc-600">
        New customer?{" "}
        <Link href="/register" className="font-semibold text-blue-700 hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
