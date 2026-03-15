import { Request, Response } from "express";
import { User } from "../models/User";
import { Booking } from "../models/Booking";
import { Room } from "../models/Room";

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRooms = await Room.countDocuments();
    
    // Revenue from paid bookings
    const bookings = await Booking.find({ paymentStatus: "paid" });
    const revenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalBookings,
        totalRooms,
        revenue,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await User.find({}).select("-password");
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};
