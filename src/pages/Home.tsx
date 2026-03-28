import { Link } from "react-router-dom";
import {
  ArrowRight,
  Wifi,
  Car,
  Coffee,
  Waves,
  Sparkles,
  ShieldCheck,
  Clock3,
} from "lucide-react";
import { motion } from "motion/react";
import {
  easeOutExpo,
  heroStagger,
  hoverLift,
  revealSide,
  revealSoft,
  revealUp,
  sectionStagger,
  viewportOnce,
} from "../lib/animations";

const amenityHighlights = [
  {
    icon: Wifi,
    label: "Free High-Speed WiFi",
    detail: "Stay connected across the property with fast, reliable coverage.",
  },
  {
    icon: Car,
    label: "Secure Parking",
    detail: "Private on-site parking with easy access from arrival to checkout.",
  },
  {
    icon: Waves,
    label: "Swimming Pool",
    detail: "Refresh with a calm poolside escape designed for every kind of stay.",
  },
  {
    icon: Coffee,
    label: "Fine Restaurant",
    detail: "Enjoy chef-led dining and warm service from morning to late evening.",
  },
];

const stayFacts = [
  { value: "120+", label: "Thoughtfully designed rooms" },
  { value: "15 min", label: "From major transit hubs" },
  { value: "24/7", label: "Guest care and concierge" },
];

const guestPromises = [
  { icon: Sparkles, label: "Curated interiors with a polished luxury feel" },
  { icon: ShieldCheck, label: "Comfort-first service from check-in to checkout" },
  { icon: Clock3, label: "Support ready anytime your plans shift" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <section className="relative isolate flex min-h-[calc(100vh-80px)] items-center overflow-hidden bg-slate-950">
        <motion.div
          initial={{ scale: 1.08, opacity: 0.45 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: easeOutExpo }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?auto=format&fit=crop&q=80"
            alt="Hotel Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.82),rgba(15,23,42,0.5),rgba(30,41,59,0.25))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.28),transparent_34%)]" />
        </motion.div>

        <div className="motion-float absolute left-[-8%] top-[14%] h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="motion-float-delayed absolute right-[-10%] top-[22%] h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />

        <div className="container relative mx-auto grid max-w-7xl gap-12 px-4 py-20 lg:grid-cols-[minmax(0,1.1fr)_380px] lg:items-center">
          <motion.div
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="max-w-3xl text-white"
          >
            <motion.div
              variants={revealSoft}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100 backdrop-blur-md"
            >
              <Sparkles className="h-4 w-4" />
              Luxury Reimagined
            </motion.div>

            <motion.h1
              variants={revealUp}
              className="text-5xl font-black tracking-tight text-white md:text-6xl lg:text-7xl"
            >
              Experience Luxury,
              <br />
              Embrace Comfort
            </motion.h1>

            <motion.p
              variants={revealSoft}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-200 md:text-xl"
            >
              Hotel Sai International offers an elevated stay in the heart of the city with refined spaces, attentive service, and amenities that make every visit feel effortless.
            </motion.p>

            <motion.div variants={revealSoft} className="mt-10 flex flex-col gap-4 sm:flex-row">
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/rooms"
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-lg font-semibold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-700 sm:w-auto"
                >
                  Book Your Stay
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/gallery"
                  className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3.5 text-lg font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 sm:w-auto"
                >
                  See The Spaces
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={sectionStagger} className="mt-12 grid gap-4 sm:grid-cols-3">
              {stayFacts.map((fact) => (
                <motion.div
                  key={fact.label}
                  variants={revealSoft}
                  className="rounded-[1.75rem] border border-white/12 bg-white/10 px-5 py-5 backdrop-blur-md"
                >
                  <p className="text-2xl font-black text-white">{fact.value}</p>
                  <p className="mt-1 text-sm text-slate-200">{fact.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={revealSide}
            initial="hidden"
            animate="visible"
            className="hidden lg:block"
          >
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/12 bg-white/10 p-8 backdrop-blur-xl shadow-2xl shadow-slate-950/25">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-300/70 to-transparent" />

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-100/80">
                  Guest Promise
                </p>
                <p className="mt-4 text-3xl font-black tracking-tight text-white">
                  Designed to feel calm the moment you arrive.
                </p>
              </div>

              <div className="mt-6 space-y-4">
                {guestPromises.map((item, index) => (
                  <motion.div
                    key={item.label}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 5.2 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: index * 0.35,
                    }}
                    className="flex items-start gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.08] px-5 py-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-100">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm leading-relaxed text-slate-100">{item.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative bg-white py-24">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sky-50/70 to-transparent" />

        <div className="container relative mx-auto max-w-6xl px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={sectionStagger}
            className="mb-16 text-center"
          >
            <motion.p
              variants={revealSoft}
              className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600"
            >
              Tailored Comfort
            </motion.p>
            <motion.h2 variants={revealUp} className="mt-4 text-3xl font-black text-slate-900 md:text-5xl">
              Our Premium Amenities
            </motion.h2>
            <motion.p variants={revealSoft} className="mx-auto mt-4 max-w-2xl text-slate-600">
              Everything you need for a memorable stay, paired with small touches that make the experience feel effortless.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={sectionStagger}
            className="grid gap-8 md:grid-cols-2 xl:grid-cols-4"
          >
            {amenityHighlights.map((item) => (
              <motion.div
                key={item.label}
                variants={revealSoft}
                whileHover={hoverLift}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-8 shadow-sm shadow-slate-200/40"
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-300 transition-transform duration-500 group-hover:scale-x-100" />
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200/60">
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{item.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
        <div className="motion-float-delayed absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={sectionStagger}
          className="container relative mx-auto max-w-4xl px-4 text-center"
        >
          <motion.p
            variants={revealSoft}
            className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-300"
          >
            Reservations Open
          </motion.p>
          <motion.h2 variants={revealUp} className="mt-4 text-3xl font-black md:text-5xl">
            Ready for an Unforgettable Stay?
          </motion.h2>
          <motion.p variants={revealSoft} className="mt-6 text-lg text-slate-300">
            Join guests who choose Hotel Sai International for elevated comfort, warm hospitality, and a stay that feels easy from the very first moment.
          </motion.p>

          <motion.div variants={revealSoft} className="mt-10">
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }} className="inline-flex">
              <Link
                to="/rooms"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-lg font-bold text-slate-900 shadow-lg shadow-white/10 transition-colors hover:bg-blue-50"
              >
                Explore Our Rooms
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
