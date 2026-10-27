import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email().max(254));
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.")
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    "Password must be at most 72 bytes.",
  );

export const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(72),
});

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100),
  email: emailSchema,
  password: passwordSchema,
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
