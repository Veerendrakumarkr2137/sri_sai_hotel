import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { CalendarDays, Home, CheckCircle2 } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

function sortBookingsByNewest<T extends { createdAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();

    return rightTime - leftTime;
  });
}

function getPaymentStatusClasses(paymentStatus: string) {
  if (paymentStatus === "paid") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (paymentStatus === "submitted") {
    return "bg-sky-100 text-sky-700";
  }

  if (paymentStatus === "failed") {
    return "bg-red-100 text-red-700";
  }

  return "bg-amber-100 text-amber-700";
}

export default function MyBookings() {
  const { token } = useContext(AuthContext);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/bookings/my-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setBookings(sortBookingsByNewest(data.bookings));
        }
      } catch (err) {
        toast.error("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBookings();
  }, [token]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setCanceling(bookingId);
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, bookingStatus: 'cancelled' } : b));
        toast.success("Booking cancelled successfully");
      } else {
        toast.error(data.error || "Failed to cancel booking");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to cancel booking");
    } finally {
      setCanceling(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-xl font-medium">Loading your bookings...</div>;

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-4xl font-bold mb-12 text-slate-900 tracking-tight text-center">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
          <CalendarDays className="w-16 h-16 mx-auto text-slate-300 mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">No Bookings Yet</h2>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">
            You haven't made any reservations. Explore our luxury rooms and book your perfect stay.
          </p>
          <Link to="/rooms" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/10 inline-flex">
            Explore Rooms
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start hover:shadow-lg transition-all">
              <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                <img
                  src={booking.roomId?.images?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80"}
                  alt={booking.roomId?.title || "Room Image"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {booking.roomId?.title || "Luxury Room"}
                    </h3>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        booking.bookingStatus === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                        booking.bookingStatus === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${getPaymentStatusClasses(booking.paymentStatus)}`}>
                        Payment {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-500 font-mono text-sm mb-4">Ref: {booking.bookingRef}</p>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check In</p>
                    <p className="font-medium text-slate-900">{new Date(booking.checkInDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Check Out</p>
                    <p className="font-medium text-slate-900">{new Date(booking.checkOutDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Guests</p>
                    <p className="font-medium text-slate-900">{booking.guests} Guests</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="font-bold text-emerald-600">₹{booking.totalPrice.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                {booking.bookingStatus === 'confirmed' && (
                  <div className="pt-4 border-t border-slate-100 mt-2">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Booking Confirmed
                    </div>
                    <div className="mb-3">
                      <Link
                        to={`/booking-confirmation/${booking._id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        View confirmation
                      </Link>
                    </div>
                    <button 
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={canceling === booking._id}
                      className="text-red-500 hover:text-red-600 font-semibold text-sm transition-colors disabled:opacity-50"
                    >
                      {canceling === booking._id ? "Cancelling..." : "Cancel Booking"}
                    </button>
                    <p className="text-xs text-slate-400 mt-1">Free cancellation up to 48 hours before check-in.</p>
                  </div>
                )}

                {booking.bookingStatus === "pending_payment" && (
                  <div className="pt-4 border-t border-slate-100 mt-2">
                    <div className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getPaymentStatusClasses(booking.paymentStatus)}`}>
                      {booking.paymentStatus === "submitted" ? "Payment Submitted" : "Payment Pending"}
                    </div>
                    <div className="mb-3">
                      <Link
                        to={booking.paymentMethod === "manual_upi" ? `/booking-confirmation/${booking._id}` : `/payment/${booking._id}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
                      >
                        <CalendarDays className="h-4 w-4" />
                        {booking.paymentStatus === "submitted" ? "View payment status" : "Complete payment"}
                      </Link>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {booking.paymentStatus === "submitted"
                        ? "Your payment has been submitted to the hotel for verification."
                        : "This booking is waiting for payment verification."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
