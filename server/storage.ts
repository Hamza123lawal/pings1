import { db } from "./db";
import {
  items,
  categories,
  messages,
  cartItems,
  orders,
  type Item,
  type Category,
  type Message,
  type CartItem,
  type Order,
  type InsertMessage,
  type InsertOrder
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getItems(categorySlug?: string): Promise<Item[]>;
  getItem(id: number): Promise<Item | undefined>;
  updateItem(id: number, updates: Partial<Item>): Promise<Item | undefined>;
  createItem(item: any): Promise<Item>;
  deleteItem(id: number): Promise<void>;
  createMessage(message: InsertMessage): Promise<Message>;
  getCart(sessionId: string): Promise<(CartItem & { item: Item })[]>;
  addToCart(sessionId: string, itemId: number, quantity: number): Promise<CartItem>;
  updateCartItem(cartItemId: number, quantity: number): Promise<CartItem>;
  removeFromCart(cartItemId: number): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
  createOrder(order: InsertOrder): Promise<Order>;
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

  async updateItem(id: number, updates: Partial<Item>): Promise<Item | undefined> {
    const [updated] = await db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning();
    return updated;
  }

  async createItem(itemData: any): Promise<Item> {
    const [created] = await db
      .insert(items)
      .values(itemData)
      .returning();
    return created;
  }

  async deleteItem(id: number): Promise<void> {
    await db.delete(items).where(eq(items.id, id));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getCart(sessionId: string): Promise<(CartItem & { item: Item })[]> {
    const cartWithItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.sessionId, sessionId));
    
    const enriched = await Promise.all(
      cartWithItems.map(async (cartItem) => {
        const item = await this.getItem(cartItem.itemId);
        return { ...cartItem, item: item! };
      })
    );
    return enriched;
  }

  async addToCart(sessionId: string, itemId: number, quantity: number): Promise<CartItem> {
    // Check if item already in cart
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.sessionId, sessionId), eq(cartItems.itemId, itemId)));
    
    if (existing.length > 0) {
      // Update quantity
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existing[0].quantity + quantity })
        .where(eq(cartItems.id, existing[0].id))
        .returning();
      return updated;
    }

    const [newItem] = await db
      .insert(cartItems)
      .values({ sessionId, itemId, quantity })
      .returning();
    return newItem;
  }

  async updateCartItem(cartItemId: number, quantity: number): Promise<CartItem> {
    const [updated] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, cartItemId))
      .returning();
    return updated;
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async seedData(): Promise<void> {
    const existingCats = await this.getCategories();
    
    // Define all categories we want
    const categoryData = [
      { name: "Printing Services", slug: "printing", description: "High quality banners, flyers, cards & t-shirts" },
      { name: "Computer Accessories", slug: "accessories", description: "Peripherals and hardware" },
      { name: "Typing Services", slug: "typing", description: "Professional typing and documentation" },
      { name: "Training", slug: "training", description: "Skill development and courses" },
      { name: "Laptop Repair", slug: "laptop-repair", description: "Hardware and software repair services" },
      { name: "Website Creation", slug: "website-creation", description: "Professional website design and development" },
      { name: "Registration Services", slug: "registration", description: "Business and official registration support" },
    ];

    // Add missing categories
    const existingSlugs = new Set(existingCats.map(c => c.slug));
    const missingCats = categoryData.filter(c => !existingSlugs.has(c.slug));
    
    let cats = existingCats;
    if (missingCats.length > 0) {
      const newCats = await db.insert(categories).values(missingCats).returning();
      cats = [...cats, ...newCats];
    }

    // Only add items if we just created categories (initial seed)
    if (existingCats.length === 0) {
      const printCat = cats.find(c => c.slug === "printing")!;
      const accCat = cats.find(c => c.slug === "accessories")!;
      const typeCat = cats.find(c => c.slug === "typing")!;
      const trainCat = cats.find(c => c.slug === "training")!;
      const repairCat = cats.find(c => c.slug === "laptop-repair")!;
      const webCat = cats.find(c => c.slug === "website-creation")!;
      const regCat = cats.find(c => c.slug === "registration")!;

      await db.insert(items).values([
        // Printing
        { categoryId: printCat.id, name: "Business Cards", description: "Premium matte or glossy business cards", price: "Starting at $20/100", imageUrl: "https://images.unsplash.com/photo-1593182440959-9d5165b29b59?w=800&q=80" },
        { categoryId: printCat.id, name: "Custom T-Shirts", description: "DTG or Screen Printing on high quality cotton", price: "$15 each", imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80" },
        { categoryId: printCat.id, name: "Large Format Banners", description: "Durable vinyl banners for events", price: "$5/sq ft", imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80" },
        { categoryId: printCat.id, name: "Monogramming", description: "Personalized embroidery and monogramming on apparel", price: "$10-$50", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" },
        { categoryId: printCat.id, name: "DTF Printing", description: "Direct-to-fabric printing for vibrant, detailed designs", price: "$8-$25 per piece", imageUrl: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&q=80" },
        
        // Accessories
        { categoryId: accCat.id, name: "Mechanical Keyboard", description: "RGB Backlit Mechanical Gaming Keyboard", price: "$49.99", imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80" },
        { categoryId: accCat.id, name: "Wireless Mouse", description: "Ergonomic wireless optical mouse", price: "$19.99", imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80" },
        
        // Typing
        { categoryId: typeCat.id, name: "Document Typing", description: "Fast and accurate typing from handwritten notes", price: "$5/page", imageUrl: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&q=80" },
        
        // Training
        { categoryId: trainCat.id, name: "Basic Computer Skills", description: "Learn Windows, Office, and Internet basics", price: "$100/course", imageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80" },
        { categoryId: trainCat.id, name: "Graphic Design Basics", description: "Intro to Photoshop and Illustrator", price: "$150/course", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799314346d?w=800&q=80" },
        
        // Laptop Repair
        { categoryId: repairCat.id, name: "Screen Replacement", description: "Professional laptop screen replacement and repair", price: "$80-$200", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80" },
        { categoryId: repairCat.id, name: "Battery Replacement", description: "Genuine laptop battery replacement", price: "$40-$80", imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80" },
        { categoryId: repairCat.id, name: "Hardware Upgrade", description: "RAM and SSD upgrades to boost performance", price: "$50-$300", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80" },
        
        // Website Creation
        { categoryId: webCat.id, name: "Business Website", description: "Custom responsive website for your business", price: "$500-$2000", imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80" },
        { categoryId: webCat.id, name: "E-commerce Store", description: "Online store with payment processing", price: "$1000-$3000", imageUrl: "https://images.unsplash.com/photo-1611537929991-481f237f5000?w=800&q=80" },
        { categoryId: webCat.id, name: "Website Redesign", description: "Modernize and optimize your existing website", price: "$300-$1000", imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799314346d?w=800&q=80" },
        
        // Registration Services
        { categoryId: regCat.id, name: "Business Registration", description: "Company incorporation and business registration", price: "$200-$500", imageUrl: "https://images.unsplash.com/photo-1450101499163-c8917c3b1c7d?w=800&q=80" },
        { categoryId: regCat.id, name: "Trademark Filing", description: "Protect your brand with trademark registration", price: "$300-$800", imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80" },
        { categoryId: regCat.id, name: "Vendor Registration", description: "E-commerce vendor and seller registration", price: "$50-$150", imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" },
      ]);
    }
  }

  async addMissingItems(): Promise<void> {
    const printCat = await this.getCategoryBySlug("printing");
    if (!printCat) return;

    // Check if these items already exist
    const existingItems = await db.select().from(items).where(eq(items.categoryId, printCat.id));
    const existingNames = new Set(existingItems.map(i => i.name));

    const newItems = [];
    if (!existingNames.has("Monogramming")) {
      newItems.push({
        categoryId: printCat.id,
        name: "Monogramming",
        description: "Personalized embroidery and monogramming on apparel",
        price: "$10-$50",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
      });
    }
    if (!existingNames.has("DTF Printing")) {
      newItems.push({
        categoryId: printCat.id,
        name: "DTF Printing",
        description: "Direct-to-fabric printing for vibrant, detailed designs",
        price: "$8-$25 per piece",
        imageUrl: "https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&q=80"
      });
    }

    if (newItems.length > 0) {
      await db.insert(items).values(newItems);
    }
  }
}

export const storage = new DatabaseStorage();
