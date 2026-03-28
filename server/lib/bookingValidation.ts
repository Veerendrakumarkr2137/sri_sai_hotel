import { Types } from "mongoose";
import { Booking } from "../models/Booking";
import { Room } from "../models/Room";

const ACTIVE_BOOKING_STATUSES = ["pending", "pending_payment", "confirmed"] as const;

type RawBookingData = {
  roomId?: string;
  name?: string;
  email?: string;
  phone?: string;
  checkInDate?: string | Date;
  checkOutDate?: string | Date;
  guests?: number | string;
  totalPrice?: number;
};

export class BookingValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "BookingValidationError";
    this.status = status;
  }
}

function parseDate(value: string | Date | undefined, label: string) {
  if (!value) {
    throw new BookingValidationError(`${label} is required`);
  }

  const parsed = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    throw new BookingValidationError(`${label} is invalid`);
  }

  return parsed;
}

function getStartOfDay(value: Date) {
  const normalized = new Date(value);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function calculateNights(checkInDate: Date, checkOutDate: Date) {
  const diff = checkOutDate.getTime() - checkInDate.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function validateBookingInput(room: InstanceType<typeof Room>, bookingData?: RawBookingData) {
  if (!bookingData) {
    throw new BookingValidationError("Booking details are required");
  }

  const name = bookingData.name?.trim();
  const email = bookingData.email?.trim().toLowerCase();
  const phone = bookingData.phone?.trim();
  const guests = Number(bookingData.guests);

  if (!name || !email || !phone) {
    throw new BookingValidationError("Name, email, and phone are required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BookingValidationError("Please provide a valid email address");
  }

  if (!Number.isInteger(guests) || guests <= 0) {
    throw new BookingValidationError("Guest count must be at least 1");
  }

  if (guests > room.capacity) {
    throw new BookingValidationError(`This room allows up to ${room.capacity} guest(s)`);
  }

  if (room.availableRooms <= 0) {
    throw new BookingValidationError("This room is currently unavailable", 409);
  }

  const checkInDate = getStartOfDay(parseDate(bookingData.checkInDate, "Check-in date"));
  const checkOutDate = getStartOfDay(parseDate(bookingData.checkOutDate, "Check-out date"));
  const today = getStartOfDay(new Date());

  if (checkInDate < today) {
    throw new BookingValidationError("Check-in date cannot be in the past");
  }

  if (checkOutDate <= checkInDate) {
    throw new BookingValidationError("Check-out date must be after check-in date");
  }

  const nights = calculateNights(checkInDate, checkOutDate);

  if (nights <= 0) {
    throw new BookingValidationError("Please select valid booking dates");
  }

  return {
    name,
    email,
    phone,
    guests,
    checkInDate,
    checkOutDate,
    nights,
    totalPrice: nights * room.price,
  };
}

export async function ensureRoomAvailability(
  roomId: string | Types.ObjectId,
  checkInDate: Date,
  checkOutDate: Date,
  availableRooms: number,
  excludeBookingId?: string | Types.ObjectId,
) {
  const overlapQuery: Record<string, unknown> = {
    roomId,
    bookingStatus: { $in: ACTIVE_BOOKING_STATUSES },
    checkInDate: { $lt: checkOutDate },
    checkOutDate: { $gt: checkInDate },
  };

  if (excludeBookingId) {
    overlapQuery._id = { $ne: excludeBookingId };
  }

  const overlappingBookings = await Booking.countDocuments(overlapQuery);

  if (overlappingBookings >= availableRooms) {
    throw new BookingValidationError("Selected dates are no longer available for this room", 409);
  }
}
