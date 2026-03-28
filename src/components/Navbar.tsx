import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X, Home, Bed, Phone, Image as ImageIcon, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { easeOutExpo } from "../lib/animations";

const menuSpring = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.9,
} as const;

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: easeOutExpo }}
      className={`fixed top-0 z-50 flex h-[80px] w-full flex-col justify-center backdrop-blur-xl transition-all duration-500 ${
        isScrolled
          ? "border-b border-white/70 bg-white/85 shadow-xl shadow-slate-900/8"
          : "border-b border-white/50 bg-white/70 shadow-sm shadow-slate-900/5"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-50/70 via-white/30 to-sky-50/70" />

      <div className="container relative mx-auto max-w-7xl px-4">
        <div className="flex h-full items-center justify-between">
          <Link to="/" className="group flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: -4, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="text-2xl font-black tracking-tighter text-slate-900"
            >
              HOTEL{" "}
              <span className="text-blue-600 transition-colors duration-300 group-hover:text-blue-500">
                SAI
              </span>
            </motion.div>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/75 px-2 py-2 shadow-sm shadow-slate-900/5">
              {navLinks.map((link) => {
                const active = isActive(link.path);

                return (
                  <motion.div key={link.name} whileHover={{ y: -1 }}>
                    <Link
                      to={link.path}
                      className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        active ? "text-slate-900" : "text-slate-500 hover:text-blue-600"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="desktop-nav-pill"
                          transition={menuSpring}
                          className="absolute inset-0 rounded-full border border-blue-100 bg-blue-50 shadow-inner"
                        />
                      )}
                      <span className="relative z-10">{link.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ y: -1 }}>
                  <Link
                    to="/my-bookings"
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-slate-900"
                  >
                    My Bookings
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -1 }}>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white/80 hover:text-slate-900"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </motion.div>
                <div className="h-8 w-px bg-slate-200" />
                <motion.div
                  whileHover={{ y: -1 }}
                  className="flex items-center gap-2 rounded-full border border-slate-100 bg-white/85 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm shadow-slate-900/5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 ring-2 ring-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </motion.div>
                <motion.button
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={handleLogout}
                  className="rounded-full bg-slate-100 p-2.5 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <motion.div whileHover={{ y: -1 }}>
                  <Link
                    to="/login"
                    className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-white/85 hover:text-slate-900"
                  >
                    Sign In
                  </Link>
                </motion.div>
                <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="block rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition-colors hover:bg-blue-600"
                  >
                    Book Now
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ y: -1 }}
            className={`rounded-2xl border px-3 py-2 text-slate-900 transition-colors md:hidden ${
              isOpen
                ? "border-blue-100 bg-blue-50 text-blue-600"
                : "border-slate-200 bg-white/85"
            }`}
            onClick={() => setIsOpen((open) => !open)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[80px] z-40 bg-slate-950/10 backdrop-blur-sm md:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={menuSpring}
              className="absolute left-4 right-4 top-[92px] z-50 overflow-hidden rounded-[2rem] border border-white/70 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 md:hidden"
            >
              <div className="space-y-2">
                {navLinks.map((link, idx) => {
                  const active = isActive(link.path);

                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                    >
                      <Link
                        to={link.path}
                        className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold transition-all ${
                          active
                            ? "bg-blue-50 text-blue-600 shadow-inner"
                            : "text-slate-800 hover:bg-slate-50 hover:text-blue-600"
                        }`}
                      >
                        <link.icon className="h-5 w-5" />
                        {link.name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <div className="my-4 h-px bg-slate-100" />

              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/my-bookings"
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                  >
                    <Bed className="h-5 w-5 text-blue-600" />
                    My Bookings
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                  >
                    <User className="h-5 w-5 text-blue-600" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-3">
                  <Link
                    to="/login"
                    className="rounded-2xl bg-slate-100 py-4 text-center font-bold text-slate-900 transition-colors hover:bg-slate-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-2xl bg-blue-600 py-4 text-center font-bold text-white shadow-xl shadow-blue-200 transition-colors hover:bg-blue-700"
                  >
                    Book Your Stay
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
