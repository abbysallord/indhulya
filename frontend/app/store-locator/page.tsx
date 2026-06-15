"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Phone, Clock } from "lucide-react";

export default function StoreLocator() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-8 py-20 pt-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif text-[#5C1218] mb-4">Our Boutiques</h1>
          <p className="text-gray-600 max-w-xl mx-auto">Experience the pristine luxury of Indhulya in person. Visit our exclusive boutiques for a personalized viewing.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Store 1 */}
          <div className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-serif text-[#5C1218] mb-4 border-b border-gray-100 pb-4">Jubilee Hills Flagship</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <p>Road No. 36, Jubilee Hills,<br/>Hyderabad, Telangana 500033</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                <p>Mon - Sun: 11:00 AM - 8:00 PM</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                <p>+91 98765 43210</p>
              </div>
            </div>
            <button className="mt-8 w-full py-3 border border-black text-black text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
              Get Directions
            </button>
          </div>

          {/* Store 2 */}
          <div className="bg-white p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-serif text-[#5C1218] mb-4 border-b border-gray-100 pb-4">Banjara Hills Boutique</h3>
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <p>Road No. 12, Banjara Hills,<br/>Hyderabad, Telangana 500034</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400 shrink-0" />
                <p>Mon - Sun: 10:30 AM - 8:30 PM</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 shrink-0" />
                <p>+91 98765 43211</p>
              </div>
            </div>
            <button className="mt-8 w-full py-3 border border-black text-black text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">
              Get Directions
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
