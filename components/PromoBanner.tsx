"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <section className="w-full py-8 bg-[#F7F7F7]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden group cursor-pointer">
          <Image
            src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000&auto=format&fit=crop"
            alt="Gift Combos Promo"
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8">
            <h2 className="text-sm md:text-base font-bold tracking-[0.2em] uppercase mb-4 text-[#E5B94E]">Specially Curated</h2>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {}
              }}
              className="font-serif text-4xl md:text-6xl mb-8 drop-shadow-md"
            >
              {"Gift Combos @ 50% OFF".split(" ").map((word, idx) => (
                <motion.span 
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, filter: "blur(10px)", y: 15 },
                    visible: { opacity: 1, filter: "blur(0px)", y: 0 }
                  }}
                  transition={{ duration: 0.8 }}
                  className="inline-block mr-3"
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
            <button className="bg-white text-[#5C1218] px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-[#E5B94E] hover:text-black transition-colors">
              Explore Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
