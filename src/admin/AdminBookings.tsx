import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Trash2, CheckCircle2, Copy } from "lucide-react";

export default function AdminBookings() {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/bookings/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
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
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Booking deleted");
      fetchBookings();
    } catch (err) {
      toast.error("Failed to delete booking");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/admin/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Booking ${status}`);
      fetchBookings();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Manage Bookings</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-semibold">Ref / Room</th>
              <th className="px-6 py-4 font-semibold">Guest Name</th>
              <th className="px-6 py-4 font-semibold">Dates</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    {booking.bookingRef}
                    <button className="text-slate-400 hover:text-slate-600">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-slate-500 font-medium">
                    {booking.roomId?.title || "Unknown Room"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900 font-medium">{booking.name}</div>
                  <div className="text-slate-500">{booking.email}</div>
                  <div className="text-slate-500">{booking.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-slate-900">In: {new Date(booking.checkInDate).toLocaleDateString()}</div>
                  <div className="text-slate-500">Out: {new Date(booking.checkOutDate).toLocaleDateString()}</div>
                  <div className="text-slate-600 font-medium mt-1">{booking.guests} Guests</div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={booking.bookingStatus}
                    onChange={(e) => updateStatus(booking._id, e.target.value)}
                    className={`block w-full text-sm font-semibold rounded-lg border-slate-200 focus:ring-slate-900 focus:border-slate-900 cursor-pointer ${
                      booking.bookingStatus === 'confirmed' ? "text-emerald-600 bg-emerald-50" :
                      booking.bookingStatus === 'pending' ? "text-amber-600 bg-amber-50" :
                      "text-slate-600 bg-slate-50"
                    } p-2 px-3 border border-transparent outline-none`}
                  >
                    <option value="pending" className="text-slate-900">Pending</option>
                    <option value="confirmed" className="text-slate-900">Confirmed</option>
                    <option value="cancelled" className="text-slate-900">Cancelled</option>
                    <option value="completed" className="text-slate-900">Completed</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => deleteBooking(booking._id)} className="text-red-600 hover:text-red-800 transition-colors p-2 bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-lg">
            No bookings found.
          </div>
        )}
      </div>
    </div>
  );
}
