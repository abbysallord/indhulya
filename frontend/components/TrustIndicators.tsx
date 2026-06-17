"use client";
import { Star, ShieldCheck, Truck, Clock, Award } from "lucide-react";
import { motion, Variants } from "framer-motion";

const reviews = [
  {
    id: 1,
    name: "Priya S.",
    location: "Bangalore",
    review: "The Navya One Gram Gold necklace is absolutely stunning. It looks exactly like real gold and the craftsmanship is immaculate. I've worn it to multiple weddings and everyone asks about it!",
    rating: 5,
  },
  {
    id: 2,
    name: "Meera Reddy",
    location: "Hyderabad",
    review: "Bought the Lakshmi Mahotsav Kada for my wedding. I received so many compliments! Quiet luxury at its finest. The packaging was beautiful and felt so premium.",
    rating: 5,
  },
  {
    id: 3,
    name: "Ananya Iyer",
    location: "Chennai",
    review: "Fast delivery and beautiful packaging. The Jhumkas are lightweight and comfortable for everyday wear. I will definitely be purchasing from Indhulya again.",
    rating: 5,
  },
];

const features = [
  {
    icon: <ShieldCheck className="w-10 h-10 text-[#E5B94E]" />,
    title: "100% Authentic",
    desc: "Premium demifine materials",
  },
  {
    icon: <Truck className="w-10 h-10 text-[#E5B94E]" />,
    title: "Insured Shipping",
    desc: "Fast & secure delivery",
  },
  {
    icon: <Clock className="w-10 h-10 text-[#E5B94E]" />,
    title: "Lifetime Support",
    desc: "Dedicated customer service",
  },
  {
    icon: <Award className="w-10 h-10 text-[#E5B94E]" />,
    title: "Heritage Crafted",
    desc: "Handcrafted by artisans",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function TrustIndicators() {
  return (
    <section className="py-24 px-4 md:px-6 bg-gradient-to-b from-white to-[#F7F7F7] w-full overflow-hidden">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-[1440px] mx-auto flex flex-col gap-20"
      >
        
        {/* Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div variants={itemVariants} key={idx} className="flex flex-col items-center text-center gap-4 group">
              <div className="p-5 bg-white shadow-sm border border-gray-50 rounded-full group-hover:shadow-md transition-all group-hover:-translate-y-1">
                {feature.icon}
              </div>
              <h4 className="font-semibold text-base text-[#5C1218]">{feature.title}</h4>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Customer Reviews */}
        <div className="flex flex-col items-center text-center gap-12 pt-12 border-t border-gray-200/60">
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif text-[#5C1218] mb-4">Loved by Women Everywhere</h2>
            <p className="text-base md:text-lg text-gray-600">Discover why Indhulya is the premier choice for heritage jewellery.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {reviews.map((review) => (
              <motion.div 
                variants={itemVariants}
                key={review.id} 
                className="bg-white p-10 rounded-2xl flex flex-col items-center text-center gap-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all group hover:-translate-y-1"
              >
                <div className="flex gap-1.5 mb-2">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#E5B94E] text-[#E5B94E] group-hover:scale-110 transition-transform delay-75" />
                  ))}
                </div>
                <p className="text-base text-gray-700 italic leading-relaxed font-serif">"{review.review}"</p>
                <div className="mt-auto pt-4 border-t border-gray-100 w-full">
                  <h4 className="font-bold text-base text-[#5C1218] tracking-wide">{review.name}</h4>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mt-1.5 font-semibold">{review.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

      </motion.div>
    </section>
  );
}
