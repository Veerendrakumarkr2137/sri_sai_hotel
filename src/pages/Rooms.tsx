import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Wifi, Coffee, Users, Tv } from "lucide-react";

export default function Rooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await axios.get("http://localhost:3000/api/rooms");
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
    return <div className="text-center py-20 text-xl font-medium">Loading amazing rooms...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 tracking-tight">
          Our Luxury Rooms
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Discover comfort and elegance in our carefully designed rooms. Each space offers a unique blend of modern amenities and timeless charm.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div key={room._id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col group">
            <div className="relative h-64 overflow-hidden">
              <img
                src={room.images?.[0] || "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80"}
                alt={room.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold shadow-sm text-slate-800">
                ₹{room.price.toLocaleString("en-IN")} / night
              </div>
            </div>
            
            <div className="p-6 flex-grow flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  {room.roomType}
                </span>
                <span className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                  <Users className="w-4 h-4" /> {room.capacity} Guests
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-3 line-clamp-1">{room.title}</h2>
              <p className="text-slate-600 mb-6 line-clamp-2 text-sm">
                {room.description}
              </p>
              
              <div className="flex gap-4 mb-6 text-slate-400">
                {room.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                  <div key={idx} className="flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                      {amenity}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto flex gap-3">
                <Link
                  to={`/room/${room._id}`}
                  className="flex-1 text-center bg-slate-100 text-slate-900 font-medium py-3 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  to={`/book/${room._id}`}
                  className="flex-1 text-center bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-sm shadow-slate-900/10"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500">
            No rooms available at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
