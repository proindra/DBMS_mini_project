"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";

export type CartItemView = {
  id: number;
  quantity: number;
  productId: number;
  productName: string;
  slug: string;
  price: string;
  stock: number;
  active: boolean;
};

export function CartManager({ initialItems }: { initialItems: CartItemView[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [quantityDrafts, setQuantityDrafts] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

  async function updateItem(id: number, quantity: number) {
    setPending(true);
    setMessage(null);
    try {
      const response =
        quantity === 0
          ? await fetch(`/api/cart/items/${id}`, { method: "DELETE" })
          : await fetch(`/api/cart/items/${id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ quantity }),
            });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setMessage(result.error ?? "Could not update your cart.");
        return;
      }
      setItems((current) =>
        quantity === 0
          ? current.filter((item) => item.id !== id)
          : current.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
      setQuantityDrafts((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  async function checkout() {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch("/api/orders", { method: "POST" });
      const result = (await response.json()) as {
        error?: string;
        order?: { id: number };
      };
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok || !result.order) {
        setMessage(result.error ?? "Could not place your order.");
        return;
      }
      router.push(`/orders/${result.order.id}`);
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <section className="mt-8 rounded-xl border border-zinc-200 bg-white p-8">
        <p className="text-zinc-700">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block font-semibold text-blue-700 hover:underline">
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
      <section className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href={`/products/${item.slug}`} className="font-semibold text-zinc-950 hover:text-blue-700">
                  {item.productName}
                </Link>
                <p className="mt-1 text-sm text-zinc-600">{formatCurrency(item.price)} each</p>
              </div>
              <p className="font-semibold text-zinc-950">
                {formatCurrency(Number(item.price) * item.quantity)}
              </p>
            </div>
            {!item.active && (
              <p className="mt-3 text-sm text-red-700">This product is no longer available.</p>
            )}
            {item.active && item.stock < item.quantity && (
              <p className="mt-3 text-sm text-amber-800">
                Stock changed. Only {item.stock} available; adjust before checkout.
              </p>
            )}
            <div className="mt-4 flex items-center gap-3">
              <label htmlFor={`quantity-${item.id}`} className="text-sm text-zinc-700">
                Quantity
              </label>
              <input
                id={`quantity-${item.id}`}
                type="number"
                min={1}
                max={item.stock}
                value={quantityDrafts[item.id] ?? String(item.quantity)}
                disabled={pending || !item.active}
                onChange={(event) =>
                  setQuantityDrafts((current) => ({
                    ...current,
                    [item.id]: event.currentTarget.value,
                  }))
                }
                className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-zinc-950"
              />
              <button
                type="button"
                onClick={() => {
                  const quantity = Number(quantityDrafts[item.id] ?? item.quantity);
                  if (Number.isInteger(quantity) && quantity > 0) {
                    void updateItem(item.id, quantity);
                  } else {
                    setMessage("Quantity must be a positive whole number.");
                  }
                }}
                disabled={pending || !item.active}
                className="text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => void updateItem(item.id, 0)}
                disabled={pending}
                className="text-sm font-semibold text-blue-700 hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </div>
          </article>
        ))}
        {message && <p role="alert" className="text-sm text-red-700">{message}</p>}
      </section>

      <aside className="h-fit rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold text-zinc-950">Order summary</h2>
        <p className="mt-4 flex justify-between text-zinc-700">
          <span>Total</span>
          <span className="font-semibold text-zinc-950">{formatCurrency(total)}</span>
        </p>
        <p className="mt-3 text-xs leading-5 text-zinc-600">
          Payment is simulated. No card details are collected.
        </p>
        <button
          type="button"
          onClick={checkout}
          disabled={pending || items.some((item) => !item.active || item.quantity > item.stock)}
          className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Placing order..." : "Place order"}
        </button>
      </aside>
    </div>
  );
}
