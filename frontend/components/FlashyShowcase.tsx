"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const showcaseImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&fit=crop", title: "Temple Masterpieces" },
  { id: 2, src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&fit=crop", title: "The Heritage Bride" },
  { id: 3, src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&fit=crop", title: "Antique Gold" },
  { id: 4, src: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=800&fit=crop&crop=bottom", title: "Everyday Elegance" },
  { id: 5, src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&fit=crop&crop=top", title: "Modern Classics" },
  { id: 6, src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&fit=crop&crop=faces", title: "One Gram Luxury" },
];

export default function FlashyShowcase() {
  return (
    <section className="relative py-24 bg-[#FAF9F6] overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E5B94E]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header & CTA */}
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-end mb-16 relative z-20">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-serif text-[#5C1218] mb-4"
          >
            The Indhulya <span className="italic font-light text-[#E5B94E]">Muse</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-lg tracking-wide leading-relaxed text-sm md:text-base"
          >
            Discover the artistry and heritage of our finest collections, worn by the women who inspire us.
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-6 md:mt-0"
        >
          <Link href="/products" className="inline-flex items-center gap-3 px-8 py-3.5 bg-transparent border border-[#5C1218] text-[#5C1218] rounded-full hover:bg-[#5C1218] hover:text-white transition-all duration-300 group">
            <span className="uppercase tracking-widest text-[11px] md:text-xs font-bold">Shop The Look</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>

      {/* Auto-scrolling Marquee Gallery */}
      {/* 
        Using a standard CSS marquee for infinite horizontal scroll.
        Hovering over the group pauses the animation for easy viewing.
      */}
      <div className="relative flex overflow-hidden group py-12">
        {/* We use 3 sets to ensure it can fill ultra-wide monitors without a gap */}
        <div className="animate-marquee flex whitespace-nowrap w-max">
          {[...showcaseImages, ...showcaseImages, ...showcaseImages].map((img, index) => (
            <div 
              key={`${img.id}-${index}`} 
              className="relative w-[70vw] sm:w-[45vw] md:w-[28vw] lg:w-[22vw] aspect-[3/4] flex-shrink-0 rounded-2xl overflow-hidden shadow-xl mx-3 md:mx-5 cursor-pointer group/card"
            >
              <div className="absolute inset-0 bg-black/10 group-hover/card:bg-black/40 transition-colors duration-500 z-10" />
              
              <Image
                src={img.src}
                alt={img.title}
                fill
                className="object-cover transition-transform duration-700 group-hover/card:scale-110 ease-out"
                sizes="(max-width: 768px) 70vw, 30vw"
              />
              
              {/* Hover CTA inside card */}
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                <Link href="/products" className="px-6 py-3 bg-white/95 backdrop-blur-sm text-[#5C1218] text-[10px] md:text-xs font-bold tracking-widest uppercase rounded-full shadow-lg transform translate-y-4 group-hover/card:translate-y-0 transition-all duration-500 hover:bg-[#5C1218] hover:text-white">
                  Shop Collection
                </Link>
              </div>

              {/* Title overlay at bottom */}
              <div className="absolute bottom-6 left-6 right-6 z-20 pointer-events-none transition-transform duration-500 group-hover/card:-translate-y-2">
                <h3 className="text-white text-lg md:text-xl font-serif drop-shadow-md">
                  {img.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          /* Translating exactly 33.333% because we duplicated the array 3 times */
          100% { transform: translateX(-33.333333%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused !important;
        }
      `}} />
    </section>
  );
}
