import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {

  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error("User parse error");
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const links = [
    { name: "Home", path: "/" },
    { name: "Rooms", path: "/rooms" },
    { name: "Amenities", path: "/amenities" },
    { name: "Gallery", path: "/gallery" },
    { name: "Reviews", path: "/reviews" },
    { name: "Contact", path: "/contact" },
    { name: "Find My Booking", path: "/booking-search" }
  ];

  return (
    <nav className="bg-white shadow sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-4">

        <div className="flex justify-between items-center h-20">

          {/* Logo */}

          <Link to="/" className="text-2xl font-serif font-bold text-[#0B1B3D]">
            Hotel Sai <span className="text-[#D4AF37]">International</span>
          </Link>

          {/* Desktop menu */}

          <div className="hidden md:flex items-center space-x-6">

            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={
                  location.pathname === link.path
                    ? "text-[#D4AF37] font-semibold"
                    : "text-gray-600 hover:text-[#0B1B3D]"
                }
              >
                {link.name}
              </Link>
            ))}

            {/* User section */}

            {!user ? (

              <>
                <Link to="/login" className="text-gray-700 hover:text-[#0B1B3D]">
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-[#D4AF37] text-white px-4 py-2 rounded-md"
                >
                  Register
                </Link>
              </>

            ) : (

              <div className="flex items-center gap-4">

                <User size={20} />

                <span className="text-gray-700">{user.name}</span>

                <Link to="/profile" className="text-gray-600 hover:text-black">
                  Profile
                </Link>

                <Link
                  to="/my-bookings"
                  className="text-gray-600 hover:text-black"
                >
                  My Bookings
                </Link>

                <button
                  onClick={logout}
                  className="text-red-500 hover:text-red-700"
                >
                  Logout
                </button>

              </div>

            )}

          </div>

          {/* Mobile menu button */}

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>

      </div>

      {/* Mobile menu */}

      {isOpen && (

        <div className="md:hidden bg-white border-t">

          <div className="px-4 py-4 space-y-3">

            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-gray-700"
              >
                {link.name}
              </Link>
            ))}

            {!user ? (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            ) : (
              <>
                <Link to="/profile">Profile</Link>
                <Link to="/my-bookings">My Bookings</Link>
                <button onClick={logout}>Logout</button>
              </>
            )}

          </div>

        </div>

      )}

    </nav>
  );
}