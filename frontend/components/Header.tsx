"use client";
import Image from "next/image";
import { Search, MapPin, Heart, ShoppingBag, ChevronDown, Menu, X, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";

export default function Header() {
  const [isPincodeOpen, setIsPincodeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const router = useRouter();
  
  const { cartCount, wishlistCount, isMounted, deliveryLocation, setDeliveryLocation } = useStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const verifyPincode = async (val: string) => {
    if (val.length === 6 && /^\d+$/.test(val)) {
      setIsLoadingPincode(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${val}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === "Success") {
          const po = data[0].PostOffice[0];
          setDeliveryLocation(`${po.Name}, ${po.District} (${val})`);
          setIsPincodeOpen(false);
        } else {
          alert("Invalid Pincode. Delivery not available.");
        }
      } catch (e) {
        alert("Failed to verify pincode. Please try again.");
      } finally {
        setIsLoadingPincode(false);
      }
    } else {
      alert("Please enter a valid 6-digit Indian Pincode.");
    }
  };

  return (
    <header className="w-full bg-white/80 backdrop-blur-xl border-b border-white/50 shadow-sm sticky top-0 z-50 transition-all duration-300">
      {/* Upper Tier */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 max-w-[1440px] mx-auto">
        {/* Left: Mobile Hamburger & Pincode */}
        <div className="flex-1 flex items-center text-xs font-semibold relative">
          <button 
            className="md:hidden mr-4 text-gray-700 hover:text-black p-2 -ml-2"
            aria-label="Toggle mobile menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div 
            className="hidden md:flex items-center cursor-pointer hover:text-gray-600"
            onClick={() => setIsPincodeOpen(!isPincodeOpen)}
          >
            <span className="truncate max-w-[120px] lg:max-w-[200px]">
              {isMounted && deliveryLocation ? deliveryLocation.split(',')[0] : "Enter Pincode"}
            </span>
            <ChevronDown className="w-4 h-4 ml-1 shrink-0" />
          </div>
          {isPincodeOpen && (
            <div className="absolute top-full left-0 mt-2 bg-white/90 backdrop-blur-md border border-white/50 shadow-lg rounded p-4 z-50 w-[240px]">
              <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-widest">Check Delivery Availability</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="6-digit Pincode"
                  className="w-full bg-black/5 border-none rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black transition-all"
                  autoFocus
                  defaultValue={deliveryLocation ? (deliveryLocation.match(/\((\d{6})\)/)?.[1] || "") : ""}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                       e.preventDefault();
                       verifyPincode(e.currentTarget.value);
                    }
                  }}
                />
                <button 
                  className="bg-black text-white px-3 py-2 rounded text-xs font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 min-w-[60px]"
                  disabled={isLoadingPincode}
                  onClick={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    verifyPincode(input.value);
                  }}
                >
                  {isLoadingPincode ? "..." : "Apply"}
                </button>
              </div>
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
              className="object-contain hover:opacity-80 transition-opacity h-auto w-auto max-h-[40px] md:max-h-[60px] invert" 
              priority
            />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-3 md:gap-5">
          <div className="hidden md:flex items-center relative">
            <form onSubmit={handleSearch} className="flex items-center bg-black/5 rounded-full px-4 py-2 w-48 focus-within:w-64 transition-all duration-300">
              <input 
                type="text" 
                placeholder="Search..." 
                maxLength={50}
                className="bg-transparent border-none outline-none text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              />
              <button type="submit" aria-label="Search"><Search className="w-4 h-4 text-gray-500" /></button>
            </form>
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
          <Link href="/products" className="md:hidden text-gray-700 hover:text-black p-2" aria-label="Search">
             <Search className="w-5 h-5" />
          </Link>
          <Link href="/store-locator" className="hidden sm:block text-gray-700 hover:text-black p-2" aria-label="Store Locator">
            <MapPin className="w-5 h-5" />
          </Link>
          <Link href="/auth" className="relative text-gray-700 hover:text-black p-2 flex items-center gap-1.5 group whitespace-nowrap" aria-label="Login">
            <User className="w-5 h-5 shrink-0" />
            <span className="hidden lg:block text-xs font-semibold uppercase tracking-wider group-hover:underline">Sign In</span>
          </Link>
          <Link href="/wishlist" className="relative text-gray-700 hover:text-black p-2" aria-label="Wishlist">
            <Heart className="w-5 h-5" />
            {isMounted && wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">{wishlistCount}</span>
            )}
          </Link>
          <Link href="/cart" className="relative text-gray-700 hover:text-black p-2" aria-label="Shopping Cart">
            <ShoppingBag className="w-5 h-5" />
            {isMounted && cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-black text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full font-bold">{cartCount}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Lower Tier: Navigation */}
      <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full border-t border-black/5 bg-white/95 md:bg-transparent absolute md:relative left-0 top-full md:top-auto shadow-md md:shadow-none`}>
        <ul className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 py-6 md:py-4 px-4 min-w-max mx-auto text-xs font-semibold tracking-wider uppercase text-gray-700">
          <li className="relative group cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="/#one-gram-gold">
              <span className="absolute -top-4 -right-4 bg-[#E5B94E] text-black text-[8px] px-2 py-0.5 rounded-full font-bold shadow-sm">Luxe</span>
              One Gram Gold
            </Link>
          </li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="/#bestsellers">Best Sellers</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="/products?category=Necklaces">Necklaces</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="/products?category=Earrings">Earrings</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="/products?search=Bracelets">Bracelets</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="/products?category=Bangles">Bangles & Kada</Link></li>
          <li className="cursor-pointer hover:text-black transition-colors" onClick={() => setIsMobileMenuOpen(false)}><Link href="/products?search=Jhumkas">Jhumkas</Link></li>
        </ul>
      </nav>
    </header>
  );
}
