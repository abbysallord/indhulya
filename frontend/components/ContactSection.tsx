"use client";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactSection() {
  return (
    <section className="w-full py-20 bg-[#FAF9F6]"> {/* Ivory Background */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row gap-16 md:gap-24">
          
          {/* Left Column: Contact Info */}
          <div className="w-full md:w-5/12 flex flex-col justify-center">
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-[#5C1218]">Get in Touch</h2> {/* Deep Maroon/Aubergine */}
            <p className="text-gray-700 mb-10 leading-relaxed text-sm md:text-base">
              Whether you are looking for the perfect bridal set or have questions about our Temple Jewelry collection, our experts are here to guide you.
            </p>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white shadow-sm rounded-full text-[#5C1218] group-hover:bg-[#5C1218] group-hover:text-white transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 tracking-wider uppercase text-xs">Flagship Store</h4>
                  <p className="text-gray-600 text-sm">Road No. 36, Jubilee Hills<br/>Hyderabad, Telangana 500033</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white shadow-sm rounded-full text-[#5C1218] group-hover:bg-[#5C1218] group-hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 tracking-wider uppercase text-xs">Phone</h4>
                  <p className="text-gray-600 text-sm">+91 98765 43210<br/><span className="text-xs text-gray-400">Mon-Sat, 10am to 8pm</span></p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white shadow-sm rounded-full text-[#5C1218] group-hover:bg-[#5C1218] group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1 tracking-wider uppercase text-xs">Email</h4>
                  <p className="text-gray-600 text-sm">concierge@indhulya.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="w-full md:w-7/12 bg-white p-8 md:p-12 shadow-xl">
            <h3 className="text-2xl font-serif text-black mb-8">Send an Inquiry</h3>
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">First Name *</label>
                  <input type="text" required className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5C1218] transition-colors bg-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Last Name</label>
                  <input type="text" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5C1218] transition-colors bg-transparent" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Email Address *</label>
                  <input type="email" required className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5C1218] transition-colors bg-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Phone Number</label>
                  <input type="tel" className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5C1218] transition-colors bg-transparent" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-widest uppercase text-gray-500 mb-2">Message *</label>
                <textarea required rows={4} className="w-full border-b border-gray-300 py-2 focus:outline-none focus:border-[#5C1218] transition-colors bg-transparent resize-none"></textarea>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input type="checkbox" id="consultation" className="w-4 h-4 accent-[#5C1218]" />
                <label htmlFor="consultation" className="text-sm text-gray-700 cursor-pointer">I would like to request an expert consultation</label>
              </div>

              <button type="submit" className="w-full bg-[#5C1218] text-white font-bold tracking-widest uppercase text-sm py-4 hover:bg-black transition-colors mt-4">
                Submit Inquiry
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
