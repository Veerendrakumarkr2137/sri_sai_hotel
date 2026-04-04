import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { hoverLift, hoverNudge, revealSoft, revealUp, sectionStagger, viewportOnce } from "../lib/animations";

const quickLinks = [
  { name: "Home", path: "/" },
  { name: "Rooms & Suites", path: "/rooms" },
  { name: "Gallery", path: "/gallery" },
  { name: "Contact Us", path: "/contact" },
  { name: "Sign In", path: "/login" },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", className: "hover:bg-blue-600" },
  { icon: Twitter, label: "Twitter", className: "hover:bg-sky-500" },
  { icon: Instagram, label: "Instagram", className: "hover:bg-pink-600" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-slate-950 pb-10 pt-20 text-slate-300">
      <div className="motion-float absolute -left-16 top-0 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="motion-float-delayed absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="container relative mx-auto max-w-7xl px-4">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionStagger}
          className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4"
        >
          <motion.div variants={revealUp} className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-3xl font-black tracking-tighter text-white">
                ASHOK <span className="text-blue-400">INN</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Experience the perfect blend of luxury and comfort at our premier destination. Your stay is our priority.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  whileHover={hoverLift}
                  whileTap={{ scale: 0.95 }}
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-slate-200 transition-colors ${social.className}`}
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={revealSoft}>
            <h3 className="mb-6 text-lg font-bold uppercase tracking-wider text-white">Quick Links</h3>
            <ul className="space-y-4 text-sm font-medium">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <motion.div whileHover={hoverNudge}>
                    <Link to={link.path} className="inline-flex text-slate-400 transition-colors hover:text-blue-400">
                      {link.name}
                    </Link>
                  </motion.div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={revealSoft}>
            <h3 className="mb-6 text-lg font-bold uppercase tracking-wider text-white">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-blue-400" />
                <span className="text-sm text-slate-400">
                  No. 113/4, Beside New KSRTC Bus Stand
                  <br />
                  P B Road, Link Road, Nittuvalli, Davanagere 577002
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="h-5 w-5 flex-shrink-0 text-blue-400" />
                <span className="text-sm text-slate-400">+91 91642 30250</span>
              </li>
              <li className="flex items-center gap-4">
                <Mail className="h-5 w-5 flex-shrink-0 text-blue-400" />
                <span className="text-sm text-slate-400">info@ashokinn.com</span>
              </li>
            </ul>
          </motion.div>

          <motion.div variants={revealUp} className="space-y-6">
            <h3 className="text-lg font-bold uppercase tracking-wider text-white">Newsletter</h3>
            <p className="text-sm text-slate-400">Subscribe for our latest offers and promotions.</p>
            <form className="flex overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
              <input
                type="email"
                placeholder="Email Address"
                className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:bg-slate-900"
              />
              <motion.button
                type="submit"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center justify-center bg-blue-600 px-4 text-white transition-colors hover:bg-blue-700"
              >
                <Navigation className="h-5 w-5" />
              </motion.button>
            </form>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={revealSoft}
          className="flex flex-col items-center justify-between gap-4 border-t border-slate-900/80 pt-8 text-center md:flex-row md:text-left"
        >
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Ashok Inn. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="transition-colors hover:text-white">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-white">
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
