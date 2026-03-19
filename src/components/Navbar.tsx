import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, Home, Bed, Phone, Image as ImageIcon, User, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Rooms & Suites", path: "/rooms", icon: Bed },
    { name: "Gallery", path: "/gallery", icon: ImageIcon },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  return (
    <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 shadow-sm transition-all h-[80px] flex flex-col justify-center">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">
              HOTEL <span className="text-blue-600">SAI</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wide flex items-center gap-1.5"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/my-bookings" className="text-slate-600 font-medium text-sm hover:text-slate-900">
                  My Bookings
                </Link>
                <Link to="/profile" className="text-slate-600 font-medium text-sm hover:text-slate-900 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <div className="h-8 w-px bg-slate-200"></div>
                <div className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-100 text-slate-600 hover:bg-slate-200 p-2 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium text-sm px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="bg-slate-900 text-white hover:bg-slate-800 px-5 py-2 rounded-full font-medium text-sm transition-colors shadow-sm shadow-slate-900/10">
                  Book Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-slate-900 p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-[80px] left-0 w-full bg-white border-b border-slate-100 shadow-xl py-4 flex flex-col px-4 gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-slate-800 font-semibold px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3"
              onClick={() => setIsOpen(false)}
            >
              <link.icon className="w-5 h-5 text-blue-600" />
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-slate-100 my-2"></div>
          {user ? (
            <>
              <Link to="/my-bookings" className="font-semibold px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3" onClick={() => setIsOpen(false)}>
                 <span className="w-5 h-5 text-blue-600" /> My Bookings
              </Link>
              <Link to="/profile" className="font-semibold px-4 py-3 rounded-xl hover:bg-slate-50 flex items-center gap-3" onClick={() => setIsOpen(false)}>
                <User className="w-5 h-5" /> Profile
              </Link>
              <button onClick={() => { handleLogout(); setIsOpen(false); }} className="text-red-600 font-semibold px-4 py-3 rounded-xl hover:bg-red-50 flex items-center gap-3 text-left">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 px-4">
              <Link to="/login" onClick={() => setIsOpen(false)} className="bg-slate-100 text-center font-semibold py-3 rounded-xl">Sign In</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="bg-slate-900 text-white text-center font-semibold py-3 rounded-xl shadow-lg">Create Account</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
