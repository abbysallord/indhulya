"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft, Package, Truck, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [tracked, setTracked] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setIsTracking(true);
    setTracked(false);
    setTimeout(() => {
      setIsTracking(false);
      setTracked(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5C1218] transition-colors text-sm font-semibold tracking-wide uppercase mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-[#5C1218] mb-4">Track Your Order</h1>
          <p className="text-gray-600">Enter your order ID below to see the current status of your shipment.</p>
        </div>

        <div className="bg-white p-8 md:p-12 shadow-xl max-w-xl mx-auto border border-gray-100 rounded-lg">
          <form onSubmit={handleTrack} className="space-y-6">
            <div>
              <label htmlFor="orderId" className="block text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Order ID or AWB Number</label>
              <input 
                id="orderId" 
                type="text" 
                required 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. IND-10045"
                className="w-full border-b border-gray-300 py-3 focus:outline-none focus:border-[#5C1218] transition-colors bg-transparent text-lg" 
              />
            </div>
            <button 
              type="submit" 
              disabled={isTracking || !orderId.trim()}
              className="w-full bg-[#5C1218] text-white font-bold tracking-widest uppercase text-sm py-4 hover:bg-black transition-colors disabled:opacity-70 flex justify-center"
            >
              {isTracking ? "Locating Package..." : "Track Package"}
            </button>
          </form>

          {tracked && (
            <div className="mt-12 pt-12 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="font-serif text-xl mb-6 text-center">Status for {orderId.toUpperCase()}</h3>
              
              <div className="relative pl-6 border-l-2 border-[#5C1218] space-y-8 pb-4">
                <div className="relative">
                  <div className="absolute -left-[35px] bg-[#5C1218] rounded-full p-1 border-4 border-white">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">Order Placed</h4>
                  <p className="text-xs text-gray-500 mt-1">We have received your order.</p>
                </div>
                
                <div className="relative">
                  <div className="absolute -left-[35px] bg-[#5C1218] rounded-full p-1 border-4 border-white">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">Processing & Packed</h4>
                  <p className="text-xs text-gray-500 mt-1">Your item has been securely packed.</p>
                </div>

                <div className="relative opacity-50">
                  <div className="absolute -left-[35px] bg-gray-300 rounded-full p-1 border-4 border-white">
                    <Truck className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="font-semibold text-sm">In Transit</h4>
                  <p className="text-xs text-gray-500 mt-1">Awaiting pickup by courier partner.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
