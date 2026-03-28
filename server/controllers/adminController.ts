import { Request, Response } from "express";
import { User } from "../models/User";
import { Booking } from "../models/Booking";
import { Room } from "../models/Room";

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    const [
      totalUsers,
      adminCount,
      totalBookings,
      totalRooms,
      revenueResult,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Booking.countDocuments(),
      Room.countDocuments(),
      Booking.aggregate([
        { $match: { paymentStatus: "paid" } },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalPrice" },
          },
        },
      ]),
      User.find({})
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(3),
    ]);
    const revenue = revenueResult[0]?.revenue || 0;
    const guestCount = Math.max(totalUsers - adminCount, 0);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        adminCount,
        guestCount,
        totalBookings,
        totalRooms,
        revenue,
      },
      recentUsers,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch stats" });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await User.find({})
      .select("name email role createdAt")
      .sort({ createdAt: -1 });
    return res.json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};
