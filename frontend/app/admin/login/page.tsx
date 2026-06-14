"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, LockKeyhole } from "lucide-react";
import { login } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await login(formData);
      if (res.success) {
        router.push("/admin/dashboard");
      } else {
        setError(res.error || "Login failed");
        setIsLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Ambient Animated Background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.2, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-[#E5B94E]/20 to-transparent blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tl from-[#5C1218]/30 to-transparent blur-[120px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl"
        >
          {/* Subtle glowing border effect */}
          <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />

          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20">
              <LockKeyhole className="w-6 h-6 text-[#E5B94E]" />
            </div>
            <h1 className="text-3xl font-serif tracking-widest text-white mb-2">INDHULYA</h1>
            <p className="text-white/50 text-sm tracking-widest uppercase">Command Center</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative group">
              <input
                type="text"
                name="username"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-transparent focus:outline-none focus:border-[#E5B94E]/50 focus:bg-black/60 transition-all peer"
                placeholder="Username"
                autoComplete="off"
              />
              <label className="absolute left-5 -top-2.5 text-xs text-[#E5B94E] bg-[#0a0a0a] px-2 transition-all peer-placeholder-shown:text-white/40 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#E5B94E] peer-focus:bg-[#0a0a0a] pointer-events-none rounded-sm">
                Username
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                name="password"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-transparent focus:outline-none focus:border-[#E5B94E]/50 focus:bg-black/60 transition-all peer"
                placeholder="Password"
              />
              <label className="absolute left-5 -top-2.5 text-xs text-[#E5B94E] bg-[#0a0a0a] px-2 transition-all peer-placeholder-shown:text-white/40 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#E5B94E] peer-focus:bg-[#0a0a0a] pointer-events-none rounded-sm">
                Password
              </label>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="group relative w-full flex items-center justify-center gap-2 bg-white text-black py-4 rounded-xl font-bold tracking-widest uppercase overflow-hidden hover:bg-[#E5B94E] transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Authenticate</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
