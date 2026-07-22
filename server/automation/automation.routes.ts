import { Router } from "express";
import { AutomationController } from "./automation.controller";

const router = Router();

// Routes mounted at /api/automation
router.get("/today-bookings", AutomationController.getTodayBookings);
router.post("/start-call", AutomationController.startCall);
router.post("/update-arrival", AutomationController.updateArrival);
router.post("/save-call-log", AutomationController.saveCallLog);
router.get("/dashboard", AutomationController.getDashboard);

export default router;
