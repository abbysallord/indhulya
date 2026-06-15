"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useStore, Product } from "@/context/StoreContext";
import { ArrowLeft, Trash2, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, isMounted } = useStore();

  const handleMoveToCart = (product: Product) => {
    addToCart(product);
    toggleWishlist(product); // Remove from wishlist after moving to cart
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <Header />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-16 pt-32">
        <div className="mb-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5C1218] transition-colors text-sm font-semibold tracking-wide uppercase">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#5C1218] mb-4">Your Wishlist</h1>
          <p className="text-gray-600 max-w-xl mx-auto">A curated selection of your favorite pristine luxury pieces.</p>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20 border border-gray-100 bg-white shadow-sm">
            <p className="text-xl font-serif text-gray-500 mb-6">Your wishlist is currently empty.</p>
            <Link href="/products" className="inline-block px-10 py-4 bg-black text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#5C1218] transition-colors">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {wishlist.map((product, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                key={product.id} 
                className="group flex flex-col"
              >
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-xl mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:text-red-600 transition-colors"
                      aria-label="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col items-center text-center flex-1">
                  {product.category && <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">{product.category}</p>}
                  <h3 className="font-serif text-lg text-gray-900 mb-1 leading-snug">{product.name}</h3>
                  <p className="font-medium text-gray-900 mb-6">{typeof product.price === 'number' ? `₹${product.price}` : product.price}</p>
                  
                  <button 
                    onClick={() => handleMoveToCart(product)}
                    className="mt-auto w-full py-3 bg-white border border-gray-200 text-black font-semibold text-xs tracking-widest uppercase hover:bg-black hover:text-white hover:border-black transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Move to Bag
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
