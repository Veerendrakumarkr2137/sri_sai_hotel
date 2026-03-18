import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Users, Building, ClipboardList, IndianRupee } from "lucide-react";
import { API_BASE_URL } from "../lib/api";

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (data.success) {
          setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };
    if (token) fetchStats();
  }, [token]);

  if (!stats) return <div className="p-8">Loading dashboard...</div>;

  const statCards = [
    { label: "Total Revenue (₹)", value: stats.revenue.toLocaleString("en-IN"), icon: IndianRupee, color: "bg-emerald-100 text-emerald-600" },
    { label: "Total Bookings", value: stats.totalBookings, icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
    { label: "Total Rooms", value: stats.totalRooms, icon: Building, color: "bg-purple-100 text-purple-600" },
    { label: "Registered Users", value: stats.totalUsers, icon: Users, color: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`p-4 rounded-xl ${stat.color}`}>
                <Icon className="w-8 h-8" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            to="/admin/rooms"
            className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
          >
            <Building className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-slate-900">Manage Rooms</h3>
              <p className="text-sm text-slate-600">Add, edit, or delete rooms</p>
            </div>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200"
          >
            <ClipboardList className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-slate-900">Manage Bookings</h3>
              <p className="text-sm text-slate-600">View and update bookings</p>
            </div>
          </Link>
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <Users className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-semibold text-slate-900">User Management</h3>
              <p className="text-sm text-slate-600">Coming soon</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
        <p className="text-slate-500">More detailed charts and tables will be added here in future updates.</p>
      </div>
    </div>
  );
}
