"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { ArrowLeft, X, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function CartPage() {
  const { cart, removeFromCart, isMounted } = useStore();

  const parsePrice = (price: string | number) => {
    if (typeof price === 'number') return price;
    return parseInt(price.replace(/\D/g, '')) || 0;
  };

  const subtotal = cart.reduce((total, item) => total + parsePrice(item.price), 0);
  const shipping = subtotal > 0 ? (subtotal > 5000 ? 0 : 150) : 0;
  const total = subtotal + shipping;

  if (!isMounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <Header />
      
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-16 pt-32">
        <div className="mb-8">
          <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5C1218] transition-colors text-sm font-semibold tracking-wide uppercase">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-[#5C1218]">Your Shopping Bag</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 border border-gray-100 bg-white shadow-sm">
            <p className="text-xl font-serif text-gray-500 mb-6">Your bag is currently empty.</p>
            <Link href="/products" className="inline-block px-10 py-4 bg-black text-white text-xs font-semibold tracking-widest uppercase hover:bg-[#5C1218] transition-colors">
              Discover New Arrivals
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-xs font-semibold uppercase tracking-widest text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map((product, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    key={`${product.id}-${idx}`} 
                    className="py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-1 md:col-span-6 flex gap-6">
                      <div className="w-24 h-32 relative bg-gray-50 shrink-0">
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        {product.category && <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{product.category}</p>}
                        <h3 className="font-serif text-lg text-gray-900 mb-2">{product.name}</h3>
                        <button 
                          onClick={() => removeFromCart(product.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors w-fit"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                    <div className="hidden md:block col-span-3 text-center text-sm">
                      1
                    </div>
                    <div className="col-span-1 md:col-span-3 text-right font-medium">
                      {typeof product.price === 'number' ? `₹${product.price}` : product.price}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-[400px]">
              <div className="bg-white border border-gray-100 p-8 shadow-sm">
                <h2 className="text-xl font-serif text-[#5C1218] mb-6">Order Summary</h2>
                
                <div className="space-y-4 text-sm mb-6 border-b border-gray-100 pb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart.length} items)</span>
                    <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Shipping</span>
                    <span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-8">
                  <span className="text-base font-semibold uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-serif text-[#5C1218]">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button className="w-full py-4 bg-[#5C1218] text-white font-semibold text-xs tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-black transition-colors">
                  <Lock className="w-4 h-4" />
                  Secure Checkout
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4">
                  Taxes and shipping calculated at checkout.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
