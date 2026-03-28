import React from "react";
import { motion } from "motion/react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

export default function Gallery() {
  const images = [
    "https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c0d13c90?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80",
  ];

  return (
    <div className="container mx-auto px-4 py-20 max-w-7xl">
      <div className="text-center mb-16 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-slate-900 tracking-tight"
        >
          Visual <span className="text-blue-600">Journey</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Explore the elegance and sophistication that defines Hotel Sai International.
        </motion.p>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {images.map((src, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            whileHover={{ y: -10 }}
            className="group relative overflow-hidden rounded-[2rem] aspect-[4/3] bg-slate-100 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500"
          >
            <img 
              src={src} 
              alt={`Gallery ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
              <span className="text-white font-bold text-lg tracking-wide uppercase">Hotel Highlight {idx + 1}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
