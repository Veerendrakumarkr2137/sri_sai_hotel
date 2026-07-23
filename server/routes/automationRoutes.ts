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

    res.json(data);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

router.get("/booking/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_ref,
        booking_status,
        check_in_date,
        check_out_date,
        total_price,
        users(name,email,phone),
        rooms(title)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return res.status(500).json(error);
    }

    if (!data) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Map response to match exact structure expected by n8n
    const responseData = {
      id: data.id,
      booking_ref: data.booking_ref,
      booking_status: data.booking_status,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      total_price: data.total_price,
      user: data.users,
      room: data.rooms
    };

    res.json(responseData);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

export default router;
