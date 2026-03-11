import { motion } from "motion/react";
import { Wifi, Coffee, Utensils, Dumbbell, Car, ShieldCheck, Tv, Wind } from "lucide-react";

const AMENITIES = [
  { icon: <Wifi size={32} />, title: "High-Speed Wi-Fi", description: "Stay connected with complimentary high-speed internet access throughout the hotel." },
  { icon: <Utensils size={32} />, title: "Fine Dining", description: "Experience culinary excellence at our multi-cuisine restaurant featuring local and international delicacies." },
  { icon: <Coffee size={32} />, title: "24/7 Room Service", description: "Enjoy delicious meals and beverages in the comfort of your room at any time of the day." },
  { icon: <Dumbbell size={32} />, title: "Fitness Center", description: "Keep up with your fitness routine in our fully equipped modern gymnasium." },
  { icon: <Car size={32} />, title: "Valet Parking", description: "Complimentary secure parking with valet service for all our guests." },
  { icon: <ShieldCheck size={32} />, title: "24/7 Security", description: "Your safety is our priority with round-the-clock security and CCTV surveillance." },
  { icon: <Tv size={32} />, title: "Smart Entertainment", description: "Large flat-screen smart TVs with premium channels in every room." },
  { icon: <Wind size={32} />, title: "Climate Control", description: "Individually controlled air conditioning for your personalized comfort." }
];

export default function Amenities() {
  return (
    <div className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1B3D] mb-4">Hotel Amenities</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We provide a comprehensive range of facilities and services to ensure your stay is comfortable, convenient, and memorable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {AMENITIES.map((amenity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-slate-50 p-8 rounded-xl border border-gray-100 text-center hover:shadow-lg transition-shadow"
            >
              <div className="text-[#D4AF37] mb-6 flex justify-center">
                {amenity.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-[#0B1B3D] mb-3">{amenity.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{amenity.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
