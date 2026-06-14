"use client";

import { useState } from "react";
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
    } catch (_err) {
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#F8FAFC]">
      {/* Ambient Animated Background - Pastel Light Mode */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.6, 0.4, 0.6],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[#E5B94E]/20 to-transparent blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.3, 0.5],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tl from-slate-200 to-transparent blur-[100px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative bg-white/70 backdrop-blur-2xl border border-white p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        >
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 rounded-3xl border border-white/50 pointer-events-none" />

          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
              <LockKeyhole className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">INDHULYA</h1>
            <p className="text-slate-500 text-sm tracking-wider uppercase font-medium">Command Center</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative group">
              <input
                type="text"
                name="username"
                required
                className="w-full bg-white/80 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-transparent focus:outline-none focus:border-[#E5B94E] focus:ring-1 focus:ring-[#E5B94E] transition-all peer"
                placeholder="Username"
                autoComplete="off"
              />
              <label className="absolute left-5 -top-2.5 text-xs text-[#E5B94E] bg-white px-2 transition-all peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#E5B94E] peer-focus:bg-white pointer-events-none rounded-sm font-medium">
                Username
              </label>
            </div>

            <div className="relative group">
              <input
                type="password"
                name="password"
                required
                className="w-full bg-white/80 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 placeholder-transparent focus:outline-none focus:border-[#E5B94E] focus:ring-1 focus:ring-[#E5B94E] transition-all peer"
                placeholder="Password"
              />
              <label className="absolute left-5 -top-2.5 text-xs text-[#E5B94E] bg-white px-2 transition-all peer-placeholder-shown:text-slate-400 peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-[#E5B94E] peer-focus:bg-white pointer-events-none rounded-sm font-medium">
                Password
              </label>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg border border-red-100"
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
              className="group relative w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-semibold tracking-wide overflow-hidden hover:bg-slate-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-md"
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
