import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ShippingInfoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCFB]">
      <Header />
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 md:px-8 py-24 md:py-32">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#5C1218] transition-colors text-sm font-semibold tracking-wide uppercase mb-12">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-[#5C1218] mb-8">Shipping Information</h1>
        <div className="text-gray-700 space-y-6 text-sm md:text-base leading-relaxed">
          <p>At Indhulya, we take immense care in packaging and delivering your heritage jewelry safely to your doorstep.</p>
          
          <h3 className="text-xl font-serif text-black mt-10 mb-4">Domestic Shipping (India)</h3>
          <ul className="list-disc pl-5 space-y-3">
            <li><strong className="text-gray-900">Free Shipping:</strong> Available on all orders above ₹5,000.</li>
            <li><strong className="text-gray-900">Standard Shipping:</strong> A flat rate of ₹150 applies to orders under ₹5,000.</li>
            <li><strong className="text-gray-900">Delivery Timeline:</strong> Orders are typically processed within 24-48 hours. Standard delivery takes 3-7 business days depending on your location.</li>
          </ul>

          <h3 className="text-xl font-serif text-black mt-10 mb-4">Order Tracking</h3>
          <p>Once your order is dispatched, you will receive an email and SMS with your courier tracking details. You can also track your package on our <Link href="/track-order" className="text-[#5C1218] font-semibold hover:underline">Track Order</Link> page.</p>

          <h3 className="text-xl font-serif text-black mt-10 mb-4">Packaging</h3>
          <p>All items are shipped in our signature Indhulya hard-case boxes to ensure absolute safety during transit and provide a premium, luxury unboxing experience.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
