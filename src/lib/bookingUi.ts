export function sortBookingsByNewest<T extends { createdAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.createdAt || 0).getTime();
    const rightTime = new Date(right.createdAt || 0).getTime();

    return rightTime - leftTime;
  });
}

export function getPaymentMethodLabel(paymentMethod: string) {
  if (paymentMethod === "manual_upi") {
    return "Direct UPI";
  }

  if (paymentMethod === "pay_at_hotel") {
    return "Pay at Hotel";
  }

  if (paymentMethod === "PhonePe") {
    return "PhonePe UPI";
  }

  return paymentMethod || "Unknown";
}

export function getPaymentStatusClasses(paymentStatus: string) {
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

export function getBookingStatusLabel(status: string) {
  if (status === "pending_payment") {
    return "Pending Payment";
  }

  if (status === "checked_in") {
    return "Checked In";
  }

  if (status === "completed") {
    return "Checked Out";
  }

  return status
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getBookingStatusClasses(status: string) {
  if (status === "confirmed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "checked_in") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "completed") {
    return "bg-slate-100 text-slate-700";
  }

  if (status === "cancelled") {
    return "bg-red-100 text-red-700";
  }

  if (status === "pending_payment") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-amber-100 text-amber-700";
}

export function getBookingStatusSelectClasses(status: string) {
  if (status === "confirmed") {
    return "bg-emerald-50 text-emerald-600";
  }

  if (status === "checked_in") {
    return "bg-blue-50 text-blue-600";
  }

  if (status === "completed") {
    return "bg-slate-100 text-slate-700";
  }

  if (status === "cancelled") {
    return "bg-red-50 text-red-600";
  }

  if (status === "pending_payment") {
    return "bg-orange-50 text-orange-600";
  }

  return "bg-amber-50 text-amber-600";
}
