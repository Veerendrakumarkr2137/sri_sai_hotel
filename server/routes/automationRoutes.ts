import express from "express";
import { supabase } from "../lib/supabaseClient"; 

const router = express.Router();

router.get("/today-bookings", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users(name,email,phone),
        rooms(title)
      `)
      .eq("booking_status", "confirmed")
      // Note: If check_in_date includes times, an exact date match might miss some records. 
      // But we are sticking to the tutorial's code here.
      .eq("check_in_date", today);

    if (error) {
      return res.status(500).json(error);
    }

    res.json({
      success: true,
      bookings: data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export default router;
