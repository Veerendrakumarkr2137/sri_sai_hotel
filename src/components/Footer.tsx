import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail, Navigation } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 pt-20 pb-10 text-slate-300">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl font-black text-white tracking-tighter">
                HOTEL <span className="text-blue-500">SAI</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Experience the perfect blend of luxury and comfort at our premier destination. Your stay is our priority.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
              <li><Link to="/rooms" className="hover:text-blue-400 transition-colors">Rooms & Suites</Link></li>
              <li><Link to="/gallery" className="hover:text-blue-400 transition-colors">Gallery</Link></li>
              <li><Link to="/contact" className="hover:text-blue-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-lg font-bold mb-6 uppercase tracking-wider">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                <span className="text-sm">123 Luxury Avenue, Business District<br />Cityville, ST 12345</span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="text-sm">info@hotelsai.com</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-white text-lg font-bold mb-6 uppercase tracking-wider">Newsletter</h3>
            <p className="text-sm text-slate-400">Subscribe for our latest offers and promotions.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="bg-slate-800 text-white p-3 rounded-l-lg outline-none w-full border border-slate-700 focus:border-blue-500 transition-colors text-sm"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-lg transition-colors flex items-center justify-center">
                <Navigation className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Hotel Sai International. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
