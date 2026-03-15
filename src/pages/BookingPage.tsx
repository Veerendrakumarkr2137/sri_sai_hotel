import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router-dom";
import { ROOMS } from "../data";
import {
  clearUserSession,
  createAuthHeaders,
  getStoredUser,
  getUserToken,
  updateStoredUser,
  type SessionUser,
} from "../lib/auth";

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
  const room = ROOMS.find((roomItem) => roomItem.id === id);
  const [user, setUser] = useState<SessionUser | null>(() => getStoredUser());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [availableRooms, setAvailableRooms] = useState<number | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<BookingFormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      guests: 1,
      checkIn: "",
      checkOut: "",
    },
  });

  const checkInDate = watch("checkIn");
  const checkOutDate = watch("checkOut");

  useEffect(() => {
    const token = getUserToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isCancelled = false;

    const loadUser = async () => {
      try {
        const response = await fetch("/api/me", {
          headers: createAuthHeaders(token),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          clearUserSession();
          navigate("/login", { replace: true });
          return;
        }

        if (!isCancelled) {
          const nextUser = data.user as SessionUser;
          updateStoredUser(nextUser);
          setUser(nextUser);

          const currentValues = getValues();
          reset({
            ...currentValues,
            name: nextUser.name,
            email: nextUser.email,
          });
        }
      } catch (requestError) {
        if (!isCancelled) {
          clearUserSession();
          navigate("/login", { replace: true });
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      isCancelled = true;
    };
  }, [getValues, navigate, reset]);

  useEffect(() => {
    if (!room) {
      return;
    }

    setAvailabilityError("");

    const searchParams = new URLSearchParams();

    if (checkInDate && checkOutDate) {
      searchParams.set("checkIn", checkInDate);
      searchParams.set("checkOut", checkOutDate);
    }

    const availabilityUrl =
      `/api/availability/${encodeURIComponent(room.name)}` +
      `${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    fetch(availabilityUrl)
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Availability is unavailable right now.");
        }

        setAvailableRooms(data.available as number);
      })
      .catch((error) => {
        console.error("Availability error:", error);
        setAvailabilityError("Availability is unavailable right now.");
      });
  }, [checkInDate, checkOutDate, room]);

  const calculateTotal = () => {
    if (!checkInDate || !checkOutDate || !room) {
      return room?.price || 0;
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diffTime = end.getTime() - start.getTime();

    if (diffTime <= 0) {
      return room.price;
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * room.price;
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!room) {
      return;
    }

    const token = getUserToken();

    if (!token) {
      clearUserSession();
      navigate("/login", { replace: true });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders(token),
        },
        body: JSON.stringify({
          roomType: room.name,
          phone: data.phone,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: data.guests,
        }),
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        clearUserSession();
        navigate("/login", { replace: true });
        return;
      }

      if (response.ok && result.success) {
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

  if (!room) {
    return <div className="p-20 text-center">Room not found</div>;
  }

  if (isLoadingUser) {
    return <div className="p-20 text-center">Loading your account...</div>;
  }

  if (success) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-500">
            <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="mb-4 text-3xl font-serif font-bold text-[#0B1B3D]">
            Booking Confirmed!
          </h2>
          <p className="mb-6 text-gray-600">
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-serif font-bold text-[#0B1B3D] md:text-4xl">
            Complete Your Booking
          </h1>
          <p className="text-gray-600">
            You are booking the
            <span className="font-semibold text-[#D4AF37]">
              {" "} {room.name}
            </span>
          </p>
        </div>
        <div className="flex flex-col gap-8 md:flex-row">
          <div className="md:w-2/3">
            <div className="rounded-xl border border-gray-100 bg-white p-8 shadow-md">
              <h3 className="mb-6 border-b pb-4 text-xl font-semibold">
                Guest Information
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <input
                  {...register("name", { required: "Name is required" })}
                  readOnly
                  className="w-full rounded-md border bg-slate-50 p-3 text-slate-700"
                />
                <input
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  readOnly
                  className="w-full rounded-md border bg-slate-50 p-3 text-slate-700"
                />
                <div>
                  <input
                    {...register("phone", { required: "Phone is required" })}
                    placeholder="Phone"
                    className="w-full rounded-md border p-3"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <input
                    type="date"
                    min={today}
                    {...register("checkIn", { required: "Check-in date is required" })}
                    className="w-full rounded-md border p-3"
                  />
                  {errors.checkIn && (
                    <p className="mt-2 text-sm text-red-600">{errors.checkIn.message}</p>
                  )}
                </div>
                <div>
                  <input
                    type="date"
                    min={checkInDate || today}
                    {...register("checkOut", {
                      required: "Check-out date is required",
                      validate: (value) =>
                        !checkInDate || new Date(value) > new Date(checkInDate) || "Check-out must be after check-in",
                    })}
                    className="w-full rounded-md border p-3"
                  />
                  {errors.checkOut && (
                    <p className="mt-2 text-sm text-red-600">{errors.checkOut.message}</p>
                  )}
                </div>
                <select
                  {...register("guests", { required: true, valueAsNumber: true })}
                  className="w-full rounded-md border p-3"
                >
                  {Array.from({ length: room.capacity }, (_, index) => index + 1).map((guestCount) => (
                    <option key={guestCount} value={guestCount}>
                      {guestCount} Guest
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting || availableRooms === 0}
                  className="w-full rounded-md bg-[#0B1B3D] py-4 font-medium text-white disabled:opacity-70"
                >
                  {isSubmitting ? "Processing..." : "Confirm Booking"}
                </button>
              </form>
            </div>
          </div>

          <div className="md:w-1/3">
            <div className="sticky top-28 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
              <img
                src={room.images[0]}
                alt={room.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-6">
                <h4 className="mb-4 text-xl font-serif font-bold text-[#0B1B3D]">
                  {room.name}
                </h4>
                {availableRooms !== null && (
                  <p className="mb-2 font-semibold text-green-600">
                    {availableRooms} Rooms Available
                  </p>
                )}
                {availabilityError && (
                  <p className="mb-2 text-sm text-amber-700">{availabilityError}</p>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Price per night</span>
                  <span>{`Rs. ${room.price.toLocaleString("en-IN")}`}</span>
                </div>
                {checkInDate && checkOutDate && (
                  <div className="mt-2 flex justify-between font-medium text-[#D4AF37]">
                    <span>Total Stay</span>
                    <span>{`Rs. ${calculateTotal().toLocaleString("en-IN")}`}</span>
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
