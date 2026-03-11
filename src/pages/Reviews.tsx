import { motion } from "motion/react";
import { Star } from "lucide-react";

const REVIEWS = [
  {
    name: "Rahul Sharma",
    date: "October 2023",
    rating: 5,
    text: "Exceptional stay! The rooms are incredibly spacious and well-maintained. The staff went above and beyond to ensure our comfort. The food at the restaurant was delicious. Highly recommend Hotel Sai International for anyone visiting Davanagere."
  },
  {
    name: "Priya Patel",
    date: "September 2023",
    rating: 5,
    text: "A true luxury experience. From the moment we checked in, the service was impeccable. The Executive Room had a beautiful view and the bed was extremely comfortable. Will definitely be returning."
  },
  {
    name: "Amit Kumar",
    date: "August 2023",
    rating: 4,
    text: "Great location and excellent amenities. The Wi-Fi was fast, which was perfect for my business trip. The breakfast spread was impressive with lots of local options. Just wish the gym was open a bit earlier."
  },
  {
    name: "Sneha Reddy",
    date: "July 2023",
    rating: 5,
    text: "We stayed in the Family Suite and it was perfect for our family of four. Plenty of space, very clean, and the kids loved the smart TV. The valet parking made arriving and leaving so easy."
  },
  {
    name: "Vikram Singh",
    date: "June 2023",
    rating: 5,
    text: "Best hotel in Davanagere without a doubt. The ambiance is premium, the decor is elegant, and the hospitality is unmatched. The front desk staff were very helpful in arranging local transport for us."
  },
  {
    name: "Anjali Desai",
    date: "May 2023",
    rating: 4,
    text: "Very comfortable stay. The room service was prompt and the food quality was excellent. The only minor issue was that the AC took a little while to cool the room initially, but otherwise a fantastic experience."
  }
];

export default function Reviews() {
  return (
    <div className="w-full bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0B1B3D] mb-4">Guest Reviews</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read what our guests have to say about their experience at Hotel Sai International. We take pride in delivering exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((review, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-8 rounded-xl shadow-md border border-gray-100"
            >
              <div className="flex text-[#D4AF37] mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
              <p className="text-gray-600 italic mb-6 leading-relaxed">"{review.text}"</p>
              <div className="flex justify-between items-center border-t pt-4">
                <span className="font-semibold text-[#0B1B3D]">{review.name}</span>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
