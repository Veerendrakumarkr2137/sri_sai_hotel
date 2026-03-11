import express from "express";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const app = express();
const PORT = 3000;

app.use(cors())
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hotel-sai";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Define Mongoose Schemas
const bookingSchema = new mongoose.Schema({
  bookingRef: { type: String, required: true, unique: true },
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
    enum: ["pending", "confirmed", "cancelled"],
    default: "confirmed"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});
const User = mongoose.model("User", userSchema);
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { 
    type: String,
    required: true,
    unique: true
  },

  password: { 
    type: String,
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Booking = mongoose.model('Booking', bookingSchema);
setInterval(async () => {
  const today = new Date();

  await Booking.updateMany(
    { checkOut: { $lt: today }, status: "confirmed" },
    { status: "completed" }
  );
}, 3600000);

// API Routes
app.post("/api/bookings", async (req, res) => {
  try {

    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);

    const existingBooking = await Booking.findOne({
      roomType: req.body.roomType,
      checkIn: { $lt: checkOut },
      checkOut: { $gt: checkIn }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        error: "⚠ Room already booked for selected dates. Please select another date."
      });
    }

    const bookingRef = "HSI-" + Date.now();

    const booking = new Booking({
      ...req.body,
      checkIn,
      checkOut,
      bookingRef
    });

    await booking.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: req.body.email,
        subject: "Booking Confirmation - Hotel Sai International",
        html: `
<div style="background:#f5f7fb;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);">

    <div style="background:#0B1B3D;padding:25px;text-align:center;">
      <h1 style="color:#D4AF37;margin:0;font-size:26px;">Hotel Sai International</h1>
      <p style="color:#ffffff;margin-top:6px;font-size:14px;">Luxury & Comfort Stay</p>
    </div>

    <div style="padding:30px;">
      <h2 style="color:#0B1B3D;margin-bottom:10px;">Booking Confirmed 🎉</h2>

      <p style="color:#555;font-size:15px;">
        Hello <b>${req.body.name}</b>,<br>
        Your reservation has been successfully confirmed.
      </p>

      <div style="margin-top:25px;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">

          <tr style="background:#fafafa;">
            <td style="padding:12px;border-bottom:1px solid #eee;">Booking ID</td>
            <td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">${bookingRef}</td>
          </tr>

          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">Room Type</td>
            <td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;">${req.body.roomType}</td>
          </tr>

          <tr style="background:#fafafa;">
            <td style="padding:12px;border-bottom:1px solid #eee;">Check-in</td>
            <td style="padding:12px;border-bottom:1px solid #eee;">${req.body.checkIn}</td>
          </tr>

          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">Check-out</td>
            <td style="padding:12px;border-bottom:1px solid #eee;">${req.body.checkOut}</td>
          </tr>

          <tr style="background:#fafafa;">
            <td style="padding:12px;border-bottom:1px solid #eee;">Guests</td>
            <td style="padding:12px;border-bottom:1px solid #eee;">${req.body.guests}</td>
          </tr>

          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee;">Total Price</td>
            <td style="padding:12px;border-bottom:1px solid #eee;font-weight:bold;color:#0B1B3D;">
              ₹${req.body.totalPrice}
            </td>
          </tr>

        </table>
      </div>

      <p style="margin-top:25px;color:#555;font-size:14px;">
        We look forward to welcoming you at <b>Hotel Sai International</b>.
        If you have any questions, please contact our reception.
      </p>

      <div style="text-align:center;margin-top:30px;">
        <a href="#" style="background:#D4AF37;color:#000;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:bold;">
          View Booking
        </a>
      </div>

    </div>

    <div style="background:#f2f2f2;text-align:center;padding:15px;font-size:12px;color:#666;">
      © 2026 Hotel Sai International<br>
      Thank you for choosing us
    </div>

  </div>
</div>
`
      });

    } catch (emailError) {
      console.error("Email failed:", emailError);
    }

    res.status(201).json({
      success: true,
      booking
    });

  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      error: "Failed to create booking"
    });
  }
});

app.get("/api/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
});

app.delete("/api/bookings/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Booking deleted" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete booking" });
  }
});

app.put("/api/bookings/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update booking" });
  }
});

app.post("/api/search-booking", async (req, res) => {

  try {

    const { bookingRef, email } = req.body;

    const booking = await Booking.findOne({
      bookingRef,
      email
    });

    if (!booking) {
      return res.json({
        success: false,
        error: "Booking not found"
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {

    res.status(500).json({
      success: false
    });

  }

});

//registor api
app.post("/api/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.json({
      success: true,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

//login api
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found"
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid password"
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      "SECRETKEY",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false
    });
  }
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USERNAME || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username === adminUser && password === adminPass) {
    res.json({ success: true, token: "fake-jwt-token-for-demo" });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
