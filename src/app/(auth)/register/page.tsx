import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
        Create your account
      </h1>
      <p className="mt-2 text-sm text-zinc-600">
        New accounts are created with the customer role.
      </p>
      <RegisterForm />
      <p className="mt-6 text-sm text-zinc-600">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-blue-700 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
