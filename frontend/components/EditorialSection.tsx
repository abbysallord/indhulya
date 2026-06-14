"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EditorialSection() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  
  // Prevent body scroll when video is open
  useEffect(() => {
    if (isVideoOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [isVideoOpen]);

  const handlePlayClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      window.open("https://youtu.be/6_J9GMgcIEE", "_blank");
    } else {
      setIsVideoOpen(true);
    }
  };

  return (
    <>
      <section className="w-full py-16 bg-[#F7F7F7]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 space-y-24">
          {/* Curated Heritage Picks */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            <div className="w-full md:w-1/2 relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1000&auto=format&fit=crop"
                alt="Editorial Image"
                fill
                priority={true}
                className="object-cover"
               sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div className="w-full md:w-1/2 flex flex-col items-start justify-center text-left">
              <h2 className="text-4xl md:text-5xl font-serif mb-6 text-black">Curated Heritage Picks</h2>
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  visible: { transition: { staggerChildren: 0.04 } },
                  hidden: {}
                }}
                className="text-gray-600 mb-8 leading-relaxed max-w-lg"
              >
                {"\"Every piece is a reflection of elegance and rich cultural heritage. Curated with a deep appreciation for traditional craftsmanship, these are timeless designs that perfectly blend antique artistry with modern wearability.\"".split(" ").map((word, idx) => (
                  <motion.span 
                    key={idx}
                    variants={{
                      hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
                      visible: { opacity: 1, filter: "blur(0px)", y: 0 }
                    }}
                    transition={{ duration: 0.5 }}
                    className="inline-block mr-1"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>
              <button 
                onClick={() => alert("Redirecting to Collection...")}
                className="border border-black text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
              >
                Explore Collection
              </button>
            </div>
          </div>

          {/* Indhulya Story */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 md:gap-16">
            <motion.div 
              layoutId="video-card"
              onClick={handlePlayClick}
              className="w-full md:w-1/2 relative aspect-video md:aspect-[4/5] overflow-hidden bg-gray-200 cursor-pointer"
            >
              <Image
                src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000&auto=format&fit=crop"
                alt="The Indhulya Story"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
               sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-black border-b-8 border-b-transparent ml-1"></div>
                </div>
              </div>
            </motion.div>
            <div className="w-full md:w-1/2 flex flex-col items-start justify-center text-left">
              <h2 className="text-4xl md:text-5xl font-serif mb-6 text-black">The Indhulya Story</h2>
              <p className="text-gray-600 mb-8 leading-relaxed max-w-lg">
                Indhulya brings you authentic South Indian heritage jewelry. Specializing in One Gram Gold, exquisite Temple designs, and intricate Antique Nakshi work, we offer timeless elegance without the price tag of solid gold.
              </p>
              <button 
                onClick={() => alert("Loading Indhulya Story...")}
                className="border border-black text-black px-8 py-3 text-sm font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
              >
                Read Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Video Overlay */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoOpen(false)}
              className="absolute inset-0 bg-black/90 cursor-pointer"
            />
            
            <motion.div 
              layoutId="video-card"
              className="w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden relative shadow-2xl z-10"
            >
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-20 bg-black/50 p-2 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe 
                width="100%" 
                height="100%" 
                src="https://www.youtube.com/embed/6_J9GMgcIEE?autoplay=1" 
                title="Indhulya Jewelry Showcase" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
