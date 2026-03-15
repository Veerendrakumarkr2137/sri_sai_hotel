import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { ROOMS } from "../data";
import {
  clearUserSession,
  createAuthHeaders,
  getUserToken,
} from "../lib/auth";

type Booking = {
  _id: string;
  bookingRef: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
};

type RescheduleForm = {
  checkIn: string;
  checkOut: string;
  guests: number;
};

const roomCatalog = Object.fromEntries(
  ROOMS.map((room) => [room.name, room]),
);

function isFutureBooking(checkIn: string) {
  return new Date(checkIn).getTime() > Date.now();
}

function isMutableBooking(booking: Booking) {
  return (booking.status === "confirmed" || booking.status === "pending") && isFutureBooking(booking.checkIn);
}

function toInputDate(value: string) {
  return value.split("T")[0];
}

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeRescheduleId, setActiveRescheduleId] = useState<string | null>(null);
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const token = getUserToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let isCancelled = false;

    const loadBookings = async () => {
      try {
        const response = await fetch("/api/my-bookings", {
          headers: createAuthHeaders(token),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 401 || response.status === 403) {
            clearUserSession();
            navigate("/login", { replace: true });
            return;
          }

          throw new Error(data.error || "Failed to load bookings");
        }

        if (!isCancelled) {
          setBookings(data.bookings as Booking[]);
        }
      } catch (requestError) {
        if (!isCancelled) {
          setError("Unable to load your bookings right now.");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  const updateBookingInState = (updatedBooking: Booking) => {
    setBookings((currentBookings) =>
      currentBookings.map((booking) => booking._id === updatedBooking._id ? updatedBooking : booking),
    );
  };

  const handleCancelBooking = async (booking: Booking) => {
    const token = getUserToken();

    if (!token) {
      clearUserSession();
      navigate("/login", { replace: true });
      return;
    }

    if (!confirm(`Cancel booking ${booking.bookingRef}?`)) {
      return;
    }

    setActionLoadingId(booking._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/my-bookings/${booking._id}/cancel`, {
        method: "PATCH",
        headers: createAuthHeaders(token),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        clearUserSession();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to cancel booking");
      }

      updateBookingInState(data.booking as Booking);
      setNotice(data.message || "Booking cancelled successfully.");
      setActiveRescheduleId(null);
      setRescheduleForm(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to cancel booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRescheduleForm = (booking: Booking) => {
    setError("");
    setNotice("");
    setActiveRescheduleId(booking._id);
    setRescheduleForm({
      checkIn: toInputDate(booking.checkIn),
      checkOut: toInputDate(booking.checkOut),
      guests: booking.guests,
    });
  };

  const closeRescheduleForm = () => {
    setActiveRescheduleId(null);
    setRescheduleForm(null);
  };

  const handleRescheduleBooking = async (booking: Booking) => {
    const token = getUserToken();

    if (!token) {
      clearUserSession();
      navigate("/login", { replace: true });
      return;
    }

    if (!rescheduleForm) {
      return;
    }

    setActionLoadingId(booking._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/my-bookings/${booking._id}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders(token),
        },
        body: JSON.stringify(rescheduleForm),
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        clearUserSession();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to reschedule booking");
      }

      updateBookingInState(data.booking as Booking);
      setNotice(data.message || "Booking rescheduled successfully.");
      closeRescheduleForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to reschedule booking.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (isLoading) {
    return <div className="p-20 text-center">Loading your bookings...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="mb-6 text-3xl font-serif font-bold text-[#0B1B3D]">My Bookings</h2>

      {error && (
        <div className="mb-6 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-6 rounded border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {notice}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-slate-600 shadow-sm">
          You do not have any bookings yet.
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const room = roomCatalog[booking.roomType];
            const isMutable = isMutableBooking(booking);
            const isActionLoading = actionLoadingId === booking._id;
            const isRescheduling = activeRescheduleId === booking._id && rescheduleForm;

            return (
              <div key={booking._id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Booking ID</p>
                    <p className="font-semibold text-[#0B1B3D]">{booking.bookingRef}</p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-700">
                    {booking.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-4">
                  <div>
                    <p className="text-slate-500">Room</p>
                    <p className="font-medium">{booking.roomType}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Check-in</p>
                    <p className="font-medium">{format(new Date(booking.checkIn), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Check-out</p>
                    <p className="font-medium">{format(new Date(booking.checkOut), "MMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Total</p>
                    <p className="font-medium">{`Rs. ${booking.totalPrice.toLocaleString("en-IN")}`}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {isMutable ? (
                    <>
                      <button
                        type="button"
                        onClick={() => openRescheduleForm(booking)}
                        disabled={isActionLoading}
                        className="rounded border border-[#0B1B3D] px-4 py-2 text-sm font-medium text-[#0B1B3D] disabled:opacity-70"
                      >
                        Reschedule
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelBooking(booking)}
                        disabled={isActionLoading}
                        className="rounded border border-red-200 px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-70"
                      >
                        {isActionLoading ? "Saving..." : "Cancel Booking"}
                      </button>
                    </>
                  ) : (
                    <p className="text-sm text-slate-500">
                      This booking can no longer be changed online.
                    </p>
                  )}
                </div>

                {isRescheduling && (
                  <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-4 text-lg font-semibold text-[#0B1B3D]">Reschedule Booking</h3>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-sm text-slate-600">Check-in</label>
                        <input
                          type="date"
                          min={today}
                          value={rescheduleForm.checkIn}
                          onChange={(event) =>
                            setRescheduleForm((currentForm) => currentForm ? {
                              ...currentForm,
                              checkIn: event.target.value,
                              checkOut:
                                currentForm.checkOut && currentForm.checkOut <= event.target.value
                                  ? ""
                                  : currentForm.checkOut,
                            } : currentForm)
                          }
                          className="w-full rounded-md border p-3"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm text-slate-600">Check-out</label>
                        <input
                          type="date"
                          min={rescheduleForm.checkIn || today}
                          value={rescheduleForm.checkOut}
                          onChange={(event) =>
                            setRescheduleForm((currentForm) => currentForm ? {
                              ...currentForm,
                              checkOut: event.target.value,
                            } : currentForm)
                          }
                          className="w-full rounded-md border p-3"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm text-slate-600">Guests</label>
                        <select
                          value={rescheduleForm.guests}
                          onChange={(event) =>
                            setRescheduleForm((currentForm) => currentForm ? {
                              ...currentForm,
                              guests: Number(event.target.value),
                            } : currentForm)
                          }
                          className="w-full rounded-md border p-3"
                        >
                          {Array.from({ length: room?.capacity || booking.guests }, (_, index) => index + 1).map((guestCount) => (
                            <option key={guestCount} value={guestCount}>
                              {guestCount} Guest
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => handleRescheduleBooking(booking)}
                        disabled={isActionLoading}
                        className="rounded bg-[#0B1B3D] px-4 py-2 text-sm font-medium text-white disabled:opacity-70"
                      >
                        {isActionLoading ? "Updating..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={closeRescheduleForm}
                        disabled={isActionLoading}
                        className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-70"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
