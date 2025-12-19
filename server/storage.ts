import { db } from "./db";
import {
  items,
  categories,
  messages,
  type Item,
  type Category,
  type Message,
  type InsertMessage
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getItems(categorySlug?: string): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async getItems(categorySlug?: string): Promise<Item[]> {
    if (categorySlug) {
      const category = await this.getCategoryBySlug(categorySlug);
      if (!category) return [];
      return await db.select().from(items).where(eq(items.categoryId, category.id));
    }
    return await db.select().from(items);
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async seedData(): Promise<void> {
    const existingCats = await this.getCategories();
    if (existingCats.length > 0) return;

    // Insert Categories
    const cats = await db.insert(categories).values([
      { name: "Printing Services", slug: "printing", description: "High quality banners, flyers, cards & t-shirts" },
      { name: "Computer Accessories", slug: "accessories", description: "Peripherals and hardware" },
      { name: "Typing Services", slug: "typing", description: "Professional typing and documentation" },
      { name: "Training", slug: "training", description: "Skill development and courses" },
    ]).returning();

    // Insert Items
    const printCat = cats.find(c => c.slug === "printing")!;
    const accCat = cats.find(c => c.slug === "accessories")!;
    const typeCat = cats.find(c => c.slug === "typing")!;
    const trainCat = cats.find(c => c.slug === "training")!;

    await db.insert(items).values([
      // Printing
      { categoryId: printCat.id, name: "Business Cards", description: "Premium matte or glossy business cards", price: "Starting at $20/100", imageUrl: "https://images.unsplash.com/photo-1593182440959-9d5165b29b59?w=800&q=80" },
      { categoryId: printCat.id, name: "Custom T-Shirts", description: "DTG or Screen Printing on high quality cotton", price: "$15 each", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
      { categoryId: printCat.id, name: "Large Format Banners", description: "Durable vinyl banners for events", price: "$5/sq ft", imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80" },
      
      // Accessories
      { categoryId: accCat.id, name: "Mechanical Keyboard", description: "RGB Backlit Mechanical Gaming Keyboard", price: "$49.99", imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80" },
      { categoryId: accCat.id, name: "Wireless Mouse", description: "Ergonomic wireless optical mouse", price: "$19.99", imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" },
      
      // Typing
      { categoryId: typeCat.id, name: "Document Typing", description: "Fast and accurate typing from handwritten notes", price: "$5/page", imageUrl: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80" },
      
      // Training
      { categoryId: trainCat.id, name: "Basic Computer Skills", description: "Learn Windows, Office, and Internet basics", price: "$100/course", imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80" },
      { categoryId: trainCat.id, name: "Graphic Design Basics", description: "Intro to Photoshop and Illustrator", price: "$150/course", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799314346d?w=800&q=80" },
    ]);
  }
}

export const storage = new DatabaseStorage();
