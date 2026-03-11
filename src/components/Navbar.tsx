import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "Rooms", path: "/rooms" },
    { name: "Amenities", path: "/amenities" },
    { name: "Gallery", path: "/gallery" },
    { name: "Reviews", path: "/reviews" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-serif text-[#0B1B3D] font-bold">Hotel Sai <span className="text-[#D4AF37]">International</span></span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`${
                  location.pathname === link.path
                    ? "text-[#D4AF37] font-semibold"
                    : "text-gray-600 hover:text-[#0B1B3D]"
                } transition-colors duration-200`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/rooms"
              className="bg-[#D4AF37] text-white px-6 py-2 rounded-md font-medium hover:bg-[#b8952b] transition-colors"
            >
              Book Now
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-[#0B1B3D] focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`${
                  location.pathname === link.path
                    ? "bg-gray-50 text-[#D4AF37]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-[#0B1B3D]"
                } block px-3 py-2 rounded-md text-base font-medium`}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/rooms"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center mt-4 bg-[#D4AF37] text-white px-6 py-3 rounded-md font-medium hover:bg-[#b8952b]"
            >
              Book Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
