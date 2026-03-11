import { motion } from "motion/react";

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1542314831-c6a4d14d8373?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1551882547-ff40c0d13c05?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=1000"
];

export default function Gallery() {
  return (
    <div className="w-full bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1B3D] mb-4">Photo Gallery</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Take a visual tour of Hotel Sai International. From our luxurious rooms to our elegant dining areas, experience the beauty of our property.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {GALLERY_IMAGES.map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative overflow-hidden rounded-lg shadow-md group aspect-square"
            >
              <img 
                src={src} 
                alt={`Gallery image ${index + 1}`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
