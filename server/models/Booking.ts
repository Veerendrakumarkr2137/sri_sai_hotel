import mongoose from "mongoose";
import { BOOKING_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES } from "../lib/bookingLifecycle";

const bookingSchema = new mongoose.Schema({
  bookingRef: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  transactionId: { type: String, index: true },
  paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
  bookingStatus: { type: String, enum: BOOKING_STATUSES, default: "pending" },
  paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "card" },
  paymentId: { type: String },
  orderId: { type: String },
  signature: { type: String },
  paymentSubmittedAt: { type: Date, default: null },
  paymentVerifiedAt: { type: Date, default: null },
  bookingConfirmedAt: { type: Date, default: null },
  checkedInAt: { type: Date, default: null },
  checkedOutAt: { type: Date, default: null },
  cancelledAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const Booking = mongoose.model("Booking", bookingSchema);
