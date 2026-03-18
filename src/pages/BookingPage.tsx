import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../lib/api";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [room, setRoom] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "upi" | "manual_upi" | "pay_at_hotel">("razorpay");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    checkInDate: "",
    checkOutDate: "",
    guests: 1,
  });

  useEffect(() => {
    if (!token) {
      toast.error("Please login to book a room");
      navigate("/login");
      return;
    }

    const fetchRoom = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/rooms/${id}`);
        if (data.success) {
          setRoom(data.room);
        }
      } catch (err) {
        console.error("Failed to fetch room:", err);
      }
    };
    fetchRoom();
  }, [id, token, navigate, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    if (!room || !formData.checkInDate || !formData.checkOutDate) return 0;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * room.price : room.price;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.checkInDate || !formData.checkOutDate) {
      toast.error("Please fill all details");
      return;
    }

    try {
      const totalAmount = calculateTotal();

      if (paymentMethod === "manual_upi") {
        // Manual UPI Payment
        const { data } = await axios.post(
          `${API_BASE_URL}/api/bookings/manual-booking`,
          {
            bookingData: {
              roomId: room._id,
              ...formData,
              totalPrice: totalAmount,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success("Booking confirmed! Please complete payment via UPI.");
          navigate("/my-bookings");
        }
        return;
      }

      if (paymentMethod === "pay_at_hotel") {
        // Pay at Hotel
        const { data } = await axios.post(
          `${API_BASE_URL}/api/bookings/pay-at-hotel`,
          {
            bookingData: {
              roomId: room._id,
              ...formData,
              totalPrice: totalAmount,
            },
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success("Booking confirmed! Please pay at the hotel upon arrival.");
          navigate("/my-bookings");
        }
        return;
      }

      // 1. Create order
      const orderRes = await axios.post(
        `${API_BASE_URL}/api/bookings/create-order`,
        { amount: totalAmount, paymentMethod },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (paymentMethod === "upi") {
        // UPI Payment via Razorpay
        const options = {
          key: process.env.RAZORPAY_KEY_ID || "test_key",
          amount: orderRes.data.order.amount,
          currency: "INR",
          name: "Hotel Sai International",
          description: `Booking for ${room.title}`,
          order_id: orderRes.data.order.id,
          method: "upi",
          upi_link: true,
          handler: async function (response: any) {
            try {
              const verifyRes = await axios.post(
                `${API_BASE_URL}/api/bookings/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  paymentMethod: "upi",
                  bookingData: {
                    roomId: room._id,
                    ...formData,
                    totalPrice: totalAmount,
                  },
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.success) {
                toast.success("Booking confirmed successfully!");
                navigate("/my-bookings");
              }
            } catch (err) {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            contact: formData.phone,
            email: formData.email,
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Card Payment via Razorpay
        const options = {
          key: process.env.RAZORPAY_KEY_ID || "test_key",
          amount: orderRes.data.order.amount,
          currency: "INR",
          name: "Hotel Sai International",
          description: `Booking for ${room.title}`,
          order_id: orderRes.data.order.id,
          handler: async function (response: any) {
            try {
              const verifyRes = await axios.post(
                `${API_BASE_URL}/api/bookings/verify-payment`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  paymentMethod: "card",
                  bookingData: {
                    roomId: room._id,
                    ...formData,
                    totalPrice: totalAmount,
                  },
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.success) {
                toast.success("Booking confirmed successfully!");
                navigate("/my-bookings");
              }
            } catch (err) {
              toast.error("Payment verification failed");
            }
          },
          prefill: {
            name: formData.name,
            email: formData.email,
            contact: formData.phone,
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Payment failed");
    }
  };

  if (!room) return <div className="text-center py-20 text-xl">Loading booking details...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-center text-slate-900">Complete Your Booking</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full text-slate-800">
          <h2 className="text-2xl font-bold mb-6 border-b border-slate-100 pb-4">Room Summary</h2>
          <img
            src={room.images?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80"}
            alt={room.title}
            className="w-full h-48 object-cover rounded-xl mb-6 shadow-sm"
          />
          <h3 className="text-xl font-semibold mb-2">{room.title}</h3>
          <p className="text-slate-500 mb-6 text-sm">{room.description}</p>
          
          <div className="mt-auto border-t border-slate-100 pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-500 font-medium">Price per night</span>
              <span className="font-semibold">₹{room.price.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-slate-900">
              <span>Total Estimated</span>
              <span className="text-emerald-600">₹{calculateTotal().toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handlePayment} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Guest Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all cursor-not-allowed bg-slate-50"
                readOnly
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Check-in</label>
                <input
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-slate-700">Check-out</label>
                <input
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-slate-700">Guests</label>
              <select
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
              >
                {[...Array(room.capacity)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <label className="block mb-4 text-sm font-semibold text-slate-900">Payment Method</label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="razorpay"
                  checked={paymentMethod === "razorpay"}
                  onChange={(e) => setPaymentMethod(e.target.value as "razorpay" | "upi" | "manual_upi")}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="ml-3 text-slate-700 font-medium">💳 Card/Wallet</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={(e) => setPaymentMethod(e.target.value as "razorpay" | "upi" | "manual_upi")}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="ml-3 text-slate-700 font-medium">📱 UPI</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="pay_at_hotel"
                  checked={paymentMethod === "pay_at_hotel"}
                  onChange={(e) => setPaymentMethod(e.target.value as "razorpay" | "upi" | "manual_upi" | "pay_at_hotel")}
                  className="w-4 h-4 cursor-pointer"
                />
                <span className="ml-3 text-slate-700 font-medium">🏨 Pay at Hotel</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-semibold p-4 rounded-xl mt-8 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10 active:scale-[0.98]"
          >
            Pay {paymentMethod === "upi" ? "via UPI" : paymentMethod === "manual_upi" ? "via Manual UPI" : paymentMethod === "pay_at_hotel" ? "at Hotel" : "with Card"} & Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
