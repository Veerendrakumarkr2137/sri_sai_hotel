import express, { type NextFunction, type Request, type Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ENV_JWT_SECRET = process.env.JWT_SECRET?.trim();
const APP_BASE_URL = process.env.APP_BASE_URL?.trim();
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const MIN_PASSWORD_LENGTH = 8;
const LOGIN_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_RATE_LIMIT_MAX_REQUESTS = 5;
const PASSWORD_RESET_REQUEST_WINDOW_MS = 60 * 60 * 1000;
const PASSWORD_RESET_REQUEST_MAX_REQUESTS = 3;
const RESET_PASSWORD_RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
const RESET_PASSWORD_RATE_LIMIT_MAX_REQUESTS = 5;
const ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const ADMIN_LOGIN_RATE_LIMIT_MAX_REQUESTS = 5;

if (IS_PRODUCTION && !ENV_JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production.");
}

const JWT_SECRET = ENV_JWT_SECRET || "hotel-sai-development-secret";

if (!ENV_JWT_SECRET && !IS_PRODUCTION) {
  console.warn("JWT_SECRET is not set. Using a development fallback secret.");
}

const ROOM_CATALOG = {
  "Deluxe Room": { inventory: 5, price: 3500, capacity: 2 },
  "Executive Room": { inventory: 4, price: 5500, capacity: 2 },
  "Family Suite": { inventory: 3, price: 8500, capacity: 4 },
} as const;

const BOOKING_STATUSES = ["pending", "confirmed", "cancelled", "completed"] as const;
const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"] as const;

type BookingStatus = (typeof BOOKING_STATUSES)[number];
type AuthRole = "user" | "admin";
type AuthTokenPayload = {
  role: AuthRole;
  userId?: string;
  email?: string;
  username?: string;
};
type AuthenticatedRequest = Request & {
  auth?: AuthTokenPayload;
};
type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const app = express();

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-sai";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const bookingSchema = new mongoose.Schema({
  bookingRef: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  roomType: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: BOOKING_STATUSES,
    default: "confirmed",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordResetTokenHash: { type: String, default: null },
  passwordResetExpiresAt: { type: Date, default: null },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
const Booking = mongoose.model("Booking", bookingSchema);
const rateLimitStore = new Map<string, RateLimitEntry>();

function sanitizeUser(user: { _id: mongoose.Types.ObjectId; name: string; email: string }) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
  };
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedEmail = value.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  return normalizedEmail;
}

function readString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue;
}

function readPassword(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  if (!value) {
    return null;
  }

  return value;
}

function validatePassword(password: string) {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
  }

  return null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function findUserByEmail(email: string) {
  return User.findOne({
    email: new RegExp(`^${escapeRegExp(email)}$`, "i"),
  });
}

function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getAppBaseUrl(request: Request) {
  if (APP_BASE_URL) {
    return APP_BASE_URL.replace(/\/$/, "");
  }

  const host = request.get("host") || `localhost:${PORT}`;
  return `${request.protocol}://${host}`;
}

function getClientIp(request: Request) {
  const forwardedForHeader = request.headers["x-forwarded-for"];

  if (typeof forwardedForHeader === "string" && forwardedForHeader.trim()) {
    return forwardedForHeader.split(",")[0].trim();
  }

  if (Array.isArray(forwardedForHeader) && forwardedForHeader.length > 0) {
    const forwardedIp = forwardedForHeader[0]?.trim();

    if (forwardedIp) {
      return forwardedIp;
    }
  }

  return request.ip || request.socket.remoteAddress || "unknown";
}

function normalizeRateLimitKeyPart(value: string) {
  return value.trim().toLowerCase();
}

function getRateLimitEntries(keys: string[], windowMs: number) {
  const now = Date.now();

  return keys.map((key) => {
    const existingEntry = rateLimitStore.get(key);

    if (!existingEntry || existingEntry.resetAt <= now) {
      const nextEntry = {
        count: 0,
        resetAt: now + windowMs,
      };

      rateLimitStore.set(key, nextEntry);
      return { key, entry: nextEntry };
    }

    return { key, entry: existingEntry };
  });
}

function createRateLimiter({
  keyPrefix,
  windowMs,
  maxRequests,
  errorMessage,
  getKeys,
}: {
  keyPrefix: string;
  windowMs: number;
  maxRequests: number;
  errorMessage: string;
  getKeys: (request: Request) => string[];
}) {
  return (request: Request, response: Response, next: NextFunction) => {
    const baseKey = `${keyPrefix}:ip:${normalizeRateLimitKeyPart(getClientIp(request))}`;
    const additionalKeys = getKeys(request)
      .map((key) => normalizeRateLimitKeyPart(key))
      .filter((key) => key.length > 0)
      .map((key) => `${keyPrefix}:${key}`);
    const keys = Array.from(new Set([baseKey, ...additionalKeys]));
    const entries = getRateLimitEntries(keys, windowMs);
    const limitedEntry = entries.find(({ entry }) => entry.count >= maxRequests);

    if (limitedEntry) {
      const retryAfterSeconds = Math.max(1, Math.ceil((limitedEntry.entry.resetAt - Date.now()) / 1000));

      response.setHeader("Retry-After", String(retryAfterSeconds));
      return response.status(429).json({
        success: false,
        error: errorMessage,
        retryAfterSeconds,
      });
    }

    for (const { entry } of entries) {
      entry.count += 1;
    }

    return next();
  };
}

const rateLimitCleanupTimer = setInterval(() => {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 15 * 60 * 1000);

rateLimitCleanupTimer.unref?.();

const loginRateLimiter = createRateLimiter({
  keyPrefix: "login",
  windowMs: LOGIN_RATE_LIMIT_WINDOW_MS,
  maxRequests: LOGIN_RATE_LIMIT_MAX_REQUESTS,
  errorMessage: "Too many login attempts. Please wait a few minutes and try again.",
  getKeys: (request) => {
    const email = normalizeEmail(request.body?.email);

    return email ? [`email:${email}`] : [];
  },
});

const forgotPasswordRateLimiter = createRateLimiter({
  keyPrefix: "forgot-password",
  windowMs: PASSWORD_RESET_REQUEST_WINDOW_MS,
  maxRequests: PASSWORD_RESET_REQUEST_MAX_REQUESTS,
  errorMessage: "Too many password reset requests. Please wait before trying again.",
  getKeys: (request) => {
    const email = normalizeEmail(request.body?.email);

    return email ? [`email:${email}`] : [];
  },
});

const resetPasswordRateLimiter = createRateLimiter({
  keyPrefix: "reset-password",
  windowMs: RESET_PASSWORD_RATE_LIMIT_WINDOW_MS,
  maxRequests: RESET_PASSWORD_RATE_LIMIT_MAX_REQUESTS,
  errorMessage: "Too many password reset attempts. Please wait before trying again.",
  getKeys: (request) => {
    const token = readString(request.body?.token);

    return token ? [`token:${hashPasswordResetToken(token)}`] : [];
  },
});

const adminLoginRateLimiter = createRateLimiter({
  keyPrefix: "admin-login",
  windowMs: ADMIN_LOGIN_RATE_LIMIT_WINDOW_MS,
  maxRequests: ADMIN_LOGIN_RATE_LIMIT_MAX_REQUESTS,
  errorMessage: "Too many admin login attempts. Please wait before trying again.",
  getKeys: (request) => {
    const username = readString(request.body?.username);

    return username ? [`username:${username}`] : [];
  },
});

function isMutableBookingStatus(status: BookingStatus) {
  return status === "pending" || status === "confirmed";
}

function isFutureBooking(checkIn: Date) {
  return checkIn.getTime() > Date.now();
}

async function countOverlappingBookings(
  roomType: keyof typeof ROOM_CATALOG,
  checkIn: Date,
  checkOut: Date,
  excludeBookingId?: string,
) {
  const overlapQuery: Record<string, unknown> = {
    roomType,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  if (excludeBookingId) {
    overlapQuery._id = { $ne: excludeBookingId };
  }

  return Booking.countDocuments(overlapQuery);
}

async function sendBookingEmail({
  to,
  subject,
  heading,
  intro,
  bookingRef,
  roomType,
  checkIn,
  checkOut,
  guests,
  totalPrice,
}: {
  to: string;
  subject: string;
  heading: string;
  intro: string;
  bookingRef: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: `
<div style="background:#f5f7fb;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);">
    <div style="background:#0B1B3D;padding:25px;text-align:center;">
      <h1 style="color:#D4AF37;margin:0;font-size:26px;">Hotel Sai International</h1>
      <p style="color:#ffffff;margin-top:6px;font-size:14px;">Luxury and Comfort Stay</p>
    </div>
    <div style="padding:30px;">
      <h2 style="color:#0B1B3D;margin-bottom:10px;">${heading}</h2>
      <p style="color:#555;font-size:15px;">${intro}</p>
      <div style="margin-top:25px;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#fafafa;">
            <td style="padding:12px;border-bottom:1px solid #eee;">Booking ID</td>
            <td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">${bookingRef}</td>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">Room Type</td>
            <td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">${roomType}</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="padding:12px;border-bottom:1px solid #eee;">Check-in</td>
            <td style="padding:12px;border-bottom:1px solid #eee;">${checkIn}</td>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">Check-out</td>
            <td style="padding:12px;border-bottom:1px solid #eee;">${checkOut}</td>
          </tr>
          <tr style="background:#fafafa;">
            <td style="padding:12px;border-bottom:1px solid #eee;">Guests</td>
            <td style="padding:12px;border-bottom:1px solid #eee;">${guests}</td>
          </tr>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">Total Price</td>
            <td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;color:#0B1B3D;">
              Rs. ${totalPrice.toLocaleString("en-IN")}
            </td>
          </tr>
        </table>
      </div>
      <p style="margin-top:25px;color:#555;font-size:14px;">
        If you need anything else, please contact Hotel Sai International reception.
      </p>
    </div>
    <div style="background:#f2f2f2;text-align:center;padding:15px;font-size:12px;color:#666;">
      Copyright 2026 Hotel Sai International<br>
      Thank you for choosing us
    </div>
  </div>
</div>
`,
  });
}

async function getOwnedBooking(request: AuthenticatedRequest, bookingId: string) {
  return Booking.findOne({
    _id: bookingId,
    $or: [
      { userId: request.auth?.userId },
      { email: request.auth?.email },
    ],
  });
}

function getBearerToken(request: Request) {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim();
}

function requireAuth(role: AuthRole) {
  return (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    const token = getBearerToken(request);

    if (!token) {
      return response.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;

      if (payload.role !== role) {
        return response.status(403).json({
          success: false,
          error: "You do not have access to this resource",
        });
      }

      request.auth = payload;
      next();
    } catch (error) {
      return response.status(401).json({
        success: false,
        error: "Your session has expired. Please sign in again.",
      });
    }
  };
}

function isKnownRoomType(roomType: string): roomType is keyof typeof ROOM_CATALOG {
  return roomType in ROOM_CATALOG;
}

function parseDate(value: unknown) {
  if (typeof value !== "string" || !value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate;
}

function getStayLength(checkIn: Date, checkOut: Date) {
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const diff = checkOut.getTime() - checkIn.getTime();

  if (diff <= 0) {
    return 0;
  }

  return Math.ceil(diff / millisecondsPerDay);
}

function issueUserToken(user: { _id: mongoose.Types.ObjectId; email: string }) {
  return jwt.sign(
    {
      role: "user",
      userId: user._id.toString(),
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );
}

function issueAdminToken(username: string) {
  return jwt.sign(
    {
      role: "admin",
      username,
    },
    JWT_SECRET,
    { expiresIn: "12h" },
  );
}

async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Reset Your Password - Hotel Sai International",
    html: `
<div style="background:#f5f7fb;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);">
    <div style="background:#0B1B3D;padding:25px;text-align:center;">
      <h1 style="color:#D4AF37;margin:0;font-size:26px;">Hotel Sai International</h1>
      <p style="color:#ffffff;margin-top:6px;font-size:14px;">Password Reset Request</p>
    </div>
    <div style="padding:30px;">
      <p style="color:#555;font-size:15px;">Hello <b>${name}</b>,</p>
      <p style="color:#555;font-size:15px;">
        We received a request to reset your password. Use the button below to choose a new password.
      </p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#0B1B3D;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:bold;">
          Reset Password
        </a>
      </div>
      <p style="color:#555;font-size:14px;">
        This link expires in 1 hour. If you did not request this reset, you can safely ignore this email.
      </p>
      <p style="color:#555;font-size:14px;word-break:break-all;">
        Reset link: ${resetUrl}
      </p>
    </div>
  </div>
</div>
`,
  });
}

setInterval(async () => {
  try {
    await Booking.updateMany(
      { checkOut: { $lt: new Date() }, status: "confirmed" },
      { status: "completed" },
    );
  } catch (error) {
    console.error("Failed to refresh completed bookings:", error);
  }
}, 60 * 60 * 1000);

app.get("/api/availability/:roomType", async (request, response) => {
  try {
    const roomType = decodeURIComponent(request.params.roomType);

    if (!isKnownRoomType(roomType)) {
      return response.status(404).json({
        success: false,
        error: "Room type not found",
      });
    }

    let bookedRooms = 0;
    const totalRooms = ROOM_CATALOG[roomType].inventory;

    const checkIn = parseDate(request.query.checkIn);
    const checkOut = parseDate(request.query.checkOut);

    if ((request.query.checkIn || request.query.checkOut) && (!checkIn || !checkOut || checkOut <= checkIn)) {
      return response.status(400).json({
        success: false,
        error: "Please provide a valid date range",
      });
    }

    if (checkIn && checkOut) {
      bookedRooms = await Booking.countDocuments({
        roomType,
        status: { $in: ACTIVE_BOOKING_STATUSES },
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn },
      });
    }

    return response.json({
      success: true,
      totalRooms,
      available: Math.max(totalRooms - bookedRooms, 0),
    });
  } catch (error) {
    console.error("Availability lookup failed:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to check room availability",
    });
  }
});

app.post("/api/bookings", requireAuth("user"), async (request: AuthenticatedRequest, response) => {
  try {
    const { roomType, phone, guests, checkIn: rawCheckIn, checkOut: rawCheckOut } = request.body;

    if (typeof roomType !== "string" || !isKnownRoomType(roomType)) {
      return response.status(400).json({
        success: false,
        error: "Invalid room type selected",
      });
    }

    if (typeof phone !== "string" || !phone.trim()) {
      return response.status(400).json({
        success: false,
        error: "Phone number is required",
      });
    }

    if (typeof guests !== "number" || guests < 1 || guests > ROOM_CATALOG[roomType].capacity) {
      return response.status(400).json({
        success: false,
        error: "Guest count exceeds room capacity",
      });
    }

    const checkIn = parseDate(rawCheckIn);
    const checkOut = parseDate(rawCheckOut);

    if (!checkIn || !checkOut) {
      return response.status(400).json({
        success: false,
        error: "Check-in and check-out dates are required",
      });
    }

    const nights = getStayLength(checkIn, checkOut);

    if (nights < 1) {
      return response.status(400).json({
        success: false,
        error: "Check-out must be after check-in",
      });
    }

    const user = await User.findById(request.auth?.userId);

    if (!user) {
      return response.status(401).json({
        success: false,
        error: "User session is no longer valid",
      });
    }

    const overlappingBookings = await countOverlappingBookings(roomType, checkIn, checkOut);

    if (overlappingBookings >= ROOM_CATALOG[roomType].inventory) {
      return response.status(400).json({
        success: false,
        error: "No rooms are available for the selected dates",
      });
    }

    const bookingRef = `HSI-${Date.now()}`;
    const totalPrice = nights * ROOM_CATALOG[roomType].price;

    const booking = await Booking.create({
      bookingRef,
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: phone.trim(),
      roomType,
      checkIn,
      checkOut,
      guests,
      totalPrice,
      status: "confirmed",
    });

    try {
      await sendBookingEmail({
        to: user.email,
        subject: "Booking Confirmation - Hotel Sai International",
        heading: "Booking Confirmed",
        intro: `Hello ${user.name}, your reservation has been successfully confirmed.`,
        bookingRef,
        roomType,
        checkIn: rawCheckIn,
        checkOut: rawCheckOut,
        guests,
        totalPrice,
      });
    } catch (error) {
      console.error("Email failed:", error);
    }

    return response.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return response.status(400).json({
      success: false,
      error: "Failed to create booking",
    });
  }
});

app.get("/api/bookings", requireAuth("admin"), async (_request, response) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    return response.json({ success: true, bookings });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: "Failed to fetch bookings",
    });
  }
});

app.delete("/api/bookings/:id", requireAuth("admin"), async (request, response) => {
  try {
    await Booking.findByIdAndDelete(request.params.id);
    return response.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: "Failed to delete booking",
    });
  }
});

app.put("/api/bookings/:id/status", requireAuth("admin"), async (request, response) => {
  try {
    const { status } = request.body;

    if (!BOOKING_STATUSES.includes(status)) {
      return response.status(400).json({
        success: false,
        error: "Invalid booking status",
      });
    }

    const booking = await Booking.findByIdAndUpdate(request.params.id, { status }, { new: true });

    return response.json({ success: true, booking });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: "Failed to update booking",
    });
  }
});

app.get("/api/my-bookings", requireAuth("user"), async (request: AuthenticatedRequest, response) => {
  try {
    const bookings = await Booking.find({
      $or: [
        { userId: request.auth?.userId },
        { email: request.auth?.email },
      ],
    }).sort({ createdAt: -1 });

    return response.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Failed to fetch user bookings:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to fetch your bookings",
    });
  }
});

app.patch("/api/my-bookings/:id/cancel", requireAuth("user"), async (request: AuthenticatedRequest, response) => {
  try {
    const booking = await getOwnedBooking(request, request.params.id);

    if (!booking) {
      return response.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    if (!isMutableBookingStatus(booking.status as BookingStatus)) {
      return response.status(400).json({
        success: false,
        error: "This booking can no longer be cancelled",
      });
    }

    if (!isFutureBooking(booking.checkIn)) {
      return response.status(400).json({
        success: false,
        error: "Bookings can only be cancelled before check-in",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    try {
      await sendBookingEmail({
        to: booking.email,
        subject: "Booking Cancelled - Hotel Sai International",
        heading: "Booking Cancelled",
        intro: `Hello ${booking.name}, your booking has been cancelled successfully.`,
        bookingRef: booking.bookingRef,
        roomType: booking.roomType,
        checkIn: booking.checkIn.toISOString().split("T")[0],
        checkOut: booking.checkOut.toISOString().split("T")[0],
        guests: booking.guests,
        totalPrice: booking.totalPrice,
      });
    } catch (error) {
      console.error("Cancellation email failed:", error);
    }

    return response.json({
      success: true,
      booking,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Failed to cancel booking:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to cancel booking",
    });
  }
});

app.patch("/api/my-bookings/:id/reschedule", requireAuth("user"), async (request: AuthenticatedRequest, response) => {
  try {
    const booking = await getOwnedBooking(request, request.params.id);

    if (!booking) {
      return response.status(404).json({
        success: false,
        error: "Booking not found",
      });
    }

    if (!isMutableBookingStatus(booking.status as BookingStatus)) {
      return response.status(400).json({
        success: false,
        error: "This booking can no longer be rescheduled",
      });
    }

    if (!isFutureBooking(booking.checkIn)) {
      return response.status(400).json({
        success: false,
        error: "Bookings can only be rescheduled before check-in",
      });
    }

    const { checkIn: rawCheckIn, checkOut: rawCheckOut, guests } = request.body;
    const roomType = booking.roomType;

    if (!isKnownRoomType(roomType)) {
      return response.status(400).json({
        success: false,
        error: "Invalid room type selected",
      });
    }

    if (typeof guests !== "number" || guests < 1 || guests > ROOM_CATALOG[roomType].capacity) {
      return response.status(400).json({
        success: false,
        error: "Guest count exceeds room capacity",
      });
    }

    const checkIn = parseDate(rawCheckIn);
    const checkOut = parseDate(rawCheckOut);

    if (!checkIn || !checkOut) {
      return response.status(400).json({
        success: false,
        error: "Check-in and check-out dates are required",
      });
    }

    const nights = getStayLength(checkIn, checkOut);

    if (nights < 1) {
      return response.status(400).json({
        success: false,
        error: "Check-out must be after check-in",
      });
    }

    if (!isFutureBooking(checkIn)) {
      return response.status(400).json({
        success: false,
        error: "New check-in date must be in the future",
      });
    }

    const overlappingBookings = await countOverlappingBookings(roomType, checkIn, checkOut, booking.id);

    if (overlappingBookings >= ROOM_CATALOG[roomType].inventory) {
      return response.status(400).json({
        success: false,
        error: "No rooms are available for the selected dates",
      });
    }

    booking.checkIn = checkIn;
    booking.checkOut = checkOut;
    booking.guests = guests;
    booking.totalPrice = nights * ROOM_CATALOG[roomType].price;
    await booking.save();

    try {
      await sendBookingEmail({
        to: booking.email,
        subject: "Booking Rescheduled - Hotel Sai International",
        heading: "Booking Rescheduled",
        intro: `Hello ${booking.name}, your booking dates have been updated successfully.`,
        bookingRef: booking.bookingRef,
        roomType: booking.roomType,
        checkIn: rawCheckIn,
        checkOut: rawCheckOut,
        guests: booking.guests,
        totalPrice: booking.totalPrice,
      });
    } catch (error) {
      console.error("Reschedule email failed:", error);
    }

    return response.json({
      success: true,
      booking,
      message: "Booking rescheduled successfully",
    });
  } catch (error) {
    console.error("Failed to reschedule booking:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to reschedule booking",
    });
  }
});

app.get("/api/me", requireAuth("user"), async (request: AuthenticatedRequest, response) => {
  try {
    const user = await User.findById(request.auth?.userId);

    if (!user) {
      return response.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return response.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
});

app.post("/api/search-booking", async (request, response) => {
  try {
    const { bookingRef, email } = request.body;

    const booking = await Booking.findOne({
      bookingRef,
      email,
    });

    if (!booking) {
      return response.json({
        success: false,
        error: "Booking not found",
      });
    }

    return response.json({
      success: true,
      booking,
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      error: "Failed to search booking",
    });
  }
});

app.post("/api/register", async (request, response) => {
  try {
    const { name, email, password } = request.body;
    const normalizedEmail = normalizeEmail(email);
    const trimmedName = typeof name === "string" ? name.trim() : "";
    const normalizedPassword = readPassword(password);

    if (!trimmedName || !normalizedEmail || !normalizedPassword) {
      return response.status(400).json({
        success: false,
        error: "Name, email, and password are required",
      });
    }

    const passwordError = validatePassword(normalizedPassword);

    if (passwordError) {
      return response.status(400).json({
        success: false,
        error: passwordError,
      });
    }

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return response.status(400).json({
        success: false,
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return response.json({
      success: true,
      message: "User registered successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to register user",
    });
  }
});

app.post("/api/login", loginRateLimiter, async (request, response) => {
  try {
    const { email, password } = request.body;
    const normalizedEmail = normalizeEmail(email);
    const normalizedPassword = readPassword(password);

    if (!normalizedEmail || !normalizedPassword) {
      return response.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return response.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);

    if (!isMatch) {
      return response.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    return response.json({
      success: true,
      token: issueUserToken(user),
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to sign in",
    });
  }
});

app.post("/api/forgot-password", forgotPasswordRateLimiter, async (request, response) => {
  try {
    const normalizedEmail = normalizeEmail(request.body.email);
    const genericMessage = "If an account exists for that email, a reset link has been sent.";

    if (!normalizedEmail) {
      return response.json({
        success: true,
        message: genericMessage,
      });
    }

    const user = await findUserByEmail(normalizedEmail);

    if (!user) {
      return response.json({
        success: true,
        message: genericMessage,
      });
    }

    const resetToken = randomBytes(32).toString("hex");
    const resetTokenHash = hashPasswordResetToken(resetToken);
    const resetUrl = `${getAppBaseUrl(request)}/reset-password?token=${resetToken}`;

    user.passwordResetTokenHash = resetTokenHash;
    user.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);
    await user.save();

    try {
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    } catch (error) {
      console.error("Password reset email failed:", error);
    }

    return response.json({
      success: true,
      message: genericMessage,
      ...(!IS_PRODUCTION ? { resetUrl } : {}),
    });
  } catch (error) {
    console.error("Forgot password failed:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to process password reset request",
    });
  }
});

app.post("/api/reset-password", resetPasswordRateLimiter, async (request, response) => {
  try {
    const token = typeof request.body.token === "string" ? request.body.token.trim() : "";
    const normalizedPassword = readPassword(request.body.password);

    if (!token || !normalizedPassword) {
      return response.status(400).json({
        success: false,
        error: "Reset token and new password are required",
      });
    }

    const passwordError = validatePassword(normalizedPassword);

    if (passwordError) {
      return response.status(400).json({
        success: false,
        error: passwordError,
      });
    }

    const user = await User.findOne({
      passwordResetTokenHash: hashPasswordResetToken(token),
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return response.status(400).json({
        success: false,
        error: "This password reset link is invalid or has expired",
      });
    }

    user.password = await bcrypt.hash(normalizedPassword, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return response.json({
      success: true,
      message: "Password reset successful. You can now sign in.",
    });
  } catch (error) {
    console.error("Reset password failed:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to reset password",
    });
  }
});

app.post("/api/change-password", requireAuth("user"), async (request: AuthenticatedRequest, response) => {
  try {
    const currentPassword = readPassword(request.body.currentPassword);
    const newPassword = readPassword(request.body.newPassword);

    if (!currentPassword || !newPassword) {
      return response.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
    }

    const passwordError = validatePassword(newPassword);

    if (passwordError) {
      return response.status(400).json({
        success: false,
        error: passwordError,
      });
    }

    const user = await User.findById(request.auth?.userId);

    if (!user) {
      return response.status(401).json({
        success: false,
        error: "User session is no longer valid",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return response.status(400).json({
        success: false,
        error: "Your current password is incorrect",
      });
    }

    if (currentPassword === newPassword) {
      return response.status(400).json({
        success: false,
        error: "Choose a new password that is different from your current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return response.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password failed:", error);
    return response.status(500).json({
      success: false,
      error: "Failed to update password",
    });
  }
});

app.post("/api/admin/login", adminLoginRateLimiter, (request, response) => {
  const { username, password } = request.body;
  const configuredAdminUsername = process.env.ADMIN_USERNAME;
  const configuredAdminPassword = process.env.ADMIN_PASSWORD;

  const adminUsername =
    configuredAdminUsername || (!IS_PRODUCTION ? "admin" : "");
  const adminPassword =
    configuredAdminPassword || (!IS_PRODUCTION ? "admin123" : "");

  if (!adminUsername || !adminPassword) {
    return response.status(500).json({
      success: false,
      error: "Admin credentials are not configured on the server",
    });
  }

  if (username === adminUsername && password === adminPassword) {
    return response.json({
      success: true,
      token: issueAdminToken(adminUsername),
    });
  }

  return response.status(401).json({
    success: false,
    error: "Invalid credentials",
  });
});

async function startServer() {
  if (!IS_PRODUCTION) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));

    app.get(/^(?!\/api).*/, (_request, response) => {
      response.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
