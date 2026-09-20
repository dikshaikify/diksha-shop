import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  rating: z.number(),
  image: z.string(),
  originalPrice: z.number().nullable().optional(),
  discountPercent: z.number().optional(),
  reviewCount: z.number().optional(),
  stock: z.number().optional(),
  brand: z.string().optional(),
  color: z.string().optional()
});

export const ProductsResponseSchema = z.object({
  items: z.array(ProductSchema),
  nextCursor: z.string().nullable(),
  total: z.number().optional(),
  pageInfo: z.object({
    limit: z.number(),
    hasMore: z.boolean(),
    returned: z.number()
  }).optional()
});

export const ProductResponseSchema = z.object({
  product: ProductSchema
});

/* MongoDB IDs are strings — so id is now z.string() or number */
const IdSchema = z.union([z.string(), z.number()]);

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: IdSchema,
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable().optional()
  })
});

export const MeResponseSchema = z.object({
  user: z.object({
    id: IdSchema,
    name: z.string(),
    email: z.string().email(),
    phone: z.string().nullable().optional()
  })
});