function formatDate(value?: string | Date) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getRoomTitle(booking: any) {
  if (booking?.roomId && typeof booking.roomId === "object" && booking.roomId.title) {
    return booking.roomId.title;
  }

  return booking?.roomTitle || "Room";
}

function getAmountLabel(amount: unknown) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "Rs. -";
  }

  return `Rs. ${numericAmount.toLocaleString("en-IN")}`;
}

export function buildManualUpiConfirmationMessage(booking: any) {
  return [
    "Hello Hotel Sai International,",
    "",
    "I have completed my UPI payment for this booking.",
    "",
    `Booking Ref: ${booking?.bookingRef || "-"}`,
    `Guest Name: ${booking?.name || "-"}`,
    `Room: ${getRoomTitle(booking)}`,
    `Check-in: ${formatDate(booking?.checkInDate)}`,
    `Check-out: ${formatDate(booking?.checkOutDate)}`,
    `Amount: ${getAmountLabel(booking?.totalPrice)}`,
    "",
    "Please verify my payment and confirm the booking. I will share the payment screenshot or UTR for verification.",
  ].join("\n");
}

export function buildWhatsAppLink(whatsAppNumber: string | undefined, booking: any) {
  const normalizedNumber = (whatsAppNumber || "").replace(/\D/g, "");

  if (!normalizedNumber) {
    return "";
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(buildManualUpiConfirmationMessage(booking))}`;
}

export function buildPaymentConfirmationEmailLink(email: string | undefined, booking: any) {
  if (!email) {
    return "";
  }

  const subject = `UPI Payment Confirmation - ${booking?.bookingRef || "Booking"}`;
  const body = buildManualUpiConfirmationMessage(booking);

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
