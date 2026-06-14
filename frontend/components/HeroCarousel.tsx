"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

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

const extendedSlides = [slides[slides.length - 1], ...slides, slides[0]];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      if (prev >= extendedSlides.length - 1) return prev;
      return prev + 1;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentSlide((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  // Robust transition reset that doesn't rely on flaky onTransitionEnd events
  useEffect(() => {
    if (currentSlide === extendedSlides.length - 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(1);
      }, 750);
      return () => clearTimeout(timer);
    }
    if (currentSlide === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(slides.length);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [currentSlide]);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying, nextSlide]);

  // Pause autoplay when tab is inactive to prevent background state drift
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) setIsAutoPlaying(false);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-[#FAF9F6]">
      <div
        className="absolute inset-0 flex"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
          transition: isTransitioning ? "transform 700ms cubic-bezier(0.87,0,0.13,1)" : "none",
        }}
      >
        {extendedSlides.map((slide, index) => {
          // Logic to keep text visible during the invisible snap
          const isVisible =
            currentSlide === index ||
            (index === 1 && currentSlide === extendedSlides.length - 1) ||
            (index === slides.length && currentSlide === 0);

          return (
            <div key={`${slide.id}-${index}`} className="w-full h-full flex-shrink-0 flex flex-col md:flex-row">
              <div className="w-full h-[45%] md:h-full md:w-1/2 relative">
                <Image
                  src={slide.image}
                  alt="Indhulya Jewelry Collection"
                  fill
                  className="object-cover object-center"
                  priority={index === 1}
                  sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
              <div className="w-full h-[55%] md:h-full md:w-1/2 flex flex-col items-center justify-center text-center px-4 pb-12 pt-4 md:p-8 bg-[#FAF9F6]">
                <motion.h2
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                  variants={{
                    visible: { transition: { staggerChildren: 0.08 } },
                    hidden: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
                  }}
                  className="font-serif text-3xl md:text-5xl lg:text-6xl text-[#5C1218] mb-4 tracking-wide"
                >
                  {slide.title.split("").map((char, idx) => (
                    <motion.span
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
                        visible: { opacity: 1, filter: "blur(0px)", y: 0 },
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
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ delay: isVisible ? 0.6 : 0, duration: 0.8 }}
                    className="italic text-gray-800"
                  >
                    {slide.subtitle}
                  </motion.span>
                </motion.h2>
                <p className="text-gray-700 text-sm md:text-base tracking-widest uppercase mb-8">
                  {slide.description}
                </p>
                <Link
                  href="/products"
                  className="border-b-2 border-black text-black font-semibold text-sm tracking-widest uppercase pb-1 hover:text-gray-600 hover:border-gray-600 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <button
        onClick={() => {
          setIsAutoPlaying(false);
          prevSlide();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 text-black transition-colors z-10 backdrop-blur-sm"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={() => {
          setIsAutoPlaying(false);
          nextSlide();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 text-black transition-colors z-10 backdrop-blur-sm"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots and Play/Pause */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6 z-10 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full shadow-sm">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-black hover:text-[#5C1218] transition-colors"
          title={isAutoPlaying ? "Pause Auto-play" : "Start Auto-play"}
          aria-label={isAutoPlaying ? "Pause Auto-play" : "Start Auto-play"}
        >
          {isAutoPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
        <div className="flex gap-2">
          {slides.map((_, index) => {
            const activeIndex = currentSlide === 0 ? slides.length - 1 : currentSlide === extendedSlides.length - 1 ? 0 : currentSlide - 1;
            return (
              <div
                key={index}
                className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${activeIndex === index ? "bg-[#5C1218] w-4" : "bg-black/30"}`}
                onClick={() => {
                  setIsAutoPlaying(false);
                  if (!isTransitioning) setIsTransitioning(true);
                  setCurrentSlide(index + 1);
                }}
              ></div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
