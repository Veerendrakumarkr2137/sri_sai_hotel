import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wifi, Car, Coffee, Waves, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?auto=format&fit=crop&q=80"
            alt="Hotel Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Experience Luxury, <br /> Embrace Comfort
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Hotel Sai International offers an unparalleled stay in the heart of the city with world-class amenities and breathtaking views.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/rooms"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-md text-lg font-medium transition-all w-full sm:w-auto flex items-center justify-center gap-2"
            >
              Book Your Stay <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-slate-900">Our Premium Amenities</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need for a comfortable and memorable stay.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Wifi className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Free High-Speed WiFi</h3>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Car className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Parking</h3>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Waves className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Swimming Pool</h3>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Coffee className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fine Restaurant</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-20 text-white">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="text-3xl font-bold mb-6">Ready for an Unforgettable Stay?</h2>
          <p className="text-slate-300 mb-8">
            Join thousands of satisfied guests who chose Hotel Sai International as their home away from home.
          </p>
          <Link
            to="/rooms"
            className="inline-flex items-center justify-center bg-white text-slate-900 px-8 py-3 rounded-md text-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Explore Our Rooms
          </Link>
        </div>
      </section>
    </div>
  );
}
