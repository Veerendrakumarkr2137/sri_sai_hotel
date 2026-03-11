import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROOMS } from "../data";
import { motion } from "motion/react";

type BookingFormData = {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

export default function BookingPage() {

  const { id } = useParams();
  const navigate = useNavigate();
  const room = ROOMS.find(r => r.id === id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<number | null>(null);
  
const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

const { register, handleSubmit, watch, formState: { errors } } =
  useForm<BookingFormData>({
    defaultValues: {
      name: savedUser.name || "",
      email: savedUser.email || ""
    }
  });
  const checkInDate = watch("checkIn");
  const checkOutDate = watch("checkOut");

  // 🔐 LOGIN CHECK
  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login to continue booking");
      navigate("/login");
    }

  }, []);

  // 📦 FETCH ROOM AVAILABILITY
  useEffect(() => {

    if (!room) return;

    fetch(`/api/availability/${room.name}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableRooms(data.available);
        }
      })
      .catch(err => console.error("Availability error:", err));

  }, [room]);

  // 💰 TOTAL PRICE CALCULATION
  const calculateTotal = () => {

    if (!checkInDate || !checkOutDate || !room)
      return room?.price || 0;

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);

    const diffTime = Math.abs(end.getTime() - start.getTime());

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays * room.price : room.price;
  };

  // 📩 BOOKING SUBMIT
  const onSubmit = async (data: BookingFormData) => {

    if (!room) return;

    setIsSubmitting(true);

    try {

      const token = localStorage.getItem("token");

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          roomType: room.name,
          totalPrice: calculateTotal()
        })
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        alert(result.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert("Server connection error");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!room)
    return <div className="p-20 text-center">Room not found</div>;

  // 🎉 SUCCESS SCREEN
  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#0B1B3D] mb-4">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for choosing Hotel Sai International.
            We have sent a confirmation email with your booking details.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to home...
          </p>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="w-full bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1B3D] mb-2">
            Complete Your Booking
          </h1>
          <p className="text-gray-600">
            You are booking the
            <span className="font-semibold text-[#D4AF37]">
              {" "} {room.name}
            </span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* FORM */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <h3 className="text-xl font-semibold mb-6 border-b pb-4">
                Guest Information
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <input 
                  {...register("name", { required: "Name is required" })}
                  readOnly
                />
                <input 
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  readOnly
                />
                <input
                  {...register("phone", { required: true })}
                  placeholder="Phone"
                  className="w-full border p-3 rounded-md"
                />
                <input
                  type="date"
                  {...register("checkIn", { required: true })}
                  className="w-full border p-3 rounded-md"
                />
                <input
                  type="date"
                  {...register("checkOut", { required: true })}
                  className="w-full border p-3 rounded-md"
                />
                <select
                  {...register("guests", { required: true, valueAsNumber: true })}
                  className="w-full border p-3 rounded-md"
                >
                  {[...Array(room.capacity)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guest
                    </option>
                  ))}

                </select>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0B1B3D] text-white py-4 rounded-md font-medium"
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          </div>
          {/* ROOM SUMMARY */}
          <div className="md:w-1/3">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 sticky top-28">
              <img
                src={room.images[0]}
                alt={room.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h4 className="text-xl font-serif font-bold text-[#0B1B3D] mb-4">
                  {room.name}
                </h4>
                {availableRooms !== null && (
                  <p className="text-green-600 font-semibold mb-2">
                    {availableRooms} Rooms Available
                  </p>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Price per night</span>
                  <span>₹{room.price}</span>
                </div>
                {checkInDate && checkOutDate && (
                  <div className="flex justify-between text-[#D4AF37] font-medium mt-2">
                    <span>Total Stay</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}