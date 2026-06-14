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
                placeholder="Email address" 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-400"
              />
              <button className="text-xs font-bold tracking-widest uppercase hover:text-gray-300 text-white" aria-label="Subscribe to newsletter">
                SUBSCRIBE
              </button>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="w-6 h-6 rounded-full bg-gray-500 hover:bg-white cursor-pointer transition-colors"></div>
              <div className="w-6 h-6 rounded-full bg-gray-500 hover:bg-white cursor-pointer transition-colors"></div>
              <div className="w-6 h-6 rounded-full bg-gray-500 hover:bg-white cursor-pointer transition-colors"></div>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="col-span-1 flex flex-col gap-4">
            <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase mb-1 md:mb-2 text-white">Shop</h3>
            <ul className="flex flex-col gap-3 text-xs md:text-sm text-gray-300">
              <li className="hover:text-white cursor-pointer transition-colors">One Gram Gold</li>
              <li className="hover:text-white cursor-pointer transition-colors">Temple Jewelry</li>
              <li className="hover:text-white cursor-pointer transition-colors">Necklaces & Sets</li>
              <li className="hover:text-white cursor-pointer transition-colors">Earrings & Jhumkas</li>
              <li className="hover:text-white cursor-pointer transition-colors">Bangles & Bracelets</li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div className="col-span-1 flex flex-col gap-4">
            <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase mb-1 md:mb-2 text-white">Support</h3>
            <ul className="flex flex-col gap-3 text-xs md:text-sm text-gray-300">
              <li className="hover:text-white cursor-pointer transition-colors">Contact Us</li>
              <li className="hover:text-white cursor-pointer transition-colors">Track Order</li>
              <li className="hover:text-white cursor-pointer transition-colors">Returns & Exchanges</li>
              <li className="hover:text-white cursor-pointer transition-colors">Shipping Info</li>
              <li className="hover:text-white cursor-pointer transition-colors">FAQs</li>
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
            <div className="flex gap-1.5 ml-2">
              <div className="w-7 h-4 bg-gray-300 rounded-[2px] opacity-80"></div>
              <div className="w-7 h-4 bg-gray-300 rounded-[2px] opacity-80"></div>
              <div className="w-7 h-4 bg-gray-300 rounded-[2px] opacity-80"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
