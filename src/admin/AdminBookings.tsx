import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Trash2, Copy } from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { motion } from "motion/react";
import { hoverLift, revealSoft, revealUp, sectionStagger } from "../lib/animations";

export default function AdminBookings() {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBookings(bookings);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = bookings.filter((booking) =>
        booking.bookingRef.toLowerCase().includes(query) ||
        booking.name.toLowerCase().includes(query) ||
        booking.email.toLowerCase().includes(query) ||
        booking.phone.includes(query)
      );
      setFilteredBookings(filtered);
    }
  }, [searchQuery, bookings]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/bookings/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      toast.error("Failed to load bookings");
    }
  };

  const deleteBooking = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/bookings/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Booking deleted");
      fetchBookings();
    } catch (err) {
      toast.error("Failed to delete booking");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/bookings/admin/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={sectionStagger} className="max-w-7xl mx-auto">
      <motion.h1 variants={revealUp} className="mb-8 text-3xl font-bold text-slate-900">
        Manage Bookings
      </motion.h1>

      <motion.div variants={revealSoft} className="mb-6">
        <input
          type="text"
          placeholder="Search by booking ID, name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition-all focus:border-slate-900 focus:ring-2 focus:ring-slate-900"
        />
        {searchQuery && (
          <p className="mt-2 text-sm text-slate-500">Found {filteredBookings.length} booking(s)</p>
        )}
      </motion.div>

      <motion.div
        variants={revealSoft}
        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
      >
        <table className="w-full text-left">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Ref / Room</th>
              <th className="px-6 py-4 font-semibold">Guest Name</th>
              <th className="px-6 py-4 font-semibold">Dates</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredBookings.map((booking, index) => (
              <motion.tr
                key={booking._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: index * 0.03 }}
                className="transition-colors hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    {booking.bookingRef}
                    <button className="text-slate-400 transition-colors hover:text-slate-600">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-medium text-slate-500">{booking.roomId?.title || "Unknown Room"}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{booking.name}</div>
                  <div className="text-slate-500">{booking.email}</div>
                  <div className="text-slate-500">{booking.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900">In: {new Date(booking.checkInDate).toLocaleDateString()}</div>
                  <div className="text-slate-500">Out: {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                  <div className="mt-1 font-medium text-slate-600">{booking.guests} Guests</div>
                </td>
                <td className="px-6 py-4">
                  <motion.div whileHover={hoverLift}>
                    <select
                      value={booking.bookingStatus}
                      onChange={(e) => updateStatus(booking._id, e.target.value)}
                      className={`block w-full cursor-pointer rounded-lg border border-transparent p-2 px-3 text-sm font-semibold outline-none focus:border-slate-900 focus:ring-slate-900 ${
                        booking.bookingStatus === "confirmed"
                          ? "bg-emerald-50 text-emerald-600"
                          : booking.bookingStatus === "pending_payment"
                            ? "bg-orange-50 text-orange-600"
                            : booking.bookingStatus === "pending"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-slate-50 text-slate-600"
                      }`}
                    >
                      <option value="pending" className="text-slate-900">
                        Pending
                      </option>
                      <option value="pending_payment" className="text-slate-900">
                        Pending Payment
                      </option>
                      <option value="confirmed" className="text-slate-900">
                        Confirmed
                      </option>
                      <option value="cancelled" className="text-slate-900">
                        Cancelled
                      </option>
                      <option value="completed" className="text-slate-900">
                        Completed
                      </option>
                    </select>
                  </motion.div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <motion.button
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => deleteBooking(booking._id)}
                      className="rounded-lg bg-red-50 p-2 text-red-600 transition-colors hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <motion.div variants={revealSoft} className="py-12 text-center text-lg text-slate-500">
            {searchQuery ? "No bookings match your search." : "No bookings found."}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
