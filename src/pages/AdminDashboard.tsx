import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { format } from "date-fns";
import { Trash2, CheckCircle, XCircle, LogOut, Users, Calendar, DollarSign } from "lucide-react";

type Booking = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
};

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin");
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      const response = await fetch(`/api/bookings/${id}`, { method: "DELETE" });
      if (response.ok) {
        setBookings(bookings.filter(b => b._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (response.ok) {
        setBookings(bookings.map(b => b._id === id ? { ...b, status } : b));
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin");
  };

  // Calculate stats
  const totalRevenue = bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + b.totalPrice : sum, 0);
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalGuests = bookings.reduce((sum, b) => b.status !== 'cancelled' ? sum + b.guests : sum, 0);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-[#0B1B3D] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-serif font-bold text-[#D4AF37]">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-300 hover:text-white transition-colors text-sm"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{activeBookings}</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-4">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mr-4">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
            </div>
          </motion.div>
        </div>

        {/* Bookings Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Guest</th>
                  <th className="px-6 py-4 font-medium">Room</th>
                  <th className="px-6 py-4 font-medium">Dates</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{booking.name}</div>
                        <div className="text-sm text-gray-500">{booking.email}</div>
                        <div className="text-sm text-gray-500">{booking.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.roomType}</div>
                        <div className="text-xs text-gray-500">{booking.guests} Guests</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          In: {format(new Date(booking.checkIn), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-900">
                          Out: {format(new Date(booking.checkOut), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">₹{booking.totalPrice.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {booking.status !== 'confirmed' && (
                            <button 
                              onClick={() => handleStatusChange(booking._id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                              title="Confirm"
                            >
                              <CheckCircle size={18} />
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button 
                              onClick={() => handleStatusChange(booking._id, 'cancelled')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Cancel"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(booking._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
