import { z } from "zod";

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  rating: z.number(),
  image: z.string(),
});

export const ProductsResponseSchema = z.object({
  items: z.array(ProductSchema),
  nextCursor: z.string().nullable(),
  pageInfo: z.object({
    limit: z.number(),
    hasMore: z.boolean(),
    returned: z.number(),
  }),
});

export const ProductResponseSchema = z.object({
  product: ProductSchema,
});

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
});

export const MeResponseSchema = z.object({
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
  }),
});