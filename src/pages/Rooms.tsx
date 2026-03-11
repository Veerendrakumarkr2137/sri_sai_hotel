import { motion } from "motion/react";
import { ROOMS } from "../data";
import { Link } from "react-router-dom";
import { CheckCircle, Users, Maximize } from "lucide-react";

export default function Rooms() {
  return (
    <div className="w-full bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1B3D] mb-4">Our Rooms & Suites</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience unparalleled comfort and luxury in our thoughtfully designed rooms. Each space is crafted to provide a relaxing sanctuary during your stay in Davanagere.
          </p>
        </div>

        <div className="space-y-12">
          {ROOMS.map((room, index) => (
            <motion.div 
              key={room.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col lg:flex-row border border-gray-100"
            >
              <div className="lg:w-2/5 h-64 lg:h-auto relative">
                <img 
                  src={room.images[0]} 
                  alt={room.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="lg:w-3/5 p-8 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-3xl font-serif font-bold text-[#0B1B3D]">{room.name}</h2>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-[#D4AF37]">₹{room.price}</span>
                      <span className="text-gray-500 text-sm block">per night</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {room.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-6 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Users className="w-5 h-5 mr-2 text-[#D4AF37]" />
                      <span>Up to {room.capacity} Guests</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Maximize className="w-5 h-5 mr-2 text-[#D4AF37]" />
                      <span>{room.size}</span>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h4 className="font-semibold text-gray-900 mb-3">Room Amenities:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {room.amenities.slice(0, 4).map((amenity, i) => (
                        <div key={i} className="flex items-center text-gray-600 text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-[#D4AF37]" />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-auto">
                  <Link 
                    to={`/rooms/${room.id}`}
                    className="flex-1 text-center border-2 border-[#0B1B3D] text-[#0B1B3D] py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/book/${room.id}`}
                    className="flex-1 text-center bg-[#D4AF37] text-white py-3 rounded-md font-medium hover:bg-[#b8952b] transition-colors"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
