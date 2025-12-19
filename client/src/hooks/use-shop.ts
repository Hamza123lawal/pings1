import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Categories
export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.categories.list.responses[200].parse(await res.json());
    },
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: [api.categories.get.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.categories.get.path, { slug });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch category");
      return api.categories.get.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

// Items
export function useItems(categorySlug?: string) {
  return useQuery({
    queryKey: [api.items.list.path, categorySlug],
    queryFn: async () => {
      // Construct URL with query params
      const url = new URL(api.items.list.path, window.location.origin);
      if (categorySlug) {
        url.searchParams.append("categorySlug", categorySlug);
      }
      
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to fetch items");
      return api.items.list.responses[200].parse(await res.json());
    },
  });
}

export function useItem(id: number) {
  return useQuery({
    queryKey: [api.items.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.items.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch item");
      return api.items.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Messages
export function useSendMessage() {
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.messages.create.input>) => {
      const res = await fetch(api.messages.create.path, {
        method: api.messages.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.messages.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to send message");
      }
      
      return api.messages.create.responses[201].parse(await res.json());
    },
  });
}
