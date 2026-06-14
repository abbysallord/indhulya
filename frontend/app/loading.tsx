"use client";
import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-xl">
      <div className="flex flex-col items-center">
        {/* The Loader Ring */}
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-r-2 border-[#5C1218] rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute inset-2 border-b-2 border-l-2 border-[#E5B94E] rounded-full opacity-60"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center">
            <span className="font-serif text-[#5C1218] text-xl font-bold tracking-widest">I</span>
          </motion.div>
        </div>
        
        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="mt-6 text-xs font-bold tracking-[0.3em] uppercase text-[#5C1218]"
        >
          Curating
        </motion.div>
      </div>
    </div>
  );
}
