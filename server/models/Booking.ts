import mongoose from "mongoose";

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
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  bookingStatus: { type: String, enum: ["pending", "pending_payment", "confirmed", "cancelled", "completed"], default: "pending" },
  paymentMethod: { type: String, enum: ["card", "upi", "wallet", "manual_upi"], default: "card" },
  paymentId: { type: String },
  orderId: { type: String },
  signature: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const Booking = mongoose.model("Booking", bookingSchema);
