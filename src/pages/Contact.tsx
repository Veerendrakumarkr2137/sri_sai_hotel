import React from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { motion } from "motion/react";

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-6xl">
      <div className="text-center mb-16 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-slate-900 tracking-tight"
        >
          Get in <span className="text-blue-600">Touch</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          We're here to help. Reach out to us for bookings, inquiries, or any assistance you may need.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }
          }}
          className="space-y-6"
        >
          {[
            { icon: MapPin, title: "Our Location", detail: ["123 Luxury Avenue, Business District", "Cityville, ST 12345"] },
            { icon: Phone, title: "Phone Number", detail: ["+91 98765 43210", "+91 87654 32109"] },
            { icon: Mail, title: "Email Address", detail: ["info@hotelsai.com", "bookings@hotelsai.com"] }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              variants={sectionVariants}
              whileHover={{ x: 10 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-6 group transition-all hover:shadow-xl hover:shadow-blue-500/5"
            >
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-xl mb-2 text-slate-900 tracking-tight">{item.title}</h3>
                {item.detail.map((line, lIdx) => (
                  <p key={lIdx} className="text-slate-500 font-medium">{line}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50"
        >
          <h2 className="text-3xl font-black mb-8 text-slate-900 tracking-tight">Send a Message</h2>
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
              <input type="text" className="w-full bg-slate-50 border border-transparent p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <input type="email" className="w-full bg-slate-50 border border-transparent p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium" placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
              <textarea rows={4} className="w-full bg-slate-50 border border-transparent p-4 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-slate-900 text-white font-black p-5 rounded-2xl hover:bg-blue-600 transition-colors shadow-xl shadow-slate-900/10 hover:shadow-blue-500/20"
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
