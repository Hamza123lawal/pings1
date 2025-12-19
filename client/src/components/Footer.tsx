import { Link } from "wouter";
import { Printer, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 mt-20">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <Printer className="h-5 w-5" />
              </div>
              <span>Print & Tech</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your one-stop solution for professional printing, quality computer accessories, and expert training services.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-slate-400 hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/services" className="text-slate-400 hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/shop" className="text-slate-400 hover:text-primary transition-colors">Shop Accessories</Link></li>
              <li><Link href="/contact" className="text-slate-400 hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>123 Business Street, Tech District<br />City, State 12345</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>hello@printandtech.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter / Social */}
          <div>
            <h3 className="text-white font-bold mb-4">Follow Us</h3>
            <div className="flex gap-4 mb-6">
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-primary hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-primary hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="bg-slate-800 p-2 rounded-lg hover:bg-primary hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Print & Tech Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
