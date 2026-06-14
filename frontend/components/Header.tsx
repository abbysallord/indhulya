"use client";
import Image from "next/image";
import { Search, MapPin, Heart, ShoppingBag, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
      {/* Upper Tier */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 max-w-[1440px] mx-auto">
        {/* Left: Mobile Hamburger & Pincode */}
        <div className="flex-1 flex items-center text-xs font-semibold relative">
          <button 
            className="md:hidden mr-4 text-gray-700 hover:text-black"
            aria-label="Toggle mobile menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div 
            className="hidden md:flex items-center cursor-pointer hover:text-gray-600"
            onClick={() => setIsPincodeOpen(!isPincodeOpen)}
          >
            Enter Pincode <ChevronDown className="w-4 h-4 ml-1" />
          </div>
          {isPincodeOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white/90 backdrop-blur-md border border-white/50 shadow-lg rounded p-4 z-50 min-w-[200px]">
              <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest">Select Area</p>
              <ul className="space-y-2 text-sm font-normal">
                <li className="cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => setIsPincodeOpen(false)}>500033 - Jubilee Hills</li>
                <li className="cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => setIsPincodeOpen(false)}>500034 - Banjara Hills</li>
                <li className="cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => setIsPincodeOpen(false)}>500081 - Hitech City</li>
              </ul>
            </div>
          )}
        </div>

        {/* Center: Logo */}
        <div className="flex-1 flex justify-center">
          <Link href="/" className="flex items-center justify-center">
            <Image 
              src="/Indhulya_logo.avif" 
              alt="Indhulya Logo" 
              width={280} 
              height={80} 
              className="object-contain hover:opacity-80 transition-opacity h-auto w-auto max-h-[40px] md:max-h-[60px]" 
              priority
            />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
          <div className="hidden md:flex items-center relative">
            <div className="flex items-center bg-black/5 rounded-full px-4 py-2 w-48 focus-within:w-64 transition-all duration-300">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              />
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            {isSearchOpen && searchQuery.length > 0 && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white/90 backdrop-blur-md border border-white/50 shadow-lg rounded p-4 z-50">
                <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest">Suggested Results</p>
                <ul className="space-y-2 text-sm font-normal">
                  <li className="cursor-pointer hover:bg-gray-50 p-2 border-b border-gray-100" onClick={() => alert('Searching for: ' + searchQuery + ' Necklaces')}>
                    {searchQuery} <span className="font-semibold">Necklaces</span>
                  </li>
                  <li className="cursor-pointer hover:bg-gray-50 p-2 border-b border-gray-100" onClick={() => alert('Searching for: ' + searchQuery + ' Bangles')}>
                    {searchQuery} <span className="font-semibold">Bangles</span>
                  </li>
                  <li className="cursor-pointer hover:bg-gray-50 p-2" onClick={() => alert('Searching for: ' + searchQuery + ' Jhumkas')}>
                    {searchQuery} <span className="font-semibold">Jhumkas</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
          <button className="md:hidden text-gray-700 hover:text-black" aria-label="Search">
             <Search className="w-5 h-5" />
          </button>
          <button onClick={() => alert("Opening Store Locator...")} className="hidden sm:block text-gray-700 hover:text-black" aria-label="Store Locator">
            <MapPin className="w-5 h-5" />
          </button>
          <button onClick={() => alert("Opening Wishlist...")} className="relative text-gray-700 hover:text-black" aria-label="Wishlist">
            <Heart className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">0</span>
          </button>
          <button onClick={() => alert("Opening Cart...")} className="relative text-gray-700 hover:text-black" aria-label="Shopping Cart">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">0</span>
          </button>
        </div>
      </div>

      {/* Lower Tier: Navigation */}
      <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full border-t border-black/5 bg-white/95 md:bg-transparent absolute md:relative left-0 top-full md:top-auto shadow-md md:shadow-none`}>
        <ul className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 py-6 md:py-4 px-4 min-w-max mx-auto text-xs font-semibold tracking-wider uppercase text-gray-700">
          <li className="relative group cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="#one-gram-gold">
              <span className="absolute -top-4 -right-4 bg-[#E5B94E] text-black text-[8px] px-2 py-0.5 rounded-full font-bold shadow-sm">Luxe</span>
              One Gram Gold
            </Link>
          </li>
          <li className="relative group cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="#editorial">
              <span className="absolute -top-4 -right-4 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full font-bold shadow-sm">New</span>
              Temple Jewelry
            </Link>
          </li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="#bestsellers">Best Sellers</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="#categories">Necklaces</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="#categories">Earrings</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="#categories">Bracelets</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="#categories">Bangles & Kada</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="#categories">Jhumkas</Link></li>
        </ul>
      </nav>
    </header>
  );
}
