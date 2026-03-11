import { useParams, Link } from "react-router-dom";
import { ROOMS } from "../data";
import { motion } from "motion/react";
import { CheckCircle, Users, Maximize, BedDouble } from "lucide-react";

export default function RoomDetails() {
  const { id } = useParams();
  const room = ROOMS.find(r => r.id === id);

  if (!room) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl font-serif font-bold text-[#0B1B3D] mb-4">Room Not Found</h2>
        <Link to="/rooms" className="text-[#D4AF37] hover:underline">Return to Rooms</Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Hero Image */}
      <div className="h-[50vh] md:h-[60vh] relative">
        <img 
          src={room.images[0]} 
          alt={room.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">{room.name}</h1>
            <p className="text-xl text-gray-200">₹{room.price} / night</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-serif font-bold text-[#0B1B3D] mb-6">Room Overview</h3>
              <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                {room.description}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 p-6 bg-slate-50 rounded-xl border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <Users className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <span className="text-sm text-gray-500">Capacity</span>
                  <span className="font-semibold text-[#0B1B3D]">Up to {room.capacity} Guests</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Maximize className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <span className="text-sm text-gray-500">Size</span>
                  <span className="font-semibold text-[#0B1B3D]">{room.size}</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <BedDouble className="w-8 h-8 text-[#D4AF37] mb-2" />
                  <span className="text-sm text-gray-500">Bed Type</span>
                  <span className="font-semibold text-[#0B1B3D]">{room.bedType}</span>
                </div>
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#0B1B3D] mb-6">Amenities</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                {room.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center text-gray-700">
                    <CheckCircle className="w-5 h-5 mr-3 text-[#D4AF37]" />
                    {amenity}
                  </div>
                ))}
              </div>

              <h3 className="text-2xl font-serif font-bold text-[#0B1B3D] mb-6">Room Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {room.images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    alt={`${room.name} ${i + 1}`} 
                    className="w-full h-64 object-cover rounded-lg shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-xl border border-gray-100 sticky top-28"
            >
              <h3 className="text-2xl font-serif font-bold text-[#0B1B3D] mb-2">Reserve this room</h3>
              <div className="text-3xl font-bold text-[#D4AF37] mb-6">
                ₹{room.price} <span className="text-sm text-gray-500 font-normal">/ night</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 border-b pb-2">
                  <span>Taxes & Fees</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b pb-2">
                  <span>Breakfast</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between text-gray-600 border-b pb-2">
                  <span>Cancellation</span>
                  <span className="text-green-600">Free before 48h</span>
                </div>
              </div>

              <Link 
                to={`/book/${room.id}`}
                className="block w-full text-center bg-[#0B1B3D] text-white py-4 rounded-md font-medium hover:bg-opacity-90 transition-colors text-lg"
              >
                Book Now
              </Link>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                You won't be charged yet
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
