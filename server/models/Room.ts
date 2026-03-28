import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  roomType: { type: String, required: true },
  capacity: { type: Number, required: true },
  amenities: [{ type: String }],
  availableRooms: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Room = mongoose.model("Room", roomSchema);
