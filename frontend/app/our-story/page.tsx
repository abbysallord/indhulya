"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function OurStoryPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB] selection:bg-[#5C1218] selection:text-white">
      <Header />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-24 md:py-32 pt-32">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center text-center mb-16 md:mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-[#5C1218] mb-6"
          >
            Our Story
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl text-sm md:text-base leading-relaxed tracking-wide"
          >
            A legacy of craftsmanship. A commitment to accessible luxury. Discover the passion behind Indhulya&apos;s timeless creations.
          </motion.p>
        </div>

        {/* Feature Image */}
        <motion.div 
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative w-full h-[50vh] md:h-[70vh] rounded-2xl overflow-hidden mb-20 md:mb-32 shadow-xl"
        >
          <motion.div style={{ scale }} className="absolute inset-0 w-full h-full origin-center">
            <Image
              src="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&fit=crop&crop=faces"
              alt="Artisan crafting jewelry"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </motion.div>
          <div className="absolute inset-0 bg-black/10" />
        </motion.div>

        {/* Narrative Section */}
        <div className="max-w-3xl mx-auto space-y-16 text-gray-800">
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl md:text-3xl font-serif text-[#5C1218] mb-6">The Genesis of Indhulya</h2>
            <p className="text-sm md:text-base leading-loose text-gray-600 mb-4">
              Indhulya was born from a simple yet profound realization: the beauty of traditional South Indian temple jewelry and intricate antique designs should not be confined to a handful of occasions. We believed that every woman deserves to experience the radiance of heirloom-quality craftsmanship without the exorbitant price tag of solid gold.
            </p>
            <p className="text-sm md:text-base leading-loose text-gray-600">
              Our journey began in the vibrant heart of artisan communities, where techniques passed down through generations were slowly fading. By collaborating directly with these master craftsmen, we breathed new life into ancient motifs—the majestic Annapakshi, the divine Lakshmi, and the classic mango mala—reimagining them in premium one-gram gold.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="border-l-4 border-[#E5B94E] pl-6 md:pl-8 py-2"
          >
            <h2 className="text-2xl md:text-3xl font-serif text-[#5C1218] mb-6">Quiet Luxury, Loud Impact</h2>
            <p className="text-sm md:text-base leading-loose text-gray-600 mb-4">
              We operate on the philosophy of &quot;Quiet Luxury.&quot; True elegance doesn&apos;t scream for attention; it commands it through impeccable detail and pristine finishing. Every piece in our collection undergoes rigorous quality checks to ensure the gold plating mimics the exact warmth and luster of 22k gold.
            </p>
            <p className="text-sm md:text-base leading-loose text-gray-600">
              But our impact goes beyond aesthetics. Indhulya is dedicated to sustainable practices and fair compensation for our artisans. When you wear Indhulya, you are not just wearing a piece of jewelry; you are preserving a cultural legacy.
            </p>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
