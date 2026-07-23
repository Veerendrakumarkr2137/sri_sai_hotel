import { Request, Response } from "express";
import { supabase } from "../lib/supabaseClient"; 

export const getBookingDetails = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        users(*),
        rooms(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.json(data);
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
