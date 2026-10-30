"use client";

import { useState } from "react";

export type AdminProductView = {
  id: number;
  name: string;
  slug: string;
  description: string;
  sku: string;
  categoryId: number;
  categoryName: string;
  price: string;
  stock: number;
  active: boolean;
};

export type CategoryView = { id: number; name: string };

export function ProductManager({
  initialProducts,
  categories,
}: {
  initialProducts: AdminProductView[];
  categories: CategoryView[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function saveProduct(
    id: number | null,
    payload: Record<string, unknown>,
  ): Promise<boolean> {
    setPending(true);
    setMessage(null);
    try {
      const response = await fetch(
        id === null ? "/api/admin/products" : `/api/admin/products/${id}`,
        {
          method: id === null ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as {
        error?: string;
        product?: AdminProductView & { category: CategoryView };
      };
      if (!response.ok || !result.product) {
        setMessage(result.error ?? "Could not save product.");
        return false;
      }
      const saved = {
        ...result.product,
        categoryName: result.product.category.name,
        price: String(result.product.price),
      };
      setProducts((current) =>
        id === null
          ? [saved, ...current]
          : current.map((product) => (product.id === id ? saved : product)),
      );
      setMessage("Product saved.");
      return true;
    } catch {
      setMessage("Could not reach the server. Please try again.");
      return false;
    } finally {
      setPending(false);
    }
  }

  async function createProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const saved = await saveProduct(null, {
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      sku: form.get("sku"),
      categoryId: Number(form.get("categoryId")),
      price: Number(form.get("price")),
      stock: Number(form.get("stock")),
      active: true,
    });
    if (saved) formElement.reset();
  }

  return (
    <section className="mt-8 space-y-8">
      <form onSubmit={createProduct} className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-2">
        <h2 className="text-lg font-semibold text-zinc-950 sm:col-span-2">Add product</h2>
        <Field label="Name" name="name" required />
        <Field label="Slug" name="slug" required />
        <Field label="SKU" name="sku" required />
        <label className="block text-sm font-medium text-zinc-800">
          Category
          <select name="categoryId" required className={inputClass}>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <Field label="Price (INR)" name="price" type="number" min="0.01" step="0.01" required />
        <Field label="Stock" name="stock" type="number" min="0" step="1" required />
        <label className="block text-sm font-medium text-zinc-800 sm:col-span-2">
          Description
          <textarea name="description" required minLength={5} maxLength={5000} className={inputClass} rows={3} />
        </label>
        <button disabled={pending} className="rounded-lg bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-50 sm:col-span-2">
          Add product
        </button>
      </form>

      {products.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-5 text-zinc-700">No products yet.</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-950">Products</h2>
          {products.map((product) => (
            <form
              key={`${product.id}-${product.active}-${product.stock}-${product.name}`}
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void saveProduct(product.id, {
                  name: form.get("name"),
                  slug: form.get("slug"),
                  description: form.get("description"),
                  sku: form.get("sku"),
                  categoryId: Number(form.get("categoryId")),
                  price: Number(form.get("price")),
                  stock: Number(form.get("stock")),
                  active: form.get("active") === "on",
                });
              }}
              className="grid gap-4 rounded-xl border border-zinc-200 bg-white p-5 sm:grid-cols-2"
            >
              <div className="flex items-center justify-between gap-3 sm:col-span-2">
                <h3 className="font-semibold text-zinc-950">{product.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.active ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-700"}`}>
                  {product.active ? "Active" : "Inactive"}
                </span>
              </div>
              <Field label="Name" name="name" defaultValue={product.name} required />
              <Field label="Slug" name="slug" defaultValue={product.slug} required />
              <Field label="SKU" name="sku" defaultValue={product.sku} required />
              <label className="block text-sm font-medium text-zinc-800">
                Category
                <select name="categoryId" defaultValue={product.categoryId} className={inputClass}>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </label>
              <Field label="Price (INR)" name="price" type="number" min="0.01" step="0.01" defaultValue={product.price} required />
              <Field label="Stock" name="stock" type="number" min="0" step="1" defaultValue={String(product.stock)} required />
              <label className="block text-sm font-medium text-zinc-800 sm:col-span-2">
                Description
                <textarea name="description" defaultValue={product.description} required minLength={5} maxLength={5000} className={inputClass} rows={3} />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                <input type="checkbox" name="active" defaultChecked={product.active} />
                Available to customers
              </label>
              <button disabled={pending} className="rounded-lg border border-zinc-300 px-4 py-2 font-semibold text-zinc-800 hover:bg-zinc-50 disabled:opacity-50">
                Save changes
              </button>
            </form>
          ))}
        </div>
      )}
      {message && <p role="status" className="text-sm text-zinc-700">{message}</p>}
    </section>
  );
}

const inputClass = "mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  ...props
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <label className="block text-sm font-medium text-zinc-800">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className={inputClass} {...props} />
    </label>
  );
}
