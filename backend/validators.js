import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const RegisterSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(8).max(20).optional(),
  password: z.string().min(6).max(100)
});

export const ForgotSchema = z.object({ email: z.string().email() });

export const ResetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6).max(100)
});

export const ProductsQuerySchema = z.object({
  search: z.string().trim().max(100).optional().default(""),
  category: z.string().optional().default(""),
  cursor: z.string().optional().nullable(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  sort: z.enum(["relevance","price_asc","price_desc","rating","newest"]).optional().default("relevance"),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional()
});

export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues.map(i => ({ path: i.path.join("."), message: i.message }));
    const err = new Error("Validation failed");
    err.status = 400;
    err.code = "VALIDATION";
    err.details = details;
    throw err;
  }
  return parsed.data;
}
