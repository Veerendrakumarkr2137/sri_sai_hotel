import mongoose from "mongoose";
import dotenv from "dotenv";
import { Room } from "./server/models/Room";
import { defaultRooms } from "./server/data/defaultRooms";
import { syncRoomIndexes } from "./server/lib/ensureDefaultRooms";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-sai";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully.");
    await syncRoomIndexes();

    console.log("Clearing existing rooms...");
    await Room.deleteMany({});
    
    console.log("Inserting sample rooms...");
    await Room.insertMany(defaultRooms);
    
    console.log("Sample rooms seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
