import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Minus, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

interface CartItemWithProduct {
  id: number;
  sessionId: string;
  itemId: number;
  quantity: number;
  item: {
    id: number;
    name: string;
    price: string;
    imageUrl: string;
    description: string;
  };
}

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("sessionId") || Math.random().toString(36).substring(7);
    setSessionId(id);
    localStorage.setItem("sessionId", id);
    fetchCart(id);
  }, []);

  const fetchCart = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/cart/${sessionId}`);
      const data = await response.json();
      setCartItems(data);
    } catch (err) {
      console.error("Failed to fetch cart", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await fetch(`/api/cart/${cartItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      fetchCart(sessionId);
    } catch (err) {
      console.error("Failed to update cart", err);
    }
  };

  const removeItem = async (cartItemId: number) => {
    try {
      await fetch(`/api/cart/${cartItemId}`, { method: "DELETE" });
      fetchCart(sessionId);
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  };

  const calculatePrice = (priceStr: string): number => {
    const numStr = priceStr.replace(/[^0-9.-]/g, "");
    return parseFloat(numStr) || 0;
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = calculatePrice(item.item.price);
    return sum + price * item.quantity;
  }, 0);

  const TAX_RATE = 0.1; // 10% tax
  const SHIPPING_RATE = 0.05; // 5% of subtotal for shipping
  const HANDLING_FEE = 2.5; // Fixed $2.50 handling fee

  const tax = subtotal * TAX_RATE;
  const shipping = Math.max(subtotal * SHIPPING_RATE, 5); // Minimum $5 shipping
  const handling = cartItems.length > 0 ? HANDLING_FEE : 0;
  const total = subtotal + tax + shipping + handling;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 container mx-auto px-4 py-16">
        <Link href="/shop" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8" data-testid="link-back-shop">
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        {loading ? (
          <p className="text-muted-foreground">Loading cart...</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty</p>
            <Link href="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((cartItem, index) => (
                <motion.div
                  key={cartItem.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="flex gap-6 p-6" data-testid={`cart-item-${cartItem.id}`}>
                    <img
                      src={cartItem.item.imageUrl}
                      alt={cartItem.item.name}
                      className="w-24 h-24 object-contain rounded-lg bg-white"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{cartItem.item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{cartItem.item.description}</p>
                      <p className="text-xl font-bold text-primary">{cartItem.item.price}</p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(cartItem.id)}
                        data-testid={`button-remove-item-${cartItem.id}`}
                      >
                        <Trash2 className="h-5 w-5 text-destructive" />
                      </Button>

                      <div className="flex items-center gap-2 border border-border rounded-lg p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                          data-testid={`button-decrease-qty-${cartItem.id}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{cartItem.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                          data-testid={`button-increase-qty-${cartItem.id}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div>
              <Card className="sticky top-20" data-testid="cart-summary">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Items ({cartItems.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                      <span className="font-semibold">${subtotal.toFixed(2)}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2 py-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping:</span>
                        <span>${shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Handling Fee:</span>
                        <span>${handling.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (10%):</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between text-lg font-bold pt-2">
                      <span>Total to Pay:</span>
                      <span className="text-primary text-xl">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Link href="/checkout" className="w-full">
                    <Button className="w-full" size="lg" data-testid="button-checkout">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link href="/shop" className="w-full">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
