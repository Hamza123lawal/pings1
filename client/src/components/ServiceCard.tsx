import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  imageUrl: string;
  href: string;
  className?: string;
}

export function ServiceCard({ title, description, icon, imageUrl, href, className }: ServiceCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl bg-white border border-border/50 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      className
    )}>
      <div className="aspect-[4/3] overflow-hidden">
        {/* Descriptive comment for dynamic/stock image */}
        {/* Service category image */}
        <img 
          src={imageUrl} 
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-6">
        <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">{description}</p>
        
        <Link 
          href={href}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
        >
          Learn More <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
