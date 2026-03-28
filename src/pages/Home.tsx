import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wifi, Car, Coffee, Waves } from "lucide-react";
import { motion } from "motion/react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?auto=format&fit=crop&q=80"
            alt="Hotel Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </motion.div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight"
          >
            Experience Luxury, <br /> Embrace Comfort
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto"
          >
            Hotel Sai International offers an unparalleled stay in the heart of the city with world-class amenities and breathtaking views.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/rooms"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-medium transition-all w-full sm:w-auto flex items-center justify-center gap-2 group"
            >
              Book Your Stay <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Our Premium Amenities</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need for a comfortable and memorable stay.
            </p>
          </motion.div>
          
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { icon: Wifi, label: "Free High-Speed WiFi" },
              { icon: Car, label: "Secure Parking" },
              { icon: Waves, label: "Swimming Pool" },
              { icon: Coffee, label: "Fine Restaurant" }
            ].map((item, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-xl hover:bg-white"
              >
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <item.icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.label}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-20 text-white overflow-hidden relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center max-w-4xl relative z-10"
        >
          <h2 className="text-3xl font-bold mb-6">Ready for an Unforgettable Stay?</h2>
          <p className="text-slate-300 mb-8">
            Join thousands of satisfied guests who chose Hotel Sai International as their home away from home.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/rooms"
              className="inline-flex items-center justify-center bg-white text-slate-900 px-10 py-4 rounded-full text-lg font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-white/10"
            >
              Explore Our Rooms
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
      </section>
    </div>
  );
}
