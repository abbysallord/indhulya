"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AdPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasSeenAd = sessionStorage.getItem("indhulya_ad_seen");
    if (!hasSeenAd) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem("indhulya_ad_seen", "true");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShow(false)}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#FAF9F6] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white"
          >
            <button 
              onClick={() => setShow(false)}
              className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-800 hover:bg-white hover:text-[#5C1218] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="relative w-full md:w-1/2 h-64 md:h-auto">
              <Image 
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&fit=crop"
                alt="New Heritage Collection"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative z-10">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#E5B94E] mb-3">Limited Time Offer</span>
              <h2 className="text-3xl md:text-4xl font-serif text-[#5C1218] mb-4 leading-tight">The Heritage Revival</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                Discover our breathtaking new collection of Antique Nakshi and One Gram Gold masterpieces. Elevate your everyday elegance.
              </p>
              <Link 
                href="/products" 
                onClick={() => setShow(false)}
                className="inline-flex items-center justify-center w-full bg-[#5C1218] text-white py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[#70161E] transition-all group shadow-md"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
