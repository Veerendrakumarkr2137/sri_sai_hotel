import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {

  const [user, setUser] = useState<any>(null);

  useEffect(() => {

    const storedUser = localStorage.getItem("user");

    if (storedUser && storedUser !== "undefined") {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.log("Invalid user in storage");
      }
    }

  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  return (

    <nav className="bg-white shadow p-4 flex justify-between">

      <Link to="/" className="font-bold text-xl">
        Hotel Sai International
      </Link>

      <div className="flex gap-4">

        <Link to="/">Home</Link>
        <Link to="/rooms">Rooms</Link>

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/profile">Profile</Link>
            <Link to="/my-bookings">My Bookings</Link>

            <button onClick={logout}>
              Logout
            </button>
          </>
        )}

      </div>

    </nav>

  );
}