import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { ROOMS } from "../data";
import { Star, Wifi, Coffee, MapPin, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=2000')" }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif text-white font-bold mb-6"
          >
            Experience Luxury in the Heart of Davanagere
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200 mb-10"
          >
            Hotel Sai International offers world-class hospitality, elegant rooms, and exceptional dining experiences.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link 
              to="/rooms" 
              className="bg-[#D4AF37] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#b8952b] transition-colors inline-block"
            >
              Explore Our Rooms
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Search Form (Simplified for UI) */}
      <section className="relative z-20 -mt-16 max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
            <input type="date" className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
            <input type="date" className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]" />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Guests</label>
            <select className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]">
              <option>1 Adult</option>
              <option>2 Adults</option>
              <option>2 Adults, 1 Child</option>
              <option>2 Adults, 2 Children</option>
            </select>
          </div>
          <div className="w-full md:w-auto">
            <Link to="/rooms" className="w-full md:w-auto bg-[#0B1B3D] text-white px-8 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors block text-center">
              Check Availability
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-3">About Us</h2>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1B3D] mb-6">
                  Welcome to Hotel Sai International
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Located in the vibrant city of Davanagere, Hotel Sai International is a beacon of luxury and comfort. We pride ourselves on offering an unforgettable experience with our impeccably designed rooms, state-of-the-art amenities, and personalized service.
                </p>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Whether you are traveling for business or leisure, our dedicated staff ensures that every aspect of your stay is perfect. Enjoy fine dining at our signature restaurant, relax in our elegant lounges, and experience the true meaning of hospitality.
                </p>
                <Link to="/contact" className="text-[#0B1B3D] font-semibold border-b-2 border-[#D4AF37] pb-1 hover:text-[#D4AF37] transition-colors">
                  Discover More
                </Link>
              </motion.div>
            </div>
            <div className="lg:w-1/2 relative">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <img 
                  src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1000" 
                  alt="Hotel Lobby" 
                  className="rounded-lg shadow-2xl w-full object-cover h-[500px]"
                />
                <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-xl hidden md:block">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#D4AF37] text-white p-3 rounded-full">
                      <Star size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-xl text-[#0B1B3D]">5 Star</p>
                      <p className="text-sm text-gray-500">Luxury Hotel</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase mb-3">Our Accommodation</h2>
            <h3 className="text-3xl md:text-4xl font-serif font-bold text-[#0B1B3D]">Featured Rooms</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ROOMS.map((room, index) => (
              <motion.div 
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-gray-100 group"
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={room.images[0]} 
                    alt={room.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-[#0B1B3D]">
                    ₹{room.price} / night
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-serif font-bold text-[#0B1B3D] mb-2">{room.name}</h4>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-2">{room.description}</p>
                  <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><CheckCircle size={16} className="text-[#D4AF37]"/> {room.capacity} Guests</span>
                    <span className="flex items-center gap-1"><CheckCircle size={16} className="text-[#D4AF37]"/> {room.size}</span>
                  </div>
                  <Link 
                    to={`/rooms/${room.id}`}
                    className="block w-full text-center border border-[#0B1B3D] text-[#0B1B3D] py-2 rounded hover:bg-[#0B1B3D] hover:text-white transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-[#0B1B3D] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Ready to Experience Luxury?</h2>
          <p className="text-lg text-gray-300 mb-10">Book your stay directly with us to get the best rates and exclusive perks.</p>
          <Link 
            to="/rooms" 
            className="bg-[#D4AF37] text-white px-8 py-4 rounded-md text-lg font-medium hover:bg-[#b8952b] transition-colors inline-block"
          >
            Book Your Stay Now
          </Link>
        </div>
      </section>
    </div>
  );
}
