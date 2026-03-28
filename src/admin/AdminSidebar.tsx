import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LayoutDashboard, Hotel, ClipboardList, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { easeOutExpo } from "../lib/animations";

export default function AdminSidebar() {
  const { logout } = useContext(AuthContext);
  const location = useLocation();

  const menu = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Rooms", path: "/admin/rooms", icon: Hotel },
    { name: "Bookings", path: "/admin/bookings", icon: ClipboardList },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: easeOutExpo }}
      className="flex h-full w-64 flex-col bg-slate-900 pt-8 text-white"
    >
      <div className="px-6 mb-12">
        <h2 className="text-2xl font-bold text-white tracking-tight">Admin<span className="text-blue-500">Panel</span></h2>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Hotel Sai International</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);
          return (
            <motion.div key={item.name} whileHover={{ x: 4 }} transition={{ duration: 0.2 }}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl transition-colors font-semibold"
        >
          <LogOut className="w-5 h-5" />
          Logout Admin
        </motion.button>
      </div>
    </motion.div>
  );
}
