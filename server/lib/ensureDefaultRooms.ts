import { Room } from "../models/Room";
import { defaultRooms } from "../data/defaultRooms";

export async function syncRoomIndexes() {
  await Room.syncIndexes();
}

export async function ensureDefaultRooms() {
  const roomCount = await Room.countDocuments();

  if (roomCount > 0) {
    return false;
  }

  await Room.insertMany(defaultRooms);
  return true;
}
