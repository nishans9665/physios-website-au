"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    question: "Do you support NDIS participants?",
    answer: "Yes, we are experienced in providing physiotherapy services for NDIS participants. We focus on goal-oriented rehabilitation to enhance independence and quality of life.",
  },
  {
    question: "Do you provide home visits?",
    answer: "Absolutely! We specialize in mobile physiotherapy, bringing our professional services directly to your home across Brisbane for your convenience.",
  },
  {
    question: "What areas do you service?",
    answer: "We provide mobile physiotherapy services throughout Brisbane and surrounding areas. Please contact us to confirm if we service your specific location.",
  },
  {
    question: "How do online sessions work?",
    answer: "Our telehealth sessions are conducted via secure video platforms. They are highly effective for assessments, exercise supervision, and consultation without leaving your home.",
  },
  {
    question: "Can elderly patients join balance programs?",
    answer: "Yes! Our Strength & Balance program is specifically designed for older adults to improve mobility, prevent falls, and increase confidence.",
  },
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="section-padding bg-light">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-primary font-bold uppercase tracking-widest text-sm"
          >
            Got Questions?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold text-dark mt-4"
          >
            Frequently Asked Questions
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4"
              >
                <span className="font-bold text-dark text-lg">{faq.question}</span>
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary shrink-0">
                  {activeIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </div>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-gray-500 leading-relaxed border-t border-secondary/50 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
