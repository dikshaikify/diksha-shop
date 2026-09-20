import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchProductsPage, fetchProduct, fetchCategories } from "../api";

export function useInfiniteProducts({ search, categories, sort, minPrice, maxPrice, minRating }) {
  const catsKey = [...categories].sort().join(",");
  return useInfiniteQuery({
    queryKey: ["products", { search, cats: catsKey, sort, minPrice, maxPrice, minRating }],
    initialPageParam: null,
    queryFn: ({ pageParam, signal }) =>
      fetchProductsPage({
        search,
        categories,
        sort,
        minPrice,
        maxPrice,
        minRating,
        cursor: pageParam,
        signal
      }),
    getNextPageParam: (last) => last.nextCursor,
    staleTime: 30_000
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: ({ signal }) => fetchProduct(id, signal),
    staleTime: 60_000
  });
}

export function useCategories(enabled = true) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: 5 * 60_000,
    enabled
  });
}