import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { API_BASE_URL } from "../lib/api";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 30 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/rooms`);
        if (data.success) {
          setRooms(data.rooms);
        }
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full"
        />
        <p className="text-slate-500 font-medium animate-pulse">Loading amazing rooms...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20 max-w-7xl">
      <div className="text-center mb-16 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-slate-900 tracking-tight"
        >
          Our Luxury <span className="text-blue-600">Rooms</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Experience the pinnacle of hospitality where tradition meets luxury. Every detail is curated for your ultimate comfort.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {rooms.map((room) => (
          <motion.div 
            key={room._id} 
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-shadow duration-300 flex flex-col group"
          >
            <div className="relative h-72 overflow-hidden">
              <img
                src={room.images?.[0] || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80"}
                alt={room.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-sm font-bold shadow-lg text-slate-900 border border-slate-100">
                ₹{room.price.toLocaleString("en-IN")} <span className="text-[10px] text-slate-500 font-medium">/ night</span>
              </div>
            </div>
            
            <div className="p-8 flex-grow flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                  {room.roomType}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-full">
                  <Users className="w-3.5 h-3.5" /> {room.capacity} Guests
                </span>
              </div>
              <h2 className="text-2xl font-black mb-4 group-hover:text-blue-600 transition-colors line-clamp-1 leading-tight">{room.title}</h2>
              <p className="text-slate-500 mb-8 line-clamp-2 text-sm leading-relaxed">
                {room.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {room.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                  <span key={idx} className="text-[10px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    {amenity}
                  </span>
                ))}
              </div>
              
              <div className="mt-auto flex gap-4">
                <Link
                  to={`/room/${room._id}`}
                  className="flex-1 text-center bg-slate-50 text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all text-sm border border-slate-100"
                >
                  Details
                </Link>
                <Link
                  to={`/book/${room._id}`}
                  className="flex-1 text-center bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all text-sm"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        {rooms.length === 0 && !loading && (
          <div className="col-span-full text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium">No rooms match your criteria.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
