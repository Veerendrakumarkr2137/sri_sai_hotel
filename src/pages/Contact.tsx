import { motion } from "motion/react";
import { HOTEL_INFO } from "../data";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function Contact() {
  return (
    <div className="w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1B3D] mb-4">Contact Us</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're here to help. Whether you have a question about our rooms, need assistance with your booking, or want to provide feedback, please don't hesitate to reach out.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Contact Information */}
          <div className="lg:w-1/3 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-slate-50 p-8 rounded-xl border border-gray-100"
            >
              <h3 className="text-2xl font-serif font-bold text-[#0B1B3D] mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="text-[#D4AF37] mr-4 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {HOTEL_INFO.address}<br />
                      {HOTEL_INFO.city}, {HOTEL_INFO.state} {HOTEL_INFO.zip}<br />
                      {HOTEL_INFO.country}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="text-[#D4AF37] mr-4 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                    <p className="text-gray-600 text-sm">{HOTEL_INFO.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="text-[#D4AF37] mr-4 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600 text-sm">{HOTEL_INFO.email}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="text-[#D4AF37] mr-4 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Reception Hours</h4>
                    <p className="text-gray-600 text-sm">24 Hours / 7 Days a week</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100"
            >
              <h3 className="text-2xl font-serif font-bold text-[#0B1B3D] mb-6">Send us a Message</h3>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully!"); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    required
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    rows={5}
                    required
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  className="bg-[#0B1B3D] text-white px-8 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
