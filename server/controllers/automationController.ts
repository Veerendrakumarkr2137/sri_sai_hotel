import { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient";

// GET /api/automation/today-bookings
export const getTodayBookings = async (_req: Request, res: Response): Promise<any> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(`
        *,
        rooms:room_id (title, room_type),
        users:user_id (name, email)
      `)
      .gte("check_in_date", today.toISOString())
      .lt("check_in_date", tomorrow.toISOString())
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase today bookings fetch error:", error);
      return res.status(500).json({ success: false, error: "Failed to load today's bookings" });
    }

    return res.json({ success: true, bookings });
  } catch (error) {
    console.error("getTodayBookings error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// POST /api/automation/start-call
export const startCall = async (req: Request, res: Response): Promise<any> => {
  try {
    const { booking_ref } = req.body;
    
    if (!booking_ref) {
      return res.status(400).json({ success: false, error: "booking_ref is required" });
    }

    // Here you would integrate with an AI calling service (Twilio, Retell, Vapi, etc.)
    // For now, we update the status to "In Progress" as a placeholder
    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ call_status: 'In Progress' })
      .eq("booking_ref", booking_ref)
      .select()
      .single();

    if (error) {
      console.error("Supabase start call error:", error);
      return res.status(500).json({ success: false, error: "Failed to update call status" });
    }

    return res.json({ success: true, message: "Call initiated successfully", booking });
  } catch (error) {
    console.error("startCall error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// GET /api/automation/call-result/:booking_ref
export const getCallResult = async (req: Request, res: Response): Promise<any> => {
  try {
    const { booking_ref } = req.params;

    if (!booking_ref) {
      return res.status(400).json({ success: false, error: "booking_ref is required" });
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("call_status, ai_summary, arrival_time")
      .eq("booking_ref", booking_ref)
      .single();

    if (error) {
      console.error("Supabase get call result error:", error);
      return res.status(404).json({ success: false, error: "Booking not found" });
    }

    return res.json({ success: true, call_status: booking.call_status, ai_summary: booking.ai_summary, arrival_time: booking.arrival_time });
  } catch (error) {
    console.error("getCallResult error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// POST /api/automation/update-arrival
export const updateArrival = async (req: Request, res: Response): Promise<any> => {
  try {
    const { booking_ref, arrival_time } = req.body;

    if (!booking_ref || !arrival_time) {
      return res.status(400).json({ success: false, error: "booking_ref and arrival_time are required" });
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ arrival_time })
      .eq("booking_ref", booking_ref)
      .select()
      .single();

    if (error) {
      console.error("Supabase update arrival error:", error);
      return res.status(500).json({ success: false, error: "Failed to update arrival time" });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    console.error("updateArrival error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

// POST /api/automation/save-call-log
export const saveCallLog = async (req: Request, res: Response): Promise<any> => {
  try {
    const { booking_ref, call_status, ai_summary } = req.body;

    if (!booking_ref) {
      return res.status(400).json({ success: false, error: "booking_ref is required" });
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .update({ call_status, ai_summary })
      .eq("booking_ref", booking_ref)
      .select()
      .single();

    if (error) {
      console.error("Supabase save call log error:", error);
      return res.status(500).json({ success: false, error: "Failed to save call log" });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    console.error("saveCallLog error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
