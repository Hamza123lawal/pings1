import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useCategories, useItems } from "@/hooks/use-shop";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Shop() {
  const { data: categories } = useCategories();
  const { data: items, isLoading } = useItems();
  const { toast } = useToast();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const handleAddToCart = async (itemId: number, itemName: string, itemPrice: string) => {
    setAddingToCart(itemId);
    try {
      const sessionId = localStorage.getItem("sessionId") || Math.random().toString(36).substring(7);
      if (!localStorage.getItem("sessionId")) {
        localStorage.setItem("sessionId", sessionId);
      }

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          itemId,
          quantity: 1,
        }),
      });

      if (response.ok) {
        toast({
          title: "Added to Cart",
          description: `${itemName} has been added to your cart`,
        });
        window.dispatchEvent(new Event("cartUpdated"));
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Failed to add to cart", err);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  }

  // Filter only accessories category if it exists, otherwise show all items that look like products
  // Also filter to only show items where isInShop is true
  const accessoriesCategory = categories?.find(c => c.slug === "computer-accessories");
  const shopItems = items?.filter(item => {
    const isInCorrectCategory = accessoriesCategory 
      ? item.categoryId === accessoriesCategory.id 
      : item.price !== null;
    const isInShop = (item as any).isInShop !== false; // Default to true if not specified
    return isInCorrectCategory && isInShop;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="bg-secondary/10 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <h1 className="text-4xl md:text-5xl font-bold">Computer Accessories Shop</h1>
              <p className="text-xl text-muted-foreground">
                Upgrade your setup with our premium selection of keyboards, mice, cables, and peripherals.
              </p>
            </div>
            {/* Tech accessories background */}
            <img 
              src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80" 
              alt="Shop Banner" 
              className="rounded-2xl shadow-xl w-full max-w-sm rotate-3 hover:rotate-0 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {shopItems?.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-all border-border/50">
                  <div className="p-4 bg-white flex items-center justify-center h-48 rounded-t-xl relative overflow-hidden group">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="max-h-full max-w-full object-contain transition-transform group-hover:scale-110"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-1" title={item.name}>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="mt-4 font-bold text-xl text-primary">{item.price}</div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full gap-2 group"
                      onClick={() => handleAddToCart(item.id, item.name, item.price)}
                      disabled={addingToCart === item.id}
                      data-testid={`button-add-to-cart-${item.id}`}
                    >
                      <ShoppingBag className="h-4 w-4 group-hover:animate-bounce" /> 
                      {addingToCart === item.id ? "Adding..." : "Add to Cart"}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
            
            {shopItems?.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-xl text-muted-foreground">New products arriving soon!</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
