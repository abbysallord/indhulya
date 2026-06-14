"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Heart, ShoppingBag } from "lucide-react";

// Using unique Unsplash IDs for a rich catalog feel
const ALL_PRODUCTS = [
  { id: 1, name: "Navya Heritage Short Necklace", category: "Necklaces", price: "₹1,200", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 2, name: "Pushpa Floral Kemp Bangles", category: "Bangles", price: "₹850", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 3, name: "Divine Lakshmi Jhumkas", category: "Earrings", price: "₹999", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
  { id: 4, name: "Varna Versatile Choker", category: "Chokers", price: "₹3,200", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop&crop=bottom" },
  { id: 5, name: "Aavya Gutta Pusalu", category: "Necklaces", price: "₹2,800", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop&crop=top" },
  { id: 6, name: "Mayura Peacock Long Haram", category: "Long Harams", price: "₹3,500", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop&crop=faces" },
  { id: 7, name: "Lakshmi Mahotsav Kada", category: "Bangles", price: "₹850", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop" },
  { id: 8, name: "Star-Burst CZ Bangles", category: "Bangles", price: "₹999", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop" },
  { id: 9, name: "Aura Minimalist Studs", category: "Earrings", price: "₹450", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop" },
  { id: 10, name: "Royal Rajputi Nath", category: "Nose Rings", price: "₹1,500", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=600&fit=crop&crop=bottom" },
  { id: 11, name: "Classic Gold Chain", category: "Chains", price: "₹2,100", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&fit=crop&crop=top" },
  { id: 12, name: "Bridal Complete Set", category: "Bridal Sets", price: "₹15,000", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&fit=crop&crop=faces" },
];

const CATEGORIES = ["All", "Necklaces", "Earrings", "Bangles", "Chokers", "Bridal Sets"];

export default function ProductsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <Header />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-16 pt-32">
        
        {/* Page Header */}
        <div className="flex flex-col items-center justify-center text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif text-[#5C1218] mb-4"
          >
            The Collection
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-xl text-sm md:text-base leading-relaxed"
          >
            Explore our curated selection of heritage, everyday, and bridal jewelry. Every piece is crafted with unparalleled devotion to tradition and modern elegance.
          </motion.p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 border-b border-gray-200 pb-8">
          
          <div className="flex flex-wrap items-center gap-2 md:gap-4 justify-center md:justify-start">
            {CATEGORIES.map((cat, idx) => (
              <button 
                key={idx}
                className={`px-6 py-2 rounded-full text-xs font-semibold tracking-widest uppercase transition-all duration-300 ${
                  idx === 0 
                  ? "bg-[#5C1218] text-white border-transparent shadow-md" 
                  : "bg-transparent text-gray-600 border border-gray-200 hover:border-[#5C1218] hover:text-[#5C1218]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-[#E5B94E] focus:ring-1 focus:ring-[#E5B94E] transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
              <SlidersHorizontal className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
          {ALL_PRODUCTS.map((product, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx % 4 * 0.1 }}
              key={product.id} 
              className="group cursor-pointer flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-100 mb-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-colors duration-300" />
                <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:text-[#5C1218] transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <button className="w-full py-3 bg-white/95 backdrop-blur-sm text-black font-semibold text-xs tracking-widest uppercase rounded-lg shadow-lg hover:bg-[#5C1218] hover:text-white transition-colors flex items-center justify-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col items-center text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">{product.category}</p>
                <h3 className="font-serif text-lg text-gray-900 mb-1 leading-snug group-hover:text-[#5C1218] transition-colors">{product.name}</h3>
                <p className="font-medium text-gray-900">{product.price}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="w-full flex justify-center mt-20">
          <button className="px-10 py-4 border border-black text-black font-semibold text-sm tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300">
            Load More Products
          </button>
        </div>

      </main>
      
      <Footer />
    </div>
  );
}
