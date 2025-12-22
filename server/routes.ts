import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize seed data
  await storage.seedData();
  await storage.addMissingItems();

  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get(api.categories.get.path, async (req, res) => {
    const category = await storage.getCategoryBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  });

  app.get(api.items.list.path, async (req, res) => {
    const categorySlug = req.query.categorySlug as string | undefined;
    const items = await storage.getItems(categorySlug);
    res.json(items);
  });

  app.get(api.items.get.path, async (req, res) => {
    const item = await storage.getItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  });

  app.patch("/api/items/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { isInShop } = req.body;
      
      if (typeof isInShop !== "boolean") {
        return res.status(400).json({ message: "isInShop must be a boolean" });
      }

      const updated = await storage.updateItem(id, { isInShop });
      if (!updated) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(updated);
    } catch (err) {
      console.error("Error updating item:", err);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      res.status(201).json(message);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.get(api.cart.getCart.path, async (req, res) => {
    const cart = await storage.getCart(req.params.sessionId);
    res.json(cart);
  });

  app.post(api.cart.addItem.path, async (req, res) => {
    try {
      const input = api.cart.addItem.input.parse(req.body);
      const cartItem = await storage.addToCart(input.sessionId, input.itemId, input.quantity);
      res.status(201).json(cartItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.patch(api.cart.updateItem.path, async (req, res) => {
    try {
      const input = api.cart.updateItem.input.parse(req.body);
      const cartItem = await storage.updateCartItem(Number(req.params.id), input.quantity);
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
        });
      }
      throw err;
    }
  });

  app.delete(api.cart.removeItem.path, async (req, res) => {
    await storage.removeFromCart(Number(req.params.id));
    res.status(204).send();
  });

  return httpServer;
}
