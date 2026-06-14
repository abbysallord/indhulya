export default function Footer() {
  return (
    <footer className="w-full bg-[#3a0a10] text-[#FAF9F6] pt-16 pb-8 border-t-4 border-[#E5B94E]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Newsletter */}
          <div className="flex flex-col gap-6">
            <h2 className="font-serif text-3xl font-bold tracking-widest text-[#E5B94E]">INDHULYA</h2>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Join our heritage family to receive updates on authentic South Indian arrivals and exclusive bridal offers.
            </p>
            <div className="flex w-full border-b border-gray-600 pb-2">
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
            <div className="flex gap-4 mt-4">
              <div className="w-6 h-6 rounded-full bg-gray-500 hover:bg-white cursor-pointer"></div>
              <div className="w-6 h-6 rounded-full bg-gray-500 hover:bg-white cursor-pointer"></div>
              <div className="w-6 h-6 rounded-full bg-gray-500 hover:bg-white cursor-pointer"></div>
              <div className="w-6 h-6 rounded-full bg-gray-500 hover:bg-white cursor-pointer"></div>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-white">Shop</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-300">
              <li className="hover:text-white cursor-pointer">Necklaces</li>
              <li className="hover:text-white cursor-pointer">Earrings</li>
              <li className="hover:text-white cursor-pointer">Bracelets</li>
              <li className="hover:text-white cursor-pointer">Rings</li>
              <li className="hover:text-white cursor-pointer">Mangalsutras</li>
              <li className="hover:text-white cursor-pointer">Men&apos;s Jewelry</li>
            </ul>
          </div>

          {/* Column 3: Information */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-white">Information</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-300">
              <li className="hover:text-white cursor-pointer">About Us</li>
              <li className="hover:text-white cursor-pointer">Contact Us</li>
              <li className="hover:text-white cursor-pointer">Store Locator</li>
              <li className="hover:text-white cursor-pointer">Track Order</li>
              <li className="hover:text-white cursor-pointer">Returns & Exchanges</li>
              <li className="hover:text-white cursor-pointer">FAQs</li>
            </ul>
          </div>

          {/* Column 4: Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-white">Legal</h3>
            <ul className="flex flex-col gap-3 text-sm text-gray-300">
              <li className="hover:text-white cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white cursor-pointer">Terms of Service</li>
              <li className="hover:text-white cursor-pointer">Shipping Policy</li>
              <li className="hover:text-white cursor-pointer">Refund Policy</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-700 text-xs text-gray-300 gap-4">
          <p>© {new Date().getFullYear()} INDHULYA. All Rights Reserved.</p>
          <div className="flex items-center gap-2">
            <span>Secured Checkout</span>
            {/* Dummy Payment Icons */}
            <div className="flex gap-1">
              <div className="w-8 h-5 bg-white rounded-sm"></div>
              <div className="w-8 h-5 bg-white rounded-sm"></div>
              <div className="w-8 h-5 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
