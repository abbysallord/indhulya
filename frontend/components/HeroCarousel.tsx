"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=2000&auto=format&fit=crop",
    title: "HERITAGE",
    subtitle: "Elegance",
    description: "One Gram Gold • Antique • Temple Jewelry",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2000&auto=format&fit=crop",
    title: "TIMELESS",
    subtitle: "Tradition",
    description: "Kemp Stones • Nakshi Work • CZ Bangles",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=2000&auto=format&fit=crop",
    title: "FESTIVE",
    subtitle: "Radiance",
    description: "Bridal Sets • Chokers • Long Harams",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=2000&auto=format&fit=crop",
    title: "EVERYDAY",
    subtitle: "Charm",
    description: "Jhumkas • Studs • Delicate Chains",
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-[#FAF9F6]">
      <div 
        className="absolute inset-0 flex transition-transform duration-700 ease-[cubic-bezier(0.87,0,0.13,1)]"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="w-full h-full flex-shrink-0 flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 h-full relative">
              <Image
                src={slide.image}
                alt="Indhulya Jewelry Collection"
                fill
                className="object-cover object-center"
                priority
              />
            </div>
            <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center text-center p-8 bg-[#FAF9F6]">
              {currentSlide === index && (
                <motion.h2 
                  key={`title-${slide.id}`}
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.08 } },
                    hidden: {}
                  }}
                  className="font-serif text-4xl md:text-5xl lg:text-6xl text-[#5C1218] mb-4 tracking-wide"
                >
                  {slide.title.split("").map((char, idx) => (
                    <motion.span 
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
                        visible: { opacity: 1, filter: "blur(0px)", y: 0 }
                      }}
                      transition={{ duration: 0.6 }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                  <br />
                  <motion.span 
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 }
                    }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="italic text-gray-800"
                  >
                    {slide.subtitle}
                  </motion.span>
                </motion.h2>
              )}
              <p className="text-gray-700 text-sm md:text-base tracking-widest uppercase mb-8">
                {slide.description}
              </p>
              <button 
                onClick={() => alert(`Navigating to ${slide.title} collection...`)}
                className="border-b-2 border-black text-black font-semibold text-sm tracking-widest uppercase pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
              >
                Shop Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 text-black transition-colors z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 text-black transition-colors z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <div 
            key={index} 
            className={`w-2 h-2 rounded-full cursor-pointer ${currentSlide === index ? 'bg-black' : 'bg-black/30'}`}
            onClick={() => setCurrentSlide(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}
