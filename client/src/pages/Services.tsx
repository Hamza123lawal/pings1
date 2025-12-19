import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useCategories, useItems } from "@/hooks/use-shop";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Services() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const activeTab = searchParams.get("cat") || "all";
  
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const { data: items, isLoading: isItemsLoading } = useItems();

  const filteredItems = items?.filter(item => {
    if (activeTab === "all") return true;
    const category = categories?.find(c => c.slug === activeTab);
    return category ? item.categoryId === category.id : true;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services & Products</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse our comprehensive catalog of printing services, computer accessories, and training programs.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {isCategoriesLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full md:w-1/2 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
            </div>
          </div>
        ) : (
          <Tabs defaultValue={activeTab} className="w-full">
            <div className="flex justify-center mb-12 overflow-x-auto pb-4">
              <TabsList className="bg-muted p-1 rounded-full">
                <TabsTrigger value="all" onClick={() => window.history.pushState(null, "", "/services")}>All Services</TabsTrigger>
                {categories?.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.slug}
                    onClick={() => window.history.pushState(null, "", `/services?cat=${cat.slug}`)}
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {isItemsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-80 rounded-2xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems?.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="h-full overflow-hidden border-border/50 hover:shadow-lg transition-all hover:border-primary/50 group">
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                              {categories?.find(c => c.id === item.categoryId)?.name}
                            </Badge>
                            {item.price && <span className="font-bold text-lg text-primary">{item.price}</span>}
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-base">
                            {item.description}
                          </CardDescription>
                        </CardContent>
                        <CardFooter>
                          <Button className="w-full variant-outline hover:bg-primary hover:text-white transition-colors">
                            Inquire Now
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {filteredItems?.length === 0 && (
                <div className="text-center py-20 bg-muted/30 rounded-3xl">
                  <h3 className="text-2xl font-bold text-muted-foreground">No items found in this category.</h3>
                  <p className="text-muted-foreground mt-2">Check back later or contact us for custom requests.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
}
