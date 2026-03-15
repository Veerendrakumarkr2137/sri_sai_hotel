import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  AUTH_CHANGE_EVENT,
  clearUserSession,
  getStoredUser,
  type SessionUser,
} from "../lib/auth";

export default function Navbar() {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredUser());
  const navigate = useNavigate();

  useEffect(() => {
    const syncUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener("storage", syncUser);
    window.addEventListener(AUTH_CHANGE_EVENT, syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncUser);
    };
  }, []);

  const logout = () => {
    clearUserSession();
    navigate("/", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors ${isActive ? "font-semibold text-[#0B1B3D]" : "text-slate-600 hover:text-[#0B1B3D]"}`;

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <Link to="/" className="text-xl font-bold text-[#0B1B3D]">
          Hotel Sai International
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/rooms" className={navLinkClass}>
            Rooms
          </NavLink>

          {!user ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <Link to="/register" className="rounded bg-[#D4AF37] px-4 py-2 text-white hover:bg-[#b8952b]">
                Register
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/profile" className={navLinkClass}>
                {user.name}
              </NavLink>
              <NavLink to="/my-bookings" className={navLinkClass}>
                My Bookings
              </NavLink>
              <button onClick={logout} className="text-slate-600 hover:text-[#0B1B3D]">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
