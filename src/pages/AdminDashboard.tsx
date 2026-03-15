import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { format } from "date-fns";
import { Trash2, CheckCircle, XCircle, LogOut, Users, Calendar, DollarSign } from "lucide-react";
import {
  clearAdminSession,
  createAuthHeaders,
  getAdminToken,
} from "../lib/auth";

type Booking = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      const token = getAdminToken();

      if (!token) {
        navigate("/admin", { replace: true });
        return;
      }

      try {
        setError("");
        const response = await fetch("/api/bookings", {
          headers: createAuthHeaders(token),
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          clearAdminSession();
          navigate("/admin", { replace: true });
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to load bookings");
        }

        setBookings(data.bookings as Booking[]);
      } catch (requestError) {
        console.error("Failed to fetch bookings:", requestError);
        setError("Failed to fetch bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    const token = getAdminToken();

    if (!token) {
      clearAdminSession();
      navigate("/admin", { replace: true });
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "DELETE",
        headers: createAuthHeaders(token),
      });

      if (response.status === 401 || response.status === 403) {
        clearAdminSession();
        navigate("/admin", { replace: true });
        return;
      }

      if (response.ok) {
        setBookings((currentBookings) =>
          currentBookings.filter((booking) => booking._id !== id),
        );
      }
    } catch (requestError) {
      console.error("Failed to delete booking:", requestError);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    const token = getAdminToken();

    if (!token) {
      clearAdminSession();
      navigate("/admin", { replace: true });
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders(token),
        },
        body: JSON.stringify({ status }),
      });

      if (response.status === 401 || response.status === 403) {
        clearAdminSession();
        navigate("/admin", { replace: true });
        return;
      }

      if (response.ok) {
        setBookings((currentBookings) =>
          currentBookings.map((booking) => booking._id === id ? { ...booking, status } : booking),
        );
      }
    } catch (requestError) {
      console.error("Failed to update status:", requestError);
    }
  };

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin", { replace: true });
  };

  const totalRevenue = bookings.reduce((sum, booking) => booking.status !== "cancelled" ? sum + booking.totalPrice : sum, 0);
  const activeBookings = bookings.filter((booking) => booking.status === "confirmed").length;
  const totalGuests = bookings.reduce((sum, booking) => booking.status !== "cancelled" ? sum + booking.guests : sum, 0);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0B1B3D] text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-serif font-bold text-[#D4AF37]">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm text-gray-300 transition-colors hover:text-white"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{activeBookings}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{`Rs. ${totalRevenue.toLocaleString("en-IN")}`}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Guest</th>
                  <th className="px-6 py-4 font-medium">Room</th>
                  <th className="px-6 py-4 font-medium">Dates</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{booking.name}</div>
                        <div className="text-sm text-gray-500">{booking.email}</div>
                        <div className="text-sm text-gray-500">{booking.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.roomType}</div>
                        <div className="text-xs text-gray-500">{booking.guests} Guests</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          In: {format(new Date(booking.checkIn), "MMM dd, yyyy")}
                        </div>
                        <div className="text-sm text-gray-900">
                          Out: {format(new Date(booking.checkOut), "MMM dd, yyyy")}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {`Rs. ${booking.totalPrice.toLocaleString("en-IN")}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : booking.status === "completed"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {booking.status !== "confirmed" && booking.status !== "completed" && (
                            <button
                              onClick={() => handleStatusChange(booking._id, "confirmed")}
                              className="text-green-600 hover:text-green-900"
                              title="Confirm"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {booking.status !== "cancelled" && booking.status !== "completed" && (
                            <button
                              onClick={() => handleStatusChange(booking._id, "cancelled")}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Cancel"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
