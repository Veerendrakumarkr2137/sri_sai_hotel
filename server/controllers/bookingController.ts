import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Room } from "../models/Room";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

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

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

console.log("Email config:", {
  user: process.env.EMAIL_USER,
  passSet: !!process.env.EMAIL_PASS,
  frontendUrl: FRONTEND_URL,
});

// Verify transporter once at startup so any auth issues show immediately
transporter.verify((error) => {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function buildBookingEmailHTML({
  name,
  bookingRef,
  roomTitle,
  checkInDate,
  checkOutDate,
  guests,
  totalPrice,
  headline,
  message,
  actionLabel,
  actionUrl,
  extraInfo,
}: {
  name: string;
  bookingRef: string;
  roomTitle: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  totalPrice: number;
  headline: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  extraInfo?: string;
}) {
  const checkIn = formatDate(checkInDate);
  const checkOut = formatDate(checkOutDate);
  const amount = `₹${totalPrice.toFixed(2)}`;

  return `
    <html>
      <body style="margin:0;padding:0;font-family:system-ui, -apple-system, 'Segoe UI', sans-serif; background:#f4f6f9;">
        <center style="width:100%;background:#f4f6f9;padding:40px 0;">
          <table width="600" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(0,0,0,0.08);">
            <tr>
              <td style="background:#0b1b3d;padding:24px 32px;color:#ffffff;text-align:center;">
                <h1 style="margin:0;font-size:24px;letter-spacing:0.5px;">Hotel Sai International</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Booking Confirmation</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 32px 24px;">
                <h2 style="margin:0 0 12px;font-size:20px;color:#0b1b3d;">${headline}</h2>
                <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#334155;">Hi ${name},</p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#334155;">${message}</p>

                <table width="100%" style="border-collapse:collapse;margin-bottom:24px;">
                  <tr>
                    <td style="padding:12px 14px;background:#f1f5f9;border-radius:12px;">
                      <strong style="font-size:13px;color:#0b1b3d;">Booking ref</strong><br />
                      <span style="font-size:15px;color:#0b1b3d;">${bookingRef}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;background:#f1f5f9;border-radius:12px;margin-top:8px;">
                      <strong style="font-size:13px;color:#0b1b3d;">Room</strong><br />
                      <span style="font-size:15px;color:#0b1b3d;">${roomTitle}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;background:#f1f5f9;border-radius:12px;margin-top:8px;">
                      <strong style="font-size:13px;color:#0b1b3d;">Dates</strong><br />
                      <span style="font-size:15px;color:#0b1b3d;">${checkIn} → ${checkOut}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;background:#f1f5f9;border-radius:12px;margin-top:8px;">
                      <strong style="font-size:13px;color:#0b1b3d;">Guests</strong><br />
                      <span style="font-size:15px;color:#0b1b3d;">${guests}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 14px;background:#f1f5f9;border-radius:12px;margin-top:8px;">
                      <strong style="font-size:13px;color:#0b1b3d;">Amount</strong><br />
                      <span style="font-size:15px;color:#0b1b3d;">${amount}</span>
                    </td>
                  </tr>
                </table>

                ${actionUrl ? `
                  <div style="text-align:center;margin-bottom:24px;">
                    <a href="${actionUrl}" style="display:inline-block;padding:12px 24px;background:#0b1b3d;color:#ffffff;border-radius:999px;text-decoration:none;font-weight:600;">${actionLabel || "View details"}</a>
                  </div>
                ` : ""}

                ${extraInfo ? `<div style="font-size:13px;line-height:1.6;color:#475569;padding:14px 16px;background:#f8fafc;border-radius:12px;">${extraInfo}</div>` : ""}

                <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#94a3b8;">If you have any questions, reply to this email and we'll help you right away.</p>
              </td>
            </tr>
            <tr>
              <td style="background:#0b1b3d;padding:18px 32px;text-align:center;color:#cbd5e1;font-size:12px;">
                © ${new Date().getFullYear()} Hotel Sai International. All rights reserved.
              </td>
            </tr>
          </table>
        </center>
      </body>
    </html>
  `;
}

function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string; }) {
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  }, (err, info) => {
    if (err) {
      console.error("Email error:", err);
    } else {
      console.log("Email sent:", info?.response);
    }
  });
}

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
    const bookingUrl = `${FRONTEND_URL}/my-bookings`;
    const html = buildBookingEmailHTML({
      name,
      bookingRef,
      roomTitle: room.title,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      headline: "Your booking is confirmed!",
      message: "Thanks for booking with Hotel Sai International. Your reservation is confirmed and you can pay at the hotel upon arrival.",
      actionLabel: "View my bookings",
      actionUrl: bookingUrl,
      extraInfo: "If you have any questions or need to modify your reservation, please reply to this email.",
    });

    sendEmail({
      to: email,
      subject: "Booking Confirmed - Hotel Sai International",
      html,
      text: `Hello ${name}, your booking for room ${room.title} is confirmed. Booking Ref: ${bookingRef}. Total Amount: Rs. ${totalPrice}. Please pay at the hotel upon arrival.`,
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
      bookingStatus: "pending_payment",
      paymentMethod: "manual_upi",
      paymentId: null,
      orderId: null,
      signature: null,
    });

    // Send email asynchronously without blocking the response
    const paymentUrl = `${FRONTEND_URL}/payment/${booking._id}`;
    const html = buildBookingEmailHTML({
      name,
      bookingRef,
      roomTitle: room.title,
      checkInDate,
      checkOutDate,
      guests,
      totalPrice,
      headline: "Your booking is almost complete",
      message: `Please complete payment via UPI to confirm your reservation. Your UPI ID is <strong>${process.env.UPI_ID || "your-upi-id@phonepe"}</strong>. Once you have made the payment, click the button below to confirm your booking.`,
      actionLabel: "Confirm payment",
      actionUrl: paymentUrl,
      extraInfo: `If you need help, reply to this email and we'll assist you.`,
    });

    sendEmail({
      to: email,
      subject: "Complete your payment - Hotel Sai International",
      html,
      text: `Hello ${name}, please complete payment of Rs. ${totalPrice} to UPI ID ${process.env.UPI_ID || "your-upi-id@phonepe"}. Booking Ref: ${bookingRef}.`,
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Booking creation failed" });
  }
};

export const getBooking = async (req: any, res: Response): Promise<any> => {
  try {
    const booking = await Booking.findById(req.params.id).populate("roomId");
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.userId.toString() !== req.auth?.userId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    return res.json({
      success: true,
      booking: {
        ...booking.toObject(),
        upiId: process.env.UPI_ID || "",
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to load booking" });
  }
};

export const confirmPayment = async (req: any, res: Response): Promise<any> => {
  try {
    const booking = await Booking.findById(req.params.id).populate("roomId");
    if (!booking) {
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    if (booking.userId.toString() !== req.auth?.userId) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    if (booking.paymentStatus === "paid") {
      return res.json({ success: true, booking });
    }

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    await booking.save();

    const bookingUrl = `${FRONTEND_URL}/my-bookings`;
    const html = buildBookingEmailHTML({
      name: booking.name,
      bookingRef: booking.bookingRef,
      roomTitle: (booking.roomId as any)?.title || "Room",
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      headline: "Payment received!",
      message: "Thank you for completing your payment. Your booking is now confirmed.",
      actionLabel: "View my bookings",
      actionUrl: bookingUrl,
      extraInfo: "We look forward to hosting you at Hotel Sai International.",
    });

    sendEmail({
      to: booking.email,
      subject: "Payment Confirmed - Hotel Sai International",
      html,
      text: `Hello ${booking.name}, your payment has been received and your booking is confirmed. Booking Ref: ${booking.bookingRef}.`,
    });

    return res.json({ success: true, booking });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to confirm payment" });
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
    }, (err, info) => {
      if (err) {
        console.error("Email error:", err);
      } else {
        console.log("Email sent:", info?.response);
      }
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
