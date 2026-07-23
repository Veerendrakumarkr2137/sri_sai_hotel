import express from "express";
import { getBookingDetails } from "../controllers/automationController";

const router = express.Router();

router.get("/booking/:id", getBookingDetails);

export default router;
