import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { createAuthHeaders, getUserToken } from "../lib/auth";
import { API_BASE_URL } from "../lib/api";

export default function PaymentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
          headers: createAuthHeaders(token),
        });

        if (response.status === 401 || response.status === 403) {
          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json();
        if (!response.ok || !data.success) {
          setError(data.error || "Failed to load booking.");
          return;
        }

        setBooking(data.booking);
      } catch (err) {
        setError("Failed to load booking.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate]);

  const handleConfirmPayment = async () => {
    const token = getUserToken();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/${id}/confirm-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...createAuthHeaders(token),
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        toast.error(data.error || "Unable to confirm payment.");
        return;
      }

      toast.success("Payment confirmed! Your booking is now complete.");
      navigate("/my-bookings");
    } catch (err) {
      toast.error("Unable to confirm payment right now.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCopyUpi = () => {
    if (!booking?.upiId) return;
    navigator.clipboard
      .writeText(booking.upiId)
      .then(() => toast.success("UPI ID copied to clipboard"))
      .catch(() => toast.error("Failed to copy UPI ID"));
  };

  if (isLoading) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-20 text-center text-red-600">{error}</div>;
  }

  if (!booking) {
    return <div className="p-20 text-center text-red-600">Booking not found.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl space-y-6 px-4">
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-3xl font-serif font-bold text-[#0B1B3D]">Complete payment</h1>

          <div className="space-y-4 text-gray-700">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">Booking reference</p>
                  <p className="text-lg font-semibold text-slate-900">{booking.bookingRef}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Total amount</p>
                  <p className="text-lg font-semibold text-slate-900">₹{booking.totalPrice}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Check-in</p>
                  <p className="text-base font-medium text-slate-800">
                    {new Date(booking.checkInDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Check-out</p>
                  <p className="text-base font-medium text-slate-800">
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Guests</p>
                  <p className="text-base font-medium text-slate-800">{booking.guests}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Room</p>
                  <p className="text-base font-medium text-slate-800">{booking.roomId?.title || "--"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-bold text-slate-900">Pay via UPI</h2>
              <p className="mt-2 text-sm text-slate-600">Use the UPI ID below to send payment. After completing the payment, click the button to confirm.</p>

              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">UPI ID</p>
                    <p className="text-lg font-medium text-slate-900">{booking.upiId || "-"}</p>
                  </div>
                  <button
                    onClick={handleCopyUpi}
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Copy
                  </button>
                </div>

                <button
                  onClick={handleConfirmPayment}
                  disabled={booking.paymentStatus === "paid" || isConfirming}
                  className="w-full rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {booking.paymentStatus === "paid" ? "Payment confirmed" : isConfirming ? "Confirming..." : "I have paid"}
                </button>

                {booking.paymentStatus !== "paid" && (
                  <p className="text-sm text-slate-500">
                    After confirming payment, you'll be redirected to your bookings.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
