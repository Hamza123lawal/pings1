import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Printer, Laptop, PenTool, GraduationCap } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient pt-20 pb-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-foreground">
                Communication <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Solutions</span> For Everyone
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Your complete platform for printing, technology, and professional services. Pings Communications delivers quality and innovation.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/services">
                  <Button size="lg" className="rounded-full px-8 text-lg bg-primary hover:bg-primary/90">
                    Our Services
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button size="lg" variant="outline" className="rounded-full px-8 text-lg border-primary text-primary hover:bg-primary/5">
                    Shop Now
                  </Button>
                </Link>
              </div>
              <div className="flex gap-6 pt-4">
                {["Quality Prints", "Expert Training", "Tech Retail"].map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    {feat}
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              {/* Modern office workspace setup with printer and laptop */}
              <img 
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
                alt="Creative Workspace"
                className="relative rounded-3xl shadow-2xl border-4 border-white/50"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Services</h2>
            <p className="text-muted-foreground text-lg">
              We provide comprehensive solutions for individuals and businesses, delivering quality and professionalism in every project.
            </p>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            <motion.div variants={item}>
              <ServiceCard 
                title="Printing"
                description="High-quality banners, flyers, business cards, and custom t-shirt printing."
                icon={<Printer className="h-6 w-6" />}
                // Printing press or colorful prints
                imageUrl="https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=600&q=80"
                href="/services?cat=printing"
              />
            </motion.div>
            
            <motion.div variants={item}>
              <ServiceCard 
                title="Accessories"
                description="Wide range of computer peripherals including keyboards, mice, and cables."
                icon={<Laptop className="h-6 w-6" />}
                // Computer accessories setup
                imageUrl="https://images.unsplash.com/photo-1646489099036-e22a9d506a32?q=80&w=724&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                href="/shop"
              />
            </motion.div>
            
            <motion.div variants={item}>
              <ServiceCard 
                title="Typing Services"
                description="Professional documentation, data entry, and formatting services."
                icon={<PenTool className="h-6 w-6" />}
                // Typing hands on keyboard
                imageUrl="https://images.unsplash.com/photo-1519337265831-281ec6cc8514?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                href="/services?cat=typing"
              />
            </motion.div>
            
            <motion.div variants={item}>
              <ServiceCard 
                title="Training"
                description="Expert-led courses in computer skills, design, and office productivity."
                icon={<GraduationCap className="h-6 w-6" />}
                // Classroom or learning environment
                imageUrl="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&q=80"
                href="/services?cat=training"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://pixabay.com/get/g37c4c9830c9f309d24046573451b27a480ebe42e1e07453a0b2f16c5963a555d3ea8d74dea2cf54f71a13cbd424716e708d76ec211e902f84cd86117650c21ae_1280.png')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to start your project?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Whether you need a thousand flyers or a single custom t-shirt, we're here to help you bring your ideas to life.
          </p>
          <Link href="/contact">
            <Button size="lg" className="rounded-full px-10 py-6 text-lg bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
