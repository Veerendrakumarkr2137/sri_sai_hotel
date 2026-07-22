import { Router } from "express";
import {
  getTodayBookings,
  startCall,
  getCallResult,
  updateArrival,
  saveCallLog
} from "../controllers/automationController";

const router = Router();

// Routes are mounted at /api/automation
router.get("/today-bookings", getTodayBookings);
router.post("/start-call", startCall);
router.get("/call-result/:booking_ref", getCallResult);
router.post("/update-arrival", updateArrival);
router.post("/save-call-log", saveCallLog);

export default router;
