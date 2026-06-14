"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Do you ship internationally?",
    answer: "Yes, we proudly ship our heritage collections worldwide. International shipping typically takes 7-14 business days. All packages are fully insured for your peace of mind."
  },
  {
    question: "What is One Gram Gold jewelry?",
    answer: "One Gram Gold jewelry is crafted with a base of copper or silver alloy and coated with exactly one gram of 22k pure gold. This process gives the pieces the identical authentic look and luster of solid gold, but at a fraction of the cost."
  },
  {
    question: "How should I care for my antique pieces?",
    answer: "To maintain the luster of your Indhulya jewelry, keep it away from perfumes, water, and harsh chemicals. Store each piece separately in the provided velvet pouches to prevent scratches and oxidation."
  },
  {
    question: "Can I customize a bridal set?",
    answer: "Absolutely. Our master artisans can customize any bridal set to match your outfit and preferences. Please contact our support team to book a bridal consultation."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy for unused items in their original packaging. Please note that customized items and nose pins (for hygiene reasons) are strictly non-returnable."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative w-full py-24 bg-[#FAF9F6] overflow-hidden">
      {/* Decorative Blur matching the premium aesthetic */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E5B94E]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-80 h-80 bg-[#5C1218]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif text-black mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-lg mx-auto"
          >
            Everything you need to know about our collections, shipping, and caring for your jewelry.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex justify-between items-center p-6 md:px-8 bg-white/50 backdrop-blur-md rounded-2xl border border-white shadow-sm hover:bg-white/80 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C1218] focus-visible:ring-offset-2"
                >
                  <span className={`font-medium md:text-lg transition-colors ${isOpen ? "text-[#5C1218]" : "text-gray-900"}`}>
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 ml-4 p-2 rounded-full transition-colors duration-300 ${isOpen ? "bg-[#5C1218] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    >
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </motion.div>
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.section
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: "auto" },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                      className="overflow-hidden"
                    >
                      <motion.div 
                        variants={{ collapsed: { y: -10 }, open: { y: 0 } }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="p-6 md:px-8 pt-2 pb-6 text-gray-600 leading-relaxed bg-white/30 backdrop-blur-sm rounded-b-2xl border-x border-b border-white shadow-sm -mt-4 pt-8"
                      >
                        {faq.answer}
                      </motion.div>
                    </motion.section>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
