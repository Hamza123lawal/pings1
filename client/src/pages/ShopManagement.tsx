import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff } from "lucide-react";

interface ShopItem {
  id: number;
  name: string;
  categoryId: number;
  price?: string;
  imageUrl: string;
  isInShop: boolean;
}

interface Category {
  id: number;
  name: string;
}

export default function ShopManagement() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        fetch("/api/items"),
        fetch("/api/categories"),
      ]);
      const itemsData = await itemsRes.json();
      const catsData = await catsRes.json();
      setItems(itemsData);
      setCategories(catsData);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast({
        title: "Error",
        description: "Failed to load items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleItemVisibility = async (itemId: number, currentStatus: boolean) => {
    setTogglingId(itemId);
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isInShop: !currentStatus }),
      });

      if (response.ok) {
        setItems(
          items.map((item) =>
            item.id === itemId ? { ...item, isInShop: !currentStatus } : item
          )
        );
        toast({
          title: "Success",
          description: `Item ${!currentStatus ? "added to" : "removed from"} shop`,
        });
      }
    } catch (err) {
      console.error("Failed to toggle item", err);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const getCategoryName = (catId: number) => {
    return categories.find((c) => c.id === catId)?.name || "Unknown";
  };

  const shopItems = items.filter((item) => item.isInShop);
  const hiddenItems = items.filter((item) => !item.isInShop);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Shop Management</h1>
          <p className="text-muted-foreground">
            Toggle which items appear in your shop page
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading items...</p>
        ) : (
          <div className="space-y-12">
            {/* Visible Items */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-green-600" />
                Showing in Shop ({ shopItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden"
                    data-testid={`shop-item-${item.id}`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryName(item.categoryId)}
                        </Badge>
                        {item.price && (
                          <span className="font-semibold">{item.price}</span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => toggleItemVisibility(item.id, item.isInShop)}
                        disabled={togglingId === item.id}
                        data-testid={`button-hide-item-${item.id}`}
                      >
                        <EyeOff className="h-4 w-4" />
                        Hide from Shop
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {shopItems.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No items visible in shop
                </p>
              )}
            </div>

            {/* Hidden Items */}
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <EyeOff className="h-6 w-6 text-gray-500" />
                Hidden from Shop ({hiddenItems.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {hiddenItems.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden opacity-60"
                    data-testid={`hidden-item-${item.id}`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="text-xs">
                          {getCategoryName(item.categoryId)}
                        </Badge>
                        {item.price && (
                          <span className="font-semibold">{item.price}</span>
                        )}
                      </div>
                      <Button
                        className="w-full gap-2"
                        onClick={() => toggleItemVisibility(item.id, item.isInShop)}
                        disabled={togglingId === item.id}
                        data-testid={`button-show-item-${item.id}`}
                      >
                        <Eye className="h-4 w-4" />
                        Show in Shop
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {hiddenItems.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No hidden items
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
