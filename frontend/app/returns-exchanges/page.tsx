import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5C1218] transition-colors text-sm font-semibold tracking-wide uppercase mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-[#5C1218] mb-8">Returns & Exchanges</h1>
        <div className="text-gray-700 space-y-6 text-sm md:text-base leading-relaxed">
          <p>We want you to love your Indhulya jewelry. If you are not entirely satisfied with your purchase, we're here to help.</p>
          
          <h3 className="text-xl font-serif text-black mt-10 mb-4">7-Day Return Policy</h3>
          <p>You have 7 calendar days to return an item from the date you received it. To be eligible for a return, your item must be:</p>
          <ul className="list-disc pl-5 space-y-3">
            <li>Unused and in the exact same condition that you received it.</li>
            <li>Must have all original tags attached and untampered.</li>
            <li>In the original Indhulya packaging.</li>
          </ul>

          <h3 className="text-xl font-serif text-black mt-10 mb-4">Exceptions</h3>
          <p>Please note that for hygiene reasons, <strong className="text-gray-900">Earrings, Jhumkas, and Nose Rings</strong> cannot be returned or exchanged unless received damaged or defective.</p>

          <h3 className="text-xl font-serif text-black mt-10 mb-4">Refunds</h3>
          <p>Once we receive your item, we will inspect it and notify you on the status of your refund. If your return is approved, we will initiate a refund to your original method of payment. Shipping costs are non-refundable.</p>

          <div className="mt-12 p-6 bg-gray-50 border border-gray-200 text-center rounded">
            <p className="font-semibold text-black mb-2">Need to start a return?</p>
            <p className="text-sm mb-4">Contact our concierge team with your Order ID.</p>
            <Link href="/#contact" className="inline-block bg-[#5C1218] text-white px-6 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
