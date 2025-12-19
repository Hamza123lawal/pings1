import { z } from 'zod';
import { insertMessageSchema, items, categories, insertCartItemSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  categories: {
    list: {
      method: 'GET' as const,
      path: '/api/categories',
      responses: {
        200: z.array(z.custom<typeof categories.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/categories/:slug',
      responses: {
        200: z.custom<typeof categories.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  items: {
    list: {
      method: 'GET' as const,
      path: '/api/items',
      input: z.object({
        categorySlug: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof items.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/items/:id',
      responses: {
        200: z.custom<typeof items.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/messages',
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof insertMessageSchema>(),
        400: errorSchemas.validation,
      },
    },
  },
  cart: {
    getCart: {
      method: 'GET' as const,
      path: '/api/cart/:sessionId',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          sessionId: z.string(),
          itemId: z.number(),
          quantity: z.number(),
          item: z.custom<typeof items.$inferSelect>(),
        })),
      },
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/cart',
      input: z.object({
        sessionId: z.string(),
        itemId: z.number(),
        quantity: z.number().int().min(1).default(1),
      }),
      responses: {
        201: z.object({
          id: z.number(),
          sessionId: z.string(),
          itemId: z.number(),
          quantity: z.number(),
        }),
        400: errorSchemas.validation,
      },
    },
    updateItem: {
      method: 'PATCH' as const,
      path: '/api/cart/:id',
      input: z.object({
        quantity: z.number().int().min(1),
      }),
      responses: {
        200: z.object({
          id: z.number(),
          sessionId: z.string(),
          itemId: z.number(),
          quantity: z.number(),
        }),
        404: errorSchemas.notFound,
      },
    },
    removeItem: {
      method: 'DELETE' as const,
      path: '/api/cart/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
