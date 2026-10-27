import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ShopNavigation } from "@/components/shop-navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-8 text-zinc-600">Loading order...</p>}>
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "CUSTOMER") redirect("/account");

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) notFound();
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true, payment: true },
  });
  if (!order) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-12">
      <ShopNavigation />
      <section className="mt-10 rounded-xl border border-zinc-200 bg-white p-6">
        <Link href="/orders" className="text-sm font-semibold text-blue-700 hover:underline">
          ← Your orders
        </Link>
        <h1 className="mt-6 text-3xl font-semibold text-zinc-950">Order #{order.id}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          {order.status} · Payment {order.payment?.status ?? "PENDING"} (simulated)
        </p>
        <div className="mt-6 divide-y divide-zinc-200">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-4 py-4">
              <div>
                <p className="font-medium text-zinc-950">{item.productName}</p>
                <p className="mt-1 text-sm text-zinc-600">
                  ${Number(item.unitPrice).toFixed(2)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold text-zinc-950">
                ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 flex justify-between border-t border-zinc-200 pt-4 text-lg font-semibold text-zinc-950">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </p>
      </section>
    </main>
  );
}
