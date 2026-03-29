export const PAYMENT_STATUSES = ["pending", "submitted", "paid", "failed"] as const;
export const BOOKING_STATUSES = ["pending", "pending_payment", "confirmed", "checked_in", "cancelled", "completed"] as const;
export const PAYMENT_METHODS = ["card", "upi", "wallet", "manual_upi", "pay_at_hotel", "PhonePe"] as const;
export const ACTIVE_BOOKING_STATUSES = ["pending", "pending_payment", "confirmed", "checked_in"] as const;

export type PaymentStatus = typeof PAYMENT_STATUSES[number];
export type BookingStatus = typeof BOOKING_STATUSES[number];
export type PaymentMethod = typeof PAYMENT_METHODS[number];

export type BookingLifecycleSnapshot = {
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentId?: string | null;
  paymentSubmittedAt?: Date | null;
  paymentVerifiedAt?: Date | null;
  bookingConfirmedAt?: Date | null;
  checkedInAt?: Date | null;
  checkedOutAt?: Date | null;
  cancelledAt?: Date | null;
};

export const BOOKING_STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ["pending_payment", "confirmed", "cancelled"],
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["completed"],
  cancelled: [],
  completed: [],
};

export function isTerminalBookingStatus(status: BookingStatus) {
  return status === "cancelled" || status === "completed";
}

export function buildConfirmedBookingAudit(now = new Date()) {
  return {
    bookingConfirmedAt: now,
  };
}

export function buildPaymentVerifiedAudit(now = new Date()) {
  return {
    paymentVerifiedAt: now,
    bookingConfirmedAt: now,
  };
}

export function buildManualPaymentSubmissionPatch(
  booking: Pick<BookingLifecycleSnapshot, "bookingStatus" | "paymentStatus" | "paymentSubmittedAt">,
  now = new Date(),
) {
  if (booking.paymentStatus === "submitted") {
    return {};
  }

  return {
    paymentStatus: "submitted" as const,
    bookingStatus: "pending_payment" as const,
    paymentSubmittedAt: booking.paymentSubmittedAt || now,
  };
}

export function getBookingStatusTransitionError(
  booking: Pick<BookingLifecycleSnapshot, "bookingStatus" | "paymentStatus" | "paymentMethod">,
  nextStatus: BookingStatus,
) {
  if (booking.bookingStatus === nextStatus) {
    return "";
  }

  const allowedTransitions = BOOKING_STATUS_TRANSITIONS[booking.bookingStatus];

  if (!allowedTransitions.includes(nextStatus)) {
    return "This booking cannot move to that status.";
  }

  if (nextStatus === "confirmed" && booking.paymentStatus !== "paid" && booking.paymentMethod !== "pay_at_hotel") {
    return "This booking cannot be confirmed until the payment is verified.";
  }

  if (nextStatus === "checked_in" && booking.bookingStatus !== "confirmed") {
    return "Only confirmed bookings can be checked in.";
  }

  if (nextStatus === "completed" && booking.bookingStatus !== "checked_in") {
    return "Only checked-in bookings can be checked out.";
  }

  return "";
}

export function buildBookingStatusTransitionPatch(
  booking: BookingLifecycleSnapshot,
  nextStatus: BookingStatus,
  now = new Date(),
) {
  const error = getBookingStatusTransitionError(booking, nextStatus);

  if (error) {
    return { error };
  }

  if (booking.bookingStatus === nextStatus) {
    return { patch: {} };
  }

  const patch: Partial<BookingLifecycleSnapshot> = {
    bookingStatus: nextStatus,
  };

  if (nextStatus === "confirmed") {
    patch.bookingConfirmedAt = booking.bookingConfirmedAt || now;
  }

  if (nextStatus === "checked_in") {
    patch.checkedInAt = booking.checkedInAt || now;

    if (booking.paymentMethod === "pay_at_hotel" && booking.paymentStatus !== "paid") {
      patch.paymentStatus = "paid";
      patch.paymentVerifiedAt = booking.paymentVerifiedAt || now;
      patch.paymentId = booking.paymentId || `hotel-desk-${now.getTime()}`;
    }
  }

  if (nextStatus === "completed") {
    patch.checkedOutAt = booking.checkedOutAt || now;
  }

  if (nextStatus === "cancelled") {
    patch.cancelledAt = booking.cancelledAt || now;
  }

  return { patch };
}
