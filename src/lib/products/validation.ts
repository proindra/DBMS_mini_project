import { z } from "zod";

const moneySchema = z.number().finite().min(0.01).max(99999999.99);
const stockSchema = z.number().int().min(0).max(2147483647);

export const productInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(5).max(5000),
  sku: z.string().trim().toUpperCase().min(2).max(64).regex(/^[A-Z0-9-]+$/),
  categoryId: z.number().int().positive(),
  price: moneySchema,
  stock: stockSchema,
  active: z.boolean().default(true),
});

export const productPatchSchema = productInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one product field.");

export const cartItemInputSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(1000).default(1),
});

export const cartQuantitySchema = z.object({
  quantity: z.number().int().positive().max(1000),
});

export const productFiltersSchema = z.object({
  categoryId: z.coerce.number().int().positive().optional(),
  q: z.string().trim().max(100).optional(),
  sort: z.enum(["name", "price-asc", "price-desc", "newest"]).default("name"),
});
