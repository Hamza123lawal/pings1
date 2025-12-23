import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Service {
  id: number;
  name: string;
  categoryId: number;
  description: string;
  price?: string;
  imageUrl: string;
}

const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().optional(),
  imageUrl: z.string().min(1, "Image URL is required"),
});

type CreateServiceFormValues = z.infer<typeof createServiceSchema>;

export default function ServiceManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toast } = useToast();

  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      price: "",
      imageUrl: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catsRes, servicesRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/items"),
      ]);
      const catsData = await catsRes.json();
      const servicesData = await servicesRes.json();
      setCategories(catsData);
      setServices(servicesData);
    } catch (err) {
      console.error("Failed to fetch data", err);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: CreateServiceFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          categoryId: Number(data.categoryId),
        }),
      });

      if (response.ok) {
        const newService = await response.json();
        setServices([...services, newService]);
        form.reset();
        toast({
          title: "Success",
          description: "Service created successfully",
        });
      } else {
        throw new Error("Failed to create service");
      }
    } catch (err) {
      console.error("Error creating service:", err);
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deleteService = async (serviceId: number) => {
    setDeletingId(serviceId);
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setServices(services.filter((s) => s.id !== serviceId));
        toast({
          title: "Success",
          description: "Service deleted successfully",
        });
      } else {
        throw new Error("Failed to delete service");
      }
    } catch (err) {
      console.error("Error deleting service:", err);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryName = (catId: number) => {
    return categories.find((c) => c.id === catId)?.name || "Unknown";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Service Management</h1>
          <p className="text-muted-foreground">
            Add new services to your catalog
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Add New Service Form */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Service
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Logo Design" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id.toString()}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Service description..."
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., $50 or Starting at $25" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Image URL</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Creating..." : "Create Service"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Services List */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">All Services ({services.length})</h2>
                {services.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No services added yet. Create one to get started!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <Card key={service.id} className="overflow-hidden" data-testid={`service-card-${service.id}`}>
                        <div className="aspect-video overflow-hidden bg-muted">
                          <img
                            src={service.imageUrl}
                            alt={service.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/400x225?text=Image+Not+Found";
                            }}
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {getCategoryName(service.categoryId)}
                          </p>
                          <p className="text-sm mb-3 line-clamp-2">{service.description}</p>
                          {service.price && (
                            <p className="font-semibold text-primary mb-3">{service.price}</p>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => deleteService(service.id)}
                            disabled={deletingId === service.id}
                            data-testid={`button-delete-service-${service.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            {deletingId === service.id ? "Deleting..." : "Delete"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
