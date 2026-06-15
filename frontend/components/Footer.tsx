import { CreditCard } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#3a0a10] text-[#FAF9F6] pt-16 pb-8 border-t-4 border-[#E5B94E]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-16">
          {/* Column 1: Brand & Newsletter (Takes full width on mobile, 2 cols on desktop) */}
          <div className="col-span-2 flex flex-col gap-6 pr-0 md:pr-12">
            <h2 className="font-serif text-3xl font-bold tracking-widest text-[#E5B94E]">INDHULYA</h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Join our heritage family to receive updates on authentic South Indian arrivals and exclusive bridal offers.
            </p>
            <div className="flex w-full md:w-3/4 border-b border-gray-600 pb-2">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input 
                id="newsletter-email"
                type="email" 
                maxLength={50}
                placeholder="Email address" 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-400"
              />
              <button className="text-xs font-bold tracking-widest uppercase hover:text-gray-300 text-white" aria-label="Subscribe to newsletter">
                SUBSCRIBE
              </button>
            </div>
            <div className="flex gap-4 mt-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.822a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="col-span-1 flex flex-col gap-4">
            <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase mb-1 md:mb-2 text-white">Shop</h3>
            <ul className="flex flex-col gap-3 text-xs md:text-sm text-gray-300">
              <li className="hover:text-white transition-colors"><Link href="/#one-gram-gold">One Gram Gold</Link></li>
              <li className="hover:text-white transition-colors"><Link href="/products?category=Necklaces">Necklaces & Sets</Link></li>
              <li className="hover:text-white transition-colors"><Link href="/products?category=Earrings">Earrings & Jhumkas</Link></li>
              <li className="hover:text-white transition-colors"><Link href="/products?category=Bangles">Bangles & Bracelets</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="col-span-1 flex flex-col gap-4">
            <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase mb-1 md:mb-2 text-white">Support</h3>
            <ul className="flex flex-col gap-3 text-xs md:text-sm text-gray-300">
              <li className="hover:text-white transition-colors"><Link href="/#contact">Contact Us</Link></li>
              <li className="hover:text-white transition-colors"><Link href="/track-order">Track Order</Link></li>
              <li className="hover:text-white transition-colors"><Link href="/returns-exchanges">Returns & Exchanges</Link></li>
              <li className="hover:text-white transition-colors"><Link href="/shipping-info">Shipping Info</Link></li>
              <li className="hover:text-white transition-colors"><Link href="/#faq">FAQs</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-700 text-[10px] md:text-xs text-gray-400 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
            <p>© {new Date().getFullYear()} INDHULYA. All Rights Reserved.</p>
            <div className="hidden md:block w-1 h-1 rounded-full bg-gray-600"></div>
            <div className="flex items-center gap-3">
              <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className="uppercase tracking-wider">Secured Checkout</span>
            <div className="flex gap-2 ml-2 text-gray-300 opacity-80">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
