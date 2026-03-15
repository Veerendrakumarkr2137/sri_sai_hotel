import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Users, Building, ClipboardList, IndianRupee } from "lucide-react";

export default function AdminDashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/admin/stats", {
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

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Recent Activity</h2>
        <p className="text-slate-500">More detailed charts and tables will be added here in future updates.</p>
      </div>
    </div>
  );
}
