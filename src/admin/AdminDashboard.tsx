import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Users, Building, ClipboardList, IndianRupee, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { motion } from "motion/react";
import { hoverLift, revealSoft, revealUp, sectionStagger } from "../lib/animations";

type DashboardStats = {
  revenue: number;
  totalBookings: number;
  totalRooms: number;
  totalUsers: number;
};

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  createdAt?: string;
};

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, usersResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/admin/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/admin/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsResponse.data.success) {
          setStats(statsResponse.data.stats);
        }

        if (usersResponse.data.success) {
          setUsers(usersResponse.data.users);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };

    if (token) fetchDashboardData();
  }, [token]);

  if (!stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], y: [0, -6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-500 shadow-sm"
        >
          Loading dashboard...
        </motion.div>
      </div>
    );
  }

  const adminCount = users.filter((user) => user.role === "admin").length;
  const guestCount = users.length - adminCount;
  const recentUsers = users.slice(0, 3);

  const statCards = [
    {
      label: "Total Revenue (Rs.)",
      value: stats.revenue.toLocaleString("en-IN"),
      icon: IndianRupee,
      color: "bg-emerald-100 text-emerald-600",
    },
    { label: "Total Bookings", value: stats.totalBookings, icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
    { label: "Total Rooms", value: stats.totalRooms, icon: Building, color: "bg-purple-100 text-purple-600" },
    { label: "Registered Users", value: stats.totalUsers, icon: Users, color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={sectionStagger} className="max-w-7xl mx-auto">
      <motion.h1 variants={revealUp} className="mb-8 text-3xl font-bold text-slate-900">
        Dashboard Overview
      </motion.h1>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              variants={revealSoft}
              whileHover={hoverLift}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div>
                <p className="mb-1 text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`rounded-xl p-4 ${stat.color}`}>
                <Icon className="w-8 h-8" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div variants={revealSoft} className="mb-8 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-xl font-bold text-slate-900">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div whileHover={hoverLift}>
            <Link
              to="/admin/rooms"
              className="flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 transition-colors hover:bg-blue-100"
            >
              <Building className="w-6 h-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Manage Rooms</h3>
                <p className="text-sm text-slate-600">Add, edit, or delete rooms</p>
              </div>
            </Link>
          </motion.div>

          <motion.div whileHover={hoverLift}>
            <Link
              to="/admin/bookings"
              className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 transition-colors hover:bg-green-100"
            >
              <ClipboardList className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-slate-900">Manage Bookings</h3>
                <p className="text-sm text-slate-600">View and update bookings</p>
              </div>
            </Link>
          </motion.div>

          <motion.div
            whileHover={hoverLift}
            className="flex items-center gap-3 rounded-xl border border-purple-200 bg-purple-50 p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Users className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-900">User Overview</h3>
                <span className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-700">
                  {users.length} total
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                <span className="rounded-full bg-white/80 px-2.5 py-1">
                  {guestCount} guest{guestCount === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                  {adminCount} admin{adminCount === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-3 space-y-1.5">
                {recentUsers.length > 0 ? (
                  recentUsers.map((user) => (
                    <div key={user._id} className="truncate text-sm text-slate-600">
                      <span className="font-medium text-slate-900">{user.name}</span>
                      {" • "}
                      <span className="truncate">{user.email}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-600">No registered users yet.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div variants={revealSoft} className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Activity</h2>
        <p className="text-slate-500">More detailed charts and tables will be added here in future updates.</p>
      </motion.div>
    </motion.div>
  );
}
