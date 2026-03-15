import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 tracking-tight">Contact Us</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          We'd love to hear from you. Get in touch with us for any inquiries or assistance.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg pb-1">Our Location</h3>
              <p className="text-slate-600">123 Luxury Avenue, Business District<br />Cityville, ST 12345</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg pb-1">Phone Number</h3>
              <p className="text-slate-600">+91 98765 43210<br />+91 87654 32109</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg pb-1">Email Address</h3>
              <p className="text-slate-600">info@hotelsai.com<br />bookings@hotelsai.com</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Send us a message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
              <input type="text" className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input type="email" className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
              <textarea rows={4} className="w-full border border-slate-200 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"></textarea>
            </div>
            <button className="w-full bg-slate-900 text-white font-semibold p-4 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
