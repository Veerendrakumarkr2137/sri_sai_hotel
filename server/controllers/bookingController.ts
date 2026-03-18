import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Room } from "../models/Room";
import Razorpay from "razorpay";
import crypto from "crypto";
import nodemailer from "nodemailer";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test_key",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test_secret",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const createRazorpayOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { amount } = req.body;
    const options = {
      amount: amount * 100, // Razorpay works in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to create order" });
  }
};

export const createPayAtHotelBooking = async (req: any, res: Response): Promise<any> => {
  try {
    const { bookingData } = req.body;
    const { roomId, name, email, phone, checkInDate, checkOutDate, guests, totalPrice } = bookingData;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    const bookingRef = `HSI-${Date.now()}`;
    const booking = await Booking.create({
      bookingRef,
      userId: req.auth?.userId,
      roomId,
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      paymentStatus: "pending",
      bookingStatus: "confirmed",
      paymentMethod: "pay_at_hotel",
      paymentId: null,
      orderId: null,
      signature: null,
    });

    // Send email asynchronously without blocking the response
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmed - Hotel Sai International",
      text: `Hello ${name}, your booking for room ${room.title} is confirmed. Booking Ref: ${bookingRef}. Total Amount: Rs. ${totalPrice}. Please pay at the hotel upon arrival. Check-in: ${new Date(checkInDate).toLocaleDateString()}, Check-out: ${new Date(checkOutDate).toLocaleDateString()}.`,
    }, (err) => {
      if (err) console.error("Email error:", err);
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Booking creation failed" });
  }
};

export const createManualBooking = async (req: any, res: Response): Promise<any> => {
  try {
    const { bookingData } = req.body;
    const { roomId, name, email, phone, checkInDate, checkOutDate, guests, totalPrice } = bookingData;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    const bookingRef = `HSI-${Date.now()}`;
    const booking = await Booking.create({
      bookingRef,
      userId: req.auth?.userId,
      roomId,
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      paymentStatus: "pending",
      bookingStatus: "confirmed",
      paymentMethod: "manual_upi",
      paymentId: null,
      orderId: null,
      signature: null,
    });

    // Send email asynchronously without blocking the response
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmed - Hotel Sai International",
      text: `Hello ${name}, your booking for room ${room.title} is confirmed. Booking Ref: ${bookingRef}. Total Amount: Rs. ${totalPrice}. Please complete payment by transferring to UPI ID: ${process.env.UPI_ID || "your-upi-id@phonepe"}. Check-in: ${new Date(checkInDate).toLocaleDateString()}, Check-out: ${new Date(checkOutDate).toLocaleDateString()}.`,
    }, (err) => {
      if (err) console.error("Email error:", err);
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Booking creation failed" });
  }
};

export const verifyPaymentAndBook = async (req: any, res: Response): Promise<any> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentMethod = "card",
      bookingData
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "test_secret")
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ success: false, error: "Invalid API signature" });
    }

    const { roomId, name, email, phone, checkInDate, checkOutDate, guests, totalPrice } = bookingData;
    
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: "Room not found" });
    }

    const bookingRef = `HSI-${Date.now()}`;
    const booking = await Booking.create({
      bookingRef,
      userId: req.auth?.userId,
      roomId,
      name,
      email,
      phone,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      paymentMethod: paymentMethod || "card",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
    });

    // Send email asynchronously without blocking the response
    transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmation - Hotel Sai International",
      text: `Hello ${name}, your booking for room ${room.title} is confirmed. Booking Ref: ${bookingRef}. Total Paid: Rs. ${totalPrice}.`,
    }, (err) => {
      if (err) console.error("Email error:", err);
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Payment verification failed" });
  }
};

export const getMyBookings = async (req: any, res: Response): Promise<any> => {
  try {
    const bookings = await Booking.find({ userId: req.auth?.userId }).populate("roomId");
    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
};

export const getAllBookings = async (req: Request, res: Response): Promise<any> => {
  try {
    const bookings = await Booking.find({}).populate("roomId").populate("userId");
    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch bookings" });
  }
};

export const deleteBooking = async (req: Request, res: Response): Promise<any> => {
   try {
     const booking = await Booking.findByIdAndDelete(req.params.id);
     if (!booking) return res.status(404).json({ success: false, error: "Not found" });
     return res.json({ success: true, message: "Deleted" });
   } catch(e) {
     return res.status(500).json({ success: false, error: "Failed to delete" });
   }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<any> => {
   try {
      const { status } = req.body;
      const booking = await Booking.findByIdAndUpdate(req.params.id, { bookingStatus: status }, { new: true });
      if(!booking) return res.status(404).json({ success: false, error: "Not found" });
      return res.json({ success: true, booking });
   } catch (e) {
     return res.status(500).json({ success: false, error: "Failed to update" });
   }
};
