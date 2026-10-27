"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddToCartButton({
  productId,
  stock,
}: {
  productId: number;
  stock: number;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function addItem() {
    setPending(true);
    setMessage(null);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      const result = (await response.json()) as { error?: string };

      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) {
        setMessage(result.error ?? "Could not add this product.");
        return;
      }

      setMessage("Added to your cart.");
      router.refresh();
    } catch {
      setMessage("Could not reach the server. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={addItem}
        disabled={pending || stock < 1}
        className="rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {stock < 1 ? "Out of stock" : pending ? "Adding..." : "Add to cart"}
      </button>
      {message && (
        <p role="status" className="mt-2 text-sm text-zinc-700">
          {message}
        </p>
      )}
    </div>
  );
}
