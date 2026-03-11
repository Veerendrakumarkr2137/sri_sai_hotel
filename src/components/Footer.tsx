import { Link } from "react-router-dom";
import { HOTEL_INFO } from "../data";
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0B1B3D] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-serif font-bold mb-4 text-[#D4AF37]">Hotel Sai International</h3>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              {HOTEL_INFO.description}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors"><Twitter size={20} /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Home</Link></li>
              <li><Link to="/rooms" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Our Rooms</Link></li>
              <li><Link to="/amenities" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Amenities</Link></li>
              <li><Link to="/gallery" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Gallery</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Our Rooms</h4>
            <ul className="space-y-3">
              <li><Link to="/rooms/deluxe-room" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Deluxe Room</Link></li>
              <li><Link to="/rooms/executive-room" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Executive Room</Link></li>
              <li><Link to="/rooms/family-suite" className="text-gray-300 hover:text-[#D4AF37] transition-colors">Family Suite</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 border-b border-gray-700 pb-2 inline-block">Contact Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="text-[#D4AF37] mr-3 mt-1 flex-shrink-0" size={20} />
                <span className="text-gray-300 text-sm leading-relaxed">
                  {HOTEL_INFO.address},<br />
                  {HOTEL_INFO.city}, {HOTEL_INFO.state} {HOTEL_INFO.zip}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="text-[#D4AF37] mr-3 flex-shrink-0" size={20} />
                <span className="text-gray-300">{HOTEL_INFO.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-[#D4AF37] mr-3 flex-shrink-0" size={20} />
                <span className="text-gray-300">{HOTEL_INFO.email}</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Hotel Sai International. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link to="/admin" className="hover:text-white transition-colors">Admin Login</Link>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
