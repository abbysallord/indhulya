"use client";
import { useState } from "react";
import { Mail, Lock, User, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-[#F7F7F7]">
      {/* Light subtle decorative blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#E5B94E]/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#5C1218]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <Link 
        href="/" 
        className="absolute top-6 left-6 md:top-10 md:left-10 z-20 text-gray-500 hover:text-[#5C1218] flex items-center gap-2 text-sm font-semibold uppercase tracking-wider group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      {/* Glassmorphic Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 md:p-10 mx-4"
      >
        <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border border-white rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]" />
        
        <div className="relative z-20">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-serif text-[#5C1218] mb-2 tracking-wide">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-sm text-gray-500">
              {isSignUp 
                ? "Join Indhulya to experience quiet luxury." 
                : "Sign in to access your curated wishlist."}
            </p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence initial={false}>
              {isSignUp && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#5C1218] transition-colors" />
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5C1218] focus:border-[#5C1218] transition-all shadow-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#5C1218] transition-colors" />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5C1218] focus:border-[#5C1218] transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
                {!isSignUp && (
                  <button type="button" className="text-[10px] text-[#5C1218] hover:underline transition-colors font-semibold tracking-wider uppercase">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#5C1218] transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5C1218] focus:border-[#5C1218] transition-all shadow-sm"
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#5C1218] text-white py-4 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-[#70161E] transition-colors flex items-center justify-center gap-2 mt-8 shadow-md"
            >
              {isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </form>

          <div className="mt-8 text-center text-xs font-semibold text-gray-500 tracking-wider uppercase">
            {isSignUp ? "Already a member?" : "New to Indhulya?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#5C1218] hover:underline transition-colors ml-1 font-bold"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
