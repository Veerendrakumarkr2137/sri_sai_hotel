import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPaymentAndBook,
  createManualBooking,
  createPayAtHotelBooking,
  getMyBookings,
  getAllBookings,
  deleteBooking,
  updateBookingStatus
} from "../controllers/bookingController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/create-order", requireAuth("user"), createRazorpayOrder);
router.post("/verify-payment", requireAuth("user"), verifyPaymentAndBook);
router.post("/manual-booking", requireAuth("user"), createManualBooking);
router.post("/pay-at-hotel", requireAuth("user"), createPayAtHotelBooking);
router.get("/my-bookings", requireAuth("user"), getMyBookings);

// Admin routes
router.get("/admin/all", requireAuth("admin"), getAllBookings);
router.delete("/admin/:id", requireAuth("admin"), deleteBooking);
router.put("/admin/:id/status", requireAuth("admin"), updateBookingStatus);

export default router;
