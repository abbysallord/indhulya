"use client";
import { useState, useEffect } from "react";

export default function AnnouncementBar() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 43, seconds: 21 });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 5, minutes: 59, seconds: 59 }; // Reset loop
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (t: number) => t.toString().padStart(2, "0");
  return (
    <div className="w-full bg-[#5C1218] text-[#FAF9F6] py-2 px-4 text-center tracking-wide font-sans flex flex-col md:flex-row justify-center items-center gap-1 md:gap-2">
      <span className="font-semibold uppercase tracking-widest text-[10px] md:text-xs leading-snug">Free Insured Shipping on all Heritage Orders</span>
      <span className="hidden md:inline text-zinc-400 mx-2">|</span>
      <div className="flex items-center justify-center gap-1 mt-0.5 md:mt-0 text-[10px] md:text-xs">
        <span>Offer ends in...</span>
        <span className="text-[#E5B94E] font-bold ml-1 tracking-wider whitespace-nowrap">
          {mounted ? `${formatTime(timeLeft.hours)} : ${formatTime(timeLeft.minutes)} : ${formatTime(timeLeft.seconds)}` : "05 : 43 : 21"}
        </span>
      </div>
    </div>
  );
}
