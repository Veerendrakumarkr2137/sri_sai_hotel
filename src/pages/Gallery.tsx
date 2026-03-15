import React from "react";

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
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 tracking-tight">Image Gallery</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Take a look at what awaits you at Hotel Sai International.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((src, idx) => (
          <div key={idx} className="group overflow-hidden rounded-2xl aspect-[4/3] bg-slate-100 cursor-pointer">
            <img 
              src={src} 
              alt={`Gallery ${idx + 1}`} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
