import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

  app.post("/api/services", async (req, res) => {
    try {
      const { name, categoryId, description, price, imageUrl } = req.body;
      
      if (!name || !categoryId || !description || !imageUrl) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const newItem = await storage.createItem({
        categoryId: Number(categoryId),
        name,
        description,
        price: price || null,
        imageUrl,
        isInShop: false,
      });
      res.status(201).json(newItem);
    } catch (err) {
      console.error("Error creating service:", err);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await storage.deleteItem(id);
      res.status(200).json({ message: "Service deleted" });
    } catch (err) {
      console.error("Error deleting service:", err);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  app.post(api.messages.create.path, async (req, res) => {
    try {
      const input = api.messages.create.input.parse(req.body);
      const message = await storage.createMessage(input);
      
      if (resend) {
        try {
          await resend.emails.send({
            from: 'Pings Communications <onboarding@resend.dev>',
            to: 'lawalhamzah2@gmail.com',
            subject: `New Message from ${input.name}: ${input.subject}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
                <h2 style="color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">New Contact Form Submission</h2>
                <div style="margin-top: 20px;">
                  <p><strong>Name:</strong> ${input.name}</p>
                  <p><strong>Email:</strong> <a href="mailto:${input.email}">${input.email}</a></p>
                  <p><strong>Subject:</strong> ${input.subject}</p>
                  <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                    <p style="margin-top: 0; font-weight: bold; color: #64748b;">Message:</p>
                    <p style="white-space: pre-wrap; line-height: 1.6; color: #334155;">${input.message}</p>
                  </div>
                </div>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center;">
                  Sent from Pings Communications Business Website
                </div>
              </div>
            `,
          });
          console.log(`[RESEND] Email sent to lawalhamzah2@gmail.com`);
        } catch (emailError) {
          console.error(`[RESEND] Failed to send email:`, emailError);
        }
      } else {
        // LOGIC: In a real production app, we would use a service like SendGrid, Mailgun, or AWS SES.
        // For now, we simulate the email sending by logging it to the console with the target email.
        console.log(`[EMAIL SIMULATION] Sending message to: lawalhamzah2@gmail.com`);
        console.log(`[EMAIL SIMULATION] From: ${input.name} (${input.email})`);
        console.log(`[EMAIL SIMULATION] Subject: ${input.subject}`);
        console.log(`[EMAIL SIMULATION] Content: ${input.message}`);
      }

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
