import { Request, Response } from "express";
import { Booking } from "../models/Booking";
import { Room } from "../models/Room";
import { User } from "../models/User";
import { buildDashboardStats, getDayRange } from "../lib/dashboardAnalytics";

async function getRevenueTotal() {
  const [result] = await Booking.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  return Number(result?.total || 0);
}

async function getTotalInventory() {
  const [result] = await Room.aggregate([
    { $group: { _id: null, totalInventory: { $sum: "$availableRooms" } } },
  ]);

  return Number(result?.totalInventory || 0);
}

export const getDashboardStats = async (_request: Request, response: Response): Promise<any> => {
  try {
    const { start, end } = getDayRange();

    const [
      totalUsers,
      adminCount,
      totalBookings,
      totalRooms,
      totalInventory,
      revenue,
      pendingPayments,
      manualReviewBookings,
      todayArrivals,
      todayDepartures,
      overdueArrivals,
      inHouseGuests,
      completedStays,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "admin" }),
      Booking.countDocuments({}),
      Room.countDocuments({}),
      getTotalInventory(),
      getRevenueTotal(),
      Booking.countDocuments({
        paymentStatus: { $in: ["pending", "submitted"] },
        bookingStatus: { $nin: ["cancelled", "completed"] },
      }),
      Booking.countDocuments({
        paymentMethod: "manual_upi",
        paymentStatus: "submitted",
        bookingStatus: { $nin: ["cancelled", "completed"] },
      }),
      Booking.countDocuments({
        bookingStatus: "confirmed",
        checkInDate: { $gte: start, $lt: end },
      }),
      Booking.countDocuments({
        bookingStatus: "checked_in",
        checkOutDate: { $gte: start, $lt: end },
      }),
      Booking.countDocuments({
        bookingStatus: "confirmed",
        checkInDate: { $lt: start },
      }),
      Booking.countDocuments({ bookingStatus: "checked_in" }),
      Booking.countDocuments({ bookingStatus: "completed" }),
      User.find({})
        .select("name email role createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const stats = buildDashboardStats({
      totalUsers,
      adminCount,
      totalBookings,
      totalRooms,
      totalInventory,
      revenue,
      pendingPayments,
      manualReviewBookings,
      todayArrivals,
      todayDepartures,
      overdueArrivals,
      inHouseGuests,
      completedStays,
    });

    return response.json({
      success: true,
      stats,
      recentUsers,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return response.status(500).json({ success: false, error: "Failed to load dashboard stats" });
  }
};

export const getAllUsers = async (_request: Request, response: Response): Promise<any> => {
  try {
    const users = await User.find({})
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return response.json({ success: true, users });
  } catch (error) {
    console.error("Admin users error:", error);
    return response.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};
